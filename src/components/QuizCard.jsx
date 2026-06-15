const quizItems = [
  { question: 'Which action saves the most carbon?', answer: 'Switching to renewable energy', options: ['Replacing lightbulbs', 'Switching to renewable energy', 'Using reusable bags'] },
  { question: 'Which water habit is best?', answer: 'Shorter showers', options: ['Longer showers', 'Shorter showers', 'Taking more baths'] }
];

export function QuizCard() {
  return (
    <section className="quiz-card glass-card">
      <span className="eyebrow">Quiz</span>
      <h2>Eco quick quiz</h2>
      <ul>
        {quizItems.map((quiz, idx) => (
          <li key={idx}>
            <strong>{quiz.question}</strong>
            <p>{quiz.answer}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
