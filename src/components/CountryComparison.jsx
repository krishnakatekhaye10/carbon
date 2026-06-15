/**
 * CountryComparison — Interactive bar chart comparing a user's carbon footprint
 * against 20+ world countries. Built with pure SVG and React.
 */
import { useState, useMemo } from 'react';
import { Globe, TrendingDown, Info } from 'lucide-react';

/** @type {Array<{country: string, footprint: number, flag: string, region: string}>} */
const WORLD_DATA = [
  { country: 'Qatar',       footprint: 37200, flag: '🇶🇦', region: 'Middle East' },
  { country: 'Kuwait',      footprint: 25400, flag: '🇰🇼', region: 'Middle East' },
  { country: 'UAE',         footprint: 22800, flag: '🇦🇪', region: 'Middle East' },
  { country: 'Australia',   footprint: 15400, flag: '🇦🇺', region: 'Oceania' },
  { country: 'USA',         footprint: 14600, flag: '🇺🇸', region: 'Americas' },
  { country: 'Canada',      footprint: 14200, flag: '🇨🇦', region: 'Americas' },
  { country: 'Saudi Arabia',footprint: 13900, flag: '🇸🇦', region: 'Middle East' },
  { country: 'Russia',      footprint: 11700, flag: '🇷🇺', region: 'Europe' },
  { country: 'Japan',       footprint: 8800,  flag: '🇯🇵', region: 'Asia' },
  { country: 'Germany',     footprint: 8600,  flag: '🇩🇪', region: 'Europe' },
  { country: 'South Korea', footprint: 8200,  flag: '🇰🇷', region: 'Asia' },
  { country: 'China',       footprint: 7600,  flag: '🇨🇳', region: 'Asia' },
  { country: 'UK',          footprint: 5700,  flag: '🇬🇧', region: 'Europe' },
  { country: 'France',      footprint: 4800,  flag: '🇫🇷', region: 'Europe' },
  { country: 'World Avg.',  footprint: 4000,  flag: '🌍', region: 'Global' },
  { country: 'Brazil',      footprint: 3200,  flag: '🇧🇷', region: 'Americas' },
  { country: 'Mexico',      footprint: 3000,  flag: '🇲🇽', region: 'Americas' },
  { country: 'India',       footprint: 1900,  flag: '🇮🇳', region: 'Asia' },
  { country: 'Indonesia',   footprint: 1800,  flag: '🇮🇩', region: 'Asia' },
  { country: 'Paris Target',footprint: 2300,  flag: '🎯', region: 'Target' },
  { country: 'Nigeria',     footprint: 700,   flag: '🇳🇬', region: 'Africa' },
  { country: 'Ethiopia',    footprint: 150,   flag: '🇪🇹', region: 'Africa' },
];

/**
 * CountryComparison component — shows the user's footprint vs world nations.
 * @param {{ footprint: number }} props
 */
export default function CountryComparison({ footprint }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [sortBy, setSortBy] = useState('desc');

  /** All data including user's footprint */
  const allData = useMemo(() => {
    const userData = { country: 'You', footprint: Math.round(footprint), flag: '👤', region: 'You' };
    const data = [...WORLD_DATA, userData];
    return sortBy === 'desc'
      ? data.sort((a, b) => b.footprint - a.footprint)
      : data.sort((a, b) => a.footprint - b.footprint);
  }, [footprint, sortBy]);

  const maxVal = allData[0]?.footprint || 1;

  /** Count how many countries emit more than user */
  const betterThanCount = WORLD_DATA.filter(c => c.footprint > footprint && c.region !== 'Target' && c.region !== 'Global').length;
  const totalCountries = WORLD_DATA.filter(c => c.region !== 'Target' && c.region !== 'Global').length;
  const percentile = Math.round((betterThanCount / totalCountries) * 100);

  const getBarColor = (item) => {
    if (item.region === 'You') return '#10b981';
    if (item.region === 'Target') return '#f59e0b';
    if (item.footprint > 10000) return '#ef4444';
    if (item.footprint > 6000) return '#f97316';
    if (item.footprint > 3000) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Globe size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Global Footprint Comparison</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Your footprint compared to 20+ countries worldwide
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setSortBy(s => s === 'desc' ? 'asc' : 'desc')}
            style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)', borderRadius: 10, padding: '6px 12px',
              cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5
            }}
          >
            <TrendingDown size={12} /> Sort {sortBy === 'desc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 14,
        background: percentile > 70
          ? 'rgba(16,185,129,0.08)'
          : percentile > 40
          ? 'rgba(234,179,8,0.08)'
          : 'rgba(239,68,68,0.08)',
        border: `1px solid ${percentile > 70 ? 'rgba(16,185,129,0.25)' : percentile > 40 ? 'rgba(234,179,8,0.25)' : 'rgba(239,68,68,0.25)'}`,
        marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Info size={16} color={percentile > 70 ? '#10b981' : percentile > 40 ? '#eab308' : '#ef4444'} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your footprint of <strong style={{ color: 'var(--text-primary)' }}>{(footprint / 1000).toFixed(1)}t CO₂/yr</strong> is lower than{' '}
          <strong style={{ color: percentile > 70 ? '#10b981' : percentile > 40 ? '#eab308' : '#ef4444' }}>{percentile}%</strong> of the world countries listed here.
          {footprint <= 2300 && ' 🎉 You are within the Paris Agreement 1.5°C budget!'}
        </span>
      </div>

      {/* Bar Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
        {allData.map((item) => {
          const barWidth = (item.footprint / maxVal) * 100;
          const isUser = item.region === 'You';
          const isTarget = item.region === 'Target';
          const isHovered = hoveredCountry === item.country;
          const color = getBarColor(item);

          return (
            <div
              key={item.country}
              onMouseEnter={() => setHoveredCountry(item.country)}
              onMouseLeave={() => setHoveredCountry(null)}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr 90px',
                gap: 10,
                alignItems: 'center',
                padding: '5px 8px',
                borderRadius: 10,
                background: isUser
                  ? 'rgba(16,185,129,0.06)'
                  : isHovered
                  ? 'var(--bg-tertiary)'
                  : 'transparent',
                border: isUser
                  ? '1px solid rgba(16,185,129,0.2)'
                  : isTarget
                  ? '1px dashed rgba(245,158,11,0.3)'
                  : '1px solid transparent',
                transition: 'all 0.15s',
                cursor: 'default'
              }}
            >
              {/* Country Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 16 }}>{item.flag}</span>
                <span style={{
                  fontSize: 12, fontWeight: isUser || isTarget ? 700 : 500,
                  color: isUser ? 'var(--color-accent)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {item.country}
                </span>
              </div>

              {/* Bar */}
              <div style={{ position: 'relative', height: 20, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: `${barWidth}%`,
                  height: '100%',
                  background: isUser
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : isTarget
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : color,
                  borderRadius: 99,
                  transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: isUser ? '0 0 8px rgba(16,185,129,0.4)' : 'none'
                }} />
              </div>

              {/* Value */}
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: isUser ? 'var(--color-accent)' : 'var(--text-primary)',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {(item.footprint / 1000).toFixed(1)}t
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
        Data sources: Global Carbon Project 2025, IEA World Energy Outlook. Per-capita annual CO₂e figures.
      </p>
    </div>
  );
}
