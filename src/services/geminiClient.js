// Light-weight Google Gemini API REST client for Climatora
// Endpoint: v1beta/models/gemini-2.5-flash:generateContent

export async function getRecommendationFromAI(payload) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  
  // High-fidelity offline heuristic if the API key is not configured
  const getOfflineRecommendation = () => {
    const travel = payload.travelHabits || '';
    const electricity = Number(payload.electricity || 300);
    const food = payload.foodHabits || '';

    const hasCar = /car|drive|gasoline|petrol|diesel/i.test(travel);
    const hasHighElec = electricity > 350;
    const hasMeat = /heavyMeat|meat/i.test(food);

    let advice = 'You have a solid sustainability profile! ';
    let reduction = 10;
    
    if (hasCar) {
      advice += 'You can reduce your emissions by switching to public transport twice a week or driving an EV. ';
      reduction += 8;
    }
    if (hasHighElec) {
      advice += `Your energy use of ${electricity} kWh is high. Auditing home insulation and switching to solar can yield significant savings. `;
      reduction += 5;
    }
    if (hasMeat) {
      advice += 'Adopting plant-rich or vegetarian meals a few times a week can cut your dietary emissions significantly. ';
      reduction += 6;
    }
    if (!hasCar && !hasHighElec && !hasMeat) {
      advice += 'Keep doing what you are doing! Offset remaining footprint by planting a tree or composting.';
    }

    return {
      suggestion: advice.trim(),
      sustainabilityScore: Math.min(95, Math.max(45, 95 - Math.round(electricity / 20) - (hasCar ? 15 : 0) - (hasMeat ? 10 : 0))),
      level: electricity > 500 ? 'Green Learner' : 'Eco Warrior',
      streak: 12,
      stats: {
        co2SavedKg: Math.round(reduction * 8.5),
        treesEquivalent: Math.round(reduction * 8.5 / 20),
        waterSavedL: Math.round(reduction * 250),
        energySavedKwh: Math.round(electricity * 0.1)
      }
    };
  };

  if (!key) {
    // No API key configured, use local model
    return new Promise((resolve) => {
      setTimeout(() => resolve(getOfflineRecommendation()), 750);
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  try {
    const promptText = `
You are the Climatora AI Sustainability Coach.
Analyze this user's lifestyle habits:
- Travel habits: ${payload.travelHabits}
- Electricity: ${payload.electricity} kWh/month
- Diet/lifestyle: ${payload.foodHabits}

Recommend a custom carbon footprint reduction plan in 2-3 sentences.
Return a structured JSON with:
{
  "suggestion": "string detailing your advice",
  "sustainabilityScore": integer 0-100,
  "level": "string ('Beginner' | 'Green Learner' | 'Eco Warrior' | 'Climate Hero')",
  "streak": 12,
  "stats": {
    "co2SavedKg": integer,
    "treesEquivalent": integer,
    "waterSavedL": integer,
    "energySavedKwh": integer
  }
}
Respond with JSON only. Do not wrap in markdown code blocks.
`;

    const body = {
      contents: [
        {
          parts: [{ text: promptText }]
        }
      ],
      generationConfig: {
        // Avoid empty-output errors caused by strict MIME-type enforcement;
        // we strip markdown fences ourselves below.
        temperature: 0.4
      },
      // Disable the thinking budget on flash to prevent empty responses
      thinkingConfig: { thinkingBudget: 0 }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    // Strip optional markdown code fences (```json ... ``` or ``` ... ```)
    const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Gemini API call failed, falling back to offline recommendations:', err);
    return getOfflineRecommendation();
  }
}
