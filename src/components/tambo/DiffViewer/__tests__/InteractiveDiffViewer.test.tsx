import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveDiffViewer } from '../InteractiveDiffViewer';

// Mock Tambo hooks
vi.mock('@tambo-ai/react', () => ({
  withInteractable: (Component: any) => Component,
  useTamboComponentState: vi.fn(),
}));

describe('InteractiveDiffViewer', () => {
  const mockFiles = [
    {
      filename: 'src/components/Button.tsx',
      status: 'modified',
      additions: 15,
      deletions: 5,
      changes: 20,
      patch: '@@ -1,5 +1,5 @@\n-old line\n+new line',
    },
    {
      filename: 'src/utils/helpers.ts',
      status: 'added',
      additions: 50,
      deletions: 0,
      changes: 50,
      patch: '@@ -0,0 +1,50 @@\n+new file content',
    },
    {
      filename: 'src/legacy/old.js',
      status: 'removed',
      additions: 0,
      deletions: 30,
      changes: 30,
    },
    {
      filename: 'README.md',
      status: 'renamed',
      additions: 2,
      deletions: 2,
      changes: 4,
      previous_filename: 'README.txt',
    },
  ];

  it('renders search input when enabled', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={true}
        enableSearch={true}
        enableViewToggle={false}
      />
    );

    expect(screen.getByPlaceholderText(/search files/i)).toBeInTheDocument();
  });

  it('renders status filter buttons with counts', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={true}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    // Check for status buttons - use getAllByRole to get buttons
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(btn => btn.textContent?.toLowerCase());
    
    expect(buttonTexts.some(text => text?.includes('all'))).toBe(true);
    expect(buttonTexts.some(text => text?.includes('added'))).toBe(true);
    expect(buttonTexts.some(text => text?.includes('removed'))).toBe(true);
    expect(buttonTexts.some(text => text?.includes('modified'))).toBe(true);
    expect(buttonTexts.some(text => text?.includes('renamed'))).toBe(true);
  });

  it('filters files by status', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={true}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    // Find button by text content
    const buttons = screen.getAllByRole('button');
    const addedButton = buttons.find(btn => btn.textContent?.toUpperCase().includes('ADDED'));
    expect(addedButton).toBeDefined();
    fireEvent.click(addedButton!);

    // After clicking, button should be highlighted
    expect(addedButton).toHaveClass('border-neon-cyan');
  });

  it('searches files by filename', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={true}
        enableViewToggle={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search files/i);
    fireEvent.change(searchInput, { target: { value: 'Button' } });

    const container = screen.getByText(/showing/i).parentElement;
    expect(container?.textContent).toContain('1');
    expect(container?.textContent).toContain('4');
  });

  it('searches files by path', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={true}
        enableViewToggle={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search files/i);
    fireEvent.change(searchInput, { target: { value: 'src/utils' } });

    const container = screen.getByText(/showing/i).parentElement;
    expect(container?.textContent).toContain('1');
    expect(container?.textContent).toContain('4');
  });

  it('renders view toggle buttons when enabled', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={false}
        enableViewToggle={true}
      />
    );

    expect(screen.getByText('Split View')).toBeInTheDocument();
    expect(screen.getByText('Unified View')).toBeInTheDocument();
  });

  it('toggles between split and unified view', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={false}
        enableViewToggle={true}
      />
    );

    const unifiedButton = screen.getByText('Unified View');
    fireEvent.click(unifiedButton);

    expect(unifiedButton).toHaveClass('border-neon-cyan');
  });

  it('renders expand/collapse all button', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    expect(screen.getByText('Expand All')).toBeInTheDocument();
  });

  it('toggles expand all button text', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    const expandButton = screen.getByText('Expand All');
    fireEvent.click(expandButton);

    expect(screen.getByText('Collapse All')).toBeInTheDocument();
  });

  it('shows total additions and deletions', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    // Total additions: 15 + 50 + 0 + 2 = 67
    // Total deletions: 5 + 0 + 30 + 2 = 37
    // Text might be split, check for presence in document
    const allText = document.body.textContent || '';
    expect(allText).toContain('+67');
    expect(allText).toContain('-37');
  });

  it('combines filter and search correctly', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={true}
        enableSearch={true}
        enableViewToggle={false}
      />
    );

    // Filter by modified
    const buttons = screen.getAllByRole('button');
    const modifiedButton = buttons.find(btn => btn.textContent?.includes('MODIFIED'));
    expect(modifiedButton).toBeDefined();
    fireEvent.click(modifiedButton!);

    // Then search for "Button"
    const searchInput = screen.getByPlaceholderText(/search files/i);
    fireEvent.change(searchInput, { target: { value: 'Button' } });

    // Should show 1 of 4 files
    const container = screen.getByText(/showing/i).parentElement;
    expect(container?.textContent).toContain('1');
    expect(container?.textContent).toContain('4');
  });

  it('shows no match message when filters return empty', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={true}
        enableViewToggle={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search files/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No files match the current filters')).toBeInTheDocument();
  });

  it('updates additions/deletions when filtering', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={true}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    // Filter to only show added files
    const buttons = screen.getAllByRole('button');
    const addedButton = buttons.find(btn => btn.textContent?.includes('ADDED'));
    expect(addedButton).toBeDefined();
    fireEvent.click(addedButton!);

    // Should only show additions from added file (50)
    const allText = document.body.textContent || '';
    expect(allText).toContain('+50');
    expect(allText).toContain('-0');
  });

  it('handles files without patches gracefully', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    // File without patch should still render
    expect(screen.getByText('src/legacy/old.js')).toBeInTheDocument();
  });

  it('searches by previous filename for renamed files', () => {
    render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={false}
        enableSearch={true}
        enableViewToggle={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search files/i);
    fireEvent.change(searchInput, { target: { value: 'README.txt' } });

    // Should find the renamed file by its previous name
    const container = screen.getByText(/showing/i).parentElement;
    expect(container?.textContent).toContain('1');
    expect(container?.textContent).toContain('4');
  });

  it('handles empty file list', () => {
    render(
      <InteractiveDiffViewer
        files={[]}
        enableFiltering={true}
        enableSearch={true}
        enableViewToggle={true}
      />
    );

    const container = screen.getByText(/showing/i).parentElement;
    expect(container?.textContent).toContain('0');
  });

  it('maintains filter state across re-renders', () => {
    const { rerender } = render(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={true}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    // Apply filter
    const buttons = screen.getAllByRole('button');
    const addedButton = buttons.find(btn => btn.textContent?.toUpperCase().includes('ADDED'));
    expect(addedButton).toBeDefined();
    fireEvent.click(addedButton!);

    // Re-render
    rerender(
      <InteractiveDiffViewer
        files={mockFiles}
        enableFiltering={true}
        enableSearch={false}
        enableViewToggle={false}
      />
    );

    // Button should still be highlighted
    const buttonsAfter = screen.getAllByRole('button');
    const addedButtonAfter = buttonsAfter.find(btn => btn.textContent?.toUpperCase().includes('ADDED'));
    expect(addedButtonAfter).toHaveClass('border-neon-cyan');
  });
});
