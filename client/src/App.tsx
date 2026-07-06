import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastProvider, useToast } from './components/Toast';

// Import Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterFlow } from './pages/RegisterFlow';
import { HirerDashboard } from './pages/HirerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { WorkerProfile } from './pages/WorkerProfile';
import { AdminDashboard } from './pages/AdminDashboard';

// Import Icons
import { 
  Sun, Moon, Globe, Menu, X, Users, Settings, UserCheck, ShieldCheck, HeartHandshake 
} from 'lucide-react';

const NavigationBar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('laborlink_dark') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('laborlink_dark', String(dark));
  }, [dark]);

  const navLinks = [
    { path: '/', label: t('navHome') },
    { path: '/find', label: t('navFind') },
    { path: '/dashboard', label: t('navDashboard') },
    { path: '/admin', label: t('navAdmin') }
  ];

  const handleLanguageToggle = (lang: 'en' | 'te' | 'hi') => {
    setLanguage(lang);
  };

  return (
    <nav className="glass sticky top-0 z-[5000] border-b border-slate-200/40 dark:border-slate-800/40 py-4 px-4 transition-all">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo / Brand Name */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold font-display tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent transform hover:scale-102 transition-all active:scale-98"
        >
          <HeartHandshake className="w-6 h-6 text-primary shrink-0" />
          <span>{t('title')}</span>
        </Link>

        {/* Desktop Navbar Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-650 dark:text-slate-300">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-all hover:text-primary ${
                  isActive ? 'text-primary border-b-2 border-primary pb-1' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Utility bar: Dark toggle, language, mobile triggers */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/30 dark:border-slate-700/30 text-slate-600 dark:text-slate-350"
            title="Toggle theme mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative group">
            <button
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200/30 dark:border-slate-700/30 text-slate-600 dark:text-slate-350 flex items-center gap-1.5 text-xs font-bold"
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Dropdown Languages list overlay */}
            <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all p-1 flex flex-col gap-1 w-28">
              {[
                { code: 'en', label: 'English' },
                { code: 'te', label: 'తెలుగు' },
                { code: 'hi', label: 'हिन्दी' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageToggle(lang.code as any)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 transition-all ${
                    language === lang.code ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3 font-semibold text-sm animate-slide-up">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl hover:text-primary ${
                location.pathname === link.path ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-450'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col justify-between">
            <div>
              <NavigationBar />
              
              {/* Main Content Area Container */}
              <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/register" element={<RegisterFlow />} />
                  <Route path="/find" element={<HirerDashboard />} />
                  <Route path="/dashboard" element={<WorkerDashboard />} />
                  <Route path="/profile/:id" element={<WorkerProfile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
            </div>

            {/* Platform footer */}
            <footer className="border-t border-slate-200/40 dark:border-slate-800/40 py-8 px-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-950 mt-12 transition-all">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-1.5 font-bold font-display text-slate-600 dark:text-slate-350">
                  <HeartHandshake className="w-4 h-4 text-primary" /> LaborLink Platform
                </div>
                <div>© 2026 LaborLink. Built to empower workers and teams. All rights reserved.</div>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
