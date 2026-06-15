import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Shield, Globe, Award, Sparkles, CheckCircle, Quote, Zap } from 'lucide-react';

export default function HomePage({ onNavigate, isLoggedIn, onLoginClick }) {
  const stats = [
    { label: 'CO₂ Saved Globally', value: '1,248,930 kg', icon: Zap },
    { label: 'Active Eco Warriors', value: '45,200+', icon: Globe },
    { label: 'Equivalent Trees Saved', value: '62,440 🌳', icon: Leaf }
  ];

  const features = [
    {
      title: 'Interactive Carbon Tracker',
      description: 'Log and analyze your daily travel, diet, and energy usage in real-time.',
      icon: Leaf,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
    },
    {
      title: 'AI Climate Coach',
      description: 'Get personalized, Gemini-powered action plans to systematically reduce your footprint.',
      icon: Sparkles,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
    },
    {
      title: 'Eco Gamification',
      description: 'Keep a daily streak, earn level badges, and climb the local leaderboard.',
      icon: Award,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
    },
    {
      title: 'Academy & Mini Courses',
      description: 'Take short courses, check climate terms in the glossary, and earn certificates.',
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
    }
  ];

  const steps = [
    { number: '01', title: 'Input Habits', desc: 'Answer a few simple questions about your daily travel, diet, and electricity.' },
    { number: '02', title: 'Get AI Insights', desc: 'Receive immediate recommendations and sustainability goals tailored by Gemini.' },
    { number: '03', title: 'Build a Streak', desc: 'Complete weekly challenges, log savings, and maintain your action streak.' },
    { number: '04', title: 'Earn Badges', desc: 'Watch your score climb, level up from Eco Beginner to Climate Hero, and export PDF reports.' }
  ];

  const testimonials = [
    {
      quote: "Climatora turned carbon reduction into a game! I reduced my emissions by 15% and love the streak system.",
      author: "Sarah K.",
      role: "Climate Hero 🌱"
    },
    {
      quote: "The AI Coach gave me practical tips that actually saved me money on my utility bill while reducing my carbon footprint.",
      author: "David M.",
      role: "Green Learner 🚲"
    }
  ];

  return (
    <div className="w-full text-slate-800 dark:text-slate-100 font-jakarta">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center py-12 md:py-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 dark:bg-emerald-950/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 dark:bg-blue-950/10 rounded-full filter blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold w-fit border border-emerald-200/50 dark:border-emerald-900/50">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
              Climatora Engagement Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-outfit tracking-tight leading-tight">
              Making Climate Action Part of <span className="text-emerald-500 bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">Everyday Life</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Assess your environmental impact, learn core sustainability skills, stay informed on climate issues, and complete green habits to unlock certificates and badges.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                id="cta-calculate-footprint"
                onClick={() => {
                  if (isLoggedIn) {
                    onNavigate('track');
                  } else {
                    onLoginClick();
                  }
                }}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
                aria-label="Calculate Your Carbon Footprint"
              >
                Calculate Your Carbon Footprint
                <ArrowRight size={18} />
              </button>
              
              {!isLoggedIn && (
                <button
                  id="cta-signin"
                  onClick={onLoginClick}
                  className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm transition duration-200"
                  aria-label="Sign In"
                >
                  Sign In to Track Streaks
                </button>
              )}
            </div>
          </motion.div>

          {/* Green SVG Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center items-center w-full"
          >
            <div className="relative w-full max-w-md aspect-square bg-emerald-100/30 dark:bg-emerald-950/20 rounded-full p-4 border border-emerald-200/20 dark:border-emerald-800/10 flex items-center justify-center">
              <svg viewBox="0 0 500 500" className="w-11/12 h-11/12 drop-shadow-xl" aria-hidden="true">
                <defs>
                  <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="earthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                
                {/* Outer halo */}
                <circle cx="250" cy="250" r="230" fill="url(#skyGrad)" />
                <circle cx="250" cy="250" r="200" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="5 5" className="animate-spin" style={{ animationDuration: '40s' }} />

                {/* Earth Base */}
                <circle cx="250" cy="250" r="140" fill="url(#waterGrad)" />
                
                {/* Continents (Green blobs) */}
                <path d="M 210 130 Q 250 120 280 150 Q 320 180 300 230 Q 250 250 220 220 Q 180 200 210 130 Z" fill="url(#earthGrad)" />
                <path d="M 160 250 Q 180 230 200 260 Q 230 280 210 320 Q 170 340 150 290 Q 140 270 160 250 Z" fill="url(#earthGrad)" />
                <path d="M 280 270 Q 320 250 350 280 Q 360 320 320 340 Q 290 320 280 270 Z" fill="url(#earthGrad)" />
                <path d="M 230 350 Q 260 350 270 370 Q 250 390 230 380 Z" fill="url(#earthGrad)" />

                {/* Trees around Earth */}
                {/* Top Tree */}
                <g transform="translate(250, 75)" className="origin-bottom transform scale-75 hover:scale-90 transition-transform">
                  <rect x="-4" y="0" width="8" height="35" fill="#78350f" rx="2" />
                  <circle cx="0" cy="-10" r="22" fill="#059669" opacity="0.95" />
                  <circle cx="-10" cy="-5" r="16" fill="#10b981" />
                  <circle cx="10" cy="-5" r="16" fill="#34d399" />
                </g>
                
                {/* Left Tree */}
                <g transform="translate(80, 230) rotate(-75)" className="origin-bottom transform scale-75">
                  <rect x="-4" y="0" width="8" height="35" fill="#78350f" rx="2" />
                  <circle cx="0" cy="-10" r="20" fill="#047857" />
                  <circle cx="-8" cy="-5" r="14" fill="#059669" />
                </g>

                {/* Right Tree */}
                <g transform="translate(420, 230) rotate(75)" className="origin-bottom transform scale-75">
                  <rect x="-4" y="0" width="8" height="35" fill="#78350f" rx="2" />
                  <circle cx="0" cy="-10" r="20" fill="#065f46" />
                  <circle cx="8" cy="-5" r="14" fill="#10b981" />
                </g>

                {/* Wind Turbine on the Earth */}
                <g transform="translate(290, 150)">
                  <line x1="0" y1="0" x2="0" y2="-60" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="0" cy="-60" r="4" fill="#64748b" />
                  <g className="animate-spin" style={{ animationDuration: '6s', transformOrigin: '0px -60px' }}>
                    <path d="M 0 -60 L -8 -105 L 0 -105 Z" fill="#cbd5e1" opacity="0.9" />
                    <path d="M 0 -60 L 40 -80 L 32 -75 Z" transform="rotate(120, 0, -60)" fill="#cbd5e1" opacity="0.9" />
                    <path d="M 0 -60 L 40 -80 L 32 -75 Z" transform="rotate(240, 0, -60)" fill="#cbd5e1" opacity="0.9" />
                  </g>
                </g>

                {/* Solar Panel */}
                <g transform="translate(160, 270) rotate(-30)">
                  <rect x="-15" y="-10" width="30" height="20" fill="#1e3a8a" stroke="#475569" strokeWidth="1.5" rx="1" />
                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#475569" strokeWidth="1" />
                  <line x1="-5" y1="-10" x2="-5" y2="10" stroke="#475569" strokeWidth="1" />
                  <line x1="5" y1="-10" x2="5" y2="10" stroke="#475569" strokeWidth="1" />
                  <line x1="0" y1="10" x2="0" y2="20" stroke="#475569" strokeWidth="2.5" />
                </g>

                {/* Satellite/Leaf Orbiting */}
                <path d="M 120 120 C 180 80, 320 80, 380 120" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 4" />
                <g transform="translate(380, 120)">
                  <circle cx="0" cy="0" r="6" fill="#3b82f6" className="animate-ping" />
                  <circle cx="0" cy="0" r="5" fill="#3b82f6" />
                </g>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm glass-card">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Icon size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-outfit">{stat.value}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Empowering Features to Drive Change</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-16">
            Our platform provides integrated calculators, AI consulting, gamified challenges, and certificates to guide you at every step of your eco-journey.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex flex-col text-left p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 glass-card">
                  <div className={`p-3 rounded-xl w-fit mb-6 ${feat.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 font-outfit text-slate-800 dark:text-slate-100">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Follow these simple, compounding steps to establish a carbon-neutral lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm glass-card">
                <span className="text-4xl font-extrabold text-emerald-500/20 dark:text-emerald-500/10 font-outfit mb-4 block">
                  {step.number}
                </span>
                <h3 className="text-lg font-bold mb-2 font-outfit">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-outfit mb-16">What Our Community Says</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-8 bg-emerald-50/50 dark:bg-slate-800/30 border border-emerald-100/50 dark:border-slate-800 rounded-2xl text-left relative glass-card">
                <Quote size={32} className="text-emerald-400/30 absolute top-4 right-4" />
                <p className="text-slate-700 dark:text-slate-300 italic mb-6 leading-relaxed">
                  "{t.quote}"
                </p>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 font-outfit">{t.author}</h4>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">C</span>
            <div>
              <h3 className="font-bold font-outfit leading-none">Climatora</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sustaining Future</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
            <a href="https://github.com/krishnakatekhaye10/carbon" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">GitHub</a>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} Climatora. Built for the Planet.
          </div>
        </div>
      </footer>
    </div>
  );
}
