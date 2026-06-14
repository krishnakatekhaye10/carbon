import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Search, 
  Calendar, 
  Check, 
  ArrowRight, 
  PlayCircle,
  Vote,
  Newspaper,
  Landmark,
  FileText,
  CheckCircle2,
  Award,
  X,
  Compass,
  Info
} from 'lucide-react';
import VideoLectures from './VideoLectures';
import { useToast } from './ToastContext';

// ---------------------------------------------------------------------------
// Constants & Static Data
// ---------------------------------------------------------------------------

const GLOSSARY_TERMS = [
  { term: 'Albedo Effect', def: 'The fraction of solar energy reflected from the Earth back into space. Light surfaces like ice sheets have high albedo, while oceans have low albedo.' },
  { term: 'Carbon Sequestration', def: 'The process of capturing and storing atmospheric carbon dioxide, either biologically (by trees and soil) or technologically (carbon capture plants).' },
  { term: 'Circular Economy', def: 'An economic model focused on minimizing waste by making products durable, repairing, reusing, and recycling everything.' },
  { term: 'Greenhouse Gas (GHG)', def: 'Gases in the atmosphere (like CO₂, methane, water vapor) that trap heat, keeping the Earth warmer than it would otherwise be.' },
  { term: 'Net Zero', def: 'Achieving a balance between the greenhouse gases put into the atmosphere and those taken out, resulting in no net increase.' },
  { term: 'Anthropogenic', def: 'Environmental pollution and greenhouse gas emissions originating from human activity (e.g. burning coal, deforestation).' },
  { term: 'IPCC', def: 'The Intergovernmental Panel on Climate Change, a United Nations body that compiles scientific research regarding human-induced climate change.' }
];

const ACADEMY_CLASSES = [
  {
    id: 'energy',
    title: 'Energy Conservation 101',
    desc: 'Master the basics of household energy efficiency and grid reliance.',
    questions: [
      { q: "Which appliance consumes the most energy in an average home?", opts: ["Refrigeration", "Space Heating & Cooling", "Lighting"], correct: 1 },
      { q: "How much heating energy is saved by lowering the thermostat 1°C?", opts: ["Up to 8%", "Around 2%", "Over 20%"], correct: 0 }
    ]
  },
  {
    id: 'food',
    title: 'Sustainable Agriculture & Food',
    desc: 'Understand the hidden greenhouse gas costs of what we consume.',
    questions: [
      { q: "Which food type has the highest carbon emissions per kilogram?", opts: ["Beef & Lamb", "Cheese & Dairy", "Poultry"], correct: 0 },
      { q: "What percentage of global greenhouse gases come from food waste?", opts: ["1-2%", "8-10%", "Around 25%"], correct: 1 }
    ]
  }
];

