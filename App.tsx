import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppContextProvider, useAppContext } from './context/AppContext.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import HomePage from './pages/HomePage.js';
import { CheckCircleIcon, CloseIcon, LogoIcon } from './components/Icons.js';

// Lazy load dashboard components to enable code-splitting.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.js'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard.js'));

// Lazy load authentication pages for faster initial load.
const LoginPage = lazy(() => import('./pages/LoginPage.js'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.js'));


const DashboardLoader = () => (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <LogoIcon className="h-20 w-20 text-primary animate-pulse" />
        <p className="mt-4 text-lg font-semibold">Loading Dashboard...</p>
    </div>
);

const AuthPageLoader = () => (
    <div className="flex justify-center items-center min-h-screen">
        <LogoIcon className="h-20 w-20 text-primary animate-pulse" />
    </div>
);

const Router = () => {
    const { profile, user, profileLoading, authLoading } = useAppContext();
    const [hash, setHash] = useState(() => window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const path = hash.substring(1);

    // While initial authentication is happening, render nothing from React.
    // This allows the static App Shell in index.html to remain visible,
    // providing a seamless loading experience without a flash of content.
    if (authLoading) {
        return null;
    }

    // --- Authenticated User Flow ---
    if (user) {
        // If profile is still loading, show a specific dashboard loader
        if (profileLoading || !profile) {
            return <DashboardLoader />;
        }
        
        // Render the correct dashboard based on user role
        if (profile.role === 'admin') {
            return <Suspense fallback={<DashboardLoader />}><AdminDashboard /></Suspense>;
        }
        if (profile.role === 'employee') {
            return <Suspense fallback={<DashboardLoader />}><EmployeeDashboard /></Suspense>;
        }
    }

    // --- Unauthenticated User Flow ---
    if (path === 'login') {
        return <Suspense fallback={<AuthPageLoader />}><LoginPage /></Suspense>;
    }
    if (path === 'register') {
        return <Suspense fallback={<AuthPageLoader />}><RegisterPage /></Suspense>;
    }
    
    // If an unauthenticated user tries to access a dashboard path, redirect them
    if (path.startsWith('dashboard/')) {
        window.location.hash = 'login';
        return null;
    }

    // Default to the homepage for all other cases
    return <HomePage />;
};


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