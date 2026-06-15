export function DashboardOverview({ data }) {
  return (
    <section className="dashboard-overview glass-card">
      <header className="section-heading"><span className="eyebrow">Overview</span><h2>Your performance metrics</h2></header>
      <div className="overview-grid">
        <div className="mini-card"><span>Footprint</span><strong>{data.footprint} kg CO₂e</strong></div>
        <div className="mini-card"><span>Water use</span><strong>{data.waterUse.toLocaleString()} L</strong></div>
        <div className="mini-card"><span>Streak</span><strong>{data.streak} days</strong></div>
        <div className="mini-card"><span>Challenges</span><strong>{data.challengesCompleted}</strong></div>
      </div>
    </section>
  );
}
