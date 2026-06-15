import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-content centered-page">
      <div className="not-found-card">
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p className="section-copy">The page you are looking for doesn’t exist or has been moved.</p>
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
    </div>
  );
}
