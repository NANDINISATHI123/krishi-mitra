import React, { useState, useEffect } from 'react';
import { AppContextProvider, useAppContext } from './context/AppContext.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
// FIX: Corrected import paths.
import AdminDashboard from './pages/AdminDashboard.js';
import EmployeeDashboard from './pages/EmployeeDashboard.js';
import { CheckCircleIcon, CloseIcon, LogoIcon } from './components/Icons.js';

const Router = () => {
    const { profile, user, profileLoading } = useAppContext();
    const [hash, setHash] = useState(() => window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const path = hash.substring(1);

    // If the user is authenticated but we are still fetching their profile, show a loading screen.
    if (user && profileLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
                <LogoIcon className="h-20 w-20 text-primary animate-pulse" />
                <p className="mt-4 text-lg font-semibold">Loading your dashboard...</p>
            </div>
        );
    }
    
    if (profile) {
        const adminPath = 'dashboard/admin';
        const employeePath = 'dashboard/employee';

        if (profile.role === 'admin' && (path === adminPath || path === '')) {
            return <AdminDashboard />;
        }
        if (profile.role === 'employee' && (path === employeePath || path === '')) {
             return <EmployeeDashboard />;
        }
         // If a logged-in user tries to access login/register or another dashboard, redirect them.
        if (path === 'login' || path === 'register' || (profile.role === 'admin' && path === employeePath) || (profile.role === 'employee' && path === adminPath)) {
             window.location.hash = profile.role === 'admin' ? adminPath : employeePath;
             return null;
        }
    }
    
    if (path === 'login') return <LoginPage />;
    if (path === 'register') return <RegisterPage />;
    
    return <HomePage />;
}

const OfflineBanner = () => {
    const { isOnline, t, pendingActionCount } = useAppContext();

    if (isOnline) {
        return null;
    }

    return (
        <div className="bg-yellow-500 text-center text-white p-2 font-semibold">
            <span>{t('you_are_offline')}</span>
            {pendingActionCount > 0 && 
                <span className="ml-2 font-normal">
                    ({pendingActionCount} {t('pending_sync')})
                </span>
            }
        </div>
    );
};

const SyncSuccessBanner = () => {
    const { syncSuccessMessage, setSyncSuccessMessage } = useAppContext();

    useEffect(() => {
        if (syncSuccessMessage) {
            const timer = setTimeout(() => {
                setSyncSuccessMessage('');
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [syncSuccessMessage, setSyncSuccessMessage]);

    if (!syncSuccessMessage) {
        return null;
    }

    return (
        <div className="bg-green-500 text-center text-white p-2 font-semibold flex justify-center items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span>{syncSuccessMessage}</span>
            <button onClick={() => setSyncSuccessMessage('')} className="absolute right-4">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    );
}

const App = () => {
    const [hash, setHash] = useState(() => window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const isAuthPage = hash === '#login' || hash === '#register';

    return (
        <AppContextProvider>
            <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark font-body">
                {!isAuthPage && <Header />}
                <OfflineBanner />
                <SyncSuccessBanner />
                <main className="flex-grow">
                    <Router />
                </main>
                {!isAuthPage && <Footer />}
            </div>
        </AppContextProvider>
    );
};

export default App;