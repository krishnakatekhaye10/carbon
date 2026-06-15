const headlines = [
  { title: 'Global renewable investment hits record high', source: 'Eco Times' },
  { title: 'Cities commit to 50% emission reductions by 2035', source: 'Green Report' },
  { title: 'New climate policy unlocks sustainable transit', source: 'Transit News' }
];

export function LatestNewsCard() {
  return (
    <section className="news-card glass-card">
      <div className="section-heading"><span className="eyebrow">Latest</span><h2>Climate news highlights</h2></div>
      <ul>
        {headlines.map((item) => (
          <li key={item.title} className="news-item">
            <strong>{item.title}</strong>
            <span>{item.source}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
