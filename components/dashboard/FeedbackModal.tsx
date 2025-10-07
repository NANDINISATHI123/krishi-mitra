import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { addFeedback } from '../../services/communityService.ts';
import { CloseIcon, CheckCircleIcon } from '../Icons.tsx';

interface FeedbackModalProps {
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const { t, profile } = useAppContext();
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !profile) {
            alert("Please enter a message and be logged in.");
            return;
        }
        setLoading(true);
        const result = await addFeedback(message, profile);
        if (result) {
            setSubmitted(true);
        } else {
            alert("Failed to submit feedback. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <CloseIcon />
                </button>

                {submitted ? (
                    <div className="text-center p-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{t('feedback_submitted')}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('thank_you_feedback')}</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        >
                            {t('close')}
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">{t('feedback_title')}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('feedback_desc')}</p>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('your_message')}
                                rows={5}
                                required
                                className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Submitting...' : t('submit')}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;