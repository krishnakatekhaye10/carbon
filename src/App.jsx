import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Home, Compass, GraduationCap, Newspaper, Vote, Award, Shield, User, LogOut, Loader2 } from 'lucide-react';
import { ToastProvider, useToast } from './components/ToastContext';
import { calculateCarbonBreakdown, calculateCarbonFootprint } from './utils/footprintMath';

// Lazy loaded page components
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CoachPage = lazy(() => import('./pages/CoachPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ActPlatformPage = lazy(() => import('./pages/ActPlatformPage'));

const DEFAULT_CALCULATOR_DATA = {
  transport: { carKm: 150, fuelType: 'gas', publicKm: 50 },
  flights: { shortHaul: 2, longHaul: 1 },
  diet: { dietType: 'lowMeat' },
  energy: { electricity: 300, heatingSource: 'gas' },
  lifestyle: { newPurchases: 5, recycling: true }
};

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

function PageSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse" aria-busy="true">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
    </div>
  );
}

function AppInner() {
  const { addToast } = useToast();
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  // Active page state
  const [activeTab, setActiveTab] = useState('home');

  // User state
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('carbon_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Carbon calculator data
  const [calculatorData, setCalculatorData] = useState(() => {
    try {
      const stored = localStorage.getItem('carbon_tracker_data');
      return stored ? JSON.parse(stored) : DEFAULT_CALCULATOR_DATA;
    } catch {
      return DEFAULT_CALCULATOR_DATA;
    }
  });

  // Gamification state
  const [gamification, setGamification] = useState(() => {
    try {
      const stored = localStorage.getItem('carbon_gamification');
      return stored ? JSON.parse(stored) : {
        xp: 0,
        level: 1,
        badgeIds: ['first_calculation'],
        streak: 12,
        lastActiveDate: new Date().toISOString().split('T')[0],
        completedChallenges: [],
        co2Saved: 120, // kg CO2 saved
        waterSaved: 4200, // Liters water saved
        energySaved: 32, // kWh energy saved
        reductionGoal: 20 // percent reduction target
      };
    } catch {
      return {
        xp: 0,
        level: 1,
        badgeIds: ['first_calculation'],
        streak: 12,
        lastActiveDate: new Date().toISOString().split('T')[0],
        completedChallenges: [],
        co2Saved: 120,
        waterSaved: 4200,
        energySaved: 32,
        reductionGoal: 20
      };
    }
  });

  // Onboarding status
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return localStorage.getItem('carbon_onboarded') === 'true';
    } catch {
      return false;
    }
  });

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginAvatar, setLoginAvatar] = useState('🌱');
  const avatars = ['🌱', '🚲', '🌍', '⚡', '🐼', '🦊', '🦉', '🌳'];

  // Sync theme with HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  // Sync state to local storage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('carbon_user', JSON.stringify(user));
      } catch {}
    } else {
      try {
        localStorage.removeItem('carbon_user');
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('carbon_tracker_data', JSON.stringify(calculatorData));
    } catch {}
  }, [calculatorData]);

  useEffect(() => {
    try {
      localStorage.setItem('carbon_gamification', JSON.stringify(gamification));
    } catch {}
  }, [gamification]);

  useEffect(() => {
    try {
      localStorage.setItem('carbon_onboarded', String(isOnboarded));
    } catch {}
  }, [isOnboarded]);

  // Manage login attempt
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginName.trim()) return;
    
    const profile = { name: loginName.trim(), avatar: loginAvatar };
    setUser(profile);
    setShowLoginModal(false);
    addToast(`Welcome back, ${profile.name}! 🌱`, 'success');
  };

  const handleSignOut = () => {
    setUser(null);
    setIsOnboarded(false);
    setActiveTab('home');
    try {
      localStorage.removeItem('carbon_user');
      localStorage.removeItem('carbon_onboarded');
    } catch {}
    addToast('Signed out successfully.', 'info');
  };

  // Gamification helper triggers
  const addXp = (amount) => {
    const nextXp = gamification.xp + amount;
    const nextLevel = Math.floor(nextXp / 400) + 1;
    let earnedBadges = [...gamification.badgeIds];

    let badgeNotification = null;

    if (nextLevel > gamification.level) {
      addToast(`🎉 Level Up! You reached Level ${nextLevel}!`, 'success', 4500);
      if (nextLevel >= 2 && !earnedBadges.includes('eco_beginner')) {
        earnedBadges.push('eco_beginner');
        badgeNotification = '🌱 Eco Beginner';
      }
      if (nextLevel >= 3 && !earnedBadges.includes('recycling_champion')) {
        earnedBadges.push('recycling_champion');
        badgeNotification = '♻️ Recycling Champion';
      }
      if (nextLevel >= 4 && !earnedBadges.includes('climate_hero')) {
        earnedBadges.push('climate_hero');
        badgeNotification = '🌍 Climate Hero';
      }
    }

    setGamification(prev => ({
      ...prev,
      xp: nextXp,
      level: nextLevel,
      badgeIds: earnedBadges
    }));

    addToast(`+${amount} XP earned!`, 'info', 2000);
    if (badgeNotification) {
      setTimeout(() => {
        addToast(`🏅 Unlocked Badge: ${badgeNotification}!`, 'success', 4000);
      }, 1000);
    }
  };

  const updateCalculatorData = (category, field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Nav interceptor for unauthenticated users
  const handleNavClick = (tab) => {
    if (tab === 'home') {
      setActiveTab('home');
      return;
    }
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg text-slate-800 dark:text-slate-100 flex flex-col font-jakarta transition-colors duration-200 pb-20 md:pb-0">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 md:px-8 py-4 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('home')}
          aria-label="Climatora Home"
        >
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-500/20">
            C
          </span>
          <div className="flex flex-col text-left">
            <h1 className="text-xl font-bold font-outfit leading-none tracking-tight">Climatora</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sustaining Future</span>
          </div>
        </div>

        {/* Desktop Navbar Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'track', label: 'Dashboard', icon: Compass },
            { id: 'learn', label: 'Learn', icon: GraduationCap },
            { id: 'buzz', label: 'News Feed', icon: Newspaper },
            { id: 'act', label: 'Act & Shop', icon: Vote }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
                aria-label={`Go to ${tab.label}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3">
          {/* User badge */}
          {user ? (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-sm">
              <span className="text-xl" role="img" aria-label="avatar">{user.avatar}</span>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">{user.name}</span>
                <span className="text-[9px] font-bold text-emerald-500">Lv {gamification.level} • {gamification.xp} XP</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="hidden md:flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
              aria-label="Log In"
            >
              <User size={15} />
              Log In
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm transition-all duration-150"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6" id="main-content">
        <Suspense fallback={<PageSkeleton />}>
          {activeTab === 'home' && (
            <HomePage 
              onNavigate={handleNavClick} 
              isLoggedIn={!!user} 
              onLoginClick={() => setShowLoginModal(true)} 
            />
          )}

          {activeTab === 'track' && user && (
            <DashboardPage
              calculatorData={calculatorData}
              onUpdateCalculator={updateCalculatorData}
              gamification={gamification}
              setGamification={setGamification}
              addXp={addXp}
              isOnboarded={isOnboarded}
              setIsOnboarded={setIsOnboarded}
              onNavigate={handleNavClick}
            />
          )}

          {activeTab === 'learn' && user && (
            <LearnPage addXp={addXp} user={user} gamification={gamification} />
          )}

          {activeTab === 'buzz' && user && (
            <NewsPage user={user} />
          )}

          {activeTab === 'act' && user && (
            <ActPlatformPage 
              gamification={gamification} 
              setGamification={setGamification}
              addXp={addXp} 
              user={user} 
            />
          )}

          {activeTab === 'coach' && user && (
            <CoachPage calculatorData={calculatorData} user={user} />
          )}
        </Suspense>
      </main>

      {/* Mobile Persistent Bottom Nav Bar */}
      <nav 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-850/50 shadow-xl rounded-2xl flex items-center gap-1 p-2 w-[90%] max-w-md z-50 md:hidden backdrop-blur-md"
        aria-label="Mobile Navigation"
      >
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'track', label: 'Track', icon: Compass },
          { id: 'learn', label: 'Learn', icon: GraduationCap },
          { id: 'buzz', label: 'News', icon: Newspaper },
          { id: 'act', label: 'Act', icon: Vote }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavClick(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-[10px] font-bold gap-1 transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              aria-label={`Go to ${tab.label}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Glassmorphic Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-2xl relative"
          >
            <h2 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100 mb-2">Join Climatora 🌱</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create a profile to unlock streaks, achievements, mini-courses, and the AI coach.</p>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Profile Name</label>
                <input
                  id="login-name"
                  type="text"
                  required
                  placeholder="e.g. Eco Sunrise"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Avatar Mascot</label>
                <div className="grid grid-cols-4 gap-3">
                  {avatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setLoginAvatar(av)}
                      className={`h-14 rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                        loginAvatar === av
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-105'
                          : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-805 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-shadow"
                >
                  Let's Go!
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
