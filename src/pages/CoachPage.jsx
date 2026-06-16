import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, BrainCircuit, ShieldCheck, ArrowRight, RefreshCw, Car, Flame, AlertCircle } from 'lucide-react';
import { getRecommendationFromAI } from '../services/geminiClient';

export default function CoachPage({ calculatorData, user }) {
  const [travel, setTravel] = useState(
    `Drive ${calculatorData.transport.carKm} km/week in a ${calculatorData.transport.fuelType} car, public transit ${calculatorData.transport.publicKm} km/week`
  );
  const [electricity, setElectricity] = useState(String(calculatorData.energy.electricity));
  const [food, setFood] = useState(
    `Diet type is ${calculatorData.diet.dietType}. Recycling is ${calculatorData.lifestyle.recycling ? 'active' : 'inactive'}.`
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getRecommendationFromAI({
        travelHabits: travel,
        electricity: Number(electricity),
        foodHabits: food,
        userName: user?.name
      });
      setResult(response);
    } catch {
      setError('Failed to reach Gemini AI Coach. Using offline heuristic suggestions.');
      // safe fallback heuristic
      setResult({
        suggestion: `Switch to public transit twice a week to reduce car use. Swap old light bulbs for LEDs to reduce your monthly ${electricity} kWh energy draw. Try a meatless Monday!`,
        sustainabilityScore: 82,
        level: 'Eco Warrior',
        streak: 12,
        stats: { co2SavedKg: 95, treesEquivalent: 5, waterSavedL: 3100, energySavedKwh: 24 }
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTravel(`Drive ${calculatorData.transport.carKm} km/week in a ${calculatorData.transport.fuelType} car, public transit ${calculatorData.transport.publicKm} km/week`);
    setElectricity(String(calculatorData.energy.electricity));
    setFood(`Diet type is ${calculatorData.diet.dietType}. Recycling is ${calculatorData.lifestyle.recycling ? 'active' : 'inactive'}.`);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left font-jakarta max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 p-6 rounded-3xl shadow-sm glass-card flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
          <BrainCircuit size={28} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            AI Climate Coach
            <span className="text-sm font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">Gemini Flash 2.5</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit your lifestyle habits to receive personalized carbon reduction strategies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Form Inputs */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm glass-card">
            <h3 className="text-lg font-bold font-outfit text-slate-850 dark:text-slate-100 mb-4">Habit Profile Settings</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="coach-travel" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Travel Habits</label>
                <textarea
                  id="coach-travel"
                  rows="2"
                  value={travel}
                  onChange={(e) => setTravel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="coach-electricity" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Electricity (kWh/month)</label>
                <input
                  id="coach-electricity"
                  type="number"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="coach-food" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Food & Lifestyle Habits</label>
                <textarea
                  id="coach-food"
                  rows="2"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-3 border border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-xl transition"
                  title="Reset to Profile Values"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Consulting AI...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Get AI Advice
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Coach Recommendations Output */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading-skele"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm glass-card space-y-5 animate-pulse min-h-[350px] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-11/12"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-10/12"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                </div>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div
                key="welcome-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-8 rounded-3xl shadow-sm glass-card flex flex-col items-center justify-center text-center min-h-[350px] space-y-4"
              >
                <span className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-2xl flex items-center justify-center text-3xl animate-bounce">
                  🤖
                </span>
                <div>
                  <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">Ready to consult the coach?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
                    The coach analyzes transport engine type, flight counts, heating fuel sources, and diets to recommend offsets.
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-1.5"
                >
                  Consult AI Coach
                  <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div
                key="result-box"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm glass-card space-y-6 text-left"
              >
                {/* Header message */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl select-none" role="img" aria-label="bot">🤖</span>
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100">AI Sustainability Summary</h3>
                    <p className="text-xs text-blue-500 font-semibold flex items-center gap-1">
                      <ShieldCheck size={13} /> Highly Optimized Recommendations
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl text-xs flex items-center gap-2 border border-amber-500/10">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}

                {/* AI Advice text */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-900/10 rounded-2xl">
                  <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                    "{result.suggestion}"
                  </p>
                </div>

                {/* Sub statistics cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'CO₂ Saved', value: `${result.stats?.co2SavedKg || 120}kg`, sub: 'Annual equivalent', icon: Car, color: 'text-emerald-500' },
                    { label: 'Trees Equivalent', value: `${result.stats?.treesEquivalent || 6} 🌳`, sub: 'Trees planted', icon: Car, color: 'text-green-500' },
                    { label: 'Water Saved', value: `${(result.stats?.waterSavedL || 4200).toLocaleString()}L`, sub: 'Household water', icon: Car, color: 'text-blue-500' },
                    { label: 'Energy Saved', value: `${result.stats?.energySavedKwh || 32} kWh`, sub: 'Grid optimization', icon: Car, color: 'text-amber-500' }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-850">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                      <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stat.value}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{stat.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Sustainability ratings from AI */}
                <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</div>
                    <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{result.sustainabilityScore || 85}%</div>
                  </div>
                  <div className="text-center border-x border-slate-100 dark:border-slate-850">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</div>
                    <div className="text-sm font-extrabold text-emerald-500 mt-1.5">{result.level || 'Eco Warrior'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</div>
                    <div className="text-xl font-extrabold text-amber-500 mt-1 flex items-center justify-center gap-1">
                      <Flame size={16} /> {result.streak || 12}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
