import { useMemo } from 'react';
import { DashboardOverview } from '../components/DashboardOverview';
import { HabitProgress } from '../components/HabitProgress';
import { SustainabilityPulse } from '../components/SustainabilityPulse';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function DashboardPage() {
  const [dashboard] = useLocalStorage('carbon_dashboard', {
    footprint: 1863,
    waterUse: 12908,
    plantableTrees: 3,
    streak: 9,
    challengesCompleted: 14
  });

  const sections = useMemo(() => [
    { title: 'Footprint Score', value: `${dashboard.footprint} kg CO2e`, subtitle: 'Your annual carbon estimate' },
    { title: 'Water Usage', value: `${dashboard.waterUse.toLocaleString()} L`, subtitle: 'Annual household water use' },
    { title: 'Tree Equivalent', value: `${dashboard.plantableTrees}+`, subtitle: 'Trees saved by actions' }
  ], [dashboard]);

  return (
    <div className="page-content dashboard-page">
      <div className="section split-grid">
        <DashboardOverview data={dashboard} />
        <SustainabilityPulse data={dashboard} />
      </div>
      <div className="section">
        <HabitProgress progress={dashboard} />
      </div>
    </div>
  );
}
