export function AIClimateCoachCard({ recommendation }) {
  if (!recommendation) {
    return (
      <section className="coach-card glass-card">
        <span className="eyebrow">AI Coach</span>
        <h2>Generate your personalized plan</h2>
        <p className="section-copy">Use the AI Climate Coach to get a tailored sustainability roadmap.</p>
      </section>
    );
  }

  return (
    <section className="coach-card glass-card">
      <span className="eyebrow">AI Coach</span>
      <h2>Your personalized sustainability summary</h2>
      <p className="section-copy">{recommendation.suggestion}</p>
      <div className="coach-summary-grid">
        <div><strong>{recommendation.sustainabilityScore}%</strong><span>Score</span></div>
        <div><strong>{recommendation.level}</strong><span>Rank</span></div>
        <div><strong>{recommendation.streak}</strong><span>Streak</span></div>
      </div>
    </section>
  );
}
