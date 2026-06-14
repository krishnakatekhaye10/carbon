import { useState } from 'react';
import { Leaf, ArrowRight } from 'lucide-react';

const AVATAR_OPTIONS = [
  { char: '🌱', label: 'Seedling' },
  { char: '☀️', label: 'Solar Sun' },
  { char: '💧', label: 'Hydro Drop' },
  { char: '🌳', label: 'Forest Tree' }
];

export default function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌱');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onLogin({
        name: name.trim(),
        email: email.trim(),
        avatar: selectedAvatar
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--glass-border)'
      }}>
        {/* Logo and Welcome header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--color-mint), var(--color-accent))',
            color: 'var(--color-forest)',
            width: 48,
            height: 48,
            borderRadius: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: 16
          }}>
            <Leaf size={24} strokeWidth={2.5} />
          </span>
          <h2 style={{ fontSize: 26, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Welcome to Climatora</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Set up your climate profile to start tracking and learning.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="login-name" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Full Name
            </label>
            <input
              id="login-name"
              type="text"
              className="glass-input"
              placeholder="e.g. Elena Vance"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="login-email" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="glass-input"
              placeholder="e.g. elena@canopy.org"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Avatar Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Choose Your Eco Avatar
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {AVATAR_OPTIONS.map(opt => (
                <button
                  key={opt.char}
                  type="button"
                  onClick={() => setSelectedAvatar(opt.char)}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 14,
                    border: `2px solid ${selectedAvatar === opt.char ? 'var(--color-accent)' : 'var(--border-color)'}`,
                    background: selectedAvatar === opt.char ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                    fontSize: 24,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s'
                  }}
                  title={opt.label}
                >
                  <span>{opt.char}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: 14, marginTop: 10 }}
            disabled={!name.trim() || !email.trim()}
          >
            Enter Climatora <ArrowRight size={16} />
          </button>

        </form>
      </div>
    </div>
  );
}
