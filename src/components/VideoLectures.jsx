import { useState, useCallback } from 'react';
import {
  PlayCircle, BookOpen, Clock, Star, CheckCircle2, ChevronRight,
  Flame, Filter, X, Award, StickyNote
} from 'lucide-react';

/** @type {Array<{id: string, youtubeId: string, title: string, instructor: string, duration: string, category: string, level: string, description: string, topics: string[], xpReward: number}>} */
const VIDEO_LIBRARY = [
  {
    id: 'v1',
    youtubeId: 'dcBXmj1nMTQ',
    title: 'Climate Change: What Happens If We Do Nothing?',
    instructor: 'TED-Ed',
    duration: '5 min',
    category: 'fundamentals',
    level: 'Beginner',
    description: 'An animated overview of what climate scientists predict if global warming continues unchecked — from sea level rise to extreme weather events.',
    topics: ['Sea Level Rise', 'Extreme Weather', 'Feedback Loops'],
    xpReward: 50
  },
  {
    id: 'v2',
    youtubeId: 'G4H1N_yXBiA',
    title: 'The Carbon Footprint Sham — Or Is It?',
    instructor: 'Kurzgesagt',
    duration: '8 min',
    category: 'carbon',
    level: 'Intermediate',
    description: 'Kurzgesagt breaks down who is really responsible for carbon emissions and how individuals and corporations both play critical roles.',
    topics: ['Carbon Emissions', 'Corporate Responsibility', 'Individual Impact'],
    xpReward: 75
  },
  {
    id: 'v3',
    youtubeId: '3CM_KkDuzGQ',
    title: 'Can 100% Renewable Energy Power the World?',
    instructor: 'TED-Ed',
    duration: '6 min',
    category: 'energy',
    level: 'Intermediate',
    description: 'A deep-dive into whether solar, wind, and hydro power can fully replace fossil fuels and what challenges remain to be solved.',
    topics: ['Renewables', 'Solar', 'Grid Storage', 'Wind Energy'],
    xpReward: 75
  },
  {
    id: 'v4',
    youtubeId: 'wbR-5mHI6bo',
    title: 'Sustainable Agriculture: Feeding 10 Billion People',
    instructor: 'Our World in Data',
    duration: '10 min',
    category: 'food',
    level: 'Advanced',
    description: 'How regenerative farming, reducing food waste, and shifting diets can sustainably feed the planet by 2050 while cutting emissions.',
    topics: ['Regenerative Farming', 'Food Waste', 'Dietary Shifts', 'Land Use'],
    xpReward: 100
  },
  {
    id: 'v5',
    youtubeId: 'SXxVNRFCBas',
    title: 'Water Crisis: Why We\'re Running Out',
    instructor: 'Vox',
    duration: '7 min',
    category: 'water',
    level: 'Beginner',
    description: 'Vox explains why freshwater is rapidly becoming the world\'s most scarce resource and the innovations being used to address it.',
    topics: ['Water Scarcity', 'Groundwater Depletion', 'Desalination'],
    xpReward: 50
  },
  {
    id: 'v6',
    youtubeId: 'ipVxxxqwBQw',
    title: 'The Circular Economy Explained',
    instructor: 'Ellen MacArthur Foundation',
    duration: '4 min',
    category: 'lifestyle',
    level: 'Beginner',
    description: 'An introduction to the circular economy model — design products to eliminate waste, keep materials in use, and regenerate natural systems.',
    topics: ['Zero Waste', 'Product Design', 'Material Loops'],
    xpReward: 50
  },
  {
    id: 'v7',
    youtubeId: 'EhAemz1v7dQ',
    title: 'Carbon Capture: The Technology That Could Save Us',
    instructor: 'Bloomberg QuickTake',
    duration: '11 min',
    category: 'carbon',
    level: 'Advanced',
    description: 'A look at direct air capture, bioenergy with carbon capture, and other emerging technologies that could reverse the damage already done.',
    topics: ['DACCS', 'BECCS', 'Negative Emissions', 'Geoengineering'],
    xpReward: 100
  },
  {
    id: 'v8',
    youtubeId: 'KNMihpSrFsQ',
    title: 'The Amazon Rainforest: Our Planet\'s Lungs Under Threat',
    instructor: 'National Geographic',
    duration: '9 min',
    category: 'fundamentals',
    level: 'Intermediate',
    description: 'An investigation into deforestation rates, the tipping point that scientists fear, and restoration projects fighting to save the Amazon.',
    topics: ['Deforestation', 'Biodiversity', 'Tipping Points', 'Reforestation'],
    xpReward: 75
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Lectures', emoji: '🎬' },
  { id: 'fundamentals', label: 'Fundamentals', emoji: '🌍' },
  { id: 'carbon', label: 'Carbon', emoji: '💨' },
  { id: 'energy', label: 'Energy', emoji: '⚡' },
  { id: 'food', label: 'Food & Agriculture', emoji: '🌾' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '♻️' }
];

const LEVEL_COLORS = {
  Beginner: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  Intermediate: { bg: 'rgba(251,191,36,0.12)', color: '#f59e0b' },
  Advanced: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' }
};

/**
 * VideoLectures component — displays a curated video library with
 * category filters, XP rewards on watch, and a notes panel.
 *
 * @param {{ addXp: (amount: number) => void }} props
 */
export default function VideoLectures({ addXp }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeVideo, setActiveVideo] = useState(null);
  const [watchedIds, setWatchedIds] = useState(/** @type {string[]} */ ([]));
  const [notes, setNotes] = useState(/** @type {Record<string,string>} */ ({}));
  const [showNotes, setShowNotes] = useState(false);
  const [levelFilter, setLevelFilter] = useState('all');

  /** Mark video as watched and award XP once */
  const handleWatchVideo = useCallback((video) => {
    setActiveVideo(video);
    setShowNotes(false);
    if (!watchedIds.includes(video.id)) {
      setWatchedIds(prev => [...prev, video.id]);
      addXp(video.xpReward);
    }
  }, [watchedIds, addXp]);

  const handleCloseVideo = useCallback(() => {
    setActiveVideo(null);
    setShowNotes(false);
  }, []);

  const handleNoteChange = useCallback((videoId, value) => {
    setNotes(prev => ({ ...prev, [videoId]: value }));
  }, []);

  const filteredVideos = VIDEO_LIBRARY.filter(v => {
    const categoryMatch = activeCategory === 'all' || v.category === activeCategory;
    const levelMatch = levelFilter === 'all' || v.level === levelFilter;
    return categoryMatch && levelMatch;
  });

  const totalXpAvailable = VIDEO_LIBRARY.reduce((s, v) => s + v.xpReward, 0);
  const earnedXp = VIDEO_LIBRARY.filter(v => watchedIds.includes(v.id)).reduce((s, v) => s + v.xpReward, 0);
  const progressPercent = Math.round((watchedIds.length / VIDEO_LIBRARY.length) * 100);

  return (
    <div style={{ display: 'grid', gap: 24 }} className="animate-fade-in">

      {/* Header Stats Bar */}
      <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 2 }}>📺 Video Lecture Library</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Watch curated climate science lectures and earn XP</p>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-accent)', fontFamily: "'Outfit', sans-serif" }}>
              {watchedIds.length}<span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/{VIDEO_LIBRARY.length}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Watched</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', fontFamily: "'Outfit', sans-serif" }}>
              {earnedXp}<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/{totalXpAvailable}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>XP Earned</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-sage)', fontFamily: "'Outfit', sans-serif" }}>{progressPercent}%</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', background: 'var(--bg-tertiary)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-mint), var(--color-accent))',
            borderRadius: 99,
            transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

      {/* Video Player Modal Overlay */}
      {activeVideo && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(12px)'
          }}
          onClick={handleCloseVideo}
        >
          <div
            style={{
              width: '100%', maxWidth: 900,
              background: 'var(--bg-secondary)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-color)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Video Header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, ...LEVEL_COLORS[activeVideo.level], padding: '3px 10px', borderRadius: 99 }}>
                  {activeVideo.level}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{activeVideo.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowNotes(n => !n)}
                  style={{
                    background: showNotes ? 'rgba(16,185,129,0.12)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: showNotes ? 'var(--color-accent)' : 'var(--text-secondary)',
                    borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600
                  }}
                >
                  <StickyNote size={14} /> Notes
                </button>
                <button
                  onClick={handleCloseVideo}
                  style={{
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', borderRadius: 10, padding: '6px 10px', cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video + Notes Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: showNotes ? '1fr 300px' : '1fr' }}>
              {/* YouTube Embed */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                <iframe
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Notes Panel */}
              {showNotes && (
                <div style={{ padding: 16, borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StickyNote size={14} color="var(--color-accent)" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>My Notes</span>
                  </div>
                  <textarea
                    placeholder={`Jot your key takeaways from "${activeVideo.title}"...`}
                    value={notes[activeVideo.id] || ''}
                    onChange={e => handleNoteChange(activeVideo.id, e.target.value)}
                    style={{
                      flex: 1,
                      minHeight: 200,
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 12,
                      padding: 12,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      lineHeight: 1.6,
                      resize: 'none',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
                    {(notes[activeVideo.id] || '').length} chars
                  </div>
                </div>
              )}
            </div>

            {/* Video Metadata Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <BookOpen size={13} /> {activeVideo.instructor}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={13} /> {activeVideo.duration}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
                <Star size={13} /> +{activeVideo.xpReward} XP
                {watchedIds.includes(activeVideo.id) && (
                  <span style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                    <CheckCircle2 size={14} /> Earned
                  </span>
                )}
              </div>
            </div>

            {/* Topics */}
            <div style={{ padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeVideo.topics.map(topic => (
                <span key={topic} style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: 'rgba(16,185,129,0.08)', color: 'var(--color-sage)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Category Filters */}
        <div className="glass-card" style={{ padding: 6, display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap', fontSize: 12 }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Level Filter */}
        <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="all" style={{ background: 'var(--bg-secondary)' }}>All Levels</option>
            <option value="Beginner" style={{ background: 'var(--bg-secondary)' }}>Beginner</option>
            <option value="Intermediate" style={{ background: 'var(--bg-secondary)' }}>Intermediate</option>
            <option value="Advanced" style={{ background: 'var(--bg-secondary)' }}>Advanced</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 14 }}>No videos match your filters. Try a different category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filteredVideos.map(video => {
            const isWatched = watchedIds.includes(video.id);
            const hasNotes = !!(notes[video.id] && notes[video.id].trim().length > 0);
            const levelStyle = LEVEL_COLORS[video.level];

            return (
              <div
                key={video.id}
                className="glass-card"
                style={{
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  outline: isWatched ? '2px solid rgba(16,185,129,0.35)' : '2px solid transparent'
                }}
                onClick={() => handleWatchVideo(video)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(16,185,129,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0a1a0a', overflow: 'hidden' }}>
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    loading="lazy"
                  />
                  {/* Play overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,20,10,0.4))',
                    transition: 'background 0.2s'
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'rgba(16,185,129,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(16,185,129,0.5)'
                    }}>
                      <PlayCircle size={28} color="#fff" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <span style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(0,0,0,0.75)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 6
                  }}>
                    {video.duration}
                  </span>
                  {/* Watched badge */}
                  {isWatched && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(16,185,129,0.9)', color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <CheckCircle2 size={11} /> Watched
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, ...levelStyle }}>
                      {video.level}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {hasNotes && (
                        <span title="You have notes for this video">
                          <StickyNote size={13} color="var(--color-accent)" />
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Flame size={12} /> +{video.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 }}>
                    {video.title}
                  </h4>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {video.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BookOpen size={11} /> {video.instructor}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, fontWeight: 700, color: 'var(--color-accent)'
                    }}>
                      Watch <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Achievement Banner */}
      {watchedIds.length === VIDEO_LIBRARY.length && (
        <div className="glass-card animate-scale-in" style={{
          padding: '24px 28px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,95,70,0.15))',
          border: '1px solid rgba(16,185,129,0.4)'
        }}>
          <Award size={40} color="var(--color-accent)" style={{ marginBottom: 10 }} />
          <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>🎉 Library Complete!</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            You've watched all {VIDEO_LIBRARY.length} lectures and earned <strong style={{ color: '#f59e0b' }}>{totalXpAvailable} XP</strong>. You're a certified Climate Scholar!
          </p>
        </div>
      )}
    </div>
  );
}
