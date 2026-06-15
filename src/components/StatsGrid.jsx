export function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      {stats.map((item) => (
        <article key={item.label} className="stat-card glass-card">
          <p className="stat-label">{item.label}</p>
          <p className="stat-value">{item.value}</p>
          <p className="stat-detail">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
