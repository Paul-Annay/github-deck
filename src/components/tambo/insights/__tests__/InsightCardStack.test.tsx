import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InsightCardStack } from '../InsightCardStack';

// Mock Tambo hooks
vi.mock('@tambo-ai/react', () => ({
  withInteractable: (Component: any) => Component,
  useTamboComponentState: vi.fn(),
}));

describe('InsightCardStack', () => {
  const mockInsights = [
    {
      id: '1',
      type: 'success' as const,
      title: 'HIGH VISIBILITY',
      message: 'This repository has 50,000 stars',
      metric: '50K ⭐',
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'HIGH ISSUE COUNT',
      message: '234 open issues detected',
      metric: '234 OPEN',
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'ACTIVE ECOSYSTEM',
      message: '1,500 forks indicate strong engagement',
      metric: '1.5K FORKS',
    },
  ];

  it('renders empty state when no insights provided', () => {
    render(<InsightCardStack insights={[]} maxVisible={5} />);
    expect(screen.getByText('AWAITING ANALYSIS...')).toBeInTheDocument();
  });

  it('renders all insights when provided', () => {
    render(<InsightCardStack insights={mockInsights} maxVisible={5} />);
    
    expect(screen.getByText('HIGH VISIBILITY')).toBeInTheDocument();
    expect(screen.getByText('HIGH ISSUE COUNT')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE ECOSYSTEM')).toBeInTheDocument();
  });

  it('displays correct metrics for each insight', () => {
    render(<InsightCardStack insights={mockInsights} maxVisible={5} />);
    
    expect(screen.getByText('50K ⭐')).toBeInTheDocument();
    expect(screen.getByText('234 OPEN')).toBeInTheDocument();
    expect(screen.getByText('1.5K FORKS')).toBeInTheDocument();
  });

  it('shows correct count of active insights', () => {
    render(<InsightCardStack insights={mockInsights} maxVisible={5} />);
    expect(screen.getByText('3 ACTIVE')).toBeInTheDocument();
  });

  it('allows dismissing individual insights', () => {
    render(<InsightCardStack insights={mockInsights} maxVisible={5} />);
    
    const dismissButtons = screen.getAllByLabelText('Dismiss insight');
    expect(dismissButtons).toHaveLength(3);
    
    // Dismiss first insight
    fireEvent.click(dismissButtons[0]);
    
    // Should only show 2 insights now
    expect(screen.getByText('2 ACTIVE')).toBeInTheDocument();
    expect(screen.queryByText('HIGH VISIBILITY')).not.toBeInTheDocument();
  });

  it('respects maxVisible limit', () => {
    const manyInsights = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      type: 'info' as const,
      title: `INSIGHT ${i}`,
      message: `Message ${i}`,
    }));

    render(<InsightCardStack insights={manyInsights} maxVisible={3} />);
    
    expect(screen.getByText('3 ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INSIGHT 0')).toBeInTheDocument();
    expect(screen.getByText('INSIGHT 1')).toBeInTheDocument();
    expect(screen.getByText('INSIGHT 2')).toBeInTheDocument();
    expect(screen.queryByText('INSIGHT 3')).not.toBeInTheDocument();
  });

  it('applies correct styling for different insight types', () => {
    render(<InsightCardStack insights={mockInsights} maxVisible={5} />);
    
    // Find the title elements which have the color classes
    const successTitle = screen.getByText('HIGH VISIBILITY');
    const warningTitle = screen.getByText('HIGH ISSUE COUNT');
    const infoTitle = screen.getByText('ACTIVE ECOSYSTEM');
    
    expect(successTitle).toHaveClass('text-green-400');
    expect(warningTitle).toHaveClass('text-amber-400');
    expect(infoTitle).toHaveClass('text-neon-cyan');
  });

  it('shows empty state after all insights are dismissed', () => {
    render(<InsightCardStack insights={[mockInsights[0]]} maxVisible={5} />);
    
    const dismissButton = screen.getByLabelText('Dismiss insight');
    fireEvent.click(dismissButton);
    
    expect(screen.getByText('AWAITING ANALYSIS...')).toBeInTheDocument();
  });
});
