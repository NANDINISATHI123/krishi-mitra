import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getAllOutcomes } from '../../services/trackerService';
import { Outcome } from '../../types';
import SkeletonLoader from '../SkeletonLoader';

const SuccessTrackerViewer = () => {
    const { t } = useAppContext();
    type EnrichedOutcome = Outcome & { profiles: { name: string, email: string } };
    const [outcomes, setOutcomes] = useState<EnrichedOutcome[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getAllOutcomes();
            setOutcomes(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">All User Harvests</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {loading ? <SkeletonLoader className="h-64" /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Farmer</th>
                                    <th className="p-2">Crop</th>
                                    <th className="p-2">Yield</th>
                                    <th className="p-2">Revenue (INR)</th>
                                    <th className="p-2">{t('notes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outcomes.map(o => (
                                    <tr key={o.id} className="border-b dark:border-gray-700 last:border-b-0">
                                        <td className="p-2">{new Date(o.date).toLocaleDateString()}</td>
                                        <td className="p-2">{o.profiles?.name || o.profiles?.email || 'N/A'}</td>
                                        <td className="p-2 font-semibold">{o.crop_name}</td>
                                        <td className="p-2">{o.yield_amount} {o.yield_unit}</td>
                                        <td className="p-2">{o.revenue.toLocaleString('en-IN')}</td>
                                        <td className="p-2 text-sm text-gray-500">{o.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {outcomes.length === 0 && <p className="text-center py-8 text-gray-500">No harvests tracked by any user yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuccessTrackerViewer;
