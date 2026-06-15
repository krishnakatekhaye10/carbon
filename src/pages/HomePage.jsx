import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { StatsGrid } from '../components/StatsGrid';
import { QuickActions } from '../components/QuickActions';
import { LatestNewsCard } from '../components/LatestNewsCard';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function HomePage() {
  const [profile] = useLocalStorage('carbon_profile', { name: 'Sunrise Steward', streak: 8, score: 78 });
  const stats = useMemo(() => [
    { label: 'Sustainability score', value: `${profile.score}%`, detail: 'Higher than 58% of users' },
    { label: 'Current streak', value: `${profile.streak} days`, detail: 'Active challenge streak' },
    { label: 'Achievement badges', value: '7', detail: 'Unlocked milestones' }
  ], [profile.score, profile.streak]);

  return (
    <div className="page-content">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="section hero-section">
        <HeroBanner />
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="section stats-section">
        <StatsGrid stats={stats} />
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section action-section">
        <QuickActions />
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="section news-section">
        <LatestNewsCard />
      </motion.section>
    </div>
  );
}
