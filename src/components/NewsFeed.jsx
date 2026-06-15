const feedItems = [
  { title: 'Solar adoption doubles in three years', source: 'Energy Weekly', date: '2h ago' },
  { title: 'Low-carbon cities launch green transit plans', source: 'Urban Green', date: '5h ago' },
  { title: 'Companies commit to net-zero supply chains', source: 'Market Earth', date: '9h ago' }
];

export function NewsFeed() {
  return (
    <section className="feed-panel glass-card">
      <span className="eyebrow">Climate feed</span>
      <h2>Curated environmental stories</h2>
      <ul>
        {feedItems.map((item) => (
          <li key={item.title} className="feed-item">
            <strong>{item.title}</strong>
            <div><span>{item.source}</span><span>{item.date}</span></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
