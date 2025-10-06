
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getOutcomes, addOutcome } from '../../services/trackerService';
// FIX: Corrected import path.
import { addActionToQueue } from '../../services/offlineService';
import { Outcome } from '../../types';
import SkeletonLoader from '../SkeletonLoader';
import { PendingIcon } from '../Icons';

const SuccessTracker = () => {
    const { t, user, isOnline, refreshData, refreshPendingCount } = useAppContext();
    const [outcomes, setOutcomes] = useState<Outcome[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [cropName, setCropName] = useState('');
    const [yieldAmount, setYieldAmount] = useState<number | ''>('');
    const [revenue, setRevenue] = useState<number | ''>('');
    const [notes, setNotes] = useState('');

    const fetchData = useCallback(async () => {
        if (user) {
            setLoading(true);
            const data = await getOutcomes(user.id);
            setOutcomes(data);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !cropName || !yieldAmount || yieldAmount <= 0) return;
        
        const newOutcomeData = {
            user_id: user.id,
            date: new Date().toISOString(),
            crop_name: cropName,
            yield_amount: Number(yieldAmount),
            yield_unit: 'kg',
            revenue: Number(revenue) || 0,
            notes: notes,
        };

        const optimisticOutcome: Outcome = {
            id: `pending-${Date.now()}`,
            created_at: new Date().toISOString(),
            ...newOutcomeData,
        };
        
        setOutcomes([optimisticOutcome, ...outcomes]);
        
        setShowForm(false);
        setCropName('');
        setYieldAmount('');
        setRevenue('');
        setNotes('');
        
        if (isOnline) {
            await addOutcome(newOutcomeData);
            fetchData(); // Refresh to get real data
        } else {
            await addActionToQueue({
                service: 'tracker',
                method: 'addOutcome',
                payload: newOutcomeData
            });
            refreshPendingCount(); // Instantly update the pending count in the header
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('success_tracker')}</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{t('my_harvests')}</h2>
                    <button onClick={() => setShowForm(!showForm)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">{showForm ? t('cancel') : t('add_harvest')}</button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg dark:border-gray-700 space-y-4">
                        <input type="text" value={cropName} onChange={e => setCropName(e.target.value)} placeholder={t('crop_name_placeholder')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input type="number" value={yieldAmount} onChange={e => setYieldAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder={t('yield_placeholder')} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input type="number" value={revenue} onChange={e => setRevenue(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder={t('revenue_placeholder')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes')} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"></textarea>
                        <button type="submit" className="bg-secondary text-accent px-4 py-2 rounded-md hover:opacity-90">{t('save_harvest')}</button>
                    </form>
                )}

                {loading ? <SkeletonLoader className="h-40" /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-2">{t('date_header')}</th><th className="p-2">{t('crop_header')}</th><th className="p-2">{t('yield_header')}</th><th className="p-2">{t('revenue_header')}</th><th className="p-2">{t('notes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outcomes.map(o => (
                                    <tr key={o.id} className={`border-b dark:border-gray-700 last:border-b-0 ${o.id.startsWith('pending-') ? 'opacity-70' : ''}`}>
                                        <td className="p-2 flex items-center gap-2">
                                            {new Date(o.date).toLocaleDateString()}
                                            {o.id.startsWith('pending-') && <PendingIcon className="w-4 h-4 text-yellow-500" title={t('pending_sync_status')} />}
                                        </td>
                                        <td className="p-2 font-semibold">{o.crop_name}</td>
                                        <td className="p-2">{o.yield_amount} {o.yield_unit}</td>
                                        <td className="p-2">{o.revenue.toLocaleString('en-IN')}</td>
                                        <td className="p-2 text-sm text-gray-500">{o.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {outcomes.length === 0 && <p className="text-center py-8 text-gray-500">No harvests tracked yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuccessTracker;
