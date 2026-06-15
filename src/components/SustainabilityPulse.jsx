export function SustainabilityPulse({ data }) {
  return (
    <section className="pulse-card glass-card">
      <span className="eyebrow">Pulse</span>
      <h2>Weekly sustainability summary</h2>
      <p className="section-copy">Your carbon, energy, and water progress is trending in the right direction. Keep the momentum going.</p>
      <div className="pulse-metrics">
        <div><strong>+12%</strong><span>Better than last week</span></div>
        <div><strong>3</strong><span>Eco challenges finished</span></div>
      </div>
    </section>
  );
}
