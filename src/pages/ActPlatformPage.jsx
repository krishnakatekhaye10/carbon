import React, { useState } from 'react';
import { Vote, ShoppingBag, Trophy, Flame, CheckCircle, ExternalLink, ThumbsUp } from 'lucide-react';

export default function ActPlatformPage({ gamification, setGamification, addXp, user }) {
  // Local priorities voting state
  const [votedOption, setVotedOption] = useState(null);
  const [pollVotes, setPollVotes] = useState({
    bikeLanes: 142,
    composting: 98,
    solarGrids: 215,
    foodCoop: 76
  });

  const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  const handleVote = (optionKey) => {
    if (votedOption) return; // Can only vote once
    
    setVotedOption(optionKey);
    setPollVotes(prev => ({
      ...prev,
      [optionKey]: prev[optionKey] + 1
    }));
    addXp(20); // Award XP for civic engagement
  };

  // Sustainable Marketplace items
  const marketplaceProducts = [
    {
      id: 1,
      title: 'Stainless Steel Reusable Bottle',
      price: '$18.99',
      offsetDesc: 'Saves ~167 plastic bottles per year',
      url: '#',
      imageText: '🥤'
    },
    {
      id: 2,
      title: 'Solar Charged Table Lamp',
      price: '$34.50',
      offsetDesc: 'Offsets 40kWh of electricity annually',
      url: '#',
      imageText: '☀️'
    },
    {
      id: 3,
      title: 'Cedarwood Kitchen Compost Bin',
      price: '$28.00',
      offsetDesc: 'Diverts 80kg of landfill waste',
      url: '#',
      imageText: '🪵'
    },
    {
      id: 4,
      title: 'Organic Bamboo Dinnerware Set',
      price: '$14.99',
      offsetDesc: 'Zero-plastic biodegradable structure',
      url: '#',
      imageText: '🍽️'
    }
  ];

  // Leaderboard dummy players (including current user!)
  const leaderboardPlayers = [
    { name: 'Eco Champion Alex', avatar: '🌍', level: 6, xp: 2250, badge: 'Climate Hero' },
    { name: 'Solar Stella', avatar: '⚡', level: 5, xp: 1840, badge: 'Climate Hero' },
    { name: user?.name || 'You', avatar: user?.avatar || '🌱', level: gamification.level, xp: gamification.xp, badge: gamification.level >= 4 ? 'Climate Hero' : gamification.level >= 2 ? 'Eco Warrior' : 'Eco Beginner', isCurrentUser: true },
    { name: 'Recycle Robert', avatar: '♻️', level: 3, xp: 1040, badge: 'Eco Warrior' },
    { name: 'Bicycle Ben', avatar: '🚲', level: 2, xp: 680, badge: 'Green Learner' }
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-8 animate-fade-in text-left font-jakarta">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 p-6 rounded-3xl shadow-sm glass-card flex items-center gap-4">
        <div className="p-3 bg-teal-500/10 text-teal-600 rounded-2xl">
          <Vote size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-slate-100">Community Act Portal</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Vote on municipal priorities, browse clean energy marketplace products, and track leaderboard standings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Marketplace and Voting) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Local Priority Voting Poll */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm glass-card text-left">
            <h3 className="text-lg font-bold font-outfit text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Vote size={20} className="text-teal-500" />
              Local Priorities Voting Poll
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-6">Vote on which green infrastructure project the community organization should fund next. +20 XP reward.</p>

            <div className="space-y-4">
              {[
                { key: 'solarGrids', label: 'Install Solar Microgrids in Parks', count: pollVotes.solarGrids },
                { key: 'bikeLanes', label: 'Add Downtown Protected Bike Lanes', count: pollVotes.bikeLanes },
                { key: 'composting', label: 'Implement Community Composting Loop', count: pollVotes.composting },
                { key: 'foodCoop', label: 'Introduce Organic Food Co-op Subsidies', count: pollVotes.foodCoop }
              ].map(opt => {
                const percentage = Math.round((opt.count / totalVotes) * 100);
                return (
                  <div key={opt.key} className="space-y-1">
                    <button
                      disabled={!!votedOption}
                      onClick={() => handleVote(opt.key)}
                      className={`w-full p-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        votedOption === opt.key
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                          : votedOption
                          ? 'border-slate-100 dark:border-slate-850 opacity-60 text-slate-600 dark:text-slate-350'
                          : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {votedOption === opt.key && <CheckCircle size={14} className="text-emerald-500" />}
                        {opt.label}
                      </span>
                      <span className="font-bold">{opt.count} votes {votedOption ? `(${percentage}%)` : ''}</span>
                    </button>
                    
                    {votedOption && (
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            votedOption === opt.key ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {votedOption && (
              <p className="text-[10px] text-emerald-500 font-bold mt-4 flex items-center gap-1">
                <ThumbsUp size={12} /> Thank you for voting! You earned +20 XP.
              </p>
            )}
          </div>

          {/* Section 2: Eco Marketplace Recommendations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm glass-card text-left">
            <h3 className="text-lg font-bold font-outfit text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-2">
              <ShoppingBag size={20} className="text-teal-500" />
              Eco Marketplace Recommendations
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-6">Cut emissions by swapping daily plastics and high-carbon devices for these low-impact alternatives.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {marketplaceProducts.map(prod => (
                <div key={prod.id} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-start gap-4">
                  <span className="text-3xl p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-805 select-none" role="img" aria-hidden="true">
                    {prod.imageText}
                  </span>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{prod.title}</h4>
                    <div className="text-xs font-extrabold text-teal-500">{prod.price}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{prod.offsetDesc}</div>
                    <a 
                      href={prod.url}
                      onClick={(e) => { e.preventDefault(); alert(`Redirecting to sustainable marketplace partner for ${prod.title}!`); }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-teal-500 transition pt-2"
                    >
                      Browse Item
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Eco Leaderboard) */}
        <div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm glass-card flex flex-col min-h-[480px]">
            <h3 className="text-lg font-bold font-outfit text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Trophy size={18} className="text-teal-500" />
              Eco Leaderboard
            </h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-6">Top Climatora Contributors</p>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {leaderboardPlayers.map((player, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    player.isCurrentUser 
                      ? 'bg-emerald-500/5 border-emerald-300 dark:border-emerald-800/50 shadow-inner' 
                      : 'bg-slate-50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm font-black text-slate-400">#{index + 1}</span>
                    <span className="text-2xl select-none" role="img" aria-label="mascot">{player.avatar}</span>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-805 dark:text-slate-100 flex items-center gap-1.5">
                        {player.name}
                        {player.isCurrentUser && <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">YOU</span>}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 font-medium">{player.badge} • Level {player.level}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{player.xp.toLocaleString()} XP</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                      <Flame size={10} className="text-amber-500" /> Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
