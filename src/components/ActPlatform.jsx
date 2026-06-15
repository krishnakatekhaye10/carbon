import { useState } from 'react';
import { Vote, Trophy, ShoppingCart, Share2, Send, Heart, Leaf, X, Check } from 'lucide-react';

export default function ActPlatform({ addXp }) {
  const [actTab, setActTab] = useState('poll');

  // --- POLL VOTING STATE ---
  const [pollVotes, setPollVotes] = useState({ bike: 120, forest: 94, chargers: 44, recycling: 62 });
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState(null);

  // --- SOCIAL ACTION LOG STATE ---
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([
    { author: 'Sarah_K', action: 'Biked 8km to work today instead of driving. Saved about 1.8kg of CO₂!', likes: 12 },
    { author: 'EcoJohn', action: 'Installed 4 new LED bulbs in the kitchen. Energy bills already dropping!', likes: 7 }
  ]);

  // --- DONATION / GIVE BACK STATE ---
  const [ecoFundRsvped, setEcoFundRsvped] = useState(false);

  // --- CONTEST WORKABLE STATE ---
  const [activeSubmission, setActiveSubmission] = useState(null); // contest object or null
  const [submittedContests, setSubmittedContests] = useState([]); // array of contest ids
  const [mockPhotoName, setMockPhotoName] = useState('');
  const [plasticCheckbox, setPlasticCheckbox] = useState(false);

  const CONTESTS = [
    { id: 'garden', title: '📸 Urban Balcony Garden Showcase', xp: 500, activeUntil: 'June 30, 2026', desc: 'Submit a photo of your balcony or indoor plants. Top 3 voted galleries win!' },
    { id: 'plastic', title: '🗑️ Single-Use Plastic Boycott week', xp: 300, activeUntil: 'June 25, 2026', desc: 'Avoid plastic bottles, cups, and grocery bags for 7 days. Log your daily success.' }
  ];

  // Poll handler
  const handleVote = (option) => {
    if (!hasVoted) {
      setPollVotes(prev => ({
        ...prev,
        [option]: prev[option] + 1
      }));
      setHasVoted(true);
      setSelectedPollOption(option);
    }
  };

  const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  // Post handler
  const handleAddPost = () => {
    if (postText.trim()) {
      setPosts(prev => [
        {
          author: 'EcoWarrior_You',
          action: postText,
          likes: 0
        },
        ...prev
      ]);
      setPostText('');
    }
  };

  // Like post handler
  const handleLike = (index) => {
    setPosts(prev => prev.map((p, idx) => idx === index ? { ...p, likes: p.likes + 1 } : p));
  };

  // Contest submission handler
  const submitContestEntry = (e) => {
    e.preventDefault();
    if (activeSubmission) {
      if (activeSubmission.id === 'garden' && !mockPhotoName.trim()) return;
      if (activeSubmission.id === 'plastic' && !plasticCheckbox) return;

      // Add to completed list
      setSubmittedContests(prev => [...prev, activeSubmission.id]);
      
      // Award XP
      addXp(activeSubmission.xp);
      
      // Reset inputs & close modal
      alert(`Submission Accepted! You have successfully entered the ${activeSubmission.title} contest and earned +${activeSubmission.xp} XP!`);
      setActiveSubmission(null);
      setMockPhotoName('');
      setPlasticCheckbox(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="animate-fade-in">
      
      {/* Sub tabs navigation */}
      <div className="glass-card" style={{ padding: 8, display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[
          { id: 'poll', label: 'Voting & Contests', icon: Vote },
          { id: 'sustainable', label: 'Sustainable Buying & Give Back', icon: ShoppingCart },
          { id: 'share', label: 'Share Actions', icon: Share2 }
        ].map(t => {
          const Icon = t.icon;
          const isActive = actTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActTab(t.id)}
              className={`tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Pillars router */}
      <div>
        
        {/* VOTING AND CONTESTS */}
        {actTab === 'poll' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr md:1.2fr', gap: 24 }} className="dashboard-grid">
            
            {/* Poll Card */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)' }}>🗳️ Community Poll</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 20 }}>
                Help shape local climate priorities. Cast your vote.
              </p>

              <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>
                "What should be our city's main climate focus next month?"
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id: 'bike', label: '🚲 Expand Bicycle Lane Network' },
                  { id: 'forest', label: '🌳 Plant Pocket Micro-Forests' },
                  { id: 'chargers', label: '⚡ Install Public EV Charging Stations' },
                  { id: 'recycling', label: '♻️ Upgrade Municipal Sorting Facilities' }
                ].map(opt => {
                  const votes = pollVotes[opt.id];
                  const pct = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(0) : 0;
                  const votedThis = selectedPollOption === opt.id;

                  return (
                    <div key={opt.id} style={{ position: 'relative' }}>
                      <button
                        onClick={() => handleVote(opt.id)}
                        disabled={hasVoted}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: 14,
                          border: `1px solid ${votedThis ? 'var(--color-accent)' : 'var(--border-color)'}`,
                          background: votedThis ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: hasVoted ? 'default' : 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          position: 'relative',
                          zIndex: 1,
                          overflow: 'hidden',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{opt.label}</span>
                        {hasVoted && (
                          <span style={{ fontWeight: 800, color: votedThis ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                            {pct}% ({votes})
                          </span>
                        )}
                      </button>

                      {/* Vote background filling bar */}
                      {hasVoted && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: 'rgba(16, 185, 129, 0.04)',
                          borderRadius: 14,
                          zIndex: 0,
                          transition: 'width 0.6s ease'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contests Panel */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>🏆 Climate Contests</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Participate in green challenges, submit proof, and compete for XP!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {CONTESTS.map((contest) => {
                  const isSubmitted = submittedContests.includes(contest.id);
                  return (
                    <div key={contest.id} className="glass-card animate-scale-in" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: 15, color: 'var(--text-primary)' }}>{contest.title}</h4>
                        <span className="carbon-badge" style={{ backgroundColor: 'rgba(217, 119, 6, 0.12)', color: 'var(--color-amber)' }}>+{contest.xp} XP</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                        {contest.desc}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, borderTop: '1px solid var(--border-color)', paddingTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                        <span>Ends: {contest.activeUntil}</span>
                        <button
                          onClick={() => setActiveSubmission(contest)}
                          disabled={isSubmitted}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isSubmitted ? 'var(--color-accent)' : 'var(--color-accent)',
                            fontWeight: 700,
                            cursor: isSubmitted ? 'default' : 'pointer',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isSubmitted ? (
                            <>
                              <Check size={14} /> Entry Submitted
                            </>
                          ) : 'Submit Entry →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUSTAINABLE BUYING & GIVE BACK */}
        {actTab === 'sustainable' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr md:1.2fr', gap: 24 }} className="dashboard-grid">
            
            {/* Buying guide */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>🛒 Sustainable Products Guide</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Invest in household items that help permanently minimize emissions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { name: '🍂 Wooden Organic Compost Bin', savings: 'Reduces landfill methane by 60%', cost: '$35' },
                  { name: '🌡️ Smart Thermostat (ECO mode)', savings: 'Cuts HVAC energy by up to 15%', cost: '$120' },
                  { name: '🔌 Smart Power Strips (Auto-Off)', savings: 'Prevents standby phantom load', cost: '$18' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                    <div>
                      <h4 style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</h4>
                      <div style={{ fontSize: 11, color: 'var(--color-sage)', fontWeight: 600, marginTop: 2 }}>{item.savings}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Giving Back */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>💖 Give Back Initiatives</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Support global and community projects targeting reforestation and carbon sequestration.
              </p>

              <div className="glass-card" style={{ padding: 20, background: 'rgba(16, 185, 129, 0.04)' }}>
                <h4 style={{ fontSize: 15, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Leaf size={18} style={{ color: 'var(--color-accent)' }} /> Global Reforestation Alliance
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                  Every $1 donated funds the planting and tracking of one native tree in crucial areas like the Amazon Basin or Sahel Green Wall.
                </p>
                <div style={{ height: 1, background: 'var(--border-color)', margin: '14px 0' }} />
                <button
                  className="btn-primary"
                  onClick={() => setEcoFundRsvped(true)}
                  disabled={ecoFundRsvped}
                  style={{ width: '100%', fontSize: 12 }}
                >
                  {ecoFundRsvped ? 'Thanks for Supporting!' : 'Donate $5 Reforestation credits'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE POSITIVE ACTIONS */}
        {actTab === 'share' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>📢 Share Climate Actions</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Encourage the community by publishing your carbon-saving activities.
            </p>

            {/* Input card */}
            <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 12, background: 'var(--bg-tertiary)', marginBottom: 24 }}>
              <input
                type="text"
                className="glass-input"
                placeholder="What green action did you do today? (e.g. Biked 5km, skipped beef...)"
                style={{ flex: 1 }}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={handleAddPost}
                disabled={!postText.trim()}
                style={{ padding: 12, borderRadius: 12, opacity: postText.trim() ? 1 : 0.6 }}
              >
                <Send size={16} />
              </button>
            </div>

            {/* Shared feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {posts.map((post, idx) => (
                <div key={idx} className="glass-card animate-scale-in" style={{ padding: 16, display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }}>@{post.author}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{post.action}</p>
                  </div>
                  <button
                    onClick={() => handleLike(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-rose)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    <Heart size={14} fill="var(--color-rose)" /> {post.likes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* CONTEST SUBMISSION MODAL */}
      {activeSubmission && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 32, 22, 0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div className="glass-card animate-scale-in" style={{
            maxWidth: 440,
            width: '100%',
            background: 'var(--bg-secondary)',
            padding: 32,
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setActiveSubmission(null);
                setMockPhotoName('');
                setPlasticCheckbox(false);
              }}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-amber)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
              <Trophy size={14} /> Contest Submission
            </div>
            
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 10 }}>
              {activeSubmission.title}
            </h3>
            
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Provide proof for verification to claim **+{activeSubmission.xp} XP**!
            </p>

            <form onSubmit={submitContestEntry} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {activeSubmission.id === 'garden' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="contest-garden-input" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Type the name/description of your uploaded file
                  </label>
                  <input
                    id="contest-garden-input"
                    type="text"
                    required
                    className="glass-input"
                    placeholder="e.g. My_balcony_tomatoes_June2026.png"
                    value={mockPhotoName}
                    onChange={(e) => setMockPhotoName(e.target.value)}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    (Simulated photo upload. Enter any file name to submit)
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id="boycott-checkbox"
                    required
                    checked={plasticCheckbox}
                    onChange={(e) => setPlasticCheckbox(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                  />
                  <label htmlFor="boycott-checkbox" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                    I verify that I have boycotted plastic bottles, plastic cups, and grocery bags for 7 consecutive days.
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', background: 'var(--color-accent)', border: 'none', display: 'flex', gap: 6 }}
                disabled={activeSubmission.id === 'garden' ? !mockPhotoName.trim() : !plasticCheckbox}
              >
                Submit Entry <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
