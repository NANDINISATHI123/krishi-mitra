


import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { translations, Language } from '../lib/translations';
import { Profile, Theme, FontSize } from '../types';
import { getQueuedActions, processActionQueue } from '../services/offlineService';

interface AppContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    authLoading: boolean;
    profileLoading: boolean;
    theme: Theme;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
    isOnline: boolean;
    pendingActionCount: number;
    refreshData: () => void;
    refreshPendingCount: () => void;
    syncSuccessMessage: string;
    setSyncSuccessMessage: (message: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingActionCount, setPendingActionCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [syncSuccessMessage, setSyncSuccessMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    const [language, setLanguage] = useState<Language>(() => {
        return (localStorage.getItem('language') as Language) || 'en';
    });

    const refreshPendingCount = useCallback(async () => {
        const actions = await getQueuedActions();
        setPendingActionCount(actions.length);
    }, []);

    const fetchProfileAndSet = useCallback(async (userToFetch: User | null) => {
        if (!userToFetch) {
            setProfile(null);
            setProfileLoading(false);
            return;
        }

        setProfileLoading(true);
        try {
            const { data: profileData, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userToFetch.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (profileData) {
                setProfile(profileData);
            } else {
                console.warn(`No profile found for user ${userToFetch.id}, creating one.`);
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userToFetch.id,
                        email: userToFetch.email,
                        name: userToFetch.user_metadata.name || userToFetch.email,
                        role: 'employee'
                    })
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                setProfile(newProfile);
            }
        } catch (error) {
            console.error("Critical error fetching or creating profile:", error);
            await supabase.auth.signOut();
            setProfile(null); 
        } finally {
            setProfileLoading(false);
        }
    }, []);
    
    // Effect to set up auth listener and handle initial session
    useEffect(() => {
        const checkInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                await fetchProfileAndSet(session?.user ?? null);
            } catch (error) {
                console.error("Error during initial session check:", error);
            } finally {
                setAuthLoading(false);
            }
        };
        
        checkInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                
                if (_event === 'SIGNED_IN') {
                    await fetchProfileAndSet(session?.user ?? null);
                } else if (_event === 'SIGNED_OUT') {
                    setProfile(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfileAndSet]);

    // Effect for online/offline status and queue processing
    useEffect(() => {
        refreshPendingCount();

        const handleOnline = async () => {
            setIsOnline(true);
            const synced = await processActionQueue();
            if (synced) {
                setSyncSuccessMessage(translations[language].sync_complete_refresh);
                setRefreshKey(prev => prev + 1);
            }
            await refreshPendingCount();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [refreshPendingCount, language]);

    // Effect to explicitly refresh data when `refreshKey` changes (e.g., after sync)
    useEffect(() => {
        if (refreshKey > 0 && user) {
            fetchProfileAndSet(user);
        }
    }, [refreshKey, user, fetchProfileAndSet]);
    
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);
    

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const t = (key: keyof typeof translations['en']): string => {
        return translations[language]?.[key] || translations['en'][key];
    };
    
    const value = {
        session,
        user,
        profile,
        authLoading,
        profileLoading,
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        isOnline,
        pendingActionCount,
        refreshData: () => setRefreshKey(k => k + 1),
        refreshPendingCount: refreshPendingCount,
        syncSuccessMessage,
        setSyncSuccessMessage,
        isSidebarOpen,
        setIsSidebarOpen,
    };

    return (
        <AppContext.Provider value={value}>
            {!authLoading && children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};