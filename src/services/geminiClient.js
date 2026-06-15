// Lightweight Gemini client wrapper with safe fallback to mock responses.
// Expects VITE_GEMINI_API_KEY and VITE_GEMINI_REST_URL when available.

export async function getRecommendationFromAI(payload) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  const url = import.meta.env.VITE_GEMINI_REST_URL;

  // If no key configured, return a deterministic mock response quickly.
  if (!key || !url) {
    // Simple deterministic heuristic using inputs
    const travel = payload.travelHabits || '';
    const electricity = Number(payload.electricity || 0);
    const food = payload.foodHabits || 'average';

    // Basic rule: if travel mentions car, suggest public transit
    const suggestsPublicTransit = /car|drive|driving|rideshare/i.test(travel);
    const improvement = suggestsPublicTransit ? 18 : 8 + Math.min(12, Math.round(electricity / 100));

    return {
      suggestion: `You can reduce your carbon footprint by ${improvement}% by ${suggestsPublicTransit ? 'switching to public transport twice a week' : 'reducing car trips and optimizing electricity use'}.`,
      sustainabilityScore: 85,
      level: 'Eco Warrior',
      history: [120, 105, 92],
      challenges: [
        { id: 'bike', label: 'Use bicycle today', xp: 10 },
        { id: 'bottle', label: 'Carry reusable bottle', xp: 5 },
        { id: 'plant', label: 'Plant a tree', xp: 40 },
        { id: 'save_elec', label: 'Save electricity', xp: 8 }
      ],
      badges: ['first_calculation', 'eco_beginner'],
      streak: 12,
      stats: { co2SavedKg: 120, treesEquivalent: 6, waterSavedL: 4200, energySavedKwh: 32 },
      news: []
    };
  }

  // Real Gemini API call (best-effort). The exact REST format depends on provider.
  try {
    const body = {
      // a minimal prompt structure. In production, construct a robust prompt and parse response safely.
      model: 'gpt-4o-mini',
      prompt: `User data: ${JSON.stringify(payload)}\nProvide a concise recommendation, an estimated percent reduction, a sustainability score 0-100, 3-point history array (months), 3 challenges with XP values, badges earned, streak days, and stats {co2SavedKg,treesEquivalent,waterSavedL,energySavedKwh}. Respond as JSON only.`,
      max_tokens: 400
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error('ai.request_failed');

    const data = await resp.json();

    // Try to extract JSON from returned text safely
    let text = '';
    if (data && data.output_text) text = data.output_text;
    if (!text && data.choices && data.choices[0]) text = data.choices[0].text || data.choices[0].message?.content || '';

    // If server already returned structured JSON, return that.
    try {
      const parsed = typeof data === 'object' && data.generated ? data.generated : JSON.parse(text);
      return parsed;
    } catch (e) {
      // fallback to a mock if parsing failed
      return {
        suggestion: 'AI service returned unparseable output. Using safe fallback suggestion: reduce car use and save electricity.',
        sustainabilityScore: 80,
        level: 'Green Learner',
        history: [120, 110, 95],
        challenges: [],
        badges: [],
        streak: 5,
        stats: { co2SavedKg: 40, treesEquivalent: 2, waterSavedL: 1200, energySavedKwh: 12 },
        news: []
      };
    }
  } catch (err) {
    // network / parsing error -> fallback
    return {
      suggestion: 'AI call failed. Try again later. Meanwhile: reduce car use and reduce electricity by 10%.',
      sustainabilityScore: 80,
      level: 'Green Learner',
      history: [120, 110, 95],
      challenges: [],
      badges: [],
      streak: 5,
      stats: { co2SavedKg: 40, treesEquivalent: 2, waterSavedL: 1200, energySavedKwh: 12 },
      news: []
    };
  }
}
