
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AIDiagnosis from '../components/dashboard/AIDiagnosis';
import WeatherAlerts from '../components/dashboard/WeatherAlerts';
import AdvisoryCalendar from '../components/dashboard/AdvisoryCalendar';
import KnowledgeBase from '../components/dashboard/KnowledgeBase';
import SuccessTracker from '../components/dashboard/SuccessTracker';
import SuppliersDirectory from '../components/dashboard/SuppliersDirectory';
import VideoTutorials from '../components/dashboard/VideoTutorials';
import CommunityFeed from '../components/dashboard/CommunityFeed';
import FeedbackModal from '../components/dashboard/FeedbackModal';
import { FeedbackIcon } from '../components/Icons';

type Tab = 'ai_diagnosis' | 'weather_alerts' | 'advisory_calendar' | 'knowledge_base' | 'success_tracker' | 'suppliers_directory' | 'video_tutorials' | 'community_feed';

const EmployeeDashboard = () => {
    const { t, isSidebarOpen } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('ai_diagnosis');
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

    const tabs: { id: Tab; label: string; }[] = [
        { id: 'ai_diagnosis', label: t('ai_diagnosis') },
        { id: 'weather_alerts', label: t('weather_alerts') },
        { id: 'advisory_calendar', label: t('advisory_calendar') },
        { id: 'knowledge_base', label: t('knowledge_base') },
        { id: 'success_tracker', label: t('success_tracker') },
        { id: 'suppliers_directory', label: t('suppliers_directory') },
        { id: 'video_tutorials', label: t('video_tutorials') },
        { id: 'community_feed', label: t('community_feed') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'ai_diagnosis': return <AIDiagnosis />;
            case 'weather_alerts': return <WeatherAlerts />;
            case 'advisory_calendar': return <AdvisoryCalendar />;
            case 'knowledge_base': return <KnowledgeBase />;
            case 'success_tracker': return <SuccessTracker />;
            case 'suppliers_directory': return <SuppliersDirectory />;
            case 'video_tutorials': return <VideoTutorials />;
            case 'community_feed': return <CommunityFeed />;
            default: return <AIDiagnosis />;
        }
    };
    
    const SidebarContent = () => (
         <div className="h-full flex flex-col justify-between">
            <nav className="flex-grow">
                <ul>
                    {tabs.map(tab => (
                        <li key={tab.id}>
                            <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 rounded-md font-semibold transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <button
                onClick={() => setFeedbackModalOpen(true)}
                className="w-full text-left px-4 py-3 mt-4 rounded-md font-semibold transition-colors flex items-center gap-2 text-primary-dark dark:text-primary-light bg-primary-light/50 dark:bg-primary-dark/30 hover:bg-primary-light/80 dark:hover:bg-primary-dark/50"
            >
               <FeedbackIcon className="w-5 h-5" /> {t('submit_feedback')}
            </button>
        </div>
    )

    return (
        <div className="flex">
            {/* Sidebar for large screens */}
            <aside className="hidden lg:block w-64 h-[calc(100vh-68px)] sticky top-[68px] bg-white dark:bg-gray-800 p-4 shadow-lg">
               <SidebarContent />
            </aside>
            
             {/* Sidebar for mobile/tablet (drawer) */}
            <div className={`fixed inset-0 z-40 lg:hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <aside className="w-64 h-full bg-white dark:bg-gray-800 p-4 shadow-lg pt-20">
                     <SidebarContent />
                 </aside>
            </div>


            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-68px)]">
                {renderContent()}
            </main>
            {isFeedbackModalOpen && <FeedbackModal onClose={() => setFeedbackModalOpen(false)} />}
        </div>
    );
};

export default EmployeeDashboard;
