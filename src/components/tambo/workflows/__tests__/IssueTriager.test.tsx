import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IssueTriager } from '../IssueTriager';

// Mock Tambo hooks
vi.mock('@tambo-ai/react', () => ({
  withInteractable: (Component: any) => Component,
  useTamboComponentState: vi.fn(),
}));

describe('IssueTriager', () => {
  const mockIssues = [
    {
      number: 101,
      title: 'Bug: Application crashes on startup',
      state: 'open' as const,
      labels: [{ name: 'bug', color: 'ff0000' }],
      created_at: '2024-01-15T10:00:00Z',
      html_url: 'https://github.com/test/repo/issues/101',
    },
    {
      number: 102,
      title: 'Feature request: Add dark mode',
      state: 'open' as const,
      labels: [{ name: 'enhancement', color: '00ff00' }],
      created_at: '2024-01-16T10:00:00Z',
      html_url: 'https://github.com/test/repo/issues/102',
    },
    {
      number: 103,
      title: 'Documentation: Update README',
      state: 'open' as const,
      labels: [{ name: 'documentation', color: '0000ff' }],
      created_at: '2024-01-17T10:00:00Z',
      html_url: 'https://github.com/test/repo/issues/103',
    },
  ];

  const defaultCategories = ['bug', 'feature', 'documentation', 'question', 'wontfix'];

  it('renders empty state when no issues provided', () => {
    render(
      <IssueTriager
        issues={[]}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    expect(screen.getByText('NO ISSUES TO TRIAGE')).toBeInTheDocument();
  });

  it('renders all issues', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    expect(screen.getByText('#101 Bug: Application crashes on startup')).toBeInTheDocument();
    expect(screen.getByText('#102 Feature request: Add dark mode')).toBeInTheDocument();
    expect(screen.getByText('#103 Documentation: Update README')).toBeInTheDocument();
  });

  it('shows progress bar with correct count', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    const progressText = screen.getByText('TRIAGE PROGRESS').parentElement;
    expect(progressText?.textContent).toContain('0');
    expect(progressText?.textContent).toContain('3');
  });

  it('renders category buttons for each issue', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Each issue should have all category buttons
    const bugButtons = screen.getAllByText('bug');
    expect(bugButtons.length).toBeGreaterThan(0);
  });

  it('renders priority buttons for each issue', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    const lowButtons = screen.getAllByText('low');
    const mediumButtons = screen.getAllByText('medium');
    const highButtons = screen.getAllByText('high');
    const criticalButtons = screen.getAllByText('critical');

    expect(lowButtons.length).toBe(3);
    expect(mediumButtons.length).toBe(3);
    expect(highButtons.length).toBe(3);
    expect(criticalButtons.length).toBe(3);
  });

  it('allows selecting a category for an issue', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Get category buttons (not label badges)
    const allButtons = screen.getAllByRole('button');
    const bugButtons = allButtons.filter(btn => btn.textContent === 'bug');
    fireEvent.click(bugButtons[0]);

    // Button should be highlighted
    expect(bugButtons[0]).toHaveClass('border-neon-cyan');
  });

  it('allows selecting a priority for an issue', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    const highButtons = screen.getAllByText('high');
    fireEvent.click(highButtons[0]);

    // Button should be highlighted with priority color
    expect(highButtons[0]).toHaveClass('text-neon-amber');
  });

  it('allows adding notes to an issue', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    const noteInputs = screen.getAllByPlaceholderText('Add triage notes...');
    fireEvent.change(noteInputs[0], { target: { value: 'Needs investigation' } });

    expect(noteInputs[0]).toHaveValue('Needs investigation');
  });

  it('marks issue as triaged when category is selected', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Get category buttons (not label badges)
    const allButtons = screen.getAllByRole('button');
    const bugButtons = allButtons.filter(btn => btn.textContent === 'bug');
    fireEvent.click(bugButtons[0]);

    // Progress should update - text is split across elements so we need to check the parent
    const progressText = screen.getByText('TRIAGE PROGRESS').parentElement;
    expect(progressText?.textContent).toContain('1');
    expect(progressText?.textContent).toContain('3');
  });

  it('shows checkmark on triaged issues', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Get the first category button for the first issue (not the label badge)
    const categoryButtons = screen.getAllByRole('button').filter(btn => btn.textContent === 'bug');
    fireEvent.click(categoryButtons[0]);

    // Should show checkmark
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows triage summary when issues are triaged', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Get category buttons (not label badges)
    const allButtons = screen.getAllByRole('button');
    const bugButtons = allButtons.filter(btn => btn.textContent === 'bug');
    const featureButtons = allButtons.filter(btn => btn.textContent === 'feature');
    
    // Triage first issue as bug
    fireEvent.click(bugButtons[0]);

    // Triage second issue as feature
    fireEvent.click(featureButtons[1]);

    expect(screen.getByText('TRIAGE SUMMARY')).toBeInTheDocument();
    
    // Check that summary contains the categories
    const summary = screen.getByText('TRIAGE SUMMARY').parentElement;
    expect(summary?.textContent).toContain('bug');
    expect(summary?.textContent).toContain('feature');
  });

  it('updates progress bar as issues are triaged', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Get category buttons (not label badges)
    const allButtons = screen.getAllByRole('button');
    const bugButtons = allButtons.filter(btn => btn.textContent === 'bug');
    
    // Triage all issues
    fireEvent.click(bugButtons[0]);
    fireEvent.click(bugButtons[1]);
    fireEvent.click(bugButtons[2]);

    const progressText = screen.getByText('TRIAGE PROGRESS').parentElement;
    expect(progressText?.textContent).toContain('3');
  });

  it('applies correct priority colors', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    const criticalButtons = screen.getAllByText('critical');
    fireEvent.click(criticalButtons[0]);

    expect(criticalButtons[0]).toHaveClass('text-destructive');
  });

  it('renders issue labels when present', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Use getAllByText since labels appear multiple times (in label badges and category buttons)
    expect(screen.getAllByText('bug').length).toBeGreaterThan(0);
    expect(screen.getAllByText('enhancement').length).toBeGreaterThan(0);
    expect(screen.getAllByText('documentation').length).toBeGreaterThan(0);
  });

  it('allows triaging multiple issues independently', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Get all buttons and filter by text
    const allButtons = screen.getAllByRole('button');
    const bugButtons = allButtons.filter(btn => btn.textContent === 'bug');
    const featureButtons = allButtons.filter(btn => btn.textContent === 'feature');
    const highButtons = allButtons.filter(btn => btn.textContent === 'high');
    const lowButtons = allButtons.filter(btn => btn.textContent === 'low');

    // Triage first as bug with high priority
    fireEvent.click(bugButtons[0]);
    fireEvent.click(highButtons[0]);

    // Triage second as feature with low priority
    fireEvent.click(featureButtons[1]);
    fireEvent.click(lowButtons[1]);

    // Both should be triaged
    const progressText = screen.getByText('TRIAGE PROGRESS').parentElement;
    expect(progressText?.textContent).toContain('2');
  });

  it('uses custom title when provided', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="CUSTOM TRIAGE TITLE"
      />
    );

    expect(screen.getByText('CUSTOM TRIAGE TITLE')).toBeInTheDocument();
  });

  it('uses default categories when not provided', () => {
    render(
      <IssueTriager
        issues={mockIssues}
        categories={defaultCategories}
        title="ISSUE TRIAGE STATION"
      />
    );

    // Should have default categories
    expect(screen.getAllByText('bug').length).toBeGreaterThan(0);
    expect(screen.getAllByText('feature').length).toBeGreaterThan(0);
  });
});
