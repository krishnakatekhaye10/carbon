/**
 * @fileoverview ClimateBuzz component for Climatora
 * Provides an interactive portal containing:
 * 1. Climate Watch: News feed with reading verification quizzes (+50 XP)
 * 2. Climate Talk: Fully functional community forum with threads, searches, replies (+15/+30 XP)
 * 3. Events Calendar: Event registrations linked to XP rewards (+50 XP)
 * 4. Climate Blog: Article reader overlay linked to completion rewards (+50 XP)
 */

import { useState, useMemo } from 'react';
import { 
  Newspaper, 
  Users2, 
  Calendar, 
  Newspaper as BlogIcon, 
  ExternalLink, 
  X, 
  BookOpen, 
  Send, 
  Plus, 
  Search, 
  CheckCircle2, 
  Award,
  ChevronRight
} from 'lucide-react';
import { useToast } from './ToastContext';

// ---------------------------------------------------------------------------
// Constants & Static Data
// ---------------------------------------------------------------------------

const BLOG_ARTICLES = [
  {
    id: 'fashion',
    title: 'The Embodied Carbon of Fast Fashion',
    readTime: '5 min read',
    excerpt: 'Buying single-use fashion clothing generates massive industrial emissions. Let\'s explore the benefits of repair & thrifting.',
    content: `In the age of instant-delivery and weekly trend cycles, fast fashion has quietly evolved into one of the planet's most carbon-intensive industries. The fashion sector accounts for roughly 8% to 10% of global carbon emissions—more than all international flights and maritime shipping combined.

Every polyester garment is derived from petroleum/fossil fuels, requiring heavy energy inputs to manufacture. Then there is the massive global supply chain: raw cotton grown in India might be shipped to Bangladesh to be spun, sent to China to be dyed, stitched in Vietnam, and finally flown to Europe or America to be worn once and discarded. This linear model is highly destructive.

### How to combat it:
1. **Adopt a thrift-first mindset**: Choosing vintage or second-hand items prevents new production footprints entirely.
2. **Quality over Quantity**: Buy durable garments made of organic cotton, wool, or linen, which biodegrade safely and last longer.
3. **Mending and Repurposing**: Sewing buttons, patching jeans, or dyeing faded shirts gives clothes a second life, shaving kilograms off your annual lifestyle carbon count.`
  },
  {
    id: 'soil',
    title: 'Restoring Soil Health: The Silent Carbon Sink',
    readTime: '7 min read',
    excerpt: 'Healthy soils biological capture has the capacity to hold up to 3 times more carbon than the atmosphere. Learn how home compost helps.',
    content: `When we talk about carbon sequestration, we often look up at the tree canopy. But the most powerful, active, and immediate carbon sink on earth lies directly beneath our feet: the soil.

Healthy soils contain a complex biological network of mycorrhizal fungi, bacteria, and decayed organic matter. In fact, soil microbes store up to 3 times more carbon than is present in the atmosphere, and double the amount stored in all plants and trees combined. However, intensive industrial agriculture—reliant on heavy tilling, synthetic fertilizers, and pesticides—strips soils of their biology, turning carbon-rich ground into dry, depleted dirt that releases carbon instead of locking it away.

### The role of composting:
1. **Diverting waste**: Throwing organic scraps into standard trash sends them to landfills, where they rot anaerobically, releasing methane (CH₄). Composting keeps organic matter aerobic, eliminating methane.
2. **Rebuilding humus**: Applying finished compost to your garden returns nutrients, rebuilds soil structure, and cultivates mycorrhizal networks that naturally drag carbon out of the atmosphere and deposit it permanently in the earth.`
  }
];

