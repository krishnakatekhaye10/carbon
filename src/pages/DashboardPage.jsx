import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { jsPDF } from 'jspdf';
import { 
  Flame, Award, Download, TrendingDown, Leaf, Settings, CheckCircle2, 
  Droplet, Zap, Target, Edit, AlertCircle, ChevronRight, ChevronLeft, Save
} from 'lucide-react';
import { calculateCarbonBreakdown, calculateCarbonFootprint, calculateWaterFootprint } from '../utils/footprintMath';

export default function DashboardPage({
  calculatorData,
  onUpdateCalculator,
  gamification,
  setGamification,
  addXp,
  isOnboarded,
  setIsOnboarded,
  onNavigate
}) {
  const [isEditing, setIsEditing] = useState(!isOnboarded);
  const [calcStep, setCalcStep] = useState(0); // 0: transport, 1: flights, 2: diet, 3: energy, 4: lifestyle

  // Onboarding local state (to avoid half-baked calculations)
  const [localData, setLocalData] = useState(calculatorData);

  // Carbon and Water footprints calculations
  const breakdown = useMemo(() => calculateCarbonBreakdown(calculatorData), [calculatorData]);
  const totalCarbon = useMemo(() => calculateCarbonFootprint(calculatorData), [calculatorData]);
  const totalWater = useMemo(() => calculateWaterFootprint({
    showers: 6,
    length: 8,
    laundry: 3,
    dishwash: 4,
    handwash: !calculatorData.lifestyle.recycling,
    dietType: calculatorData.diet.dietType
  }), [calculatorData]);

  // Sustainability score calculated out of 100
  const sustainabilityScore = useMemo(() => {
    // 100 - (total emissions offset by 10000kg baseline, with min 0)
    // Average global emissions is ~4800kg. Let's make 2000kg score 90, 8000kg score 40.
    const score = Math.max(10, Math.round(100 - (totalCarbon / 120)));
    return Math.min(100, score);
  }, [totalCarbon]);

  // Level ranks matching sustainability score
  const scoreLevel = useMemo(() => {
    if (sustainabilityScore >= 85) return { name: 'Climate Hero', color: 'text-emerald-500 bg-emerald-500/10' };
    if (sustainabilityScore >= 70) return { name: 'Eco Warrior', color: 'text-blue-500 bg-blue-500/10' };
    if (sustainabilityScore >= 50) return { name: 'Green Learner', color: 'text-amber-500 bg-amber-500/10' };
    return { name: 'Beginner', color: 'text-slate-500 bg-slate-500/10' };
  }, [sustainabilityScore]);

  // Charts mock history data
  const historyData = [
    { name: 'June', emissions: 120 },
    { name: 'July', emissions: 105 },
    { name: 'August', emissions: 92 },
    { name: 'Current', emissions: Math.round(totalCarbon / 12) } // monthly average
  ];

  const weeklyProgress = [
    { name: 'Mon', xp: 20 },
    { name: 'Tue', xp: 40 },
    { name: 'Wed', xp: 15 },
    { name: 'Thu', xp: 30 },
    { name: 'Fri', xp: 50 },
    { name: 'Sat', xp: 10 },
    { name: 'Sun', xp: 60 }
  ];

  // List of weekly challenges
  const challenges = [
    { id: 'bike', label: 'Use bicycle today', xp: 40, co2: 8, icon: '🚲' },
    { id: 'bottle', label: 'Carry reusable bottle', xp: 20, co2: 2, icon: '🥤' },
    { id: 'plant', label: 'Plant a tree', xp: 100, co2: 25, icon: '🌳' },
    { id: 'save_elec', label: 'Save electricity today', xp: 30, co2: 5, icon: '💡' }
  ];

  // Badges catalog
  const badges = [
    { id: 'first_calculation', label: 'First Calculation', desc: 'Completed carbon profile', emoji: '🏅' },
    { id: 'eco_beginner', label: 'Eco Beginner', desc: 'Score reached above 50 points', emoji: '🌱' },
    { id: 'recycling_champion', label: 'Recycling Champion', desc: 'Recycled and completed level 3', emoji: '♻️' },
    { id: 'green_traveler', label: 'Green Traveler', desc: 'Minimized flight emissions', emoji: '🚲' },
    { id: 'climate_hero', label: 'Climate Hero', desc: 'Rebuilt score above 85 points', emoji: '🌍' }
  ];

  // PDF report downloader
  const downloadReport = () => {
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(16, 185, 129); // Emerald
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('CLIMATORA SUSTAINABILITY REPORT', 15, 25);
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 33);

    // Section 1: User Profile
    doc.setFontSize(16);
    doc.text('Profile Snapshot', 15, 55);
    doc.line(15, 57, 195, 57);
    
    doc.setFontSize(12);
    doc.text(`Active User Rank: ${scoreLevel.name}`, 15, 68);
    doc.text(`Sustainability Score: ${sustainabilityScore}/100`, 15, 76);
    doc.text(`Level reached: ${gamification.level} (${gamification.xp} XP)`, 15, 84);
    doc.text(`Active Streak: ${gamification.streak} Days`, 15, 92);
    
    // Section 2: Footprint Breakdown
    doc.setFontSize(16);
    doc.text('Annual Footprint Estimates', 15, 110);
    doc.line(15, 112, 195, 112);
    
    doc.setFontSize(12);
    doc.text(`Total Annual Carbon Footprint: ${totalCarbon.toLocaleString()} kg CO2e`, 15, 122);
    doc.text(`- Transport: ${breakdown.transport.toLocaleString()} kg CO2`, 25, 130);
    doc.text(`- Flights: ${breakdown.flights.toLocaleString()} kg CO2`, 25, 138);
    doc.text(`- Diet: ${breakdown.diet.toLocaleString()} kg CO2`, 25, 146);
    doc.text(`- Home Energy: ${breakdown.energy.toLocaleString()} kg CO2`, 25, 154);
    doc.text(`- Lifestyle: ${breakdown.lifestyle.toLocaleString()} kg CO2`, 25, 162);
    
    doc.text(`Estimated Annual Water Use: ${totalWater.toLocaleString()} Liters`, 15, 172);

    // Section 3: AI Recommendations Fallback
    doc.setFontSize(16);
    doc.text('Coach Recommendations', 15, 190);
    doc.line(15, 192, 195, 192);
    
    doc.setFontSize(11);
    const splitAdvice = doc.splitTextToSize(
      `Based on your calculations: Switch to public transit, hybrid, or EV vehicles to reduce your annual transport emissions (${breakdown.transport} kg). Adopt a plant-rich diet (currently estimated at ${breakdown.diet} kg CO2) and audit your electricity footprint to save on utility bills. Keep up your active ${gamification.streak}-day streak!`,
      180
    );
    doc.text(splitAdvice, 15, 202);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for logging your carbon footprints and making everyday life green! Climatora.', 15, 275);
    
    doc.save('climatora_sustainability_report.pdf');
  };

  const handleLocalUpdate = (category, field, value) => {
    setLocalData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveCalculator = () => {
    // Save to parent state
    Object.keys(localData).forEach(category => {
      Object.keys(localData[category]).forEach(field => {
        onUpdateCalculator(category, field, localData[category][field]);
      });
    });
    setIsOnboarded(true);
    setIsEditing(false);
    addXp(100); // XP reward for completing profile setup
  };

  const toggleChallenge = (challengeId) => {
    if (gamification.completedChallenges.includes(challengeId)) {
      return; // Already completed
    }

    const chall = challenges.find(c => c.id === challengeId);
    if (!chall) return;

    setGamification(prev => ({
      ...prev,
      completedChallenges: [...prev.completedChallenges, challengeId],
      co2Saved: prev.co2Saved + chall.co2,
      waterSaved: prev.waterSaved + 150, // mock water saved per challenge
      energySaved: prev.energySaved + 2, // mock energy saved
      streak: prev.streak + 1 // build streak
    }));

    addXp(chall.xp);
  };

  const renderCalculatorForm = () => {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl glass-card animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">
              {isOnboarded ? 'Edit Carbon Profile' : 'Calculate Your Carbon Footprint'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Step {calcStep + 1} of 5</p>
          </div>
          <span className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
            <Leaf size={20} />
          </span>
        </div>

        {/* Form Steps */}
        <div className="space-y-6">
          {calcStep === 0 && (
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-semibold font-outfit text-slate-800 dark:text-slate-200">1. Transportation</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="input-car-km">
                  Weekly driving in private vehicle: <span className="font-bold text-emerald-500">{localData.transport.carKm} km</span>
                </label>
                <input
                  id="input-car-km"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={localData.transport.carKm}
                  onChange={(e) => handleLocalUpdate('transport', 'carKm', Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="select-fuel-type">Fuel Engine Type</label>
                <select
                  id="select-fuel-type"
                  value={localData.transport.fuelType}
                  onChange={(e) => handleLocalUpdate('transport', 'fuelType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 focus:border-emerald-500 outline-none"
                >
                  <option value="gas">Petrol/Diesel (Gasoline)</option>
                  <option value="hybrid">Hybrid Engine</option>
                  <option value="electric">Electric Vehicle (EV)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="input-public-km">
                  Weekly public transit travel: <span className="font-bold text-emerald-500">{localData.transport.publicKm} km</span>
                </label>
                <input
                  id="input-public-km"
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  value={localData.transport.publicKm}
                  onChange={(e) => handleLocalUpdate('transport', 'publicKm', Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {calcStep === 1 && (
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-semibold font-outfit text-slate-800 dark:text-slate-200">2. Flights</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="input-short-haul">
                  Short-haul flights per year (&lt; 3 hours): <span className="font-bold text-emerald-500">{localData.flights.shortHaul}</span>
                </label>
                <input
                  id="input-short-haul"
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={localData.flights.shortHaul}
                  onChange={(e) => handleLocalUpdate('flights', 'shortHaul', Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="input-long-haul">
                  Long-haul flights per year (&gt; 3 hours): <span className="font-bold text-emerald-500">{localData.flights.longHaul}</span>
                </label>
                <input
                  id="input-long-haul"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={localData.flights.longHaul}
                  onChange={(e) => handleLocalUpdate('flights', 'longHaul', Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {calcStep === 2 && (
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-semibold font-outfit text-slate-800 dark:text-slate-200">3. Dietary habits</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="select-diet-type">Primary Daily Diet</label>
                <select
                  id="select-diet-type"
                  value={localData.diet.dietType}
                  onChange={(e) => handleLocalUpdate('diet', 'dietType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 focus:border-emerald-500 outline-none"
                >
                  <option value="heavyMeat">Heavy Meat Consumption</option>
                  <option value="lowMeat">Balanced (Low Meat)</option>
                  <option value="pescatarian">Pescatarian (Seafood/Veg)</option>
                  <option value="vegetarian">Vegetarian (No Meat)</option>
                  <option value="vegan">Vegan (Strictly plant-based)</option>
                </select>
              </div>
            </div>
          )}

          {calcStep === 3 && (
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-semibold font-outfit text-slate-800 dark:text-slate-200">4. Household Energy</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="input-electricity">
                  Monthly electricity consumption: <span className="font-bold text-emerald-500">{localData.energy.electricity} kWh</span>
                </label>
                <input
                  id="input-electricity"
                  type="range"
                  min="0"
                  max="1500"
                  step="10"
                  value={localData.energy.electricity}
                  onChange={(e) => handleLocalUpdate('energy', 'electricity', Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="select-heating-source">Main Heating Source</label>
                <select
                  id="select-heating-source"
                  value={localData.energy.heatingSource}
                  onChange={(e) => handleLocalUpdate('energy', 'heatingSource', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 focus:border-emerald-500 outline-none"
                >
                  <option value="gas">Natural Gas</option>
                  <option value="electric">Electric Heat Pump</option>
                  <option value="oil">Heating Oil</option>
                  <option value="solar">Solar Energy/Geothermal</option>
                </select>
              </div>
            </div>
          )}

          {calcStep === 4 && (
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-semibold font-outfit text-slate-800 dark:text-slate-200">5. Lifestyle & Consumption</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="input-purchases">
                  Monthly new purchases (clothes, gadgets, etc.): <span className="font-bold text-emerald-500">{localData.lifestyle.newPurchases} items</span>
                </label>
                <input
                  id="input-purchases"
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={localData.lifestyle.newPurchases}
                  onChange={(e) => handleLocalUpdate('lifestyle', 'newPurchases', Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-3 pt-3">
                <input
                  id="recycle-checkbox"
                  type="checkbox"
                  checked={localData.lifestyle.recycling}
                  onChange={(e) => handleLocalUpdate('lifestyle', 'recycling', e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 text-white rounded cursor-pointer"
                />
                <label htmlFor="recycle-checkbox" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  I regularly sort and recycle household waste (-250kg offset)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Steps Nav */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100 dark:border-slate-850">
          <button
            type="button"
            disabled={calcStep === 0}
            onClick={() => setCalcStep(c => c - 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          
          {calcStep < 4 ? (
            <button
              type="button"
              onClick={() => setCalcStep(c => c + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveCalculator}
              className="flex items-center gap-1.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
            >
              <Save size={16} />
              Calculate & Save
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className="w-full flex items-center justify-center min-h-[70vh] py-8">
        {renderCalculatorForm()}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 p-6 rounded-3xl shadow-sm glass-card">
        <div>
          <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Eco Workspace Dashboard
            <span className="text-xl" role="img" aria-label="sprout">🌱</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review your carbon footprint, complete challenges, and track active streaks.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl border border-slate-200/20 dark:border-slate-700 transition"
            aria-label="Edit Profile Settings"
          >
            <Edit size={16} />
            Edit Profile
          </button>
          <button
            onClick={downloadReport}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition"
            aria-label="Download Sustainability Report PDF"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      {/* Main Grid: Score Circular Ring & Streaks/Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Sustainability Score Circular Ring */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center glass-card">
          <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100 self-start mb-6">Sustainability Score</h3>
          
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="42" 
                stroke="rgba(16, 185, 129, 0.08)" 
                strokeWidth="8" fill="none" 
              />
              <circle 
                cx="50" cy="50" r="42" 
                stroke="url(#emeraldBlueGrad)" 
                strokeWidth="8" fill="none" 
                strokeDasharray="264" 
                strokeDashoffset={264 - (264 * sustainabilityScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="emeraldBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold font-outfit text-slate-800 dark:text-slate-100 leading-none">{sustainabilityScore}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/100 Points</span>
            </div>
          </div>

          <div className="mt-4 w-full">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${scoreLevel.color}`}>
              Rank: {scoreLevel.name} 🌱
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed px-4">
              Your carbon footprint is estimated at <strong className="text-slate-700 dark:text-slate-200">{totalCarbon.toLocaleString()} kg CO₂e/year</strong>. Lower values boost this score.
            </p>
          </div>
        </div>

        {/* Card 2: Streak & Badges */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between glass-card">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100">Streak & Badges</h3>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full">
                <Flame size={15} className="animate-pulse" />
                <span className="text-xs font-bold font-outfit">{gamification.streak} Day Streak</span>
              </div>
            </div>
            
            {/* Badges Grid */}
            <div className="grid grid-cols-5 gap-3.5 mt-2">
              {badges.map(b => {
                const unlocked = gamification.badgeIds.includes(b.id);
                return (
                  <div 
                    key={b.id} 
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border aspect-square ${
                      unlocked 
                        ? 'bg-amber-500/5 border-amber-300 dark:border-amber-700/50' 
                        : 'bg-slate-50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-850 opacity-40'
                    }`}
                    title={`${b.label}: ${b.desc} (${unlocked ? 'Unlocked' : 'Locked'})`}
                  >
                    <span className="text-2xl" role="img" aria-label="badge emoji">{b.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duolingo Level Progress</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(gamification.xp % 400) / 4}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {gamification.xp % 400} / 400 XP
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Carbon Goal Tracker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between glass-card text-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100">Carbon Reduction Goal</h3>
              <span className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-xl">
                <Target size={18} />
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Target Reduction</span>
                <span className="text-blue-500">{gamification.reductionGoal}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={gamification.reductionGoal}
                onChange={(e) => setGamification(prev => ({ ...prev, reductionGoal: Number(e.target.value) }))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Goal Progress */}
            <div className="space-y-2 pt-4">
              {/* Mocking that we have reduced CO2 by 120kg out of target reduction amount */}
              {/* Target footprint is totalCarbon * (reductionGoal / 100) */}
              {(() => {
                const targetKg = Math.round(totalCarbon * (gamification.reductionGoal / 100));
                const progressPct = Math.min(100, Math.round((gamification.co2Saved / targetKg) * 100));
                return (
                  <>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">Goal Progress</span>
                      <span className="text-slate-600 dark:text-slate-300">{progressPct}% Complete</span>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" 
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Saved <strong className="text-slate-600 dark:text-slate-300">{gamification.co2Saved}kg</strong> of your annual <strong className="text-slate-600 dark:text-slate-300">{targetKg}kg</strong> target.
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Need custom AI advice?</span>
            <button 
              onClick={() => onNavigate('coach')}
              className="text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1"
            >
              Ask AI Coach →
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CO₂ Saved', value: `${gamification.co2Saved} kg`, sub: `Saved globally`, icon: Leaf, col: 'text-emerald-500' },
          { label: 'Tree Equivalents', value: `${Math.floor(gamification.co2Saved / 20)} Trees 🌳`, sub: '1 tree = 20kg CO2', icon: Leaf, col: 'text-green-500' },
          { label: 'Water Saved', value: `${gamification.waterSaved.toLocaleString()} L`, sub: 'Via smart wash/showering', icon: Droplet, col: 'text-blue-400' },
          { label: 'Home Energy Saved', value: `${gamification.energySaved} kWh`, sub: 'Offset emissions', icon: Zap, col: 'text-amber-500' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between shadow-sm glass-card text-left">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <Icon size={16} className={stat.col} />
              </div>
              <div>
                <div className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">{stat.value}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts: Recharts Line Chart Trend & Weekly Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Carbon Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm lg:col-span-2 flex flex-col glass-card text-left">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100">Emissions History Trend</h3>
              <p className="text-xs text-slate-400 mt-1">Monthly average emissions in kg CO₂</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
              <TrendingDown size={14} />
              <span className="text-xs font-bold font-outfit">Downwards Trend</span>
            </div>
          </div>

          <div className="w-full h-60 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--glass-bg)', 
                    borderColor: 'var(--glass-border)', 
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: 'Plus Jakarta Sans',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Challenges Checklist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between glass-card text-left">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100">Weekly Eco Challenges</h3>
              <p className="text-xs text-slate-400 mt-1">Complete habits and earn instant XP multipliers.</p>
            </div>

            <div className="space-y-3 pt-2">
              {challenges.map(chall => {
                const isCompleted = gamification.completedChallenges.includes(chall.id);
                return (
                  <div 
                    key={chall.id}
                    onClick={() => toggleChallenge(chall.id)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border cursor-pointer transition-all duration-150 ${
                      isCompleted 
                        ? 'bg-emerald-500/5 border-emerald-300 dark:border-emerald-800/40 opacity-70' 
                        : 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-850 hover:bg-slate-100/40 dark:hover:bg-slate-800/40'
                    }`}
                    role="checkbox"
                    aria-checked={isCompleted}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleChallenge(chall.id)}
                  >
                    <span className="text-2xl select-none" role="img" aria-hidden="true">{chall.icon}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold transition ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {chall.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">-{chall.co2}kg CO₂ • +{chall.xp} XP</div>
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-750 flex-shrink-0"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs text-slate-400 flex items-center justify-between">
            <span>Challenges Reset Weekly</span>
            <span className="font-semibold text-emerald-500">
              {gamification.completedChallenges.length} / {challenges.length} Done
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
