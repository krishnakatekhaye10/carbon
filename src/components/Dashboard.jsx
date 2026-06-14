import { useState } from 'react';
import { Car, Plane, Utensils, Home, ShoppingBag } from 'lucide-react';

const CATEGORY_INFO = {
  transport: { label: 'Transport', color: '#10b981', icon: Car, desc: 'Driving & public transit' },
  flights: { label: 'Air Travel', color: '#3b82f6', icon: Plane, desc: 'Short & long-haul flights' },
  diet: { label: 'Diet & Food', color: '#f59e0b', icon: Utensils, desc: 'Diet type emissions' },
  energy: { label: 'Home Energy', color: '#8b5cf6', icon: Home, desc: 'Electricity & heating' },
  lifestyle: { label: 'Lifestyle', color: '#ec4899', icon: ShoppingBag, desc: 'Purchases & recycling' }
};

function BreathOrb({ footprint }) {
  const parisTarget = 2300;
  const globalAvg = 4000;
  const usAvg = 14500;

  // Normalise footprint between 1500 and 15000 for size scaling
  const ratio = Math.min(Math.max((footprint - 1500) / 13500, 0), 1);
  const size = 160 + ratio * 80;

  // Decide colors based on levels
  let colorPrimary, colorGlow, statusText, statusColor, statusEmoji;
  if (footprint <= parisTarget) {
    colorPrimary = '#10b981'; // Mint Green
    colorGlow = 'rgba(16, 185, 129, 0.4)';
    statusText = 'Within Paris Agreement Target';
    statusColor = 'var(--color-accent)';
    statusEmoji = '🌿';
  } else if (footprint <= globalAvg) {
    colorPrimary = '#6eb388'; // Sage
    colorGlow = 'rgba(110, 179, 136, 0.3)';
    statusText = 'Below Global Average';
    statusColor = 'var(--text-secondary)';
    statusEmoji = '🟡';
  } else if (footprint <= usAvg) {
    colorPrimary = '#f59e0b'; // Amber
    colorGlow = 'rgba(245, 158, 11, 0.35)';
    statusText = 'Above Global Average';
    statusColor = 'var(--color-amber)';
    statusEmoji = '⚠️';
  } else {
    colorPrimary = '#f43f5e'; // Coral Red
    colorGlow = 'rgba(244, 63, 94, 0.4)';
    statusText = 'Critical Footprint Level';
    statusColor = 'var(--color-rose)';
    statusEmoji = '🚨';
  }

  const pulseDuration = Math.max(1.5, 4.5 - ratio * 3); // Faster pulse for higher footprint

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, margin: '20px 0' }}>
      <div style={{
        position: 'relative',
        width: 260,
        height: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Ripple layers */}
        <div style={{
          position: 'absolute',
          width: size - 20,
          height: size - 20,
          borderRadius: '50%',
          border: `2px solid ${colorPrimary}`,
          opacity: 0.2,
          animation: `ripple ${pulseDuration}s cubic-bezier(0.16, 1, 0.3, 1) infinite`
        }} />
        <div style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          background: colorPrimary,
          opacity: 0.08,
          animation: `ripple ${pulseDuration}s cubic-bezier(0.16, 1, 0.3, 1) infinite`,
          animationDelay: `${pulseDuration / 2}s`
        }} />

        {/* Breathing Orb */}
        <div style={{
          width: size - 40,
          height: size - 40,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, #ffffff, ${colorPrimary})`,
          boxShadow: `0 12px 40px ${colorGlow}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `breathe ${pulseDuration}s ease-in-out infinite`,
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <span style={{
            fontSize: size * 0.16,
            fontWeight: 800,
            color: footprint > 6000 ? 'var(--color-forest)' : '#ffffff',
            lineHeight: 1,
            fontFamily: "'Outfit', sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {(footprint / 1000).toFixed(1)}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: footprint > 6000 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: 4
          }}>
            tonnes CO₂/yr
          </span>
        </div>
      </div>

      <div className="glass-card" style={{
        padding: '8px 16px',
        borderRadius: 99,
        fontSize: 14,
        fontWeight: 700,
        color: statusColor,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <span>{statusEmoji}</span>
        <span>{statusText}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ data, onUpdate, calculateBreakdown, calculateFootprint }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const footprint = calculateFootprint(data);
  const breakdown = calculateBreakdown(data);

  // Compute percentages for SVG doughnut
  const categoriesList = Object.keys(CATEGORY_INFO);
  const totalBreakdownVal = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const doughnutData = categoriesList.map(cat => {
    const val = breakdown[cat] || 0;
    const percentage = totalBreakdownVal > 0 ? (val / totalBreakdownVal) * 100 : 0;
    return {
      id: cat,
      label: CATEGORY_INFO[cat].label,
      value: val,
      percentage: percentage,
      color: CATEGORY_INFO[cat].color
    };
  });

  // SVG configuration
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  // Identify biggest impact category
  const topCategory = categoriesList.reduce((top, cat) => {
    const val = breakdown[cat] || 0;
    return val > top.val ? { id: cat, val } : top;
  }, { id: 'transport', val: 0 });

  const biggestCatInfo = CATEGORY_INFO[topCategory.id];

  const getTip = (id) => {
    switch (id) {
      case 'transport':
        return 'Consider swapping short car journeys for cycling, carpooling, or taking the train. Transitioning to an EV reduces travel emissions by up to 80%.';
      case 'flights':
        return 'Flying has a heavy carbon toll. Try reducing short-haul flights by opting for rail alternatives, or offset long-haul flights using reputable certified schemes.';
      case 'diet':
        return 'Switching to vegetarianism or a plant-based diet can cut food-related emissions in half. Swapping beef for chicken once a week yields massive savings.';
      case 'energy':
        return 'Upgrade to LED bulbs, adjust your thermostat by 1-2°C, and ensure your home is well-insulated. Green tariffs reduce household electricity emissions to zero.';
      case 'lifestyle':
        return 'Choose second-hand goods, buy fewer items of clothing, and repair electronics rather than buying new. Composting and recycling reduce landfill methane.';
      default:
        return '';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      
      {/* Top Banner Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr md:1.2fr', gap: 24 }} className="dashboard-grid">
          
          {/* Breathing Orb Section */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ fontSize: 18, alignSelf: 'flex-start', color: 'var(--text-primary)' }}>Your Breathing Orb</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'flex-start', marginTop: 4 }}>
              The expansion, color, and pulse rate mirror your annual carbon footprint.
            </p>
            <BreathOrb footprint={footprint} />
          </div>

          {/* Custom SVG Visualization Section */}
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>Footprint Breakdown</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Hover over segments or categories to see details.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 32, flex: 1 }}>
              {/* Doughnut Chart */}
              <div style={{ position: 'relative', width: 160, height: 160 }}>
                <svg width="100%" height="100%" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="var(--bg-tertiary)"
                    strokeWidth="15"
                  />
                  {doughnutData.map(seg => {
                    const strokeDash = `${(seg.percentage * circumference) / 100} ${circumference}`;
                    const strokeOffset = circumference - (accumulatedPercentage * circumference) / 100;
                    accumulatedPercentage += seg.percentage;

                    const isHovered = activeCategory === seg.id;

                    return (
                      <circle
                        key={seg.id}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isHovered ? 19 : 15}
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 80 80)"
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={() => setActiveCategory(seg.id)}
                        onMouseLeave={() => setActiveCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Central Info Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  {activeCategory ? (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {CATEGORY_INFO[activeCategory].label}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: CATEGORY_INFO[activeCategory].color, fontFamily: "'Outfit', sans-serif" }}>
                        {doughnutData.find(d => d.id === activeCategory).percentage.toFixed(0)}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Total CO₂
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                        {(footprint / 1000).toFixed(1)}t
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Legend details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 160 }}>
                {doughnutData.map(seg => {
                  const Icon = CATEGORY_INFO[seg.id].icon;
                  const isHovered = activeCategory === seg.id;
                  return (
                    <div
                      key={seg.id}
                      onMouseEnter={() => setActiveCategory(seg.id)}
                      onMouseLeave={() => setActiveCategory(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 10,
                        background: isHovered ? 'var(--bg-tertiary)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: `${seg.color}15`,
                          color: seg.color
                        }}>
                          <Icon size={14} />
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {seg.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(seg.value / 1000).toFixed(1)}t ({seg.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations & Impact Card */}
      <div className="glass-card animate-scale-in" style={{ padding: '24px', display: 'flex', gap: 20, alignItems: 'flex-start', background: 'var(--bg-tertiary)', border: '1px dashed var(--color-accent)' }}>
        <div style={{
          background: `${biggestCatInfo.color}20`,
          color: biggestCatInfo.color,
          padding: 16,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <biggestCatInfo.icon size={32} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="carbon-badge" style={{ backgroundColor: `${biggestCatInfo.color}20`, color: biggestCatInfo.color }}>
              Biggest Lever
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {biggestCatInfo.label} represents {(breakdown[topCategory.id] / footprint * 100).toFixed(0)}% of your score
            </span>
          </div>
          <h4 style={{ fontSize: 16, color: 'var(--text-primary)', marginTop: 8 }}>
            Our recommendation:
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
            {getTip(topCategory.id)}
          </p>
        </div>
      </div>

      {/* Adjust Habits Sliders */}
      <div>
        <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 12 }}>Fine-tune your emissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          
          {/* Transport Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Car size={20} style={{ color: CATEGORY_INFO.transport.color }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Car Driving</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
                {data.transport.carKm} km/week
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="800"
              step="10"
              value={data.transport.carKm}
              onChange={(e) => onUpdate('transport', 'carKm', Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <select
                className="glass-input"
                style={{ width: '100%', padding: '6px 12px', fontSize: 12 }}
                value={data.transport.fuelType}
                onChange={(e) => onUpdate('transport', 'fuelType', e.target.value)}
              >
                <option value="gas">Gas / Petrol Engine</option>
                <option value="hybrid">Hybrid Engine</option>
                <option value="ev">Electric Motor (EV)</option>
              </select>
            </div>
          </div>

          {/* Flights Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Plane size={20} style={{ color: CATEGORY_INFO.flights.color }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Short & Long-haul Flights</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
                {data.flights.shortHaul}S / {data.flights.longHaul}L
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Short-haul (domestic)</span>
                  <span>{data.flights.shortHaul} / yr</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={data.flights.shortHaul}
                  onChange={(e) => onUpdate('flights', 'shortHaul', Number(e.target.value))}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Long-haul (international)</span>
                  <span>{data.flights.longHaul} / yr</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={data.flights.longHaul}
                  onChange={(e) => onUpdate('flights', 'longHaul', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Diet Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Utensils size={20} style={{ color: CATEGORY_INFO.diet.color }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Diet Style</span>
              </div>
            </div>
            <select
              className="glass-input"
              style={{ width: '100%', padding: '8px 12px' }}
              value={data.diet.dietType}
              onChange={(e) => onUpdate('diet', 'dietType', e.target.value)}
            >
              <option value="heavyMeat">🥩 Heavy Meat Lover</option>
              <option value="lowMeat">🍗 Average Meat Eater</option>
              <option value="pescatarian">🐟 Pescatarian</option>
              <option value="vegetarian">🥚 Vegetarian</option>
              <option value="vegan">🌱 Plant-Based / Vegan</option>
            </select>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              Going plant-based cuts food emissions by over 70% compared to beef-heavy diets.
            </p>
          </div>

          {/* Energy Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Home size={20} style={{ color: CATEGORY_INFO.energy.color }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Home Power & Heat</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
                {data.energy.electricity} kWh
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={data.energy.electricity}
              onChange={(e) => onUpdate('energy', 'electricity', Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <select
                className="glass-input"
                style={{ width: '100%', padding: '6px 12px', fontSize: 12 }}
                value={data.energy.heatingSource}
                onChange={(e) => onUpdate('energy', 'heatingSource', e.target.value)}
              >
                <option value="gas">Natural Gas Heating</option>
                <option value="electric">Electric / Heat Pump</option>
                <option value="oil">Heating Oil</option>
                <option value="solar">Solar / Renewable heating</option>
              </select>
            </div>
          </div>

          {/* Shopping Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <ShoppingBag size={20} style={{ color: CATEGORY_INFO.lifestyle.color }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Shopping & Products</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
                {data.lifestyle.newPurchases} items/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={data.lifestyle.newPurchases}
              onChange={(e) => onUpdate('lifestyle', 'newPurchases', Number(e.target.value))}
            />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
              <input
                type="checkbox"
                id="recycling-check"
                checked={data.lifestyle.recycling}
                onChange={(e) => onUpdate('lifestyle', 'recycling', e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
              />
              <label htmlFor="recycling-check" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                I recycle glass, plastic, and paper regularly
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
