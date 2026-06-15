export function HabitProgress({ progress }) {
  return (
    <section className="habit-panel glass-card">
      <header className="section-heading"><span className="eyebrow">Habits</span><h2>Daily eco behavior</h2></header>
      <div className="habit-summary">
        <div><strong>{progress.challengesCompleted}</strong><span>Weekly habit wins</span></div>
        <div><strong>{progress.streak} days</strong><span>Consistency streak</span></div>
      </div>
      <div className="habit-list">
        <div className="habit-pill">No-drive weekend</div>
        <div className="habit-pill">LED retrofit</div>
        <div className="habit-pill">Zero waste meal</div>
      </div>
    </section>
  );
}
