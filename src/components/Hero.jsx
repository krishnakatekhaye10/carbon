import { ArrowRight, Leaf, GraduationCap, Globe, Users } from 'lucide-react';

export default function Hero({ onNavigate }) {
  return (
    <div className="animate-fade-in hero-box" style={{ padding: '60px 16px 40px' }}>
      
      {/* Visual Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 99,
        background: 'rgba(16, 185, 129, 0.08)',
        color: 'var(--color-sage)',
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 20
      }}>
        <Leaf size={14} style={{ color: 'var(--color-accent)' }} /> Climatora Engagement Platform
      </div>

      {/* Main Slogan Title */}
      <h1 className="hero-title" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
        Making Climate Action a Part of <span style={{ color: 'var(--color-accent)' }}>Everyday Life</span>.
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle">
        Assess your environmental impact, learn core sustainability skills, stay informed on climate issues, and take part in community actions to drive a greener future.
      </p>

      {/* Hero Call to Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 48
      }}>
        <button 
          onClick={() => onNavigate('track')}
          className="btn-primary" 
          style={{ padding: '16px 32px', fontSize: '1rem' }}
        >
          Start Tracking Impact <ArrowRight size={18} />
        </button>
        <button 
          onClick={() => onNavigate('buzz')}
          className="btn-secondary" 
          style={{ padding: '16px 32px', fontSize: '1rem' }}
        >
          Check Climate Buzz
        </button>
      </div>

      {/* Quick Statistics Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 20,
        textAlign: 'left',
        marginTop: 20
      }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: 'var(--color-accent)' }}><Globe size={24} /></span>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>5+</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Tracking Index Tools</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: 'var(--color-accent)' }}><GraduationCap size={24} /></span>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>10+</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Academy Skills Classes</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: 'var(--color-accent)' }}><Users size={24} /></span>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>24/7</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Community Voting & Polls</div>
        </div>
      </div>

    </div>
  );
}
