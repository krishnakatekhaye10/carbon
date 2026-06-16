import { useState, useMemo } from 'react';
import { Newspaper, Search, Globe, ChevronRight, X, Clock, Share2 } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title: 'Renewable Energy Hits New Record Milestones',
    summary: 'Solar and wind installations account for a record 38% of global electricity generation, overtaking coal in key regional grids.',
    fullText: 'Solar and wind infrastructure grew at their fastest rate in history over the past year. Driven by cost reductions in photovoltaic cells and massive turbine deployments, green energy now supplies over a third of global electricity. Grids in Denmark and Uruguay achieved peak days with 90%+ renewable integration, proving that grid stability can be sustained with clean flows. The International Energy Agency predicts coal usage will decline rapidly over the next five years.',
    source: 'International Energy Agency',
    category: 'Energy',
    date: 'June 14, 2026',
    readTime: '3 min read'
  },
  {
    id: 2,
    title: 'Solid-State Battery Tech Boosts EV Ranges by 40%',
    summary: 'New battery manufacturing breakthroughs double energy densities while removing heavy cobalt dependency, lowering EV pricing.',
    fullText: 'A joint automotive research group has announced the commercial scaling of solid-state sodium batteries. By replacing liquid electrolytes with solid ceramics, the batteries double raw energy capacity, allowing passenger vehicles to drive over 800 kilometers on a single charge. Furthermore, the design removes all cobalt dependencies, utilizing abundant sodium minerals. This lowers manufacturing costs by 35%, bringing EVs to price parity with traditional combustion engines.',
    source: 'Clean Energy Journal',
    category: 'Technology',
    date: 'June 10, 2026',
    readTime: '4 min read'
  },
  {
    id: 3,
    title: 'Paris Agreement Targets Under Critical Decade Review',
    summary: 'A new climate panel report highlights key steps required in the next 4 years to hold global temperature increases to 1.5°C.',
    fullText: 'The UN Climate Council has released its decade report, stressing that global greenhouse gas emissions must fall by 43% by 2030 to keep the 1.5°C threshold alive. While renewable growth is ahead of expectations, agricultural deforestation and methane leaks from industrial farming continue to challenge targets. The report outlines key policies, including global carbon taxes and localized conservation incentives, to bridge the remaining emissions gap.',
    source: 'Climate Watch Network',
    category: 'Policy',
    date: 'June 08, 2026',
    readTime: '5 min read'
  },
  {
    id: 4,
    title: 'Global Reusable Materials Marketplace Surges by 25%',
    summary: 'Consumer demand shifts rapidly from single-use plastics to circular packaging solutions and metallic container frameworks.',
    fullText: 'Retail studies reveal a significant consumer transition toward zero-plastic packaging. Market segments for metal containers, reusable glass containers, and seaweed-based wrap have surged by 25% year-over-year. Major grocery conglomerates are adopting bulk-dispenser models to reduce waste footprint. Cities banning single-use shopping bags report over 80% trash reductions in local waterways, highlighting the immediate impact of localized packaging bans.',
    source: 'GreenTech News',
    category: 'Lifestyle',
    date: 'June 05, 2026',
    readTime: '2 min read'
  }
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Energy', 'Technology', 'Policy', 'Lifestyle'];

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter(art => {
      const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            art.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'All' || art.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-8 animate-fade-in text-left font-jakarta max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 p-6 rounded-3xl shadow-sm glass-card flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
          <Newspaper size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-slate-100">Climate Watch News</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Get the latest vetted summaries on renewable energy, green policy, and sustainable technology.</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-4 rounded-2xl shadow-sm glass-card">
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCategory === cat
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map(art => (
          <div 
            key={art.id} 
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 glass-card"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md">{art.category}</span>
                <span>{art.date}</span>
              </div>
              <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                {art.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {art.summary}
              </p>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <Globe size={13} />
                <span className="font-semibold truncate max-w-[150px]">{art.source}</span>
              </div>
              
              <button
                onClick={() => setSelectedArticle(art)}
                className="text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-0.5"
              >
                Read Article
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-sm text-slate-400">
            No news articles match your current criteria.
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left space-y-6">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            {/* Category Date Metadata */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 font-bold rounded-lg uppercase tracking-wider">{selectedArticle.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {selectedArticle.readTime}</span>
              <span>•</span>
              <span>{selectedArticle.date}</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-850 dark:text-slate-100 leading-tight">
              {selectedArticle.title}
            </h3>

            {/* Source Details */}
            <div className="flex justify-between items-center py-3 border-y border-slate-100 dark:border-slate-850 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-500">
                  {selectedArticle.source[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-200">{selectedArticle.source}</div>
                  <div className="text-[10px] text-slate-400">Verified Climate Publisher</div>
                </div>
              </div>
              
              <button 
                onClick={() => alert('Article mock link shared!')}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition"
                title="Share Article"
              >
                <Share2 size={14} />
              </button>
            </div>

            {/* Article Content */}
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {selectedArticle.fullText}
            </p>

            {/* Callout Info */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/10 rounded-2xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Editor's Note:</strong> This summary was compiled from primary research files. Support clean-energy transitions and local conservation projects to directly implement this article's takeaways.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
