import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { getTasks, saveTask, updateTask, deleteTask } from '../../services/calendarService.js';
import { CalendarTask } from '../../types.js';
import SkeletonLoader from '../SkeletonLoader.js';

const CalendarManagement = () => {
    const { t } = useAppContext();
    const [tasks, setTasks] = useState<CalendarTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);

    const loadTasks = async () => {
        setLoading(true);
        const data = await getTasks();
        setTasks(data);
        setLoading(false);
    };
    
    useEffect(() => {
        loadTasks();
    }, []);

    const handleEdit = (task: CalendarTask) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    const handleSave = async (taskData: CalendarTask) => {
        const isEditing = !!editingTask;
        if (isEditing) {
            await updateTask(taskData);
        } else {
            const { id, created_at, ...newData } = taskData;
            await saveTask(newData);
        }
        setModalOpen(false);
        loadTasks();
    };

    const handleDelete = async (taskId: string) => {
        if (window.confirm(t('confirm_delete'))) {
            await deleteTask(taskId);
            loadTasks();
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('calendar_management_admin')}</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">All Advisory Tasks</h2>
                    <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">{t('add_new')}</button>
                </div>
                {loading ? <SkeletonLoader className="h-64" /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-2">Date (Month/Day)</th>
                                    <th className="p-2">Title</th>
                                    <th className="p-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id} className="border-b dark:border-gray-700">
                                        <td className="p-2 font-mono">{task.month}/{task.day_of_month}</td>
                                        <td className="p-2 font-semibold">{task.title}</td>
                                        <td className="p-2 text-right space-x-2">
                                            <button onClick={() => handleEdit(task)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded">{t('edit')}</button>
                                            <button onClick={() => handleDelete(task.id)} className="bg-red-500 text-white px-3 py-1 text-sm rounded">{t('delete')}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isModalOpen && <TaskFormModal t={t} task={editingTask} onSave={handleSave} onClose={() => setModalOpen(false)} />}
        </div>
    );
};


const defaultTask: CalendarTask = { id: '', created_at: '', title: '', title_te: '', description: '', description_te: '', month: 1, day_of_month: 1 };

const TaskFormModal = ({ t, task, onSave, onClose }: {t: any, task: CalendarTask | null, onSave: (data: CalendarTask) => void, onClose: () => void}) => {
    const [formData, setFormData] = useState<CalendarTask>(task || defaultTask);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: (name === 'month' || name === 'day_of_month') ? parseInt(value) : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{task ? 'Edit Task' : 'Add New Task'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <input name="title" value={formData.title} onChange={handleChange} placeholder={t('title')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <input name="title_te" value={formData.title_te} onChange={handleChange} placeholder={t('title_te')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <textarea name="description_te" value={formData.description_te} onChange={handleChange} placeholder="Description (Telugu)" required rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex gap-4">
                        <input name="month" type="number" min="1" max="12" value={formData.month} onChange={handleChange} placeholder="Month (1-12)" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input name="day_of_month" type="number" min="1" max="31" value={formData.day_of_month} onChange={handleChange} placeholder="Day (1-31)" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">{t('cancel')}</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalendarManagement;