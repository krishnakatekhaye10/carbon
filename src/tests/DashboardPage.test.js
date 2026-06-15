import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../pages/DashboardPage';

// Mock Recharts
jest.mock('recharts', () => {
  const React = require('react');
  return {
    ResponsiveContainer: ({ children }) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    LineChart: () => React.createElement('div', { 'data-testid': 'line-chart' }),
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    BarChart: () => React.createElement('div', { 'data-testid': 'bar-chart' }),
    Bar: () => null,
    CartesianGrid: () => null,
  };
});

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

// Mock jsPDF
const mockSave = jest.fn();
const mockText = jest.fn();
const mockLine = jest.fn();
const mockRect = jest.fn();
const mockSetFillColor = jest.fn();
const mockSetTextColor = jest.fn();
const mockSetFontSize = jest.fn();
const mockSplitText = jest.fn().mockReturnValue(['Mocked split text advice.']);

jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => {
      return {
        setFillColor: mockSetFillColor,
        rect: mockRect,
        setTextColor: mockSetTextColor,
        setFontSize: mockSetFontSize,
        text: mockText,
        line: mockLine,
        splitTextToSize: mockSplitText,
        save: mockSave,
      };
    })
  };
});

describe('DashboardPage Component', () => {
  const sampleCalculatorData = {
    transport: { carKm: 120, fuelType: 'hybrid', publicKm: 40 },
    flights: { shortHaul: 1, longHaul: 0 },
    diet: { dietType: 'vegetarian' },
    energy: { electricity: 250, heatingSource: 'electric' },
    lifestyle: { newPurchases: 2, recycling: true }
  };

  const sampleGamification = {
    xp: 220,
    level: 1,
    badgeIds: ['first_calculation'],
    streak: 8,
    lastActiveDate: '2026-06-15',
    completedChallenges: [],
    co2Saved: 80,
    waterSaved: 1200,
    energySaved: 15,
    reductionGoal: 20
  };

  const mockSetGamification = jest.fn();
  const mockAddXp = jest.fn();
  const mockSetIsOnboarded = jest.fn();
  const mockNavigate = jest.fn();
  const mockOnUpdateCalculator = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders step-by-step onboarding when not onboarded', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={false}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    expect(screen.getByText(/Calculate Your Carbon Footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Transportation/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly driving in private vehicle/i)).toBeInTheDocument();
  });

  test('renders interactive dashboard cards when onboarded', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={true}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    expect(screen.getByText(/Eco Workspace Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Sustainability Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Eco Challenges/i)).toBeInTheDocument();
    expect(screen.getByText(/Emissions History Trend/i)).toBeInTheDocument();
  });

  test('triggers PDF report export on download click', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={true}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    const downloadBtn = screen.getByRole('button', { name: /Download Sustainability Report PDF/i });
    fireEvent.click(downloadBtn);

    expect(mockSave).toHaveBeenCalledWith('climatora_sustainability_report.pdf');
    expect(mockText).toHaveBeenCalled();
  });

  test('completes a weekly challenge and rewards XP', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={true}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    const challengeBox = screen.getByRole('checkbox', { name: /Plant a tree/i });
    fireEvent.click(challengeBox);

    expect(mockSetGamification).toHaveBeenCalled();
    expect(mockAddXp).toHaveBeenCalledWith(100);
  });

  test('completes the entire multi-step onboarding wizard and saves', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={false}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    // Step 1: Transport
    const carKmInput = screen.getByLabelText(/Weekly driving in private vehicle/i);
    fireEvent.change(carKmInput, { target: { value: '250' } });
    const fuelSelect = screen.getByRole('combobox');
    fireEvent.change(fuelSelect, { target: { value: 'electric' } });
    
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    // Step 2: Flights
    const shortHaulInput = screen.getByLabelText(/Short-haul flights per year/i);
    fireEvent.change(shortHaulInput, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 3: Diet
    const dietSelect = screen.getByRole('combobox');
    fireEvent.change(dietSelect, { target: { value: 'vegan' } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 4: Energy
    const electricityInput = screen.getByLabelText(/Monthly electricity consumption/i);
    fireEvent.change(electricityInput, { target: { value: '450' } });
    const heatingSelect = screen.getByRole('combobox');
    fireEvent.change(heatingSelect, { target: { value: 'solar' } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 5: Lifestyle
    const purchasesInput = screen.getByLabelText(/Monthly new purchases/i);
    fireEvent.change(purchasesInput, { target: { value: '8' } });
    const recycleCheck = screen.getByLabelText(/I regularly sort and recycle household waste/i);
    fireEvent.click(recycleCheck);

    const saveBtn = screen.getByRole('button', { name: /Calculate & Save/i });
    fireEvent.click(saveBtn);

    expect(mockOnUpdateCalculator).toHaveBeenCalled();
    expect(mockSetIsOnboarded).toHaveBeenCalledWith(true);
    expect(mockAddXp).toHaveBeenCalledWith(100);
  });

  test('triggers target reduction goal adjustment', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={true}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    const goalSlider = screen.getByRole('slider');
    fireEvent.change(goalSlider, { target: { value: '35' } });

    expect(mockSetGamification).toHaveBeenCalled();
  });

  test('triggers navigation to AI Climate Coach', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={true}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    const coachRedirectBtn = screen.getByRole('button', { name: /Ask AI Coach/i });
    fireEvent.click(coachRedirectBtn);

    expect(mockNavigate).toHaveBeenCalledWith('coach');
  });

  test('triggers challenge toggle with Enter key press', () => {
    render(
      <DashboardPage
        calculatorData={sampleCalculatorData}
        onUpdateCalculator={mockOnUpdateCalculator}
        gamification={sampleGamification}
        setGamification={mockSetGamification}
        addXp={mockAddXp}
        isOnboarded={true}
        setIsOnboarded={mockSetIsOnboarded}
        onNavigate={mockNavigate}
      />
    );

    const challengeCheckbox = screen.getByRole('checkbox', { name: /Plant a tree/i });
    fireEvent.keyDown(challengeCheckbox, { key: 'Enter', code: 'Enter' });

    expect(mockSetGamification).toHaveBeenCalled();
    expect(mockAddXp).toHaveBeenCalledWith(100);
  });
});
