
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useSpeech } from '../../hooks/useSpeech';
import { getKnowledgeAnswer, getHistory, addHistory, getBookmarks, addBookmark } from '../../services/knowledgeService';
import { addActionToQueue, cacheKnowledgeAnswer, getCachedKnowledgeAnswer } from '../../services/offlineService';
import { KnowledgeAnswer, QuestionHistory, Bookmark } from '../../types';
import { SearchIcon, BookmarkIcon, PendingIcon, SpeakerIcon, MicrophoneIcon } from '../Icons';
import SkeletonLoader from '../SkeletonLoader';

const KnowledgeBase = () => {
    const { t, user, language, isOnline, refreshData, refreshPendingCount } = useAppContext();
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState<KnowledgeAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<QuestionHistory[]>([]);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    const { isListening, transcript, startListening, stopListening, speak } = useSpeech(language);
    const listeningRef = useRef(false);
    const speechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    const fetchData = useCallback(async () => {
        if (user) {
            getHistory(user.id).then(setHistory);
            getBookmarks(user.id).then(setBookmarks);
        }
    }, [user, refreshData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || !user) return;
        setLoading(true);
        setAnswer(null);
        setError('');
        setQuery(searchQuery);

        if (isOnline) {
            try {
                const result = await getKnowledgeAnswer(searchQuery, language);
                setAnswer(result);
                // Add to IndexedDB cache for offline use
                await cacheKnowledgeAnswer(result);
                await addHistory(user.id, searchQuery);
                fetchData(); // Refresh history
            } catch (e) {
                console.error("Knowledge base search failed:", e);
                setError("Failed to get an answer. Please try again.");
            }
        } else {
            // Offline mode: Check IndexedDB cache
            const cachedAnswer = await getCachedKnowledgeAnswer(searchQuery);
            if (cachedAnswer) {
                setAnswer(cachedAnswer);
            } else {
                setError(t('knowledge_base_offline_no_cache'));
            }
        }
        setLoading(false);
    }, [user, language, isOnline, fetchData, t]);

    // Effect to update the input field as the user speaks.
    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    // Effect to trigger search automatically when listening stops.
    useEffect(() => {
        if (listeningRef.current && !isListening && transcript) {
            handleSearch(transcript);
        }
        listeningRef.current = isListening;
    }, [isListening, transcript, handleSearch]);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            // Defensive check to prevent calling start if already listening
            if (!listeningRef.current) {
                setQuery('');
                setAnswer(null);
                setError('');
                startListening();
            }
        }
    };
    
    const handleBookmark = async () => {
        if (!answer || !user) return;
        
        const optimisticBookmark: Bookmark = {
            id: `pending-${Date.now()}`,
            created_at: new Date().toISOString(),
            user_id: user.id,
            question: answer.question,
            answer: answer.answer,
        };
        setBookmarks(prev => [optimisticBookmark, ...prev.filter(b => b.question !== answer.question)]);
        
        try {
            if (isOnline) {
                await addBookmark(user.id, answer.question, answer.answer);
                fetchData();
            } else {
                await addActionToQueue({
                    service: 'knowledge',
                    method: 'addBookmark',
                    payload: { userId: user.id, question: answer.question, answer: answer.answer }
                });
                refreshPendingCount(); // Instantly update the pending count in the header
            }
             // Also cache for offline access
            await cacheKnowledgeAnswer(answer);
            alert('Bookmarked and saved for offline access!');
        } catch(e) {
            alert('Failed to bookmark.');
            // Revert optimistic update
            setBookmarks(prev => prev.filter(b => b.id !== optimisticBookmark.id));
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('knowledge_base')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('kb_placeholder')}
                            className="flex-grow p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                         {speechRecognitionSupported && (
                             <button
                                type="button"
                                onClick={handleMicClick}
                                className={`p-3 rounded-lg transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300'}`}
                                title={isListening ? t('stop_listening') : t('ask_with_voice')}
                            >
                                <MicrophoneIcon className="w-6 h-6" />
                            </button>
                         )}
                        <button type="submit" className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark"><SearchIcon className="w-6 h-6" /></button>
                    </form>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md min-h-[400px]">
                        {loading && <SkeletonLoader className="h-64" />}
                        {error && <p className="text-center text-red-500 py-16">{error}</p>}
                        {answer && (
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl font-bold">{answer.question}</h2>
                                    <button
                                        onClick={() => speak(answer.answer)}
                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                        title="Read answer aloud"
                                    >
                                        <SpeakerIcon className="w-6 h-6 text-primary dark:text-primary-light" />
                                    </button>
                                </div>
                                <button onClick={handleBookmark} className="mb-4 text-sm flex items-center gap-1 text-blue-600 hover:underline"><BookmarkIcon className="w-4 h-4" /> {t('bookmark_for_offline')}</button>
                                <p className="whitespace-pre-wrap text-base">{answer.answer}</p>
                                {answer.related.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-bold mt-6 mb-2">{t('related_questions')}</h3>
                                        <ul className="list-disc list-inside space-y-1">
                                            {answer.related.map((q, i) => <li key={i} className="text-blue-600 hover:underline cursor-pointer" onClick={() => handleSearch(q)}>{q}</li>)}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                        {!loading && !answer && !error && <p className="text-center text-gray-500 py-16">{t('kb_get_started')}</p>}
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-4">
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-2">{t('history_title')}</h3>
                        <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
                            {history.length > 0 ? history.map(h => (
                                <li key={h.id} className="text-base text-gray-600 dark:text-gray-400 hover:text-primary cursor-pointer truncate" title={h.question} onClick={() => handleSearch(h.question)}>
                                    {h.question}
                                </li>
                            )) : <p className="text-sm text-gray-400">No recent questions.</p>}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-2">{t('bookmarks_title')}</h3>
                         <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
                            {bookmarks.length > 0 ? bookmarks.map(b => (
                                <li key={b.id} className="text-base text-gray-600 dark:text-gray-400 hover:text-primary cursor-pointer flex items-center justify-between gap-2" onClick={() => setAnswer({ ...b, likes: 0, dislikes: 0, related: [] })}>
                                    <span className="truncate" title={b.question}>{b.question}</span>
                                    {b.id.startsWith('pending-') && <PendingIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" title={t('pending_sync_status')} />}
                                </li>
                            )) : <p className="text-sm text-gray-400">No bookmarks yet.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;
