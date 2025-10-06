import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogoIcon, ArrowLeftIcon } from '../components/Icons';
import { supabase } from '../lib/supabaseClient';

const LoginPage = () => {
    const { t, isOnline } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        e.preventDefault();
        window.location.hash = hash;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isOnline) {
            setError(t('error_offline_login'));
            return;
        }

        setLoading(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
        });

        if (signInError) {
            setError(signInError.message);
        } else {
            // The onAuthStateChange listener in AppContext will handle fetching
            // the profile and the router in App.tsx will redirect.
            // No need to manually redirect here.
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <a 
                href="#" 
                onClick={(e) => handleNavClick(e, '')} 
                className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                {t('back_to_home')}
            </a>
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                <div className="text-center">
                    <LogoIcon className="h-16 w-16 mx-auto text-primary" />
                    <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Login to Krishi Mitra</h2>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('email_address')}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('password')}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400"
                        >
                            {loading ? 'Logging in...' : t('login')}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <a href="#register" onClick={(e) => handleNavClick(e, 'register')} className="font-medium text-primary hover:text-primary-dark">
                        Register here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;