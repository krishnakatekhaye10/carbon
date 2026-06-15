import { WeatherAqiWidget } from '../components/WeatherAqiWidget';
import { NewsFeed } from '../components/NewsFeed';

export default function NewsPage() {
  return (
    <div className="page-content news-page">
      <section className="section hero-section">
        <div className="section-heading"><span className="eyebrow">Newsroom</span><h1>Real-time climate headlines</h1></div>
        <p className="section-copy">Stay informed with curated, verified stories from energy, sustainability, and policy updates.</p>
      </section>
      <section className="section split-grid">
        <NewsFeed />
        <WeatherAqiWidget />
      </section>
    </div>
  );
}