const NEWS_FEED = [
  {
    id: 'news1',
    date: 'June 12, 2026',
    title: 'Solar Innovation Cuts Production Cost by 30%',
    source: 'GreenTech Review',
    summary: 'Scientists have perfected a perovskite coating method that boosts solar efficiency to 28% while slashing panel production carbon emissions.',
    content: 'Researchers at the GreenTech Institute have achieved a breakthrough in perovskite-silicon tandem solar cells, pushing commercial cell efficiencies up to 28.5%. Crucially, the production process utilizes a low-temperature chemical vapor deposition technique that reduces energy consumption by 30% and carbon emissions by 25% compared to conventional crystalline silicon manufacturing. This could lead to cheaper, cleaner solar panels globally.',
    quiz: {
      question: 'By how much does the new perovskite-silicon tandem cell manufacturing process reduce production carbon emissions?',
      options: ['10%', '25%', '50%', '75%'],
      correct: '25%'
    }
  },
  {
    id: 'news2',
    date: 'June 09, 2026',
    title: 'Global Wind Power Hits All-Time High Milestone',
    source: 'Climate Policy Inst.',
    summary: 'Offshore installations in the North Sea have generated record-breaking Gigawatts, lowering regional reliance on natural gas reserves by 14% this month.',
    content: 'Offshore wind installations in the North Sea region have reached an all-time high energy output this month, generating a combined capacity of 24 Gigawatts. According to the Climate Policy Institute, this record-breaking output reduced European reliance on natural gas reserves by 14% this month, accelerating regional progress towards net-zero goals.',
    quiz: {
      question: 'By how much did the offshore wind output reduce European reliance on natural gas reserves this month?',
      options: ['5%', '14%', '22%', '40%'],
      correct: '14%'
    }
  },
  {
    id: 'news3',
    date: 'June 05, 2026',
    title: 'New Cities Accord Sets Ambitious Green Zone Regulations',
    source: 'Urban Eco News',
    summary: 'Over 40 metropolitan councils have signed the Urban Canopy Treaty, pledging to cover at least 30% of concrete areas with micro-forest zones by 2030.',
    content: 'Over 40 major metropolitan councils worldwide have signed the Urban Canopy Treaty. The accord sets a binding target to cover at least 30% of concrete and asphalt urban areas with micro-forest zones and green roofs by the year 2030. These native vegetation corridors are designed to mitigate urban heat island effects, improve local biodiversity, and absorb atmospheric carbon dioxide.',
    quiz: {
      question: 'What percentage of concrete/asphalt urban areas must be covered with green canopy by 2030 under the accord?',
      options: ['15%', '30%', '45%', '60%'],
      correct: '30%'
    }
  }
];

const INITIAL_THREADS = [
  {
    id: 1,
    topic: 'Green Energy choices for apartment renters?',
    author: 'Alex_Green',
    date: 'Active 2h ago',
    replies: [
      { author: 'EcoRaj', text: 'If your building allows it, look into community solar projects! You subscribe to a farm and get credits on your utility bill.', date: '2h ago' },
      { author: 'CleanAirKira', text: 'Also check if your utility provider offers a "Green Power Plan" option. Most let you opt-in to 100% wind/solar for a few extra dollars a month.', date: '1h ago' },
      { author: 'Alex_Green', text: 'Wow, I did not know community solar was an option here. I will call my provider tomorrow!', date: '30m ago' }
    ]
  },
  {
    id: 2,
    topic: 'How to transition to zero food waste on a budget',
    author: 'Sustain_Sarah',
    date: 'Active 5h ago',
    replies: [
      { author: 'PlantEater77', text: 'Plan your meals around ingredients that are about to go bad. Also, freeze everything you can—ripe bananas make amazing smoothies later!', date: '4h ago' },
      { author: 'ZeroWastePro', text: 'Buy dry goods in bulk. It cuts packaging waste and is way cheaper in the long run.', date: '3h ago' }
    ]
  },
  {
    id: 3,
    topic: 'Are home heat pumps worth it in temperate climates?',
    author: 'HeatPumpSteve',
    date: 'Active 1d ago',
    replies: [
      { author: 'SolarSam', text: 'Absolutely! Heat pumps are extremely efficient in temperate zones because they transfer heat rather than generate it. Combined with solar panels, they cost almost nothing to run.', date: '18h ago' },
      { author: 'ReforesterMike', text: 'Agreed. Mine has cut my winter heating bill by 45%. Make sure your home insulation is decent first though.', date: '12h ago' }
    ]
  }
];

// ---------------------------------------------------------------------------
// Component Implementation
// ---------------------------------------------------------------------------

/**
 * ClimateBuzz - interactive portal displaying news, discussions, events, and blogs
 * @param {object} props
 * @param {function} props.addXp - Callback to award XP
 * @param {object|null} props.user - Logged-in user profile
 */
