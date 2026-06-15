/**
 * Leaderboard — a community leaderboard showing top eco-warriors ranked by XP,
 * with weekly/all-time filter and animated rank bars.
 */
import { useState } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';

/** @type {Array<{name: string, avatar: string, xp: number, level: number, badge: string, co2Saved: number, country: string}>} */
const COMMUNITY_MEMBERS = [
  { name: 'GreenMaya',      avatar: '🌿', xp: 4820, level: 13, badge: '🌍 Planet Guardian', co2Saved: 982, country: 'Netherlands' },
  { name: 'EcoRaj',         avatar: '☀️', xp: 4450, level: 12, badge: '⚡ Solar Champion',   co2Saved: 876, country: 'India' },
  { name: 'CleanAirKira',   avatar: '💨', xp: 3990, level: 10, badge: '🌱 Forest Keeper',    co2Saved: 754, country: 'UK' },
  { name: 'BikeCommuter99', avatar: '🚲', xp: 3720, level: 10, badge: '🚲 Zero-Emission Rider', co2Saved: 691, country: 'Denmark' },
  { name: 'SolarSam',       avatar: '⚡', xp: 3410, level: 9,  badge: '🔋 Energy Saver',     co2Saved: 612, country: 'Australia' },
  { name: 'PlantEater77',   avatar: '🌱', xp: 3100, level: 8,  badge: '🥦 Plant Advocate',   co2Saved: 578, country: 'Canada' },
  { name: 'ZeroWastePro',   avatar: '♻️', xp: 2880, level: 8,  badge: '♻️ Waste Warrior',    co2Saved: 502, country: 'Germany' },
  { name: 'CarFreeLucy',    avatar: '🚶', xp: 2640, level: 7,  badge: '🏙️ Urban Explorer',   co2Saved: 463, country: 'France' },
  { name: 'CompostKing',    avatar: '🌿', xp: 2310, level: 6,  badge: '🌱 Soil Hero',         co2Saved: 389, country: 'Japan' },
  { name: 'ReforesterMike', avatar: '🌳', xp: 2050, level: 6,  badge: '🌳 Tree Planter',      co2Saved: 344, country: 'Brazil' },
];

const RANK_ICONS = [
  <Crown key="1" size={18} color="#f59e0b" />,
  <Medal key="2" size={18} color="#94a3b8" />,
  <Medal key="3" size={18} color="#cd7c2f" />
];

/**
 * Leaderboard component — community XP rankings with weekly/all-time tabs.
 * @param {{ xp: number, level: number, user: Object|null }} props
 */
export default function Leaderboard({ xp, level, user }) {
  const [filter, setFilter] = useState('alltime');

  // Simulate weekly data by scaling down XP
  const members = COMMUNITY_MEMBERS.map(m => ({
    ...m,
    displayXp: filter === 'weekly' ? Math.round(m.xp * 0.18) : m.xp,
    displayCo2: filter === 'weekly' ? Math.round(m.co2Saved * 0.18) : m.co2Saved,
  })).sort((a, b) => b.displayXp - a.displayXp);

  // User's position
  const userDisplayXp = filter === 'weekly' ? Math.round(xp * 0.25) : xp;
  const userRank = members.filter(m => m.displayXp > userDisplayXp).length + 1;
  const topXp = members[0]?.displayXp || 1;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '24px 28px 20px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,95,70,0.05))',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Trophy size={20} color="#f59e0b" />
              <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Eco Leaderboard</h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Top climate action earners in the community</p>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 12, padding: 3, border: '1px solid var(--border-color)' }}>
            {[{ id: 'weekly', label: 'This Week' }, { id: 'alltime', label: 'All Time' }].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '6px 14px', borderRadius: 10, border: 'none',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: filter === f.id ? 'var(--color-accent)' : 'transparent',
                  color: filter === f.id ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Your position */}
        {user && (
          <div style={{
            marginTop: 16, padding: '10px 16px', borderRadius: 12,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span style={{ fontSize: 20 }}>{user.avatar || '👤'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Your Rank: #{userRank} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>out of {members.length + 1}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {userDisplayXp} XP • Level {level}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700 }}>
                {members[0] ? `${members[0].displayXp - userDisplayXp} XP` : '—'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>behind #1</div>
            </div>
          </div>
        )}
      </div>

      {/* Rankings */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {members.map((member, idx) => {
          const rankIcon = RANK_ICONS[idx];
          const barWidth = (member.displayXp / topXp) * 100;
          const isTop3 = idx < 3;

          return (
            <div
              key={member.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 44px 1fr auto',
                gap: 12,
                alignItems: 'center',
                padding: '14px 24px',
                borderBottom: '1px solid var(--border-color)',
                background: isTop3 ? `rgba(${idx === 0 ? '245,158,11' : idx === 1 ? '148,163,184' : '205,124,47'},0.03)` : 'transparent',
                transition: 'background 0.15s'
              }}
            >
              {/* Rank */}
              <div style={{ textAlign: 'center' }}>
                {rankIcon || (
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: isTop3
                  ? `rgba(${idx === 0 ? '245,158,11' : idx === 1 ? '148,163,184' : '205,124,47'},0.12)`
                  : 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20
              }}>
                {member.avatar}
              </div>

              {/* Name + bar */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.name}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{member.country}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5 }}>{member.badge}</div>
                {/* XP Bar */}
                <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${barWidth}%`, height: '100%', borderRadius: 99,
                    background: isTop3
                      ? `linear-gradient(90deg, ${idx === 0 ? '#f59e0b,#fbbf24' : idx === 1 ? '#94a3b8,#cbd5e1' : '#cd7c2f,#d97706'})`
                      : 'linear-gradient(90deg, var(--color-accent), var(--color-mint))',
                    transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)'
                  }} />
                </div>
              </div>

              {/* XP + CO2 */}
              <div style={{ textAlign: 'right', minWidth: 70 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                  {member.displayXp.toLocaleString()}
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}> XP</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-accent)', fontWeight: 600 }}>
                  -{member.displayCo2}kg CO₂
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '14px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Complete habits and pass quizzes to climb the ranks. 🚀 Keep tracking to earn more XP!
        </p>
      </div>
    </div>
  );
}
