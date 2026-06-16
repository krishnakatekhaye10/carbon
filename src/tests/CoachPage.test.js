import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoachPage from '../pages/CoachPage';
import { getRecommendationFromAI } from '../services/geminiClient';

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => React.createElement('div', { ref, ...props }, children)),
      section: React.forwardRef(({ children, ...props }, ref) => React.createElement('section', { ref, ...props }, children)),
    },
    AnimatePresence: ({ children }) => children,
  };
});

// Mock Gemini Client
jest.mock('../services/geminiClient', () => {
  return {
    getRecommendationFromAI: jest.fn()
  };
});

describe('CoachPage Component', () => {
  const sampleCalculatorData = {
    transport: { carKm: 150, fuelType: 'gas', publicKm: 50 },
    flights: { shortHaul: 2, longHaul: 1 },
    diet: { dietType: 'lowMeat' },
    energy: { electricity: 300, heatingSource: 'gas' },
    lifestyle: { newPurchases: 5, recycling: true }
  };

  const sampleUser = {
    name: 'Eco Warrior Stella',
    avatar: '🌱'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with prefilled values from carbon profile', () => {
    render(<CoachPage calculatorData={sampleCalculatorData} user={sampleUser} />);

    expect(screen.getByLabelText(/Travel Habits/i)).toHaveValue(
      'Drive 150 km/week in a gas car, public transit 50 km/week'
    );
    expect(screen.getByLabelText(/Electricity/i)).toHaveValue(300);
    expect(screen.getByLabelText(/Food & Lifestyle/i)).toHaveValue(
      'Diet type is lowMeat. Recycling is active.'
    );
  });

  test('submits and displays recommendations returned by Gemini API', async () => {
    const mockApiResponse = {
      suggestion: 'You can reduce your emissions by switching to public transit or buying an EV.',
      sustainabilityScore: 88,
      level: 'Eco Warrior',
      streak: 15,
      stats: {
        co2SavedKg: 140,
        treesEquivalent: 7,
        waterSavedL: 4500,
        energySavedKwh: 40
      }
    };
    
    getRecommendationFromAI.mockResolvedValueOnce(mockApiResponse);

    render(<CoachPage calculatorData={sampleCalculatorData} user={sampleUser} />);

    const submitBtn = screen.getByRole('button', { name: /Get AI Advice/i });
    fireEvent.click(submitBtn);

    // Should display loading state
    expect(screen.getByText(/Consulting AI.../i)).toBeInTheDocument();

    // Wait for response to render
    await waitFor(() => {
      expect(screen.getByText(/AI Sustainability Summary/i)).toBeInTheDocument();
    });

    expect(screen.getByText(new RegExp(mockApiResponse.suggestion, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/140kg/i)).toBeInTheDocument();
    expect(screen.getByText(/7 🌳/i)).toBeInTheDocument();
    expect(screen.getByText(/4,500L/i)).toBeInTheDocument();
    expect(screen.getByText(/40 kWh/i)).toBeInTheDocument();
    expect(screen.getByText(/88%/i)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('resets form when reset button is clicked', () => {
    render(<CoachPage calculatorData={sampleCalculatorData} user={sampleUser} />);
    
    const travelInput = screen.getByLabelText(/Travel Habits/i);
    fireEvent.change(travelInput, { target: { value: 'Different travel habits' } });
    expect(travelInput).toHaveValue('Different travel habits');

    const resetBtn = screen.getByTitle('Reset to Profile Values');
    fireEvent.click(resetBtn);

    expect(travelInput).toHaveValue(
      'Drive 150 km/week in a gas car, public transit 50 km/week'
    );
  });

  test('handles API request failures and falls back to offline heuristic', async () => {
    getRecommendationFromAI.mockRejectedValueOnce(new Error('API Error'));

    render(<CoachPage calculatorData={sampleCalculatorData} user={sampleUser} />);

    const submitBtn = screen.getByRole('button', { name: /Get AI Advice/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Failed to reach Gemini AI Coach/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Switch to public transit twice a week/i)).toBeInTheDocument();
  });
});
