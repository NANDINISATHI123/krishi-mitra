
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import UserManagement from '../components/admin/UserManagement';
// FIX: Corrected the import path to point to the actual file name.
import TutorialManagement from '../components/admin/ContentManagement';
import SupplierManagement from '../components/admin/SupplierManagement';
import FeedbackViewer from '../components/admin/FeedbackViewer';
import AiDiagnosisReports from '../components/admin/DangerReports';
import SuccessTrackerViewer from '../components/admin/SuccessTrackerViewer';
import CommunityFeedViewer from '../components/admin/CommunityFeedViewer';
import CalendarManagement from '../components/admin/CalendarManagement';

type AdminTab = 'users' | 'tutorials' | 'suppliers' | 'reports' | 'calendar' | 'outcomes' | 'community' | 'feedback';

const AdminDashboard = () => {
    const { t, isSidebarOpen } = useAppContext();
    const [activeTab, setActiveTab] = useState<AdminTab>('reports');

    const tabs: { id: AdminTab; label: string; }[] = [
        { id: 'reports', label: 'AI Diagnosis Reports' },
        { id: 'users', label: t('user_management_admin') },
        { id: 'tutorials', label: t('manage_tutorials') },
        { id: 'suppliers', label: t('manage_suppliers') },
        { id: 'calendar', label: t('calendar_management_admin') },
        { id: 'outcomes', label: 'Success Tracker' },
        { id: 'community', label: 'Community Feed' },
        { id: 'feedback', label: 'User Feedback' },
    ];

    const renderContent = () => {
        // This is a performance optimization. By using CSS to hide/show, we keep the component
        // state (like scroll position or data) alive when switching tabs, making the UI feel instant.
        return (
            <>
                <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}><AiDiagnosisReports /></div>
                <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}><UserManagement /></div>
                <div style={{ display: activeTab === 'tutorials' ? 'block' : 'none' }}><TutorialManagement /></div>
                <div style={{ display: activeTab === 'suppliers' ? 'block' : 'none' }}><SupplierManagement /></div>
                <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}><CalendarManagement /></div>
                <div style={{ display: activeTab === 'outcomes' ? 'block' : 'none' }}><SuccessTrackerViewer /></div>
                <div style={{ display: activeTab === 'community' ? 'block' : 'none' }}><CommunityFeedViewer /></div>
                <div style={{ display: activeTab === 'feedback' ? 'block' : 'none' }}><FeedbackViewer /></div>
            </>
        )
    };
    
    const SidebarContent = () => (
         <nav>
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
    );

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
        </div>
    );
};

export default AdminDashboard;
