import { useState, useMemo } from 'react';
import { Leaf, Droplet, CheckSquare, ShieldAlert, BarChart3, ChevronRight, RefreshCw } from 'lucide-react';
import {
  calculateWaterFootprint as calcWater,
  calculateSqScore as calcSq,
  calculateVulnerabilityScore as calcVuln
} from '../utils/footprintMath';

export default function TrackingTools({ 
  data, 
  calculateFootprint, 
  renderCarbonDashboard 
}) {
  const [subTab, setSubTab] = useState('carbon');

  // --- WATER CALCULATION STATES ---
  const [waterShowers, setWaterShowers] = useState(7); // showers per week
  const [waterLength, setWaterLength] = useState(8); // minutes per shower
  const [waterLaundry, setWaterLaundry] = useState(3); // loads per week
  const [waterDishwash, setWaterDishwash] = useState(4); // times per week
  const [waterHandwash, setWaterHandwash] = useState(false); // dishwasher vs handwash
  const [waterCompleted, setWaterCompleted] = useState(false);

  // --- SUSTAINABILITY QUOTIENT STATES ---
  const [sqAnswers, setSqAnswers] = useState({ q1: 10, q2: 12, q3: 12, q4: 10, q5: 0 });
  const [sqCompleted, setSqCompleted] = useState(false);

  // --- VULNERABILITY INDEX STATES ---
  const [vulnAnswers, setVulnAnswers] = useState({ region: 'stable', water: 'excellent', insulation: 'medium' });
  const [vulnCompleted, setVulnCompleted] = useState(false);

  // --- WATER MATH ---
  const waterTotal = useMemo(() => calcWater({
    showers: waterShowers,
    length: waterLength,
    laundry: waterLaundry,
    dishwash: waterDishwash,
    handwash: waterHandwash,
    dietType: data.diet?.dietType || 'lowMeat'
  }), [waterShowers, waterLength, waterLaundry, waterDishwash, waterHandwash, data.diet?.dietType]);

  // --- SUSTAINABILITY QUOTIENT MATH ---
  const sqScore = useMemo(() => calcSq(sqAnswers), [sqAnswers]);

  // --- VULNERABILITY MATH ---
  const vulnScore = useMemo(() => calcVuln(vulnAnswers), [vulnAnswers]);
  
  // --- GHG MATH ---
  const totalCarbon = useMemo(() => calculateFootprint(data), [calculateFootprint, data]);
  
  // Methane CH4 equivalents from high-meat agriculture and organic waste
  const methaneEq = useMemo(() => {
    const dietType = data.diet?.dietType || 'lowMeat';
    return Math.round(dietType === 'heavyMeat' ? 900 : dietType === 'lowMeat' ? 400 : 100);
  }, [data.diet?.dietType]);
  
  // Nitrous oxide N2O equivalents from energy grids & chemical processes
  const n2oEq = useMemo(() => Math.round(totalCarbon * 0.04), [totalCarbon]); 
  const totalGhg = useMemo(() => totalCarbon + methaneEq + n2oEq, [totalCarbon, methaneEq, n2oEq]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="animate-fade-in">
      
      {/* Sub-Tab Navigation Header */}
      <div className="glass-card" style={{ padding: 8, display: 'flex', gap: 8, overflowX: 'auto', flexWrap: 'wrap' }}>
        {[
          { id: 'carbon', label: 'Carbon Footprint', icon: Leaf, color: 'var(--color-accent)' },
          { id: 'water', label: 'Water Footprint', icon: Droplet, color: '#3b82f6' },
          { id: 'sq', label: 'Sustainability Quotient', icon: CheckSquare, color: 'var(--color-amber)' },
          { id: 'vuln', label: 'Vulnerability Index', icon: ShieldAlert, color: 'var(--color-rose)' },
          { id: 'ghg', label: 'GHG Emissions Log', icon: BarChart3, color: '#8b5cf6' }
        ].map(item => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              style={{
                color: isActive ? item.color : 'var(--text-secondary)',
                backgroundColor: isActive ? `${item.color}15` : 'transparent',
                fontWeight: 700
              }}
            >
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </div>

      {/* Calculator Body router */}
      <div>
        
        {/* CARBON TAB */}
        {subTab === 'carbon' && renderCarbonDashboard()}

        {/* WATER FOOTPRINT TAB */}
        {subTab === 'water' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, color: 'var(--text-primary)' }}>🚰 Water Footprint Calculator</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Understand your direct and indirect water consumption habits.
                </p>
              </div>
              <span style={{ fontSize: 24, color: '#3b82f6' }}><Droplet /></span>
            </div>

            {!waterCompleted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Shower input */}
                <div>
                  <label htmlFor="water-showers-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    How many showers do you take per week?
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="water-showers-slider"
                      type="range" min="0" max="21"
                      value={waterShowers} onChange={(e) => setWaterShowers(Number(e.target.value))}
                    />
                    <span style={{ width: 60, fontWeight: 700, textAlign: 'right' }}>{waterShowers}</span>
                  </div>
                </div>

                {/* Shower length */}
                <div>
                  <label htmlFor="water-length-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    Average length of a shower (minutes)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="water-length-slider"
                      type="range" min="2" max="25"
                      value={waterLength} onChange={(e) => setWaterLength(Number(e.target.value))}
                    />
                    <span style={{ width: 60, fontWeight: 700, textAlign: 'right' }}>{waterLength} min</span>
                  </div>
                </div>

                {/* Laundry runs */}
                <div>
                  <label htmlFor="water-laundry-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    Laundry washes per week
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="water-laundry-slider"
                      type="range" min="0" max="10"
                      value={waterLaundry} onChange={(e) => setWaterLaundry(Number(e.target.value))}
                    />
                    <span style={{ width: 60, fontWeight: 700, textAlign: 'right' }}>{waterLaundry} runs</span>
                  </div>
                </div>

                {/* Dishwasher loads */}
                <div>
                  <label htmlFor="water-dishwash-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    Dishwashing runs per week
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      id="water-dishwash-slider"
                      type="range" min="0" max="14"
                      value={waterDishwash} onChange={(e) => setWaterDishwash(Number(e.target.value))}
                    />
                    <span style={{ width: 60, fontWeight: 700, textAlign: 'right' }}>{waterDishwash} runs</span>
                  </div>
                </div>

                {/* Dishwasher type */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="checkbox" id="handwash-check"
                    checked={waterHandwash} onChange={(e) => setWaterHandwash(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#3b82f6' }}
                  />
                  <label htmlFor="handwash-check" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    I wash dishes by hand rather than using a machine (uses more water)
                  </label>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => setWaterCompleted(true)}
                  style={{ background: '#3b82f6', alignSelf: 'flex-start', marginTop: 10 }}
                >
                  Calculate Water Footprint <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  padding: 24,
                  borderRadius: 16,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Estimated Annual Water Footprint</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#3b82f6', fontFamily: "'Outfit', sans-serif", marginTop: 8 }}>
                    {(waterTotal / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} m³
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    ({waterTotal.toLocaleString()} Liters of water per year)
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Water Breakdown:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>🚿 Personal hygiene (showers)</span>
                      <strong>{(waterShowers * waterLength * 8 * 52).toLocaleString()} Liters</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>👕 Washing Clothes</span>
                      <strong>{(waterLaundry * 70 * 52).toLocaleString()} Liters</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>🍽️ Washing Dishes</span>
                      <strong>{(waterDishwash * (waterHandwash ? 45 : 15) * 52).toLocaleString()} Liters</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>🥩 Food Production (embedded water)</span>
                      <strong>
                        {data.diet.dietType === 'heavyMeat' ? '2.2 million' : data.diet.dietType === 'lowMeat' ? '1.5 million' : 'under 1 million'} Liters
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: 12, borderRadius: 10 }}>
                  💡 <strong>Did you know?</strong> An average burger requires roughly 2,400 liters of water to produce. Swapping meat for grains/vegetables is the fastest way to shrink your indirect water footprint!
                </div>

                <button className="btn-secondary" onClick={() => setWaterCompleted(false)} style={{ alignSelf: 'flex-start' }}>
                  <RefreshCw size={14} /> Recalculate
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUSTAINABILITY QUOTIENT */}
        {subTab === 'sq' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, color: 'var(--text-primary)' }}>📊 Sustainability Quotient (SQ)</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Assess your general sustainable living quotient out of 100 points.
                </p>
              </div>
              <span style={{ fontSize: 24, color: 'var(--color-amber)' }}><CheckSquare /></span>
            </div>

            {!sqCompleted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Q1 */}
                <div>
                  <label htmlFor="sq-q1" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    1. Do you switch off lights/appliances and turn down heat when not in use?
                  </label>
                  <select 
                    id="sq-q1"
                    className="glass-input" style={{ width: '100%' }}
                    value={sqAnswers.q1} onChange={(e) => setSqAnswers(prev => ({ ...prev, q1: Number(e.target.value) }))}
                  >
                    <option value="20">Always (20 pts)</option>
                    <option value="10">Sometimes (10 pts)</option>
                    <option value="0">Rarely / Never (0 pts)</option>
                  </select>
                </div>

                {/* Q2 */}
                <div>
                  <label htmlFor="sq-q2" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    2. Do you prioritize local, organic, or packaging-free foods?
                  </label>
                  <select 
                    id="sq-q2"
                    className="glass-input" style={{ width: '100%' }}
                    value={sqAnswers.q2} onChange={(e) => setSqAnswers(prev => ({ ...prev, q2: Number(e.target.value) }))}
                  >
                    <option value="20">Always (20 pts)</option>
                    <option value="12">Sometimes (12 pts)</option>
                    <option value="2">Rarely / Never (2 pts)</option>
                  </select>
                </div>

                {/* Q3 */}
                <div>
                  <label htmlFor="sq-q3" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    3. What is your primary mode of transportation?
                  </label>
                  <select 
                    id="sq-q3"
                    className="glass-input" style={{ width: '100%' }}
                    value={sqAnswers.q3} onChange={(e) => setSqAnswers(prev => ({ ...prev, q3: Number(e.target.value) }))}
                  >
                    <option value="20">Biking / Walking (20 pts)</option>
                    <option value="16">Public Transit / EV (16 pts)</option>
                    <option value="12">Carpooling (12 pts)</option>
                    <option value="2">Single Passenger Gas Car (2 pts)</option>
                  </select>
                </div>

                {/* Q4 */}
                <div>
                  <label htmlFor="sq-q4" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    4. Do you avoid single-use plastics? (bags, straws, bottles)
                  </label>
                  <select 
                    id="sq-q4"
                    className="glass-input" style={{ width: '100%' }}
                    value={sqAnswers.q4} onChange={(e) => setSqAnswers(prev => ({ ...prev, q4: Number(e.target.value) }))}
                  >
                    <option value="20">Always (20 pts)</option>
                    <option value="10">Sometimes (10 pts)</option>
                    <option value="0">Rarely / Never (0 pts)</option>
                  </select>
                </div>

                {/* Q5 */}
                <div>
                  <label htmlFor="sq-q5" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    5. Do you compost food scraps or garden waste?
                  </label>
                  <select 
                    id="sq-q5"
                    className="glass-input" style={{ width: '100%' }}
                    value={sqAnswers.q5} onChange={(e) => setSqAnswers(prev => ({ ...prev, q5: Number(e.target.value) }))}
                  >
                    <option value="20">Yes (20 pts)</option>
                    <option value="0">No (0 pts)</option>
                  </select>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => setSqCompleted(true)}
                  style={{ background: 'var(--color-amber)', alignSelf: 'flex-start', marginTop: 10 }}
                >
                  Get Sustainability Score <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{
                  background: 'rgba(217, 119, 6, 0.08)',
                  padding: 24,
                  borderRadius: 16,
                  border: '1px solid rgba(217, 119, 6, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Your Sustainability Quotient</div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--color-amber)', fontFamily: "'Outfit', sans-serif", marginTop: 8 }}>
                    {sqScore} / 100
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
                    {sqScore >= 80 ? '🌿 Eco Champion' : sqScore >= 50 ? '🌾 Average Green Practitioner' : '⚠️ Eco Learner'}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {sqScore >= 80 && "Splendid! You have outstanding green habits. Your active choices prevent significant emissions and encourage community responsibility."}
                  {sqScore < 80 && sqScore >= 50 && "You're off to a solid start! To reach the next level, see if you can compost food waste or further minimize single-use plastics."}
                  {sqScore < 50 && "There is plenty of room to grow! Small shifts like switching off standby appliances or choosing to carpool once a week can make a massive difference."}
                </div>

                <button className="btn-secondary" onClick={() => setSqCompleted(false)} style={{ alignSelf: 'flex-start' }}>
                  <RefreshCw size={14} /> Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* VULNERABILITY INDEX */}
        {subTab === 'vuln' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, color: 'var(--text-primary)' }}>⚠️ Vulnerability Index</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Assess your physical and environmental vulnerability to climate-related hazards.
                </p>
              </div>
              <span style={{ fontSize: 24, color: 'var(--color-rose)' }}><ShieldAlert /></span>
            </div>

            {!vulnCompleted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Q1 */}
                <div>
                  <label htmlFor="vuln-region" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    What best describes your geographic region?
                  </label>
                  <select 
                    id="vuln-region"
                    className="glass-input" style={{ width: '100%' }}
                    value={vulnAnswers.region} onChange={(e) => setVulnAnswers(prev => ({ ...prev, region: e.target.value }))}
                  >
                    <option value="coastal">Coastal or low-lying flood-prone zone</option>
                    <option value="wildfire">High wildfire/drought risk area</option>
                    <option value="heatwave">Densely urban heat-island center</option>
                    <option value="stable">Geographically stable, temperate, low-risk zone</option>
                  </select>
                </div>

                {/* Q2 */}
                <div>
                  <label htmlFor="vuln-water" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    What is the reliability of your municipal water supply?
                  </label>
                  <select 
                    id="vuln-water"
                    className="glass-input" style={{ width: '100%' }}
                    value={vulnAnswers.water} onChange={(e) => setVulnAnswers(prev => ({ ...prev, water: e.target.value }))}
                  >
                    <option value="scarcity">Scarcity risks or seasonal restrictions</option>
                    <option value="medium">Occasional issues but generally stable</option>
                    <option value="excellent">Highly secure, clean water reserves</option>
                  </select>
                </div>

                {/* Q3 */}
                <div>
                  <label htmlFor="vuln-insulation" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    How insulated and weather-resilient is your residence?
                  </label>
                  <select 
                    id="vuln-insulation"
                    className="glass-input" style={{ width: '100%' }}
                    value={vulnAnswers.insulation} onChange={(e) => setVulnAnswers(prev => ({ ...prev, insulation: e.target.value }))}
                  >
                    <option value="poor">Poor insulation / leaks / no air purification</option>
                    <option value="medium">Average weatherization / partial filtration</option>
                    <option value="excellent">Top-tier insulation / heat pump / air purifier</option>
                  </select>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => setVulnCompleted(true)}
                  style={{ background: 'var(--color-rose)', alignSelf: 'flex-start', marginTop: 10 }}
                >
                  Analyze Resilience Risk <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{
                  background: 'rgba(225, 29, 72, 0.08)',
                  padding: 24,
                  borderRadius: 16,
                  border: '1px solid rgba(225, 29, 72, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Resilience Risk Exposure</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--color-rose)', fontFamily: "'Outfit', sans-serif", marginTop: 8 }}>
                    {vulnScore > 70 ? 'High Risk' : vulnScore > 35 ? 'Moderate Risk' : 'Low Risk'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Score: {vulnScore} / 100 points
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Adaptation Recommendations:</h4>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {vulnAnswers.region === 'coastal' && <li>💧 Secure emergency kits, raise electrical boxes, and inspect local flood drainage routes.</li>}
                    {vulnAnswers.region === 'wildfire' && <li>🔥 Maintain defensible garden zones, install smoke-rated interior HEPA filters, and prepare evacuation plans.</li>}
                    {vulnAnswers.region === 'heatwave' && <li>🌡️ Increase reflective shading, upgrade home insulation, and look into a localized energy battery backup.</li>}
                    {vulnAnswers.water === 'scarcity' && <li>🚰 Install rainwater capture barrels for gardening, implement gray-water recycling, and choose low-flow water taps.</li>}
                    {vulnAnswers.insulation === 'poor' && <li>🏠 Seal window gaps and weatherstrip doors to immediately reduce HVAC load by up to 25%.</li>}
                  </ul>
                </div>

                <button className="btn-secondary" onClick={() => setVulnCompleted(false)} style={{ alignSelf: 'flex-start' }}>
                  <RefreshCw size={14} /> Re-analyze
                </button>
              </div>
            )}
          </div>
        )}

        {/* GHG EMISSIONS LOG */}
        {subTab === 'ghg' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>📊 Comprehensive GHG Emissions Tracker</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Tracking carbon dioxide, methane, and nitrous oxide equivalents ($CO_2e$) in real-time.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
              {/* Carbon */}
              <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid var(--color-accent)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CO₂ Emissions</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {totalCarbon.toLocaleString()} kg
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>From energy, travel, and shopping</div>
              </div>

              {/* Methane */}
              <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid var(--color-amber)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CH₄ Equivalents</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {methaneEq.toLocaleString()} kg
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>From agricultural food and waste</div>
              </div>

              {/* Nitrous Oxide */}
              <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>N₂O Equivalents</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {n2oEq.toLocaleString()} kg
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>From grid heating & industry</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: 24,
              borderRadius: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Greenhouse Gas Balance</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>
                  {(totalGhg / 1000).toFixed(2)} tonnes CO₂e / yr
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-accent)', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                Indexed Live
              </span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
