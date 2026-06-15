import { Check, Plus, Trash2, Zap, ShieldCheck } from 'lucide-react';
import { HABIT_LIBRARY, BADGE_TIERS } from '../utils/constants';

export default function HabitTracker({ 
  activeHabits, 
  completedThisWeek, 
  totalSavedCo2, 
  xp, 
  level, 
  adoptHabit, 
  removeHabit, 
  completeHabit, 
  badgeIds 
}) {
  const getLevelXp = (lvl) => lvl * 400;
  const currentLevelMaxXp = getLevelXp(level);
  const prevLevelMaxXp = getLevelXp(level - 1);
  const relativeXp = xp - prevLevelMaxXp;
  const neededXp = currentLevelMaxXp - prevLevelMaxXp;
  const xpPercentage = Math.min((relativeXp / neededXp) * 100, 100);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      
      {/* Gamification Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr md:1.2fr', gap: 24 }} className="dashboard-grid">
        {/* XP Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Your Progression</h3>
              <span className="carbon-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-accent)', fontWeight: 800 }}>
                Level {level}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Complete adopted actions weekly to gain XP and unlock badges.
            </p>
          </div>

          <div style={{ margin: '24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{xp} Total XP</span>
              <span style={{ color: 'var(--text-muted)' }}>{xp} / {currentLevelMaxXp} XP</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 99, height: 12, overflow: 'hidden' }}>
              <div style={{
                width: `${xpPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-mint), var(--color-accent))',
                borderRadius: 99,
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.06)', padding: '12px 16px', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={20} style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Total CO₂ Reduced</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                  {totalSavedCo2.toFixed(1)} kg CO₂
                </div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>Accumulated</span>
          </div>
        </div>

        {/* Badges Container */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Impact Badges</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 20 }}>
            Unlock these badges by engaging in real-life sustainable activities.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
            {BADGE_TIERS.map(b => {
              const isUnlocked = b.id === 'sprout' || badgeIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px 8px',
                    borderRadius: 16,
                    background: isUnlocked ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`,
                    opacity: isUnlocked ? 1 : 0.4,
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}
                  title={`Requirement: ${b.req}`}
                >
                  <span style={{
                    fontSize: 28,
                    marginBottom: 6,
                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                    transform: isUnlocked ? 'scale(1.1)' : 'none',
                    transition: 'transform 0.3s'
                  }}>
                    {b.icon}
                  </span>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.2 }}>
                    {b.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Habits & Challenges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr md:1.2fr', gap: 24 }} className="dashboard-grid">
        
        {/* Active Habits Checklist */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>My Active Habits</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 20 }}>
            Check them off as you complete them throughout the week!
          </p>

          {activeHabits.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 0',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <span style={{ fontSize: 32, marginBottom: 10 }}>🌱</span>
              <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>No active habits</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Select some habits from the Library to get started!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeHabits.map(habitId => {
                const habit = HABIT_LIBRARY.find(h => h.id === habitId);
                if (!habit) return null;
                const isCompleted = completedThisWeek.includes(habitId);

                return (
                  <div
                    key={habitId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 16,
                      background: isCompleted ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-secondary)',
                      border: `1px solid ${isCompleted ? 'var(--color-accent)' : 'var(--border-color)'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <button
                      onClick={() => completeHabit(habitId)}
                      disabled={isCompleted}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: `2px solid ${isCompleted ? 'var(--color-accent)' : 'var(--text-muted)'}`,
                        background: isCompleted ? 'var(--color-accent)' : 'transparent',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isCompleted ? 'default' : 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}>
                        {habit.icon} {habit.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Saves ~{habit.co2Saved} kg/week • +{habit.xp} XP
                      </div>
                    </div>

                    <button
                      onClick={() => removeHabit(habitId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-rose)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action / Habit Library */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Habit Library</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 20 }}>
            Choose habits to integrate into your lifestyle.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto', paddingRight: 6 }}>
            {HABIT_LIBRARY.map(habit => {
              const isActive = activeHabits.includes(habit.id);
              return (
                <div
                  key={habit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 14,
                    borderRadius: 16,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 24 }}>{habit.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{habit.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{habit.desc}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                      <span className="carbon-badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: 9 }}>
                        {habit.category}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>
                        -{habit.co2Saved} kg CO₂/wk
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        +{habit.xp} XP
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => adoptHabit(habit.id)}
                    disabled={isActive}
                    className="glow-btn"
                    style={{
                      border: 'none',
                      background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-accent)',
                      color: isActive ? 'var(--color-accent)' : '#ffffff',
                      padding: '6px 12px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: isActive ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.2s'
                    }}
                  >
                    {isActive ? (
                      <>
                        <ShieldCheck size={12} /> Active
                      </>
                    ) : (
                      <>
                        <Plus size={12} /> Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
