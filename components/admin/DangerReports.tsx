import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { getReports } from '../../services/reportService.js';
import { Report } from '../../types.js';
import SkeletonLoader from '../SkeletonLoader.js';

const AiDiagnosisReports = () => {
    const { t } = useAppContext();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            const reportData = await getReports();
            setReports(reportData);
            setLoading(false);
        };
        fetchReports();
    }, []);

    if (loading) return <SkeletonLoader className="h-screen"/>

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">AI Diagnosis Reports</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-2">Date</th>
                                <th className="p-2">User</th>
                                <th className="p-2">Disease</th>
                                <th className="p-2">Confidence</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.id} className="border-b dark:border-gray-700">
                                    <td className="p-2">{new Date(report.created_at).toLocaleString()}</td>
                                    <td className="p-2">{report.user_email}</td>
                                    <td className="p-2 font-semibold">{report.disease}</td>
                                    <td className="p-2">{report.confidence}%</td>
                                    <td className="p-2">
                                        <button onClick={() => setSelectedReport(report)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {reports.length === 0 && <p className="text-center py-8 text-gray-500">No reports found.</p>}
                </div>
            </div>
            {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} t={t} />}
        </div>
    );
};

const ReportDetailModal = ({ report, onClose, t }: { report: Report, onClose: () => void, t: any }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                &times;
            </button>
            <h2 className="text-2xl font-bold text-primary dark:text-primary-light mb-4">{t('diagnosis_result')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <img src={report.photo_url} alt="Analyzed crop" className="rounded-lg w-full" />
                    <div className="mt-4 text-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-lg font-semibold">{report.disease}</p>
                        <p className="text-base text-gray-500">{t('confidence_score')}: <span className="font-bold text-lg">{report.confidence}%</span></p>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <h3 className="text-lg font-bold">{t('why_it_works')}</h3>
                        <p className="text-base text-gray-600 dark:text-gray-300">{report.ai_explanation}</p>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold">{t('recommended_treatment')}</h3>
                        <p className="text-base text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{report.treatment}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default AiDiagnosisReports;