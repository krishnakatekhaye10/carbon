/**
 * Compare — upgraded component integrating CountryComparison bar chart
 * and a simulated historical trend timeline.
 */
import { useState, useMemo } from 'react';
import CountryComparison from './CountryComparison';
import { TrendingDown, BarChart3 } from 'lucide-react';

/** Generates a simulated 12-month reduction history based on current footprint */
function generateHistory(footprint) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  return months.slice(0, currentMonth + 1).map((m, i) => ({
    month: m,
    value: Math.round(footprint * (1.15 - i * 0.015) + (Math.random() - 0.5) * footprint * 0.05)
  }));
}

function HistoryChart({ footprint }) {
  const history = generateHistory(footprint);
  const max = Math.max(...history.map(h => h.value));
  const min = Math.min(...history.map(h => h.value));
  const range = max - min || 1;
  const width = 600;
  const height = 160;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = history.map((h, i) => {
    const x = padX + (i / Math.max(history.length - 1, 1)) * chartW;
    const y = padY + (1 - (h.value - min) / range) * chartH;
    return { x, y, ...h };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillD = `${pathD} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  const trend = history.length >= 2 ? history[history.length - 1].value - history[0].value : 0;

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--color-accent)" />
            <h3 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Monthly Footprint Trend (2026)</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Simulated based on your current data profile</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: trend < 0 ? '#10b981' : '#f59e0b',
          fontSize: 13, fontWeight: 700
        }}>
          <TrendingDown size={15} />
          {trend < 0 ? `${Math.abs(Math.round(trend))} kg reduced` : 'Keep tracking to see trends'}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: 320, height: 'auto' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const y = padY + frac * chartH;
            const val = Math.round(max - frac * range);
            return (
              <g key={frac}>
                <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="var(--border-color)" strokeDasharray="3,4" />
                <text x={padX - 6} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">
                  {(val / 1000).toFixed(1)}t
                </text>
              </g>
            );
          })}

          {/* Fill gradient */}
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={fillD} fill="url(#chartGrad)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="var(--bg-secondary)" strokeWidth="2" />
              <text x={p.x} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{p.month}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
import { Leaf, TreePine, Smartphone, Flame, Navigation, Award, Share2, X, ShieldCheck } from 'lucide-react';
import { useToast } from './ToastContext';

export default function Compare({ footprint, addXp, user }) {
  const { addToast } = useToast();
  const [simTrees, setSimTrees] = useState(0);
  
  const certId = useMemo(() => {
    const seed = (footprint * 33) + (user?.name ? user.name.charCodeAt(0) : 100);
    const randNum = Math.floor(1000 + (seed % 9000));
    return `CLM-${(footprint % 10000).toString(16).toUpperCase()}-${randNum}`;
  }, [footprint, user]);

  const [simAcres, setSimAcres] = useState(0);
  const [simSolar, setSimSolar] = useState(0);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certClaimed, setCertClaimed] = useState(false);

  const globalAvg = 4000;
  const parisTarget = 2300;
  const usAvg = 14500;
  const maxCompare = 16000;

  // Equivalents Calculations
  const treesNeeded = Math.round(footprint / 22); // 1 tree absorbs ~22kg CO2/year
  const carMiles = Math.round(footprint / 0.4); // 1 mile of average car driving = ~0.4kg CO2
  const phoneCharges = Math.round(footprint / 0.008); // 1 smartphone charge = ~0.008kg CO2
  const coalBurned = Math.round(footprint / 0.9); // 1 lb coal = ~0.9kg CO2

  // Simulator calculations
  const offsetFromTrees = simTrees * 22; // 22kg each
  const offsetFromAcres = simAcres * 1000; // 1000kg each
  const offsetFromSolar = simSolar * 400; // 400kg each
  const totalOffset = offsetFromTrees + offsetFromAcres + offsetFromSolar;

  const netFootprint = Math.max(0, footprint - totalOffset);
  const percentReduced = Math.min(100, (totalOffset / footprint) * 100);

  const getWidthPercent = (val) => {
    return `${Math.min((val / maxCompare) * 100, 100)}%`;
  };

  const resetSimulator = () => {
    setSimTrees(0);
    setSimAcres(0);
    setSimSolar(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>

      {/* Trend Timeline */}
      <HistoryChart footprint={footprint} />

      {/* Visual Stacked Chart */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>How Do You Stack Up?</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          Comparison of annual per-capita emissions in tonnes of CO₂.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* US Average */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>🇺🇸 United States Average</span>
              <span style={{ color: 'var(--text-primary)' }}>14.5 tonnes</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', height: 12, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: getWidthPercent(usAvg), height: '100%', background: '#94a3b8', borderRadius: 99 }} />
            </div>
          </div>

          {/* User Footprint */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>👤 Your Footprint</span>
              <span style={{ color: footprint > globalAvg ? 'var(--color-rose)' : 'var(--color-accent)', fontWeight: 800 }}>
                {(footprint / 1000).toFixed(1)} tonnes
              </span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', height: 12, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ 
                width: getWidthPercent(footprint), 
                height: '100%', 
                background: footprint > globalAvg ? 'var(--color-rose)' : 'var(--color-accent)', 
                borderRadius: 99,
                boxShadow: footprint > globalAvg ? '0 0 10px rgba(244, 63, 94, 0.3)' : '0 0 10px rgba(16, 185, 129, 0.3)',
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>
          </div>

          {/* Global Average */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>🌍 Global Average</span>
              <span style={{ color: 'var(--text-primary)' }}>4.0 tonnes</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', height: 12, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: getWidthPercent(globalAvg), height: '100%', background: 'var(--color-amber)', borderRadius: 99 }} />
            </div>
          </div>

          {/* Paris Target */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>🌿 Paris 2°C Pathway Target</span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>2.3 tonnes</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', height: 12, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: getWidthPercent(parisTarget), height: '100%', background: 'var(--color-accent)', borderRadius: 99 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Equivalents Cards */}
      <div>
        <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 12 }}>Visualizing Your Footprint</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          
          <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-accent)', padding: 12, borderRadius: 12 }}>
              <TreePine size={24} />
            </span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                {treesNeeded.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tree-years needed to absorb your footprint</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: 12, borderRadius: 12 }}>
              <Navigation size={24} />
            </span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                {carMiles.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Miles driven in a gasoline car</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: 12, borderRadius: 12 }}>
              <Smartphone size={24} />
            </span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                {phoneCharges.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Smartphones fully charged</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-amber)', padding: 12, borderRadius: 12 }}>
              <Flame size={24} />
            </span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                {coalBurned.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pounds of coal burned</div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Offsetting Simulator */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Simulated Offsetting Sandbox</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 24 }}>
          Simulate carbon offset investments to see how many initiatives you would need to support to neutralise your footprint.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr md:1.5fr', gap: 28 }} className="dashboard-grid">
          
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Plant Trees */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span>🌲 Plant Mature Trees</span>
                <span>{simTrees} trees (-{simTrees * 22} kg)</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={simTrees}
                  onChange={(e) => setSimTrees(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Protect Forest */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span>🌱 Protect Forest (acres)</span>
                <span>{simAcres} acres (-{simAcres * 1000} kg)</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={simAcres}
                  onChange={(e) => setSimAcres(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Solar Installation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span>☀️ Install Solar Panels</span>
                <span>{simSolar} panels (-{simSolar * 400} kg)</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={simSolar}
                  onChange={(e) => setSimSolar(Number(e.target.value))}
                />
              </div>
            </div>

            <button className="btn-secondary" onClick={resetSimulator} style={{ padding: '8px 16px', fontSize: 12, marginTop: 8 }}>
              Reset Simulator
            </button>
          </div>

          {/* Results Visual */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 12 }}>Offset Summary Balance</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Footprint:</span>
                <span style={{ fontWeight: 700 }}>{footprint.toLocaleString()} kg CO₂</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--color-accent)' }}>
                <span>Simulated Offsets:</span>
                <span style={{ fontWeight: 700 }}>-{totalOffset.toLocaleString()} kg CO₂</span>
              </div>
              <div style={{ height: 1, background: 'var(--border-color)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                <span style={{ color: 'var(--text-primary)' }}>Net Footprint:</span>
                <span style={{ color: netFootprint === 0 ? 'var(--color-accent)' : 'var(--text-primary)' }}>
                  {netFootprint.toLocaleString()} kg CO₂
                </span>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Carbon Offsetting Progress</span>
                <span style={{ color: 'var(--color-accent)' }}>{percentReduced.toFixed(0)}% Offsets</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', height: 14, borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div style={{
                  width: `${percentReduced}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-mint), var(--color-accent))',
                  borderRadius: 99,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              {netFootprint === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                  <div className="animate-scale-in" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 10,
                    color: 'var(--color-accent)',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    <Leaf size={16} /> Net Carbon Neutral Achieved in Simulation!
                  </div>
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="btn-primary animate-pulse-glow"
                    style={{
                      padding: '8px 16px',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontWeight: 700
                    }}
                  >
                    <Award size={14} /> Claim Neutrality Certificate
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Country Comparison */}
      <CountryComparison footprint={footprint} />

      {/* GORGEOUS CERTIFICATE MODAL */}
      {showCertModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 32, 22, 0.55)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div className="glass-card animate-scale-in" style={{
            maxWidth: 650,
            width: '100%',
            background: 'var(--bg-secondary)',
            padding: 32,
            position: 'relative',
            border: '2px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowCertModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'var(--bg-tertiary)',
                border: 'none',
                color: 'var(--text-muted)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            {/* Certificate Border Design */}
            <div style={{
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 16,
              padding: '28px 20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02), rgba(245, 158, 11, 0.02))'
            }}>
              {/* Emblem */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: 14,
                  borderRadius: '50%',
                  border: '2px solid var(--color-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={36} color="var(--color-amber)" />
                </div>
              </div>

              <h3 style={{ fontSize: 20, color: 'var(--color-amber)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                Certificate of Carbon Neutrality
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                Simulated Sandbox Achievement
              </p>

              <div style={{ height: 1, background: 'var(--border-color)', margin: '16px auto', width: '60%' }} />

              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                This is proudly presented to
              </p>
              
              <h4 style={{ fontSize: 24, color: 'var(--text-primary)', fontWeight: 800, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>
                {user?.name ?? 'Eco Warrior'}
              </h4>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 500, margin: '12px auto 0' }}>
                for successfully neutralising their gross carbon footprint of <strong style={{ color: 'var(--text-primary)' }}>{footprint.toLocaleString()} kg CO₂/yr</strong> on the Climatora environmental analytics portal by simulating carbon offsets of <strong style={{ color: 'var(--color-accent)' }}>-{totalOffset.toLocaleString()} kg CO₂/yr</strong> across reforestation and renewable energy projects.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, flexWrap: 'wrap', gap: 16, padding: '0 20px' }}>
                <div style={{ textalign: 'left' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verification Date</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Certificate ID</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {certId}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                className="btn-primary"
                onClick={() => {
                  if (!certClaimed) {
                    if (addXp) addXp(100);
                    setCertClaimed(true);
                    addToast('Neutrality Certificate claimed! +100 XP 🏆', 'success');
                  }
                }}
                disabled={certClaimed}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
              >
                <Award size={16} />
                {certClaimed ? '✓ Claimed (+100 XP)' : 'Claim Certificate (+100 XP)'}
              </button>
              
              <button
                className="btn-secondary"
                onClick={() => {
                  addToast('Sharing options: Link copied to clipboard!', 'info');
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 18px', fontSize: 13 }}
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
