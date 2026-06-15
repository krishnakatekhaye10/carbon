import { QuizCard } from '../components/QuizCard';
import { GlossaryGrid } from '../components/GlossaryGrid';

export default function LearnPage() {
  return (
    <div className="page-content learn-page">
      <section className="section hero-section">
        <div className="section-heading"><span className="eyebrow">Learn</span><h1>Build climate literacy</h1></div>
        <p className="section-copy">Interactive lessons, sustainability flashcards, and quick quizzes to sharpen your eco-decision-making.</p>
      </section>
      <section className="section split-grid">
        <QuizCard />
        <GlossaryGrid />
      </section>
    </div>
  );
}
