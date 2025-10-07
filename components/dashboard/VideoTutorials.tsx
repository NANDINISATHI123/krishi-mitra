import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { getTutorials } from '../../services/contentService.js';
import { generateThumbnail } from '../../services/geminiService.js';
import { Tutorial } from '../../types.js';
import SkeletonLoader from '../SkeletonLoader.js';

const DB_NAME = 'krishi-mitra-videos';
const STORE_NAME = 'offline_videos';

const openVideoDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveVideoToDB = async (id: string, blob: Blob) => {
  const db = await openVideoDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put({ id, blob });
  return new Promise(resolve => tx.oncomplete = resolve);
};

const getVideoFromDB = async (id: string): Promise<Blob | null> => {
  const db = await openVideoDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const record = await new Promise<{id: string, blob: Blob} | undefined>(resolve => {
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result);
  });
  return record ? record.blob : null;
};

const deleteVideoFromDB = async (id: string) => {
  const db = await openVideoDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
};

interface TutorialCardProps {
    tutorial: Tutorial;
}

const VideoTutorials = () => {
    const { t, isOnline, language } = useAppContext();
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [offlineVideoIds, setOfflineVideoIds] = useState<Set<string>>(new Set());
    const [downloading, setDownloading] = useState<Record<string, 'downloading' | 'failed'>>({});
    const [viewMode, setViewMode] = useState<'all' | 'offline'>('all');

    const updateOfflineStatus = useCallback(async () => {
        const db = await openVideoDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const keys = await new Promise<string[]>(resolve => {
            const req = tx.objectStore(STORE_NAME).getAllKeys();
            req.onsuccess = () => resolve(req.result as string[]);
        });
        setOfflineVideoIds(new Set(keys));
    }, []);

    useEffect(() => {
        const loadTutorials = async () => {
            setLoading(true);
            const data = await getTutorials();
            const populatedData = await Promise.all(data.map(async (tut) => {
                if (!tut.thumbnail && tut.title && tut.description) {
                    console.log(`Generating thumbnail for: ${tut.title}`);
                    const thumbUrl = await generateThumbnail(tut.title, tut.description);
                    return { ...tut, thumbnail: thumbUrl || 'https://placehold.co/400x225?text=Video' };
                }
                return tut;
            }));
            setTutorials(populatedData);
            setCategories(['All', ...Array.from(new Set(data.map(t => t.category)))]);
            setLoading(false);
        };
        loadTutorials();
        updateOfflineStatus();
    }, [updateOfflineStatus]);

    const handleDownload = async (tutorial: Tutorial) => {
        if (!isOnline) { alert("Downloads require an internet connection."); return; }
        setDownloading(prev => ({ ...prev, [tutorial.id]: 'downloading' }));
        try {
            const response = await fetch(tutorial.videoUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            await saveVideoToDB(tutorial.id, blob);
            await updateOfflineStatus();
            setDownloading(prev => ({ ...prev, [tutorial.id]: undefined }));
        } catch (error) {
            console.error('Download failed:', error);
            setDownloading(prev => ({ ...prev, [tutorial.id]: 'failed' }));
        }
    };
    
    const handleRemoveOffline = async (tutorialId: string) => {
        await deleteVideoFromDB(tutorialId);
        await updateOfflineStatus();
    };
    
    const filteredTutorials = useMemo(() => {
        let list = tutorials;
        if (viewMode === 'offline') {
            list = tutorials.filter(t => offlineVideoIds.has(t.id));
        }
        if (selectedCategory !== 'All') {
            list = list.filter(t => t.category === selectedCategory);
        }
        return list;
    }, [tutorials, selectedCategory, viewMode, offlineVideoIds]);

    const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial }) => {
        const [videoUrl, setVideoUrl] = useState<string | null>(null);

        useEffect(() => {
            if (offlineVideoIds.has(tutorial.id)) {
                getVideoFromDB(tutorial.id).then(blob => {
                    if (blob) setVideoUrl(URL.createObjectURL(blob));
                });
            } else {
                setVideoUrl(tutorial.videoUrl);
            }
        }, [tutorial.id, tutorial.videoUrl, offlineVideoIds]);

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video bg-black flex items-center justify-center">
                    {videoUrl ? (
                         <video src={videoUrl} controls poster={tutorial.thumbnail} className="w-full h-full object-cover"></video>
                    ) : (
                         <SkeletonLoader className="w-full h-full" />
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg">{language === 'te' ? tutorial.title_te : tutorial.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{tutorial.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10 overflow-hidden">{language === 'te' ? tutorial.description_te : tutorial.description}</p>
                    {offlineVideoIds.has(tutorial.id) ? (
                        <button onClick={() => handleRemoveOffline(tutorial.id)} className="w-full py-2 text-sm font-semibold rounded-md bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">{t('offline_available')}</button>
                    ) : (
                        <button 
                            onClick={() => handleDownload(tutorial)} 
                            disabled={!isOnline || downloading[tutorial.id] === 'downloading'}
                            className={`w-full py-2 text-sm font-semibold rounded-md ${
                                downloading[tutorial.id] === 'failed' ? 'bg-yellow-100 text-yellow-700' : 'bg-secondary text-accent'
                            } disabled:bg-gray-400`}
                        >
                            {downloading[tutorial.id] === 'downloading' ? t('downloading') : downloading[tutorial.id] === 'failed' ? t('download_failed') : t('download_for_offline')}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('video_tutorials')}</h1>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 sticky top-20 z-10 flex flex-wrap gap-4 items-center">
                <div className="flex-grow">
                    <button onClick={() => setViewMode('all')} className={`px-4 py-2 rounded-lg font-semibold ${viewMode === 'all' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('all_tutorials')}</button>
                    <button onClick={() => setViewMode('offline')} className={`px-4 py-2 ml-2 rounded-lg font-semibold ${viewMode === 'offline' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('my_offline_videos')}</button>
                </div>
                <div>
                     <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <SkeletonLoader key={i} className="h-80" />)}
                </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutorials.length > 0 ? (
                        filteredTutorials.map(tut => <TutorialCard key={tut.id} tutorial={tut} />)
                    ) : (
                        <p className="md:col-span-2 lg:col-span-3 text-center py-10 text-gray-500">
                            {viewMode === 'offline' ? t('no_offline_videos_message') : t('no_tutorials_in_category_message')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoTutorials;