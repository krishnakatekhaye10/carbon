import { Link } from 'react-router-dom';

const actions = [
  { label: 'Carbon footprint tracker', to: '/dashboard', detail: 'See your baseline and goals' },
  { label: 'AI climate coach', to: '/coach', detail: 'Get personalized eco-actions' },
  { label: 'Weekly challenges', to: '/learn', detail: 'Complete sustainability missions' }
];

export function QuickActions() {
  return (
    <div className="action-grid">
      {actions.map((action) => (
        <Link to={action.to} key={action.to} className="action-card glass-card">
          <h3>{action.label}</h3>
          <p>{action.detail}</p>
        </Link>
      ))}
    </div>
  );
}
