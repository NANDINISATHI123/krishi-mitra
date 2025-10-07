import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.js';
import { supabase } from '../lib/supabaseClient.js';
import { LogoIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, LogoutIcon } from './Icons.js';

const Header = () => {
  const { theme, toggleTheme, language, setLanguage, t, profile, isSidebarOpen, setIsSidebarOpen, showToast } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    window.location.hash = hash;
    setIsMenuOpen(false);
  };

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      showToast(t('error_generic'), 'error');
    }
    // Auth listener in context will handle state change
    window.location.hash = '';
    setIsMenuOpen(false);
    setIsSidebarOpen(false);
  };

  if (profile) {
    // Simplified header for logged-in users (dashboard view)
    return (
      <header className="sticky top-0 z-50 bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label={isSidebarOpen ? "Close menu" : "Open menu"}>
              {isSidebarOpen ? <CloseIcon className="h-8 w-8" /> : <MenuIcon className="h-8 w-8" />}
            </button>
            <a href="#" onClick={(e) => {
                const newHash = profile.role === 'admin' ? 'dashboard/admin' : 'dashboard/employee';
                handleNavClick(e, newHash);
            }} className="flex items-center gap-2">
              <LogoIcon className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-primary dark:text-primary-light font-sans">Krishi Mitra</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
             <div className="relative">
             <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'te')}
                className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Change language"
             >
                <option value="en">EN</option>
                <option value="te">TE</option>
             </select>
           </div>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle theme">
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                title={t('logout')}
            >
                <LogoutIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Header for logged-out users (public pages)
  const NavLinks = () => (
    <>
      <a href="#" onClick={(e) => handleNavClick(e, '')} className="hover:text-primary transition-colors">{t('home')}</a>
      <a href="#login" onClick={(e) => handleNavClick(e, 'login')} className="hover:text-primary transition-colors">{t('login')}</a>
      <a href="#register" onClick={(e) => handleNavClick(e, 'register')} className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors">{t('register')}</a>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="#" onClick={(e) => handleNavClick(e, '')} className="flex items-center gap-2">
          <LogoIcon className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold text-primary dark:text-primary-light font-sans">Krishi Mitra</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-lg">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-4">
           <div className="relative">
             <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'te')}
                className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Change language"
             >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
             </select>
           </div>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle theme">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
              {isMenuOpen ? <CloseIcon className="h-8 w-8" /> : <MenuIcon className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-bg-light dark:bg-bg-dark absolute top-full left-0 w-full shadow-lg">
          <nav className="flex flex-col items-center gap-6 p-6 text-lg">
            <NavLinks />
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;