import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Sparkles, Newspaper, BookOpen, Info } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Dashboard', to: '/dashboard', icon: BarChart3 },
  { label: 'Coach', to: '/coach', icon: Sparkles },
  { label: 'News', to: '/news', icon: Newspaper },
  { label: 'Learn', to: '/learn', icon: BookOpen },
  { label: 'About', to: '/about', icon: Info }
];

export function Navbar() {
  return (
    <header className="site-header">
      <div className="site-branding">
        <span className="brand-mark">🌍</span>
        <div>
          <div className="brand-title">Climatora</div>
          <div className="brand-subtitle">Climate action intelligence</div>
        </div>
      </div>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
