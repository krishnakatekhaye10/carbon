import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../pages/HomePage';

// Mock framer-motion to bypass animation triggers in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => React.createElement('div', { ref, ...props }, children)),
      section: React.forwardRef(({ children, ...props }, ref) => React.createElement('section', { ref, ...props }, children)),
    }
  };
});

describe('HomePage Component', () => {
  const mockNavigate = jest.fn();
  const mockLoginClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Hero Section and core landing headers', () => {
    render(
      <HomePage 
        onNavigate={mockNavigate} 
        isLoggedIn={false} 
        onLoginClick={mockLoginClick} 
      />
    );

    expect(screen.getByText(/Making Climate Action Part of/i)).toBeInTheDocument();
    expect(screen.getByText(/Empowering Features to Drive Change/i)).toBeInTheDocument();
    expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
    expect(screen.getByText(/What Our Community Says/i)).toBeInTheDocument();
  });

  test('calls onLoginClick when clicking CTA and user is not logged in', () => {
    render(
      <HomePage 
        onNavigate={mockNavigate} 
        isLoggedIn={false} 
        onLoginClick={mockLoginClick} 
      />
    );

    const ctaBtn = screen.getByRole('button', { name: /Calculate Your Carbon Footprint/i });
    fireEvent.click(ctaBtn);

    expect(mockLoginClick).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('calls onNavigate when clicking CTA and user is logged in', () => {
    render(
      <HomePage 
        onNavigate={mockNavigate} 
        isLoggedIn={true} 
        onLoginClick={mockLoginClick} 
      />
    );

    const ctaBtn = screen.getByRole('button', { name: /Calculate Your Carbon Footprint/i });
    fireEvent.click(ctaBtn);

    expect(mockNavigate).toHaveBeenCalledWith('track');
    expect(mockLoginClick).not.toHaveBeenCalled();
  });
});
