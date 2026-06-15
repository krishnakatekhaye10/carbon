export function CoachInsights({ status, recommendation }) {
  return (
    <section className="coach-insights glass-card">
      <span className="eyebrow">Insights</span>
      <h2>Climate actions you can take</h2>
      {status.loading ? (
        <p className="section-copy">Generating custom guidance…</p>
      ) : recommendation ? (
        <ul className="insight-list">
          {recommendation.challenges?.map((challenge) => (
            <li key={challenge.id}>{challenge.label}</li>
          ))}
        </ul>
      ) : (
        <p className="section-copy">No recommendation generated yet. Click the button to start.</p>
      )}
    </section>
  );
}
