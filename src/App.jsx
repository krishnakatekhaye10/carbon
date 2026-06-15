import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Sun, Moon, Home, GraduationCap, Newspaper, Vote, Compass, Users } from 'lucide-react';
import { ToastProvider, useToast } from './components/ToastContext';
import { calculateCarbonBreakdown, calculateCarbonFootprint } from './utils/footprintMath';
import { HABIT_LIBRARY } from './utils/constants';

const Hero = lazy(() => import('./components/Hero'));
const TrackingTools = lazy(() => import('./components/TrackingTools'));
const Education = lazy(() => import('./components/Education'));
const ClimateBuzz = lazy(() => import('./components/ClimateBuzz'));
const ActPlatform = lazy(() => import('./components/ActPlatform'));
const Login = lazy(() => import('./components/Login'));
const LiveBackground = lazy(() => import('./components/LiveBackground'));
const GlobalStatsBar = lazy(() => import('./components/GlobalStatsBar'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const HabitTracker = lazy(() => import('./components/HabitTracker'));
const Compare = lazy(() => import('./components/Compare'));
const Coach = lazy(() => import('./components/Coach'));
const WeatherAqiWidget = lazy(() => import('./components/WeatherAqiWidget'));


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

function AppInner() {
  const { addToast } = useToast();
  const [theme, setTheme] = useState('light'); // Eco-centric default is Light Mode
  const [activeTab, setActiveTab] = useState('home'); // Starts on home portal
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [calculatorData, setCalculatorData] = useState(DEFAULT_CALCULATOR_DATA);

  // Authentication State
  const [user, setUser] = useState(null);

  // Carbon Sub-routing inside Tracking -> Carbon Footprint
  const [carbonSubTab, setCarbonSubTab] = useState('dashboard');

  // Gamification States
  const [activeHabits, setActiveHabits] = useState([]);
  const [completedThisWeek, setCompletedThisWeek] = useState([]);
  const [totalSavedCo2, setTotalSavedCo2] = useState(0); // in kg
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badgeIds, setBadgeIds] = useState(['sprout']);

  // Sync theme attribute on document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Carbon Footprint calculation hooks
  const calculateBreakdown = calculateCarbonBreakdown;
  const calculateFootprint = calculateCarbonFootprint;

  const updateCalculatorData = (category, field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // XP progression system
  const addXp = (amount) => {
    const nextXp = xp + amount;
    const nextLevel = Math.floor(nextXp / 400) + 1;
    setXp(nextXp);
    
    if (nextLevel > level) {
      setLevel(nextLevel);
      addToast(`🎉 Level Up! You reached Level ${nextLevel}!`, 'success', 4000);
      if (nextLevel >= 4 && !badgeIds.includes('climate_hero')) {
        setBadgeIds(b => [...b, 'climate_hero']);
      }
    }
    addToast(`+${amount} XP earned! Keep it up 🌿`, 'info', 2500);
  };

  const adoptHabit = (habitId) => {
    if (!activeHabits.includes(habitId)) {
      setActiveHabits(prev => [...prev, habitId]);
      if (activeHabits.length === 0 && !badgeIds.includes('first_habit')) {
        setBadgeIds(prev => [...prev, 'first_habit']);
      }
    }
  };

  const removeHabit = (habitId) => {
    setActiveHabits(prev => prev.filter(id => id !== habitId));
    setCompletedThisWeek(prev => prev.filter(id => id !== habitId));
  };

  const completeHabit = (habitId) => {
    if (!completedThisWeek.includes(habitId)) {
      const habit = HABIT_LIBRARY.find(h => h.id === habitId);
      if (!habit) return;

      setCompletedThisWeek(prev => [...prev, habitId]);
      setTotalSavedCo2(prev => {
        const nextVal = prev + habit.co2Saved;
        if (nextVal >= 50 && !badgeIds.includes('carbon_slayer')) {
          setBadgeIds(b => [...b, 'carbon_slayer']);
        }
        return nextVal;
      });

      addXp(habit.xp);
    }
  };

  const handleOnboardingComplete = (data) => {
    setCalculatorData(data);
    setIsOnboarded(true);
  };

  const footprint = useMemo(() => calculateCarbonFootprint(calculatorData), [calculatorData]);
  const breakdown = useMemo(() => calculateCarbonBreakdown(calculatorData), [calculatorData]);

  // RENDER CARBON DETAILED SUB-TAB (Breathing Orb, Sliders, Habits, Compare, Coach)
  const renderCarbonDashboard = () => {
    if (!isOnboarded) {
      return (
        <Onboarding
          onComplete={handleOnboardingComplete}
          initialData={calculatorData}
          calculateFootprint={calculateFootprint}
        />
      );
    }

    return (
      <div className="glass-card animate-fade-in" style={{ padding: 24 }}>
        {/* Carbon Sub Nav */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: 'Orb & Sliders' },
            { id: 'habits', label: 'Adopt Habits' },
            { id: 'compare', label: 'Compare Footprint' },
            { id: 'coach', label: 'Climate Coach' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCarbonSubTab(tab.id)}
              className="tab-btn"
              style={{
                fontSize: 12,
                padding: '6px 12px',
                backgroundColor: carbonSubTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                color: carbonSubTab === tab.id ? 'var(--color-accent)' : 'var(--text-secondary)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-routing render */}
        {carbonSubTab === 'dashboard' && (
          <Dashboard
            data={calculatorData}
            onUpdate={updateCalculatorData}
            calculateBreakdown={calculateBreakdown}
            calculateFootprint={calculateFootprint}
          />
        )}

        {carbonSubTab === 'habits' && (
          <HabitTracker
            activeHabits={activeHabits}
            completedThisWeek={completedThisWeek}
            totalSavedCo2={totalSavedCo2}
            xp={xp}
            level={level}
            adoptHabit={adoptHabit}
            removeHabit={removeHabit}
            completeHabit={completeHabit}
            badgeIds={badgeIds}
          />
        )}

        {carbonSubTab === 'compare' && (
          <Compare footprint={footprint} addXp={addXp} user={user} />
        )}

        {carbonSubTab === 'coach' && (
          <Coach
            footprint={footprint}
            breakdown={breakdown}
            data={calculatorData}
            user={user}
          />
        )}
      </div>
    );
  };

  // IF USER IS NOT LOGGED IN, INTERCEPT APP VIEW
  if (!user) {
    return (
      <Suspense fallback={<div aria-busy="true" className="skeleton">Loading…</div>}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <LiveBackground theme={theme} />
        {/* Header decoration */}
        <header className="glass-card" style={{
          margin: '20px 20px 0',
          padding: '16px 24px',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: 'linear-gradient(135deg, #34d399, #059669)',
              width: 38,
              height: 38,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16,185,129,0.4)'
            }}>
              <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C24 2, 28 10, 26 18C24 25, 18 28, 10 26C6 19, 8 9, 16 2Z" fill="rgba(255,255,255,0.9)"/>
                <path d="M16 2 L13 22" stroke="#059669" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M13 15C15 13, 19 12, 22 13" stroke="#059669" strokeWidth="1" strokeLinecap="round"/>
                <path d="M13 19C15 17.5, 18 17, 21 18" stroke="#059669" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="16" cy="9" r="2" fill="#10b981"/>
                <circle cx="20" cy="13" r="1.5" fill="#10b981"/>
                <circle cx="19" cy="19" r="1.5" fill="#10b981"/>
                <path d="M13 26 L13 30 M13 30 L10 27 M13 30 L16 27" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <h1 style={{ fontSize: 19, color: 'var(--text-primary)', lineHeight: 1 }}>Climatora</h1>
              <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                Sustaining Future
              </span>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Login onLogin={(profile) => setUser(profile)} />
        </main>
      </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div aria-busy="true" className="skeleton">Loading…</div>}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <LiveBackground theme={theme} />

      {/* Top Navbar */}
      <header className="glass-card" style={{
        margin: '20px 20px 0',
        padding: '16px 24px',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <span style={{
              background: 'linear-gradient(135deg, #34d399, #059669)',
              width: 38,
              height: 38,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16,185,129,0.4)'
            }}>
              <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C24 2, 28 10, 26 18C24 25, 18 28, 10 26C6 19, 8 9, 16 2Z" fill="rgba(255,255,255,0.9)"/>
                <path d="M16 2 L13 22" stroke="#059669" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M13 15C15 13, 19 12, 22 13" stroke="#059669" strokeWidth="1" strokeLinecap="round"/>
                <path d="M13 19C15 17.5, 18 17, 21 18" stroke="#059669" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="16" cy="9" r="2" fill="#10b981"/>
                <circle cx="20" cy="13" r="1.5" fill="#10b981"/>
                <circle cx="19" cy="19" r="1.5" fill="#10b981"/>
                <path d="M13 26 L13 30 M13 30 L10 27 M13 30 L16 27" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          <div>
            <h1 style={{ fontSize: 19, color: 'var(--text-primary)', lineHeight: 1 }}>Climatora</h1>
            <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
              Sustaining Future
            </span>
          </div>
        </div>

        {/* User Profile details & Toggler */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-tertiary)',
            padding: '6px 12px',
            borderRadius: 14,
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: 18 }}>{user.avatar}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', maxWidth: 85, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
              <span style={{ fontSize: 9, color: 'var(--color-accent)', fontWeight: 800 }}>
                Level {level} • {xp} XP
              </span>
            </div>
          </div>

          <button
            onClick={() => { setUser(null); setIsOnboarded(false); setActiveTab('home'); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-rose)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Sign Out
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 20px 100px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {activeTab === 'home' ? (
          <div>
            {/* Hero Section */}
            <Hero onNavigate={(tab) => setActiveTab(tab)} />

            {/* Global Real-time Climate Stats */}
            <GlobalStatsBar />
            
            {/* Live Weather & AQI Location Widget */}
            <WeatherAqiWidget />
            
            {/* Grid-Based Dashboard Architecture */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 24 }}>Explore Interactive Portals</h3>
              <div className="dashboard-grid-container">
                
                {/* Grid Item 1: Track */}
                <div 
                  className="glass-card" 
                  onClick={() => setActiveTab('track')}
                  style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <span style={{ fontSize: 32 }}>📊</span>
                  <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Track Environmental Impact</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Assess your Carbon Footprint, Water usage, general Sustainability Quotient, and vulnerability index.
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', marginTop: 'auto' }}>Launch Calculators →</span>
                </div>

                {/* Grid Item 2: Learn */}
                <div 
                  className="glass-card" 
                  onClick={() => setActiveTab('learn')}
                  style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <span style={{ fontSize: 32 }}>🎓</span>
                  <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Learning Academy</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Build environmental skills via quizzes, search definitions in our Glossary, and RSVP for green workshops.
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', marginTop: 'auto' }}>Open Academy →</span>
                </div>

                {/* Grid Item 3: Buzz */}
                <div 
                  className="glass-card" 
                  onClick={() => setActiveTab('buzz')}
                  style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <span style={{ fontSize: 32 }}>📰</span>
                  <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Climate Buzz Feed</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Stay informed with Climate Watch news, stories regarding advocates, calendars, and educational blogs.
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', marginTop: 'auto' }}>Explore Buzz →</span>
                </div>

                {/* Grid Item 4: Act */}
                <div 
                  className="glass-card" 
                  onClick={() => setActiveTab('act')}
                  style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <span style={{ fontSize: 32 }}>🗳️</span>
                  <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Community Act Platform</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Cast votes on local priorities, enter eco contests, check buying guides, and publish green posts.
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', marginTop: 'auto' }}>Take Action →</span>
                </div>

                {/* Grid Item 5: Community */}
                <div 
                  className="glass-card" 
                  onClick={() => setActiveTab('community')}
                  style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <span style={{ fontSize: 32 }}>🏆</span>
                  <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Eco Leaderboard</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    See the top eco warriors, compare your XP rank, and get inspired by the community.
                  </p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', marginTop: 'auto' }}>View Rankings →</span>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'track' && (
              <TrackingTools
                data={calculatorData}
                calculateFootprint={calculateFootprint}
                renderCarbonDashboard={renderCarbonDashboard}
              />
            )}

            {activeTab === 'learn' && (
              <Education addXp={addXp} />
            )}

            {activeTab === 'buzz' && (
              <ClimateBuzz addXp={addXp} user={user} />
            )}

            {activeTab === 'act' && (
              <ActPlatform addXp={addXp} />
            )}

            {activeTab === 'community' && (
              <Leaderboard xp={xp} level={level} user={user} />
            )}
          </div>
        )}
      </main>

      {/* Persistent Glassmorphic Bottom Navigation Bar */}
      <nav className="glass-card" style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px',
        borderRadius: '20px',
        display: 'flex',
        gap: 6,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        zIndex: 100,
        maxWidth: '95%',
        width: 500
      }}>
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'track', label: 'Track', icon: Compass },
          { id: 'learn', label: 'Learn', icon: GraduationCap },
          { id: 'buzz', label: 'Buzz', icon: Newspaper },
          { id: 'act', label: 'Act', icon: Vote },
          { id: 'community', label: 'Ranks', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'track' && !isOnboarded) {
                  setCarbonSubTab('dashboard');
                }
              }}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', padding: '10px 0', fontSize: 13 }}
            >
              <Icon size={18} />
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .tab-label {
            display: none !important;
          }
          nav {
            width: 320px !important;
          }
        }
      `}</style>
    </div>
      </Suspense>
  );
}
