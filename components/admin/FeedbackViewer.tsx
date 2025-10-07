import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { deleteFeedback, getAllFeedbackAdmin } from '../../services/communityService.js';
import { Feedback } from '../../types.js';
import SkeletonLoader from '../SkeletonLoader.js';

const FeedbackViewer = () => {
    const { t } = useAppContext();
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            setLoading(true);
            const feedbackData = await getAllFeedbackAdmin();
            setFeedback(feedbackData);
            setLoading(false);
        };
        fetchFeedback();
    }, []);

    const handleDelete = async (feedbackId: string) => {
        if (window.confirm(t('confirm_delete'))) {
            const success = await deleteFeedback(feedbackId);
            if (success) {
                setFeedback(feedback.filter(f => f.id !== feedbackId));
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('user_feedback')}</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {loading ? <SkeletonLoader className="h-40"/> : feedback.length > 0 ? (
                    <div className="space-y-4">
                        {feedback.map(item => (
                            <div key={item.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{item.profiles?.email || 'Anonymous'}</p>
                                        <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm">
                                        {t('delete')}
                                    </button>
                                </div>
                                <p className="mt-2 text-gray-700 dark:text-gray-300">{item.message}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No feedback submitted yet.</p>
                )}
            </div>
        </div>
    );
};

export default FeedbackViewer;