export default function ClimateBuzz({ addXp, user }) {
  const { addToast } = useToast();

  const [buzzSubTab, setBuzzSubTab] = useState('watch');
  
  // Interactive Event Registrations
  const [registeredEvents, setRegisteredEvents] = useState([]);
  
  // Blog Modal States
  const [activeBlog, setActiveBlog] = useState(null);
  const [readBlogs, setReadBlogs] = useState([]);

  // News Modal States
  const [activeNews, setActiveNews] = useState(null);
  const [solvedNewsQuizzes, setSolvedNewsQuizzes] = useState([]);
  const [selectedNewsOption, setSelectedNewsOption] = useState('');

  // Forum/Discussion Thread States
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [replyText, setReplyText] = useState('');

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  /**
   * Registers/unregisters the user for a climate community event
   * @param {string} title - The event title
   */
  const toggleRegisterEvent = (title) => {
    if (registeredEvents.includes(title)) {
      setRegisteredEvents(prev => prev.filter(t => t !== title));
      addToast(`Cancelled registration for "${title}"`, 'info');
    } else {
      setRegisteredEvents(prev => [...prev, title]);
      if (addXp) addXp(50);
      addToast(`Successfully registered for "${title}"! +50 XP`, 'success');
    }
  };

  /**
   * Finishes reading a blog article and awards completion XP
   * @param {string} blogId - The blog identifier
   */
  const handleFinishBlog = (blogId) => {
    if (!readBlogs.includes(blogId)) {
      setReadBlogs(prev => [...prev, blogId]);
      if (addXp) addXp(50);
      addToast('Finished article! Earned +50 XP 📚', 'success');
    }
    setActiveBlog(null);
  };

  /**
   * Handles submission of news quiz answer
   * @param {object} newsItem - The news article object containing the quiz
   */
  const handleQuizSubmit = (newsItem) => {
    if (!selectedNewsOption) {
      addToast('Please select an option first!', 'warning');
      return;
    }

    if (selectedNewsOption === newsItem.quiz.correct) {
      setSolvedNewsQuizzes(prev => [...prev, newsItem.id]);
      if (addXp) addXp(50);
      addToast('Correct Answer! +50 XP earned ☀️', 'success');
    } else {
      addToast('Incorrect answer. Try reading the details again!', 'error');
    }
    setSelectedNewsOption('');
  };

  /**
   * Posts a new discussion topic thread in the forum
   */
  const handleCreateThread = () => {
    if (!newTopicTitle.trim()) {
      addToast('Thread title cannot be empty!', 'warning');
      return;
    }

    const newThread = {
      id: threads.length + 1,
      topic: newTopicTitle.trim(),
      author: user?.name ?? 'Anonymous',
      date: 'Active just now',
      replies: []
    };

    setThreads(prev => [newThread, ...prev]);
    setNewTopicTitle('');
    setIsCreatingThread(false);
    if (addXp) addXp(30);
    addToast('New discussion thread created! +30 XP 💬', 'success');
  };

  /**
   * Posts a reply in the currently opened thread
   */
  const handlePostReply = () => {
    if (!replyText.trim()) {
      addToast('Reply content cannot be empty!', 'warning');
      return;
    }

    const newReply = {
      author: user?.name ?? 'Anonymous',
      text: replyText.trim(),
      date: 'Just now'
    };

    setThreads(prev => prev.map(t => {
      if (t.id === selectedThread.id) {
        const updated = {
          ...t,
          replies: [...t.replies, newReply],
          date: 'Active just now'
        };
        // Update currently viewed thread
        setSelectedThread(updated);
        return updated;
      }
      return t;
    }));

    setReplyText('');
    if (addXp) addXp(15);
    addToast('Reply posted! +15 XP ⚡', 'success');
  };

  // Filter threads based on search bar query
  const filteredThreads = useMemo(() => {
    return threads.filter(t => t.topic.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [threads, searchQuery]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="animate-fade-in">
      
      {/* Sub tabs */}
      <div className="glass-card" style={{ padding: 8, display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[
          { id: 'watch', label: 'Climate Watch', icon: Newspaper },
          { id: 'champions', label: 'Climate Talk', icon: Users2 },
          { id: 'events', label: 'Events Calendar', icon: Calendar },
          { id: 'blog', label: 'Climate Blog', icon: BlogIcon }
        ].map(b => {
          const Icon = b.icon;
          const isActive = buzzSubTab === b.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                setBuzzSubTab(b.id);
                setSelectedThread(null); // Reset thread detail view when switching tabs
              }}
              className={`tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} /> {b.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels */}
      <div>
        
        {/* CLIMATE WATCH NEWS FEED */}
        {buzzSubTab === 'watch' && (
          <div className="glass-card animate-fade-in" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 12px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)' }}>📰 Climate Watch</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Chronological updates on climate research, policy shifts, and green technology breakthroughs.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {NEWS_FEED.map((news) => (
                <div 
                  key={news.id} 
                  className="buzz-card"
                  onClick={() => {
                    setActiveNews(news);
                    setSelectedNewsOption('');
                  }}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <div style={{ minWidth: 100, textAlign: 'left' }}>
                    <div className="buzz-date">{news.date}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{news.source}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 15, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {news.title}
                      {solvedNewsQuizzes.includes(news.id) ? (
                        <CheckCircle2 size={14} color="#10b981" />
                      ) : (
                        <ExternalLink size={12} style={{ color: 'var(--color-accent)' }} />
                      )}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                      {news.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIMATE TALK FORUMS */}
        {buzzSubTab === 'champions' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            {!selectedThread ? (
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 20, color: 'var(--text-primary)' }}>💬 Climate Talk Forum</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      Join recent environmental discussions and exchange carbon reduction tips.
                    </p>
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => setIsCreatingThread(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px' }}
                  >
                    <Plus size={16} /> New Topic
                  </button>
                </div>

                {/* Create Topic Modal Form */}
                {isCreatingThread && (
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>Start a New Discussion</h4>
                      <button 
                        onClick={() => setIsCreatingThread(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <input 
                      type="text"
                      className="glass-input"
                      placeholder="What is your discussion topic? (e.g. Tips on solar installations)"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      style={{ fontSize: 13 }}
                    />
                    <button 
                      className="btn-primary"
                      onClick={handleCreateThread}
                      style={{ alignSelf: 'flex-end', fontSize: 12, padding: '6px 14px' }}
                    >
                      Post Thread (+30 XP)
                    </button>
                  </div>
                )}

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
                  <input 
                    type="text"
                    className="glass-input"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 40, fontSize: 13 }}
                  />
                </div>

                {/* Thread Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredThreads.length > 0 ? (
                    filteredThreads.map((thread) => (
                      <div 
                        key={thread.id} 
                        onClick={() => setSelectedThread(thread)}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '16px 20px', 
                          background: 'var(--bg-tertiary)', 
                          borderRadius: 16,
                          cursor: 'pointer',
                          border: '1px solid transparent',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
                      >
                        <div>
                          <h4 style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{thread.topic}</h4>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                            Started by @{thread.author} • {thread.date}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="carbon-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--color-accent)', border: '1px solid var(--border-color)' }}>
                            {thread.replies.length} Replies
                          </span>
                          <ChevronRight size={16} color="var(--text-muted)" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 13 }}>
                      No discussions found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Thread Detail View */
              <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
                {/* Back Link */}
                <button 
                  onClick={() => setSelectedThread(null)}
                  style={{ 
                    background: 'none', border: 'none', color: 'var(--color-accent)', 
                    cursor: 'pointer', fontSize: 12, fontWeight: 700, 
                    display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0
                  }}
                >
                  ← Back to Forums
                </button>

                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.4 }}>{selectedThread.topic}</h3>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Opened by <strong style={{ color: 'var(--text-primary)' }}>@{selectedThread.author}</strong>
                  </div>
                </div>

                {/* Comment History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                  {selectedThread.replies.length > 0 ? (
                    selectedThread.replies.map((reply, index) => (
                      <div key={index} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>@{reply.author}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{reply.date}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{reply.text}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: 12 }}>
                      No replies yet. Be the first to start the conversation!
                    </div>
                  )}
                </div>

                {/* Add Reply Input */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input 
                    type="text"
                    className="glass-input"
                    placeholder="Write a helpful response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ fontSize: 13 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(); }}
                  />
                  <button 
                    onClick={handlePostReply}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'var(--color-accent)', border: 'none', color: '#fff',
                      display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EVENTS CALENDAR */}
        {buzzSubTab === 'events' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>📅 Climate Events Calendar</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Register and coordinate for virtual summits, environmental cleanups, and local workshops.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { title: 'Global Cities Climate Summit 2026', type: 'Virtual Webinar', date: 'July 05, 2026', desc: 'Join international panels discussing urban canopy programs and green SME tariffs.' },
                { title: 'Local Park Reforestation Drive', type: 'Community Meetup', date: 'June 20, 2026', desc: 'Assemble at the municipal nursery to plant 150 local saplings in the urban valley.' }
              ].map((ev, idx) => {
                const isRegistered = registeredEvents.includes(ev.title);
                return (
                  <div key={idx} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 210 }}>
                    <div>
                      <span className="carbon-badge" style={{ backgroundColor: ev.type === 'Virtual Webinar' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: ev.type === 'Virtual Webinar' ? '#3b82f6' : 'var(--color-accent)', marginBottom: 10 }}>
                        {ev.type}
                      </span>
                      <h4 style={{ fontSize: 15, color: 'var(--text-primary)' }}>{ev.title}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>{ev.desc}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Date: {ev.date}</span>
                      <button
                        onClick={() => toggleRegisterEvent(ev.title)}
                        style={{
                          background: isRegistered ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-accent)',
                          color: isRegistered ? 'var(--color-accent)' : '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isRegistered ? '✓ Registered' : 'Register →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CLIMATE BLOG */}
        {buzzSubTab === 'blog' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>✍️ Climate Action Blog</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Stories and insights regarding sustainable lifestyles and community achievements.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {BLOG_ARTICLES.map((blog) => {
                const isRead = readBlogs.includes(blog.id);
                return (
                  <div key={blog.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 210 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <h4 style={{ fontSize: 15, color: 'var(--text-primary)', flex: 1 }}>{blog.title}</h4>
                        {isRead && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Read</span>}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                        {blog.excerpt}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{blog.readTime}</span>
                      <button
                        onClick={() => setActiveBlog(blog)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-accent)',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Read Article →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* CLIMATE WATCH: DETAILED NEWS MODAL WITH COMPREHENSION QUIZ */}
      {activeNews && (
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
            maxWidth: 600,
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            padding: 32,
            position: 'relative'
          }}>
            <button
              onClick={() => setActiveNews(null)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-accent)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
              <Newspaper size={14} /> Climate Watch Report
            </div>
            
            <h3 style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.3 }}>
              {activeNews.title}
            </h3>
            
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              {activeNews.date} • Source: {activeNews.source}
            </div>

            <p style={{ 
              fontSize: 14, 
              color: 'var(--text-secondary)', 
              lineHeight: 1.7, 
              borderTop: '1px solid var(--border-color)',
              paddingTop: 20,
              marginBottom: 24
            }}>
              {activeNews.content}
            </p>

            {/* Comprehension Quiz Section */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="var(--color-accent)" />
                <h4 style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>Reading Verification Quiz (+50 XP)</h4>
              </div>

              {solvedNewsQuizzes.includes(activeNews.id) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> Verification complete! You earned 50 XP.
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {activeNews.quiz.question}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeNews.quiz.options.map(option => (
                      <label 
                        key={option} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 10, 
                          padding: '10px 14px', 
                          background: 'var(--bg-secondary)', 
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          border: selectedNewsOption === option ? '1px solid var(--color-accent)' : '1px solid transparent',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`quiz-${activeNews.id}`}
                          value={option}
                          checked={selectedNewsOption === option}
                          onChange={(e) => setSelectedNewsOption(e.target.value)}
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>

                  <button 
                    className="btn-primary"
                    onClick={() => handleQuizSubmit(activeNews)}
                    style={{ fontSize: 12, padding: '8px 16px', alignSelf: 'flex-start' }}
                  >
                    Submit Answer
                  </button>
                </>
              )}
            </div>

            <button 
              className="btn-primary" 
              onClick={() => setActiveNews(null)}
              style={{ marginTop: 24, width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* FULL ARTICLE MODAL OVERLAY */}
      {activeBlog && (
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
            maxWidth: 600,
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            padding: 32,
            position: 'relative'
          }}>
            <button
              onClick={() => setActiveBlog(null)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-accent)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
              <BookOpen size={14} /> Climatora Blog Article
            </div>
            
            <h3 style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.3 }}>
              {activeBlog.title}
            </h3>
            
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              {activeBlog.readTime} • Published by Climatora Editorial
            </div>

            <div style={{ 
              fontSize: 14, 
              color: 'var(--text-secondary)', 
              lineHeight: 1.7, 
              whiteSpace: 'pre-line',
              borderTop: '1px solid var(--border-color)',
              paddingTop: 20
            }}>
              {activeBlog.content}
            </div>

            <button 
              className="btn-primary" 
              onClick={() => handleFinishBlog(activeBlog.id)}
              style={{ marginTop: 28, width: '100%' }}
            >
              Finish Reading
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