const NEWS_ARTICLES = [
  {
    id: 'cop31',
    title: 'COP31 Treaty Sets Mandate for Low-Carbon Steel & Cement',
    category: 'policy',
    readTime: '4 min read',
    emoji: '⚖️',
    excerpt: 'Over 120 nations signed the COP31 infrastructure pact, requiring new state facilities to use green materials starting in 2028.',
    content: `In a historic session at the COP31 Climate Summit, negotiators from 124 countries have signed the Green Construction Covenant. Starting in January 2028, all new state-funded buildings, highways, bridges, and municipal infrastructure must adhere to a strict carbon limit, effectively mandating the use of low-carbon cement and steel.

Cement manufacturing alone contributes 8% of global CO₂ emissions, while steel accounts for roughly 7%. By targeting public procurement, which represents 30% of global building sector spending, governments aim to force the construction industry to commercialize green hydrogen steelmaking and carbon-capture kilns. Projections show this procurement leverage will save 1.2 Gigatonnes of carbon emissions annually by 2035.`,
    quiz: {
      question: 'Which sector of spending is targeted by governments under the COP31 Green Construction Covenant to force industry adoption?',
      options: ['Residential home building', 'Public procurement (representing 30% of sector spending)', 'Private industrial developments', 'Agricultural warehousing'],
      correct: 1
    }
  },
  {
    id: 'battery',
    title: 'Solid-State Battery Breakthrough Enters Production Phase',
    category: 'innovation',
    readTime: '3 min read',
    emoji: '🔋',
    excerpt: 'Commercial solid-state cells double the energy density of current batteries, enabling 1,000 km EV ranges and cutting production footprints by 24%.',
    content: `A research and manufacturing consortium has officially begun production of the first automotive-grade solid-state lithium-metal batteries. By replacing volatile liquid electrolytes with a solid ceramic separator, the batteries achieve an energy density of 480 Wh/kg—nearly double that of conventional lithium-ion cells.

For passenger vehicles, this translates to driving ranges exceeding 1,000 kilometers on a single charge. More importantly from a lifecycle standpoint, the solid-state manufacturing process uses a solvent-free dry coating technique, slashing the energy required for battery fabrication. Lifecycle assessments report a 24% lower carbon footprint from raw extraction through assembly compared to current EV battery cells.`,
    quiz: {
      question: 'What is the primary factor that reduces the manufacturing carbon footprint of the new solid-state battery cells?',
      options: ['Using recycled lead plates', 'A solvent-free dry coating technique that reduces fabrication energy', 'Eliminating mining requirements entirely', 'A water-cooled assembly line run on coal'],
      correct: 1
    }
  },
  {
    id: 'mangroves',
    title: 'Southeast Asia Mangrove Drive Restores Blue Carbon Sinks',
    category: 'nature',
    readTime: '5 min read',
    emoji: '🌳',
    excerpt: 'Replanting 50,000 hectares of coastal mangroves creates protective storm barriers and sequesters up to 10 times more carbon than forests.',
    content: `Coastal ecosystems are the unsung champions of planetary cooling. A regional coalition has successfully restored 50,000 hectares of degraded mangrove forests across Southeast Asia. Mangroves act as "blue carbon" vaults, capturing atmospheric carbon and locking it deep in submerged sediment where it can remain stable for centuries.

Per hectare, a healthy mangrove forest can sequester up to 10 times more carbon dioxide than a standard tropical upland rainforest. Furthermore, these restored ecosystems serve as critical biological nurseries for marine life and create resilient, natural buffers against intensifying storm surges and coastal erosion caused by rising sea levels. Over the next decade, the project is scheduled to sequester 8 million tonnes of CO₂.`,
    quiz: {
      question: 'How much more carbon can mangrove coastal systems sequester per hectare compared to upland rainforests?',
      options: ['Twice as much', 'Up to 5 times more', 'Up to 10 times more', 'More than 50 times more'],
      correct: 2
    }
  },
  {
    id: 'hydrogen',
    title: 'EU Launches Hydrogen Heavy-Freight Refueling Corridors',
    category: 'innovation',
    readTime: '4 min read',
    emoji: '🚛',
    excerpt: 'New highway refuel networks support green hydrogen produced from offshore wind, providing zero-carbon heavy logistics.',
    content: `The European Commission has officially opened the first leg of its Trans-European Transport Network (TEN-T) hydrogen corridors. While electric batteries are highly effective for passenger vehicles, heavy-duty shipping trucks require excessive battery weight, which limits cargo capacities.

To resolve this bottleneck, the new refuel corridors supply pressurized green hydrogen produced via water electrolysis powered by offshore wind farms. These heavy-duty trucks can refuel in less than 15 minutes, achieving ranges of 800 km and releasing nothing but pure water vapor. By replacing traditional diesel shipping logistics, these corridors represent a critical step toward zero-emission freight transit.`,
    quiz: {
      question: 'Why are hydrogen refueling corridors being prioritized for long-haul freight over standard battery-electric systems?',
      options: ['Hydrogen is cheaper than home grid electricity', 'Standard batteries are too heavy for cargo trucks and reduce carrying capacity', 'Hydrogen trucks are quieter than electric motors', 'Electric trucks cannot drive in cold temperatures'],
      correct: 1
    }
  }
];

