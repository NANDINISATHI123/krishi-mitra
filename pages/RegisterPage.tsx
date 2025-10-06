import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogoIcon, ArrowLeftIcon } from '../components/Icons';
import { supabase } from '../lib/supabaseClient';

const RegisterPage = () => {
    const { t, isOnline } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        e.preventDefault();
        window.location.hash = hash;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!isOnline) {
            setError(t('error_offline_register'));
            return;
        }

        setLoading(true);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
                data: {
                    name: name.trim(),
                    role: 'employee', // All sign-ups are employees
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            // After successful sign-up, attempt to sign in immediately.
            // This will work if the user has disabled "Confirm email" in their Supabase project settings.
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (signInError) {
                // If sign-in fails, it's because email confirmation is required.
                // Show the success page which instructs the user to check their email.
                setSuccess(true);
            }
            // If sign-in is successful, the onAuthStateChange listener in AppContext
            // will automatically handle the session and redirect the user to the dashboard.
        }
        setLoading(false);
    };
    
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-6 text-center">
                    <LogoIcon className="h-16 w-16 mx-auto text-primary" />
                    <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Registration Successful!</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please check your email to confirm your account, then you can log in.
                    </p>
                    <a href="#login" onClick={(e) => handleNavClick(e, 'login')} className="w-full block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

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
                    <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Create your Account</h2>
                </div>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           {t('name')}
                        </label>
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('email_address')}
                        </label>
                        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('password')}
                        </label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400">
                            {loading ? 'Registering...' : t('register')}
                        </button>
                    </div>
                </form>

                 <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <a href="#login" onClick={(e) => handleNavClick(e, 'login')} className="font-medium text-primary hover:text-primary-dark">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;