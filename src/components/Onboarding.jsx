import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Onboarding({ onComplete, initialData, calculateFootprint }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);

  const totalSteps = 5;

  const updateField = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const currentFootprint = calculateFootprint(formData);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 650, margin: '40px auto', padding: '0 16px' }}>
      <div className="glass-card" style={{ padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
        {/* Progress Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 6,
          background: 'linear-gradient(90deg, var(--color-mint), var(--color-accent))',
          width: `${(step / totalSteps) * 100}%`,
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Step {step} of {totalSteps}
            </span>
            <h2 style={{ fontSize: 24, color: 'var(--text-primary)', marginTop: 4 }}>
              {step === 1 && 'Daily Travel'}
              {step === 2 && 'Flight Habits'}
              {step === 3 && 'Diet & Food'}
              {step === 4 && 'Home Energy'}
              {step === 5 && 'Shopping & Waste'}
            </h2>
          </div>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '8px 16px',
            borderRadius: 16,
            textAlign: 'right'
          }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Est. Footprint</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-accent)', fontFamily: "'Outfit', sans-serif" }}>
              {(currentFootprint / 1000).toFixed(1)} t CO₂/yr
            </div>
          </div>
        </div>

        {/* Step Contents */}
        <div style={{ minHeight: 250, marginBottom: 32 }}>
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                Transportation is one of the largest sources of personal emissions. Tell us how you get around.
              </p>

              <div>
                <label htmlFor="onboard-carkm-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  How many kilometers do you drive in a car per week?
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    id="onboard-carkm-slider"
                    type="range"
                    min="0"
                    max="800"
                    step="10"
                    value={formData.transport.carKm}
                    onChange={(e) => updateField('transport', 'carKm', Number(e.target.value))}
                  />
                  <span style={{ width: 80, fontSize: 16, fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>
                    {formData.transport.carKm} km
                  </span>
                </div>
              </div>

              {formData.transport.carKm > 0 && (
                <div className="animate-scale-in">
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                    What is the fuel type of your car?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { id: 'gas', label: 'Gas / Petrol' },
                      { id: 'hybrid', label: 'Hybrid' },
                      { id: 'ev', label: 'Electric (EV)' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => updateField('transport', 'fuelType', type.id)}
                        style={{
                          padding: '12px',
                          borderRadius: 12,
                          border: `2px solid ${formData.transport.fuelType === type.id ? 'var(--color-accent)' : 'var(--border-color)'}`,
                          background: formData.transport.fuelType === type.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                          color: formData.transport.fuelType === type.id ? 'var(--color-accent)' : 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="onboard-publickm-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  How many kilometers do you travel by public transit (bus/train) per week?
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    id="onboard-publickm-slider"
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={formData.transport.publicKm}
                    onChange={(e) => updateField('transport', 'publicKm', Number(e.target.value))}
                  />
                  <span style={{ width: 80, fontSize: 16, fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>
                    {formData.transport.publicKm} km
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                Air travel has an extremely high carbon intensity. Please estimate your flights in a typical year.
              </p>

              <div>
                <label htmlFor="onboard-shorthaul-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  Short-haul flights per year (under 3 hours / domestic)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    id="onboard-shorthaul-slider"
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={formData.flights.shortHaul}
                    onChange={(e) => updateField('flights', 'shortHaul', Number(e.target.value))}
                  />
                  <span style={{ width: 80, fontSize: 16, fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>
                    {formData.flights.shortHaul}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Examples: NYC to Chicago, London to Paris. (~250 kg CO₂ per flight)
                </div>
              </div>

              <div>
                <label htmlFor="onboard-longhaul-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  Long-haul flights per year (over 3 hours / international)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    id="onboard-longhaul-slider"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={formData.flights.longHaul}
                    onChange={(e) => updateField('flights', 'longHaul', Number(e.target.value))}
                  />
                  <span style={{ width: 80, fontSize: 16, fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>
                    {formData.flights.longHaul}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Examples: NYC to London, LA to Tokyo. (~1,200 kg CO₂ per flight)
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                Agriculture and meat production account for significant emissions. Select the option that best describes your diet.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id: 'heavyMeat', label: '🥩 Heavy Meat Lover', desc: 'Eat beef, pork, or lamb almost daily.' },
                  { id: 'lowMeat', label: '🍗 Average Meat Eater', desc: 'Eat meat regularly, but mostly chicken or moderate portions.' },
                  { id: 'pescatarian', label: '🐟 Pescatarian', desc: 'Eat fish/seafood, dairy, and eggs, but no red meat or poultry.' },
                  { id: 'vegetarian', label: '🥚 Vegetarian', desc: 'Eat dairy and eggs, but no animal meat.' },
                  { id: 'vegan', label: '🌱 Plant-Based / Vegan', desc: 'Eat strictly plant-based food. No dairy, eggs, or meat.' }
                ].map(diet => (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() => updateField('diet', 'dietType', diet.id)}
                    style={{
                      padding: '16px',
                      borderRadius: 16,
                      border: `2px solid ${formData.diet.dietType === diet.id ? 'var(--color-accent)' : 'var(--border-color)'}`,
                      background: formData.diet.dietType === diet.id ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{diet.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{diet.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                Powering and heating our homes consumes massive amounts of electricity and fossil fuels.
              </p>

              <div>
                <label htmlFor="onboard-electricity-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  Average monthly electricity usage (kWh)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    id="onboard-electricity-slider"
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
                    value={formData.energy.electricity}
                    onChange={(e) => updateField('energy', 'electricity', Number(e.target.value))}
                  />
                  <span style={{ width: 80, fontSize: 16, fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>
                    {formData.energy.electricity} kWh
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Average households use between 200–500 kWh/month.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  What is your home's primary heating source?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {[
                    { id: 'gas', label: '🔥 Natural Gas' },
                    { id: 'electric', label: '⚡ Electric / Heat Pump' },
                    { id: 'oil', label: '🛢️ Heating Oil' },
                    { id: 'solar', label: '☀️ Solar / Renewable' }
                  ].map(source => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => updateField('energy', 'heatingSource', source.id)}
                      style={{
                        padding: '16px',
                        borderRadius: 14,
                        border: `2px solid ${formData.energy.heatingSource === source.id ? 'var(--color-accent)' : 'var(--border-color)'}`,
                        background: formData.energy.heatingSource === source.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        color: formData.energy.heatingSource === source.id ? 'var(--color-accent)' : 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                Every physical product bought has an embodied carbon footprint (manufacture and transport). Let's estimate your habits.
              </p>

              <div>
                <label htmlFor="onboard-purchases-slider" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  New physical products bought per month
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    id="onboard-purchases-slider"
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={formData.lifestyle.newPurchases}
                    onChange={(e) => updateField('lifestyle', 'newPurchases', Number(e.target.value))}
                  />
                  <span style={{ width: 80, fontSize: 16, fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>
                    {formData.lifestyle.newPurchases} items
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Includes clothing, electronics, books, toys, etc.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  Do you recycle regularly? (paper, plastic, metal, glass)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {[
                    { val: true, label: '♻️ Yes, I recycle' },
                    { val: false, label: '🗑️ No, I throw everything away' }
                  ].map(option => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => updateField('lifestyle', 'recycling', option.val)}
                      style={{
                        padding: '16px',
                        borderRadius: 14,
                        border: `2px solid ${formData.lifestyle.recycling === option.val ? 'var(--color-accent)' : 'var(--border-color)'}`,
                        background: formData.lifestyle.recycling === option.val ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        color: formData.lifestyle.recycling === option.val ? 'var(--color-accent)' : 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
          {step > 1 ? (
            <button className="btn-secondary" onClick={prevStep}>
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <div />
          )}

          <button className="btn-primary" onClick={nextStep}>
            {step === totalSteps ? (
              <>
                Complete Tracker <CheckCircle size={18} />
              </>
            ) : (
              <>
                Next Step <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
