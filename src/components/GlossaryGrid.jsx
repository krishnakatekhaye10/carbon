const glossary = [
  { term: 'Carbon footprint', definition: 'Total greenhouse gas emissions caused by an individual or product.' },
  { term: 'Net-zero', definition: 'Balancing emitted and removed carbon to make the climate impact neutral.' },
  { term: 'Sustainability', definition: 'Meeting present needs without compromising future generations.' }
];

export function GlossaryGrid() {
  return (
    <section className="glossary-card glass-card">
      <span className="eyebrow">Glossary</span>
      <h2>Key climate terms</h2>
      <dl>
        {glossary.map((item) => (
          <div key={item.term} className="glossary-item">
            <dt>{item.term}</dt>
            <dd>{item.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
