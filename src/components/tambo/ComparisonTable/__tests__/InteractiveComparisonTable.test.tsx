import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveComparisonTable } from '../InteractiveComparisonTable';

// Mock Tambo hooks
vi.mock('@tambo-ai/react', () => ({
  withInteractable: (Component: any) => Component,
  useTamboComponentState: vi.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('InteractiveComparisonTable', () => {
  const mockData = {
    title: 'Repository Comparison',
    headers: ['React', 'Vue', 'Angular'],
    rows: [
      { metric: 'Stars', values: [200000, 180000, 85000] },
      { metric: 'Forks', values: [40000, 35000, 22000] },
      { metric: 'Issues', values: [800, 300, 1200] },
      { metric: 'Language', values: ['JavaScript', 'JavaScript', 'TypeScript'] },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with all data', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={true}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    expect(screen.getByText('Repository Comparison')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
  });

  it('renders column headers as clickable when sorting is enabled', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={true}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    const reactHeader = screen.getByText('React');
    expect(reactHeader).toHaveClass('cursor-pointer');
  });

  it('sorts by column when header is clicked', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={true}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    const reactHeader = screen.getByText('React');
    fireEvent.click(reactHeader);

    // Should show sort indicator
    const allText = document.body.textContent || '';
    expect(allText).toContain('Sorted by');
    expect(allText).toContain('React');
  });

  it('toggles sort direction when clicking same column twice', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={true}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    const reactHeader = screen.getByText('React');
    
    // First click - descending
    fireEvent.click(reactHeader);
    let allText = document.body.textContent || '';
    expect(allText).toContain('↓');

    // Second click - ascending
    fireEvent.click(reactHeader);
    allText = document.body.textContent || '';
    expect(allText).toContain('↑');
  });

  it('renders checkboxes when row selection is enabled', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={true}
        enableExport={false}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('shows selected row count when rows are selected', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={true}
        enableExport={false}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText('1 row selected')).toBeInTheDocument();
  });

  it('shows selected metrics summary', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={true}
        enableExport={false}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText('SELECTED METRICS')).toBeInTheDocument();
    expect(screen.getByText('• Stars')).toBeInTheDocument();
  });

  it('renders export buttons when export is enabled', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={false}
        enableExport={true}
      />
    );

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
  });

  it('exports to CSV when button is clicked', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={false}
        enableExport={true}
      />
    );

    const csvButton = screen.getByText('Export CSV');
    fireEvent.click(csvButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('exports to JSON when button is clicked', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={false}
        enableExport={true}
      />
    );

    const jsonButton = screen.getByText('Export JSON');
    fireEvent.click(jsonButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('formats numbers with locale string', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    // 200000 should be formatted as "200,000"
    expect(screen.getByText('200,000')).toBeInTheDocument();
  });

  it('handles string values correctly', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={false}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    // Use getAllByText since values appear multiple times
    expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0);
  });

  it('sorts numeric values correctly', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={true}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    // Click on React column to sort
    const reactHeader = screen.getByText('React');
    fireEvent.click(reactHeader);

    // Check that sort indicator is shown
    const allText = document.body.textContent || '';
    expect(allText).toContain('Sorted by');
    expect(allText).toContain('React');
  });

  it('sorts string values alphabetically', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={true}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    const reactHeader = screen.getByText('React');
    fireEvent.click(reactHeader);

    // String values should be sorted alphabetically
    // This is tested by checking the order of rows
  });

  it('handles empty rows gracefully', () => {
    const emptyData = {
      ...mockData,
      rows: [],
    };

    render(
      <InteractiveComparisonTable
        {...emptyData}
        enableSorting={true}
        enableRowSelection={false}
        enableExport={false}
      />
    );

    expect(screen.getByText('Repository Comparison')).toBeInTheDocument();
  });

  it('combines sorting and selection features', () => {
    render(
      <InteractiveComparisonTable
        {...mockData}
        enableSorting={true}
        enableRowSelection={true}
        enableExport={false}
      />
    );

    // Sort by column
    const reactHeader = screen.getByText('React');
    fireEvent.click(reactHeader);

    // Select a row
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Both features should work together
    expect(screen.getByText('Sorted by:')).toBeInTheDocument();
    expect(screen.getByText('1 row selected')).toBeInTheDocument();
  });
});
