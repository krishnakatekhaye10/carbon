import { useMemo, useState } from 'react';
import { AIClimateCoachCard } from '../components/AIClimateCoachCard';
import { CoachInsights } from '../components/CoachInsights';
import { getRecommendationFromAI } from '../services/geminiClient';
import { useToast } from '../components/ToastProvider';

export default function CoachPage() {
  const { addToast } = useToast();
  const [payload, setPayload] = useState({ travelHabits: 'vehicle daily', electricity: 240, foodHabits: 'weekly meat' });
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const result = await getRecommendationFromAI(payload);
    setRecommendation(result);
    setIsLoading(false);
    addToast('AI Climate Coach has a new plan for you!', 'success');
  };

  const engineStatus = useMemo(() => ({ active: !!recommendation, loading: isLoading }), [recommendation, isLoading]);

  return (
    <div className="page-content coach-page">
      <div className="section intro-card">
        <div>
          <p className="eyebrow">Personalized climate coaching</p>
          <h1>AI-driven sustainability guidance</h1>
          <p className="section-copy">Receive tailored reduction goals, eco-challenges, and performance badges every week.</p>
        </div>
        <button className="btn-primary" type="button" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Run AI Coach'}
        </button>
      </div>
      <div className="section split-grid">
        <AIClimateCoachCard recommendation={recommendation} />
        <CoachInsights status={engineStatus} recommendation={recommendation} />
      </div>
    </div>
  );
}