export default function Education({ addXp }) {
  const { addToast } = useToast();
  const [eduTab, setEduTab] = useState('academy');
  
  // Glossary search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Workshop RSVP state
  const [rsvpedList, setRsvpedList] = useState([]);
  
  // Academy Quiz States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizPassedList, setQuizPassedList] = useState([]);

  // Government Operations Interactive States
  const [policyMandates, setPolicyMandates] = useState({
    fleet: false,
    buildings: false,
    procurement: false,
    grid: false
  });

  // News States
  const [solvedNewsQuizzes, setSolvedNewsQuizzes] = useState([]);
  const [selectedNewsOption, setSelectedNewsOption] = useState(null);
  const [activeNewsArticle, setActiveNewsArticle] = useState(null);
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('all');

  // Glossary filter
  const filteredTerms = GLOSSARY_TERMS.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.def.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Workshop handler
  const handleRsvp = (workshopId) => {
    if (!rsvpedList.includes(workshopId)) {
      setRsvpedList(prev => [...prev, workshopId]);
      if (addXp) addXp(30);
      addToast("RSVP Confirmed! We've sent a calendar invite to your profile email. +30 XP 📅", 'success');
    }
  };

  // Quiz handler
  const handleQuizAnswer = () => {
    const quiz = ACADEMY_CLASSES.find(c => c.id === activeQuiz);
    if (selectedOpt === quiz.questions[currentQuestion].correct) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOpt(null);
    } else {
      setQuizFinished(true);
      // Give XP award if passed (answered all correctly)
      const isPerfect = selectedOpt === quiz.questions[currentQuestion].correct ? (quizScore + 1 === quiz.questions.length) : (quizScore === quiz.questions.length);
      if (isPerfect && !quizPassedList.includes(activeQuiz)) {
        setQuizPassedList(prev => [...prev, activeQuiz]);
        addXp(100); // Give +100 XP!
      }
    }
  };

  const startQuiz = (id) => {
    setActiveQuiz(id);
    setCurrentQuestion(0);
    setSelectedOpt(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // Policy calculation helper for Government Operations
  const governmentEmissionsScore = useMemo(() => {
    let baseEmissions = 50.0; // Million Tonnes CO2e
    let reduction = 0;
    if (policyMandates.fleet) reduction += 15; // Fleet Electrification: 15% reduction
    if (policyMandates.buildings) reduction += 25; // Building Retrofits: 25% reduction
    if (policyMandates.procurement) reduction += 30; // Green Procurement: 30% reduction
    if (policyMandates.grid) reduction += 20; // 100% Renewable Grid: 20% reduction
    
    const saved = (baseEmissions * reduction) / 100;
    const remaining = baseEmissions - saved;
    return {
      totalSaved: saved.toFixed(1),
      remaining: remaining.toFixed(1),
      percentage: reduction
    };
  }, [policyMandates]);

  const handleTogglePolicy = (key) => {
    setPolicyMandates(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // Give micro XP for interacting
      if (addXp) addXp(5);
      return updated;
    });
  };

  // News search and category filter logic
  const filteredNews = useMemo(() => {
    return NEWS_ARTICLES.filter(article => {
      const matchesCategory = newsCategoryFilter === 'all' || article.category === newsCategoryFilter;
      const matchesSearch = article.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) || 
                            article.content.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
                            article.excerpt.toLowerCase().includes(newsSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [newsSearchQuery, newsCategoryFilter]);

  const handleNewsQuizSubmit = (article) => {
    if (selectedNewsOption === null) {
      addToast('Please select a response option first!', 'warning');
      return;
    }
    
    if (selectedNewsOption === article.quiz.correct) {
      setSolvedNewsQuizzes(prev => [...prev, article.id]);
      if (addXp) addXp(50);
      addToast('Correct response! +50 XP loaded to profile 🏆', 'success');
    } else {
      addToast('Incorrect answer. Re-read the article content and try again!', 'error');
    }
    setSelectedNewsOption(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="animate-fade-in">
      
      {/* Sub tabs navigation */}
      <div className="glass-card" style={{ padding: 8, display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[
          { id: 'academy', label: 'Academy Classes', icon: GraduationCap },
          { id: 'videos', label: 'Video Lectures', icon: PlayCircle },
          { id: 'govEmissions', label: 'Gov Operations', icon: Vote },
          { id: 'news', label: 'Climate News', icon: Newspaper },
          { id: 'glossary', label: 'Climate Glossary', icon: BookOpen },
          { id: 'tips', label: 'Practical Tips & Workshops', icon: Calendar }
        ].map(t => {
          const Icon = t.icon;
          const isActive = eduTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setEduTab(t.id)}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              style={{ flexShrink: 0 }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Main content Area */}
      <div>
        
        {/* 1. ACADEMY INTERACTIVE MODULE */}
        {eduTab === 'academy' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>🎓 Climatora Academy</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Take short courses on environmental skills, pass quizzes, and earn XP to level up your status.
            </p>

            {!activeQuiz ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {ACADEMY_CLASSES.map(cls => {
                  const passed = quizPassedList.includes(cls.id);
                  return (
                    <div key={cls.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 200 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>{cls.title}</h4>
                          {passed && <span className="carbon-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-accent)' }}>Passed</span>}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{cls.desc}</p>
                      </div>

                      <button 
                        className="btn-primary" 
                        onClick={() => startQuiz(cls.id)}
                        style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: 12, marginTop: 12 }}
                      >
                        {passed ? 'Retake Class' : 'Start Lesson'} <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="animate-scale-in" style={{ maxWidth: 500, margin: '0 auto', background: 'var(--bg-tertiary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                {/* Quiz active rendering */}
                {(() => {
                  const quiz = ACADEMY_CLASSES.find(c => c.id === activeQuiz);
                  const currentQObj = quiz.questions[currentQuestion];
                  
                  if (quizFinished) {
                    const isPerfect = quizScore === quiz.questions.length;
                    return (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 40 }}>{isPerfect ? '👑' : '📚'}</span>
                        <h4 style={{ fontSize: 18, color: 'var(--text-primary)', marginTop: 12 }}>Quiz Complete!</h4>
                        <div style={{ fontSize: 28, fontWeight: 900, color: isPerfect ? 'var(--color-accent)' : 'var(--text-primary)', marginTop: 8 }}>
                          {quizScore} / {quiz.questions.length} Correct
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
                          {isPerfect 
                            ? "Perfect score! You have earned +100 XP which has been loaded into your progression meter." 
                            : "Good effort! Go back, review the climate tips, and try again to get a perfect score and earn XP."}
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
                          <button className="btn-secondary" onClick={() => setActiveQuiz(null)}>
                            Close Quiz
                          </button>
                          {!isPerfect && (
                            <button className="btn-primary" onClick={() => startQuiz(activeQuiz)}>
                              Retry Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                        <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                        <span>Quiz Mode</span>
                      </div>
                      <h4 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.4 }}>
                        {currentQObj.q}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {currentQObj.opts.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => setSelectedOpt(oIdx)}
                            style={{
                              padding: 14,
                              borderRadius: 12,
                              border: `2px solid ${selectedOpt === oIdx ? 'var(--color-accent)' : 'var(--border-color)'}`,
                              background: selectedOpt === oIdx ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      <button 
                        className="btn-primary" 
                        disabled={selectedOpt === null}
                        onClick={handleQuizAnswer}
                        style={{ width: '100%', opacity: selectedOpt === null ? 0.6 : 1 }}
                      >
                        Next Question
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 2. GOVERNMENT OPERATIONS EMISSIONS SECTION */}
        {eduTab === 'govEmissions' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Landmark size={22} color="var(--color-accent)" /> Government Carbon Operations
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Public institutions and government operations generate substantial carbon footprints via national security, HVAC systems, transit, and public logistics.
              </p>
            </div>

            {/* Grid structure for Scope descriptions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { title: 'Scope 1 (Direct)', scope: 'Civil Fleets & Heating', desc: 'Direct emissions from municipal heating boilers, state police, postal service fleets, and defense/military vehicle fuels.', icon: Landmark, color: '#10b981' },
                { title: 'Scope 2 (Indirect)', scope: 'Purchased Energy', desc: 'Emissions from electricity purchased to power city halls, public street lighting networks, and electrified transit lines.', icon: Compass, color: '#3b82f6' },
                { title: 'Scope 3 (Indirect)', scope: 'Supply Chain Procurement', desc: 'Embedded carbon in construction materials (concrete for roads), government vendor services, and state official business travel.', icon: FileText, color: '#8b5cf6' }
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(16, 185, 129, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.title}</span>
                      <Icon size={16} color={s.color} />
                    </div>
                    <h4 style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 800 }}>{s.scope}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* SVG Visual Infographic: Emissions Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 28 }}>
              
              {/* Left Column: SVG chart */}
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>Operational Emissions Breakdown</h4>
                <div style={{ width: '100%', height: 240 }}>
                  <svg viewBox="0 0 500 240" width="100%" height="100%">
                    {/* Background grids */}
                    <line x1="120" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="3 3" />
                    <line x1="120" y1="220" x2="480" y2="220" stroke="var(--border-color)" strokeWidth="0.8" />
                    <line x1="210" y1="20" x2="210" y2="220" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="300" y1="20" x2="300" y2="220" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="390" y1="20" x2="390" y2="220" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="480" y1="20" x2="480" y2="220" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />

                    <text x="210" y="235" fontSize="9" fill="var(--text-muted)" textAnchor="middle">10%</text>
                    <text x="300" y="235" fontSize="9" fill="var(--text-muted)" textAnchor="middle">20%</text>
                    <text x="390" y="235" fontSize="9" fill="var(--text-muted)" textAnchor="middle">30%</text>
                    <text x="480" y="235" fontSize="9" fill="var(--text-muted)" textAnchor="middle">40%</text>

                    {/* Chart Rows */}
                    {[
                      { label: 'Defense / Military', val: 42, color: '#f43f5e', y: 35 },
                      { label: 'Public Buildings', val: 28, color: '#8b5cf6', y: 75 },
                      { label: 'Fleet & Transit', val: 18, color: '#3b82f6', y: 115 },
                      { label: 'Water & Waste', val: 7, color: '#f59e0b', y: 155 },
                      { label: 'Government IT', val: 5, color: '#10b981', y: 195 }
                    ].map((row, i) => {
                      const barWidth = (row.val / 42) * 350; // normalized to max 350px width
                      return (
                        <g key={i}>
                          <text x="10" y={row.y + 4} fontSize="11" fontWeight="700" fill="var(--text-primary)">{row.label}</text>
                          <rect x="120" y={row.y - 8} width={barWidth} height="16" rx="4" fill={row.color} opacity="0.85" style={{ transition: 'all 0.5s' }} />
                          <text x={120 + barWidth + 8} y={row.y + 4} fontSize="11" fontWeight="800" fill={row.color}>{row.val}%</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right Column: Policy Mandate Simulator */}
              <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>Policy Decarbonization Mandates</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Select different operational policies to simulate their impact on government-wide emissions footprint.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'fleet', label: '⚡ Electrify 100% Civil Transit Fleets', impact: '-15% Emissions' },
                      { key: 'buildings', label: '🏢 Retrofit Public Buildings to Net-Zero', impact: '-25% Emissions' },
                      { key: 'procurement', label: '🌱 Green Materials Procurement Mandate', impact: '-30% Emissions' },
                      { key: 'grid', label: '🔌 Transition Grid to 100% Renewables', impact: '-20% Emissions' }
                    ].map(p => (
                      <label 
                        key={p.key} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: policyMandates[p.key] ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                          border: `1.5px solid ${policyMandates[p.key] ? 'var(--color-accent)' : 'var(--border-color)'}`,
                          borderRadius: 12,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input 
                            type="checkbox" 
                            checked={policyMandates[p.key]}
                            onChange={() => handleTogglePolicy(p.key)}
                            style={{ accentColor: 'var(--color-accent)', width: 15, height: 15 }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{p.label}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>{p.impact}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Score Indicator */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <span>Projected Carbon Saved:</span>
                    <span style={{ color: 'var(--color-accent)' }}>-{governmentEmissionsScore.percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden', margin: '8px 0' }}>
                    <div 
                      style={{ 
                        width: `${governmentEmissionsScore.percentage}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>Baseline: 50.0 Mt CO₂e</span>
                    <span>Remaining: <strong>{governmentEmissionsScore.remaining} Mt CO₂e</strong></span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom info banner */}
            <div style={{ padding: 16, borderRadius: 14, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Info size={16} color="var(--color-sage)" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Case Study - US Federal Sustainability Plan:</strong> In 2021, the US Federal government issued mandates aiming to achieve a 100% zero-emission vehicle fleet by 2035, net-zero greenhouse gas emissions from buildings by 2045, and a 65% reduction in direct federal operations footprint by 2030, showing the massive impact public sector policies have on steering industrial green markets.
              </p>
            </div>

          </div>
        )}

        {/* 3. CLIMATE NEWS PORTAL */}
        {eduTab === 'news' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            
            {/* Header elements */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Newspaper size={22} color="var(--color-accent)" /> Climate News Portal
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Read current climate articles, complete comprehension reviews, and earn **+50 XP** per completed article.
                </p>
              </div>

              {/* Filters grid */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: '1 1 auto', maxWidth: 500 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 150 }}>
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    className="glass-input"
                    placeholder="Search articles..."
                    style={{ height: 32, paddingLeft: 30, fontSize: 12, width: '100%' }}
                    value={newsSearchQuery}
                    onChange={(e) => setNewsSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="glass-input"
                  style={{ height: 32, padding: '0 8px', fontSize: 12, width: 120 }}
                  value={newsCategoryFilter}
                  onChange={(e) => setNewsCategoryFilter(e.target.value)}
                >
                  <option value="all">All Sectors</option>
                  <option value="policy">Policy</option>
                  <option value="innovation">Innovation</option>
                  <option value="nature">Nature</option>
                </select>
              </div>
            </div>

            {/* Articles Listings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {filteredNews.length > 0 ? (
                filteredNews.map(article => {
                  const solved = solvedNewsQuizzes.includes(article.id);
                  return (
                    <div 
                      key={article.id}
                      className="glass-card" 
                      style={{ 
                        padding: 20, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        height: 220,
                        borderTop: solved ? '3px solid var(--color-accent)' : '3px solid var(--border-color)',
                        background: solved ? 'rgba(16, 185, 129, 0.01)' : 'transparent'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span className="carbon-badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: 10 }}>
                            {article.emoji} {article.category.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{article.readTime}</span>
                        </div>
                        <h4 style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}>{article.title}</h4>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>{article.excerpt}</p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10, marginTop: 10 }}>
                        {solved ? (
                          <span style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} /> Verified (+50 XP)
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Unread</span>
                        )}
                        <button 
                          className="btn-primary"
                          onClick={() => {
                            setActiveNewsArticle(article);
                            setSelectedNewsOption(null);
                          }}
                          style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8 }}
                        >
                          Read & Quiz
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No climate news articles found matching current filters.
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. CLIMATE GLOSSARY MODULE */}
        {eduTab === 'glossary' && (
          <div className="glass-card animate-fade-in" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>📖 Climate Glossary</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Search definitions for complex environmental terminology and science.
            </p>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="text"
                className="glass-input"
                placeholder="Search climate terms (e.g. Albedo, Sequestration)..."
                style={{ width: '100%', paddingLeft: 48 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Glossary Listings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredTerms.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No terms found matching "{searchQuery}". Try searching for another phrase.
                </div>
              ) : (
                filteredTerms.map((item, idx) => (
                  <div key={idx} style={{ padding: 16, borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--color-accent)', fontSize: 15 }}>{item.term}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                      {item.def}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. VIDEO LECTURES MODULE */}
        {eduTab === 'videos' && (
          <div className="animate-fade-in">
            <VideoLectures addXp={addXp} />
          </div>
        )}

        {/* 6. TIPS AND WORKSHOPS */}
        {eduTab === 'tips' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            
            {/* Consulting & Workshops panel */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 20, color: 'var(--text-primary)' }}>💼 Small Enterprise Workshops</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 24 }}>
                Consulting and skill programs designed specifically for green startups and SMEs.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { id: 'w1', title: 'Carbon Accounting for Small Businesses', date: 'June 28, 2026', time: '14:00 - 15:30 GMT', desc: 'Learn how to measure Scope 1, 2, and 3 carbon emissions for your startup.' },
                  { id: 'w2', title: 'Eco-Friendly Product Packaging Alternatives', date: 'July 14, 2026', time: '10:00 - 11:30 GMT', desc: 'Transition your store packages to biodegradable materials.' }
                ].map(workshop => {
                  const isRsvped = rsvpedList.includes(workshop.id);
                  return (
                    <div key={workshop.id} className="glass-card" style={{ padding: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <h4 style={{ fontSize: 15, color: 'var(--text-primary)' }}>{workshop.title}</h4>
                        <div style={{ fontSize: 11, color: 'var(--color-sage)', fontWeight: 700, margin: '4px 0' }}>
                          📅 {workshop.date} • 🕒 {workshop.time}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{workshop.desc}</p>
                      </div>

                      <button
                        className="btn-primary"
                        disabled={isRsvped}
                        onClick={() => handleRsvp(workshop.id)}
                        style={{
                          background: isRsvped ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-accent)',
                          color: isRsvped ? 'var(--color-accent)' : '#ffffff',
                          border: 'none',
                          padding: '10px 20px',
                          fontSize: 12
                        }}
                      >
                        {isRsvped ? (
                          <>
                            <Check size={14} /> RSVP'd
                          </>
                        ) : 'RSVP Now'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Tips */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 16 }}>💡 Sustainable Tips</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[
                  { title: 'Cold Wash Cycle', text: 'Washing your clothes at 30°C instead of 40°C saves up to 38% of electricity.' },
                  { title: 'Adjust Thermostats', text: 'Lowering your heating by just 1°C can lower your winter energy bill by 8%.' },
                  { title: 'Freezer Care', text: 'Defrost your freezer when ice exceeds 5mm; ice buildup forces the motor to run 15% longer.' },
                  { title: 'Conserve Water', text: 'Fixing a single leaking tap can prevent up to 5,000 liters of water loss per year.' }
                ].map((tip, idx) => (
                  <div key={idx} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 16 }}>
                    <h5 style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-accent)' }}>{tip.title}</h5>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* CLIMATE NEWS DETAIL MODAL OVERLAY */}
      {activeNewsArticle && (
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
              onClick={() => setActiveNewsArticle(null)}
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
              <Newspaper size={14} /> Climate Learning Report
            </div>
            
            <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>
              {activeNewsArticle.emoji} {activeNewsArticle.title}
            </h3>
            
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', fontWeight: 700 }}>
              Sector: {activeNewsArticle.category} • Read Time: {activeNewsArticle.readTime}
            </div>

            <p style={{ 
              fontSize: 13, 
              color: 'var(--text-secondary)', 
              lineHeight: 1.6, 
              borderTop: '1px solid var(--border-color)',
              paddingTop: 16,
              marginBottom: 24,
              whiteSpace: 'pre-line'
            }}>
              {activeNewsArticle.content}
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
                <h4 style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>Comprehension Review (+50 XP)</h4>
              </div>

              {solvedNewsQuizzes.includes(activeNewsArticle.id) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> verification complete! You have earned +50 XP.
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, fontWeight: 600 }}>
                    {activeNewsArticle.quiz.question}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeNewsArticle.quiz.options.map((option, oIdx) => (
                      <label 
                        key={oIdx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 10, 
                          padding: '10px 12px', 
                          background: 'var(--bg-secondary)', 
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          border: selectedNewsOption === oIdx ? '1.5px solid var(--color-accent)' : '1.5px solid var(--border-color)',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`news-quiz-${activeNewsArticle.id}`}
                          value={oIdx}
                          checked={selectedNewsOption === oIdx}
                          onChange={() => setSelectedNewsOption(oIdx)}
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>

                  <button 
                    className="btn-primary"
                    onClick={() => handleNewsQuizSubmit(activeNewsArticle)}
                    style={{ fontSize: 11, padding: '8px 16px', alignSelf: 'flex-start', marginTop: 4 }}
                  >
                    Submit Response
                  </button>
                </>
              )}
            </div>

            <button 
              className="btn-secondary" 
              onClick={() => setActiveNewsArticle(null)}
              style={{ marginTop: 20, width: '100%', fontSize: 12, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Close Article
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
