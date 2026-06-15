/**
 * GlobalStatsBar — displays live-animated global climate statistics:
 * CO2 concentration, world temperature anomaly, and an animated emissions counter.
 * Uses requestAnimationFrame for smooth number animation.
 */
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Thermometer, Wind, Zap } from 'lucide-react';

/**
 * AnimatedCounter — smoothly counts up to a target value using RAF.
 * @param {{ value: number, decimals?: number, suffix?: string, duration?: number }} props
 */
function AnimatedCounter({ value, decimals = 0, suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const startVal = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay(startVal + (value - startVal) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
      {suffix}
    </span>
  );
}

/** @type {Array<{label: string, value: number, unit: string, change: string, icon: any, color: string, decimals: number}>} */
const GLOBAL_STATS = [
  {
    label: 'Atmospheric CO₂',
    value: 426.8,
    unit: 'ppm',
    change: '+3.2 ppm/yr',
    icon: Wind,
    color: '#f59e0b',
    decimals: 1,
    description: 'Parts per million CO₂ in atmosphere (Mauna Loa, 2026)'
  },
  {
    label: 'Global Temp. Anomaly',
    value: 1.47,
    unit: '°C above pre-industrial',
    change: 'Paris limit: 1.5°C',
    icon: Thermometer,
    color: '#ef4444',
    decimals: 2,
    description: 'Mean surface temperature rise since 1850–1900 baseline'
  },
  {
    label: 'Annual Global Emissions',
    value: 37.4,
    unit: 'Gt CO₂/yr',
    change: 'Needs to halve by 2030',
    icon: TrendingUp,
    color: '#8b5cf6',
    decimals: 1,
    description: 'Total fossil fuel and land-use CO₂ emissions (2025 estimate)'
  },
  {
    label: 'Renewable Energy Share',
    value: 31,
    unit: '% of global electricity',
    change: '+4.3% from last year',
    icon: Zap,
    color: '#10b981',
    decimals: 0,
    description: 'Share of global electricity generation from renewable sources'
  }
];

/**
 * GlobalStatsBar component — a premium strip of animated real-world climate stats.
 */
export default function GlobalStatsBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}
    >
      {GLOBAL_STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="glass-card"
            title={stat.description}
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              borderTop: `3px solid ${stat.color}`,
              cursor: 'help'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </span>
              <Icon size={15} color={stat.color} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: stat.color, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                {visible && <AnimatedCounter value={stat.value} decimals={stat.decimals} duration={1400} />}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{stat.unit}</span>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: stat.color === '#10b981' ? '#10b981' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              {stat.change}
            </div>
          </div>
        );
      })}
    </div>
  );
}
