import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { addActionToQueue } from '../../services/offlineService.js';
import { 
    getTutorials, saveTutorial, updateTutorial, deleteTutorial
} from '../../services/contentService.js';
import { Tutorial } from '../../types.js';
import SkeletonLoader from '../SkeletonLoader.js';

const ContentManagement = () => {
    const { t, isOnline, refreshPendingCount, refreshData, showToast } = useAppContext();
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isTutorialModalOpen, setTutorialModalOpen] = useState(false);
    const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);

    const loadData = async () => {
        setLoading(true);
        const tutData = await getTutorials(true);
        setTutorials(tutData);
        setLoading(false);
    };
    
    useEffect(() => {
        loadData();
    }, [refreshData]);

    // --- Tutorial Handlers ---
    const handleEditTutorial = (tutorial: Tutorial) => {
        setEditingTutorial(tutorial);
        setTutorialModalOpen(true);
    };

    const handleAddTutorial = () => {
        setEditingTutorial(null);
        setTutorialModalOpen(true);
    };

    const handleSaveTutorial = async (tutorialData: Tutorial) => {
        const isEditing = !!editingTutorial;
        const optimisticId = isEditing ? tutorialData.id : `pending-${Date.now()}`;
        const optimisticTutorial = { ...tutorialData, id: optimisticId, created_at: new Date().toISOString() };
        
        // Optimistic UI Update
        if (isEditing) {
            setTutorials(tutorials.map(t => t.id === optimisticTutorial.id ? optimisticTutorial : t));
        } else {
            setTutorials([optimisticTutorial, ...tutorials]);
        }
        setTutorialModalOpen(false);
        
        if (isOnline) {
            const payload = isEditing ? tutorialData : (({ id, created_at, ...d }) => d)(tutorialData);
            const result = isEditing ? await updateTutorial(payload as Tutorial) : await saveTutorial(payload);
            if(result) {
                showToast(t('success_generic'), 'success');
            } else {
                showToast(t('error_save_failed'), 'error');
            }
            loadData(); // Refresh from server
        } else {
            const action = {
                service: 'content' as const,
                method: isEditing ? 'updateTutorial' : 'saveTutorial',
                payload: isEditing ? tutorialData : (({ id, created_at, ...d }) => d)(tutorialData),
            };
            await addActionToQueue(action);
            refreshPendingCount();
        }
    };
    
    const handleDeleteTutorial = async (tutorialId: string) => {
        if(!window.confirm(t('confirm_delete'))) return;
        
        const originalTutorials = [...tutorials];
        setTutorials(tutorials.filter(t => t.id !== tutorialId));

        if (isOnline) {
            const success = await deleteTutorial(tutorialId);
            if(success) {
                showToast(t('success_generic'), 'success');
            } else {
                showToast(t('error_delete_failed'), 'error');
                setTutorials(originalTutorials);
            }
        } else {
            await addActionToQueue({
                service: 'content',
                method: 'deleteTutorial',
                payload: { tutorialId }
            });
            refreshPendingCount();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">
                {t('manage_tutorials')}
            </h1>
            {loading ? <SkeletonLoader className="h-64" /> : (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">{t('manage_tutorials')}</h2>
                        <button onClick={handleAddTutorial} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">{t('add_new')}</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                           <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-2">{t('title')}</th>
                                    <th className="p-2">{t('category')}</th>
                                    <th className="p-2 text-right">{t('action')}</th>
                                </tr>
                           </thead>
                           <tbody>
                                {tutorials.map(tut => (
                                    <tr key={tut.id} className={`border-b dark:border-gray-700 ${tut.id.startsWith('pending-') ? 'opacity-60' : ''}`}>
                                        <td className="p-2 font-semibold">{tut.title}</td>
                                        <td className="p-2">{tut.category}</td>
                                        <td className="p-2 text-right space-x-2">
                                            <button onClick={() => handleEditTutorial(tut)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded">{t('edit')}</button>
                                            <button onClick={() => handleDeleteTutorial(tut.id)} className="bg-red-500 text-white px-3 py-1 text-sm rounded">{t('delete')}</button>
                                        </td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isTutorialModalOpen && <TutorialFormModal t={t} tutorial={editingTutorial} onSave={handleSaveTutorial} onClose={() => setTutorialModalOpen(false)} />}
        </div>
    );
};

// --- Modals and Forms ---
const defaultTutorial: Tutorial = { id: '', created_at: '', title: '', title_te: '', category: 'Fertilizers', videoUrl: '', thumbnail: '', description: '', description_te: '' };

const TutorialFormModal = ({ t, tutorial, onSave, onClose }: {t: any, tutorial: Tutorial | null, onSave: (data: Tutorial) => void, onClose: () => void}) => {
    const [formData, setFormData] = useState<Tutorial>(tutorial || defaultTutorial);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{tutorial ? t('edit_tutorial') : t('add_tutorial')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <input name="title" value={formData.title} onChange={handleChange} placeholder={t('title')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="title_te" value={formData.title_te} onChange={handleChange} placeholder={t('title_te')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="category" value={formData.category} onChange={handleChange} placeholder={t('category')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder={t('video_url')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="description_te" value={formData.description_te} onChange={handleChange} placeholder="Description (Telugu)" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">{t('cancel')}</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContentManagement;