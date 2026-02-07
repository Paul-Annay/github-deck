import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReleaseNoteBuilder } from '../ReleaseNoteBuilder';

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

describe('ReleaseNoteBuilder', () => {
  const mockPRs = [
    {
      number: 201,
      title: 'Add user authentication',
      user: { login: 'alice' },
      merged_at: '2024-01-15T12:00:00Z',
      html_url: 'https://github.com/test/repo/pull/201',
      labels: [{ name: 'feature', color: '00ff00' }],
    },
    {
      number: 202,
      title: 'Fix memory leak in data processing',
      user: { login: 'bob' },
      merged_at: '2024-01-16T12:00:00Z',
      html_url: 'https://github.com/test/repo/pull/202',
      labels: [{ name: 'bug', color: 'ff0000' }],
    },
    {
      number: 203,
      title: 'Update API documentation',
      user: { login: 'charlie' },
      merged_at: '2024-01-17T12:00:00Z',
      html_url: 'https://github.com/test/repo/pull/203',
      labels: [{ name: 'docs', color: '0000ff' }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no PRs provided', () => {
    render(
      <ReleaseNoteBuilder
        prs={[]}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    expect(screen.getByText('NO MERGED PRS AVAILABLE')).toBeInTheDocument();
  });

  it('renders all PRs with checkboxes', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    expect(screen.getByText('#201 Add user authentication')).toBeInTheDocument();
    expect(screen.getByText('#202 Fix memory leak in data processing')).toBeInTheDocument();
    expect(screen.getByText('#203 Update API documentation')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);
  });

  it('shows version in title when provided', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="2.5.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    expect(screen.getByText('v2.5.0')).toBeInTheDocument();
  });

  it('shows selection count', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    // Text is split across elements, check parent container
    const container = screen.getByText('RELEASE NOTE BUILDER').parentElement?.parentElement;
    expect(container?.textContent).toContain('0 of 3 PRs selected');
  });

  it('allows selecting individual PRs', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const container = screen.getByText('RELEASE NOTE BUILDER').parentElement?.parentElement;
    expect(container?.textContent).toContain('1 of 3 PRs selected');
  });

  it('shows category buttons when PR is selected', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText('features')).toBeInTheDocument();
    expect(screen.getByText('fixes')).toBeInTheDocument();
    expect(screen.getByText('improvements')).toBeInTheDocument();
    expect(screen.getByText('breaking')).toBeInTheDocument();
    expect(screen.getByText('docs')).toBeInTheDocument();
    expect(screen.getByText('other')).toBeInTheDocument();
  });

  it('allows categorizing selected PRs', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const featuresButton = screen.getByText('features');
    fireEvent.click(featuresButton);

    expect(featuresButton).toHaveClass('border-neon-cyan');
  });

  it('allows adding custom descriptions', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const descInput = screen.getByPlaceholderText('Add user authentication');
    fireEvent.change(descInput, { target: { value: 'Implemented OAuth2 authentication' } });

    expect(descInput).toHaveValue('Implemented OAuth2 authentication');
  });

  it('selects all PRs when Select All is clicked', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    const container = screen.getByText('RELEASE NOTE BUILDER').parentElement?.parentElement;
    expect(container?.textContent).toContain('3 of 3 PRs selected');
  });

  it('clears all selections when Clear is clicked', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    const container = screen.getByText('RELEASE NOTE BUILDER').parentElement?.parentElement;
    expect(container?.textContent).toContain('0 of 3 PRs selected');
  });

  it('shows preview when PRs are selected', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText('RELEASE NOTES PREVIEW')).toBeInTheDocument();
  });

  it('generates markdown with correct format', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="2.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Categorize as feature
    const featuresButton = screen.getByText('features');
    fireEvent.click(featuresButton);

    // Preview should contain release version - check in the preview section
    const preview = screen.getByText('RELEASE NOTES PREVIEW');
    expect(preview).toBeInTheDocument();
    
    // Check that version appears in the markdown
    expect(screen.getByText(/# Release 2\.0\.0/)).toBeInTheDocument();
  });

  it('copies markdown to clipboard when Copy Markdown is clicked', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const copyButton = screen.getByText('Copy Markdown');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('disables Copy Markdown when no PRs selected', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const copyButton = screen.getByText('Copy Markdown');
    expect(copyButton).toBeDisabled();
  });

  it('groups PRs by category in preview', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    // Select and categorize multiple PRs
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const featuresButtons = screen.getAllByText('features');
    fireEvent.click(featuresButtons[0]);

    const fixesButtons = screen.getAllByText('fixes');
    fireEvent.click(fixesButtons[1]);

    // Preview should show both categories
    expect(screen.getByText(/✨ New Features/)).toBeInTheDocument();
    expect(screen.getByText(/🐛 Bug Fixes/)).toBeInTheDocument();
  });

  it('uses custom description in preview when provided', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const descInput = screen.getByPlaceholderText('Add user authentication');
    fireEvent.change(descInput, { target: { value: 'Custom description' } });

    // Preview should contain custom description
    expect(screen.getByText(/Custom description/)).toBeInTheDocument();
  });

  it('includes PR number and author in preview', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const featuresButton = screen.getAllByText('features')[0];
    fireEvent.click(featuresButton);

    // Preview should contain PR number and author
    const preview = screen.getByText('RELEASE NOTES PREVIEW').parentElement;
    expect(preview?.textContent).toContain('#201');
    expect(preview?.textContent).toContain('@alice');
  });

  it('handles PRs without user gracefully', () => {
    const prsWithoutUser = [
      {
        ...mockPRs[0],
        user: null,
      },
    ];

    render(
      <ReleaseNoteBuilder
        prs={prsWithoutUser}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Should show "unknown" for missing user
    const prCard = screen.getByText('#201 Add user authentication').parentElement?.parentElement;
    expect(prCard?.textContent).toContain('@unknown');
  });

  it('maintains selection state when toggling PRs', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        version="1.0.0"
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    
    // Select first PR
    fireEvent.click(checkboxes[0]);
    let container = screen.getByText('RELEASE NOTE BUILDER').parentElement?.parentElement;
    expect(container?.textContent).toContain('1 of 3 PRs selected');

    // Deselect first PR
    fireEvent.click(checkboxes[0]);
    container = screen.getByText('RELEASE NOTE BUILDER').parentElement?.parentElement;
    expect(container?.textContent).toContain('0 of 3 PRs selected');
  });

  it('uses default version placeholder when not provided', () => {
    render(
      <ReleaseNoteBuilder
        prs={mockPRs}
        title="RELEASE NOTE BUILDER"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Preview should contain default version
    expect(screen.getByText(/# Release vX\.X\.X/)).toBeInTheDocument();
  });
});
