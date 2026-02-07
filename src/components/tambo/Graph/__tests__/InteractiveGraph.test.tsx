import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveGraph } from '../InteractiveGraph';

// Mock Tambo hooks
vi.mock('@tambo-ai/react', () => ({
  withInteractable: (Component: any) => Component,
  useTamboComponentState: vi.fn(),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('InteractiveGraph', () => {
  const mockLineData = {
    type: 'line' as const,
    title: 'Commit Activity',
    labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04'],
    datasets: [
      {
        label: 'Commits',
        data: [10, 15, 8, 20],
        color: '#00f0ff',
      },
      {
        label: 'PRs',
        data: [5, 8, 3, 12],
        color: '#ff00ff',
      },
    ],
  };

  const mockPieData = {
    type: 'pie' as const,
    title: 'Language Distribution',
    labels: ['TypeScript', 'JavaScript', 'CSS'],
    datasets: [
      {
        label: 'Languages',
        data: [60, 30, 10],
        color: '#00f0ff',
      },
    ],
  };

  it('renders graph with filtering controls when enabled', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={true}
        enableTimeRange={false}
        enableDataPointClick={false}
      />
    );

    expect(screen.getByText('Datasets:')).toBeInTheDocument();
    expect(screen.getByText('✓ Commits')).toBeInTheDocument();
    expect(screen.getByText('✓ PRs')).toBeInTheDocument();
  });

  it('allows toggling datasets on and off', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={true}
        enableTimeRange={false}
        enableDataPointClick={false}
      />
    );

    const commitsButton = screen.getByText('✓ Commits');
    fireEvent.click(commitsButton);

    // After clicking, the checkmark should be removed
    expect(screen.getByText('Commits')).toBeInTheDocument();
    expect(screen.queryByText('✓ Commits')).not.toBeInTheDocument();
  });

  it('renders time range controls when enabled', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={false}
        enableTimeRange={true}
        enableDataPointClick={false}
      />
    );

    const allText = document.body.textContent || '';
    expect(allText).toContain('Range');
    expect(allText.toUpperCase()).toContain('ALL');
    expect(allText.toUpperCase()).toContain('WEEK');
    expect(allText.toUpperCase()).toContain('MONTH');
    expect(allText.toUpperCase()).toContain('QUARTER');
  });

  it('allows selecting different time ranges', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={false}
        enableTimeRange={true}
        enableDataPointClick={false}
      />
    );

    const buttons = screen.getAllByRole('button');
    const weekButton = buttons.find(btn => btn.textContent?.toUpperCase() === 'WEEK');
    expect(weekButton).toBeDefined();
    fireEvent.click(weekButton!);

    // Week button should now be highlighted (has neon-cyan classes)
    expect(weekButton).toHaveClass('border-neon-cyan');
  });

  it('does not render time range controls for pie charts', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={mockPieData}
        enableFiltering={false}
        enableTimeRange={true}
        enableDataPointClick={false}
      />
    );

    expect(screen.queryByText('Range:')).not.toBeInTheDocument();
  });

  it('renders without controls when all features disabled', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={false}
        enableTimeRange={false}
        enableDataPointClick={false}
      />
    );

    expect(screen.queryByText('Datasets:')).not.toBeInTheDocument();
    expect(screen.queryByText('Range:')).not.toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={null as any}
        enableFiltering={true}
        enableTimeRange={true}
        enableDataPointClick={false}
      />
    );

    // Should not crash, component should handle null data
    expect(screen.queryByText('Datasets:')).not.toBeInTheDocument();
  });

  it('filters datasets correctly when multiple are toggled off', () => {
    render(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={true}
        enableTimeRange={false}
        enableDataPointClick={false}
      />
    );

    // Toggle off both datasets
    const commitsButton = screen.getByText('✓ Commits');
    const prsButton = screen.getByText('✓ PRs');

    fireEvent.click(commitsButton);
    fireEvent.click(prsButton);

    // Both should be unchecked
    expect(screen.queryByText('✓ Commits')).not.toBeInTheDocument();
    expect(screen.queryByText('✓ PRs')).not.toBeInTheDocument();
  });

  it('maintains dataset selection state across re-renders', () => {
    const { rerender } = render(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={true}
        enableTimeRange={false}
        enableDataPointClick={false}
      />
    );

    // Toggle off Commits
    const commitsButton = screen.getByText('✓ Commits');
    fireEvent.click(commitsButton);

    // Re-render with same props
    rerender(
      <InteractiveGraph
        title="Test Graph"
        data={mockLineData}
        enableFiltering={true}
        enableTimeRange={false}
        enableDataPointClick={false}
      />
    );

    // State should be maintained
    expect(screen.queryByText('✓ Commits')).not.toBeInTheDocument();
    expect(screen.getByText('✓ PRs')).toBeInTheDocument();
  });
});
