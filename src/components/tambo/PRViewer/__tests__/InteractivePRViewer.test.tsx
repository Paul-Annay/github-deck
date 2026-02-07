import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractivePRViewer } from '../InteractivePRViewer';

// Mock Tambo hooks
vi.mock('@tambo-ai/react', () => ({
  withInteractable: (Component: any) => Component,
  useTamboComponentState: vi.fn(),
}));

describe('InteractivePRViewer', () => {
  const mockPRs = [
    {
      number: 123,
      title: 'Add new feature',
      state: 'open' as const,
      user: { login: 'alice', avatar_url: 'https://example.com/alice.png' },
      created_at: '2024-01-15T10:00:00Z',
      merged_at: null,
      html_url: 'https://github.com/test/repo/pull/123',
      additions: 150,
      deletions: 50,
      changed_files: 5,
      labels: [{ name: 'feature', color: '00ff00' }],
      draft: false,
    },
    {
      number: 124,
      title: 'Fix critical bug',
      state: 'closed' as const,
      user: { login: 'bob', avatar_url: 'https://example.com/bob.png' },
      created_at: '2024-01-14T10:00:00Z',
      merged_at: '2024-01-15T12:00:00Z',
      html_url: 'https://github.com/test/repo/pull/124',
      additions: 20,
      deletions: 10,
      changed_files: 2,
      labels: [{ name: 'bug', color: 'ff0000' }],
      draft: false,
    },
    {
      number: 125,
      title: 'Draft PR for testing',
      state: 'open' as const,
      user: { login: 'charlie', avatar_url: 'https://example.com/charlie.png' },
      created_at: '2024-01-16T10:00:00Z',
      merged_at: null,
      html_url: 'https://github.com/test/repo/pull/125',
      additions: 100,
      deletions: 80,
      changed_files: 8,
      labels: [],
      draft: true,
    },
  ];

  it('renders search input when search is enabled', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    expect(screen.getByPlaceholderText(/search prs/i)).toBeInTheDocument();
  });

  it('renders status filter buttons', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    // Text is split across elements and may be lowercase, check for presence
    const allText = (document.body.textContent || '').toUpperCase();
    expect(allText).toContain('ALL');
    expect(allText).toContain('OPEN');
    expect(allText).toContain('CLOSED');
    expect(allText).toContain('MERGED');
    expect(allText).toContain('DRAFT');
  });

  it('filters PRs by status', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    // Click on "OPEN" filter - find button by text content (case insensitive)
    const buttons = screen.getAllByRole('button');
    const openButton = buttons.find(btn => btn.textContent?.toUpperCase().includes('OPEN'));
    expect(openButton).toBeDefined();
    fireEvent.click(openButton!);

    // Should show 2 of 3 PRs
    const container = screen.getByText(/showing/i).parentElement;
    expect(container?.textContent).toContain('2');
    expect(container?.textContent).toContain('3');
  });

  it('searches PRs by title', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search prs/i);
    fireEvent.change(searchInput, { target: { value: 'feature' } });

    // Should show 1 of 3 PRs
    expect(screen.getByText('Showing 1 of 3 PRs')).toBeInTheDocument();
  });

  it('searches PRs by number', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search prs/i);
    fireEvent.change(searchInput, { target: { value: '124' } });

    expect(screen.getByText('Showing 1 of 3 PRs')).toBeInTheDocument();
  });

  it('searches PRs by author', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search prs/i);
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(screen.getByText('Showing 1 of 3 PRs')).toBeInTheDocument();
  });

  it('renders sort options', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    expect(screen.getByText('newest')).toBeInTheDocument();
    expect(screen.getByText('oldest')).toBeInTheDocument();
    expect(screen.getByText('most changed')).toBeInTheDocument();
  });

  it('sorts PRs by newest first (default)', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    // Newest button should be highlighted by default
    const newestButton = screen.getByText('newest');
    expect(newestButton).toHaveClass('border-neon-cyan');
  });

  it('changes sort order when clicking sort buttons', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    const oldestButton = screen.getByText('oldest');
    fireEvent.click(oldestButton);

    expect(oldestButton).toHaveClass('border-neon-cyan');
  });

  it('renders selection controls when enabled', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={true}
      />
    );

    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('shows selection count when PRs are selected', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={true}
      />
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    expect(screen.getByText('3 PRs selected')).toBeInTheDocument();
  });

  it('clears selection when Clear button is clicked', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={true}
      />
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    expect(screen.getByText('3 PRs selected')).toBeInTheDocument();

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(screen.getByText('No PRs selected')).toBeInTheDocument();
  });

  it('shows selected PRs summary when selection is enabled', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={true}
      />
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    // Should show summary with PR numbers
    expect(screen.getByText('SELECTED PRs')).toBeInTheDocument();
    expect(screen.getByText('#123')).toBeInTheDocument();
    expect(screen.getByText('#124')).toBeInTheDocument();
    expect(screen.getByText('#125')).toBeInTheDocument();
  });

  it('combines filters and search correctly', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    // Filter by open
    const buttons = screen.getAllByRole('button');
    const openButton = buttons.find(btn => btn.textContent?.toUpperCase().includes('OPEN'));
    expect(openButton).toBeDefined();
    fireEvent.click(openButton!);

    // Then search for "feature"
    const searchInput = screen.getByPlaceholderText(/search prs/i);
    fireEvent.change(searchInput, { target: { value: 'feature' } });

    // Should show 1 of 3 PRs (only the open PR with "feature" in title)
    const container = screen.getByText(/showing/i).parentElement;
    expect(container?.textContent).toContain('1');
    expect(container?.textContent).toContain('3');
  });

  it('shows no results message when filters match nothing', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search prs/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/no.*match/i)).toBeInTheDocument();
  });

  it('calculates total additions and deletions correctly', () => {
    render(
      <InteractivePRViewer
        prs={mockPRs}
        enableFiltering={true}
        enableSorting={true}
        enableSelection={false}
      />
    );

    // Total additions: 150 + 20 + 100 = 270
    // Total deletions: 50 + 10 + 80 = 140
    const allText = document.body.textContent || '';
    expect(allText).toContain('+270');
    expect(allText).toContain('-140');
  });
});
