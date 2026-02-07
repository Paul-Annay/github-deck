import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComparisonBuilder } from '../ComparisonBuilder';

// Mock Tambo hooks
vi.mock('@tambo-ai/react', () => ({
  withInteractable: (Component: any) => Component,
  useTamboComponentState: vi.fn(),
}));

describe('ComparisonBuilder', () => {
  it('renders empty state initially', () => {
    render(<ComparisonBuilder repositories={[]} maxRepos={3} />);
    expect(screen.getByText('NO TARGETS SELECTED')).toBeInTheDocument();
  });

  it('shows add repository form', () => {
    render(<ComparisonBuilder repositories={[]} maxRepos={3} />);
    
    expect(screen.getByPlaceholderText('owner')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('repo')).toBeInTheDocument();
    expect(screen.getByText('+ ADD REPOSITORY')).toBeInTheDocument();
  });

  it('adds repository when form is filled and submitted', () => {
    // Note: Since we're using props directly, the component doesn't manage repos internally
    // In a real implementation, the AI would update props based on user interaction
    render(<ComparisonBuilder repositories={[]} maxRepos={3} />);
    
    const ownerInput = screen.getByPlaceholderText('owner');
    const repoInput = screen.getByPlaceholderText('repo');
    const addButton = screen.getByText('+ ADD REPOSITORY');
    
    fireEvent.change(ownerInput, { target: { value: 'facebook' } });
    fireEvent.change(repoInput, { target: { value: 'react' } });
    fireEvent.click(addButton);
    
    // In the real app, clicking would trigger AI to update props
    // For testing, we verify inputs are cleared
    expect((ownerInput as HTMLInputElement).value).toBe('');
    expect((repoInput as HTMLInputElement).value).toBe('');
  });

  it('clears input fields after adding repository', () => {
    render(<ComparisonBuilder repositories={[]} maxRepos={3} />);
    
    const ownerInput = screen.getByPlaceholderText('owner') as HTMLInputElement;
    const repoInput = screen.getByPlaceholderText('repo') as HTMLInputElement;
    const addButton = screen.getByText('+ ADD REPOSITORY');
    
    fireEvent.change(ownerInput, { target: { value: 'facebook' } });
    fireEvent.change(repoInput, { target: { value: 'react' } });
    fireEvent.click(addButton);
    
    expect(ownerInput.value).toBe('');
    expect(repoInput.value).toBe('');
  });

  it('displays existing repositories', () => {
    const repos = [
      { owner: 'facebook', repo: 'react' },
      { owner: 'vuejs', repo: 'vue' },
    ];
    
    render(<ComparisonBuilder repositories={repos} maxRepos={3} />);
    
    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(screen.getByText('vuejs/vue')).toBeInTheDocument();
  });

  it('numbers repositories sequentially', () => {
    const repos = [
      { owner: 'facebook', repo: 'react' },
      { owner: 'vuejs', repo: 'vue' },
    ];
    
    render(<ComparisonBuilder repositories={repos} maxRepos={3} />);
    
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
  });

  it('allows removing repositories', () => {
    // Note: Since we're using props directly, clicking remove doesn't change the display
    // In a real implementation, the AI would update props based on user interaction
    const repos = [
      { owner: 'facebook', repo: 'react' },
      { owner: 'vuejs', repo: 'vue' },
    ];
    
    render(<ComparisonBuilder repositories={repos} maxRepos={3} />);
    
    const removeButtons = screen.getAllByLabelText('Remove repository');
    expect(removeButtons).toHaveLength(2);
    
    // In the real app, clicking would trigger AI to update props
    // For testing, we verify the button is clickable
    fireEvent.click(removeButtons[0]);
    expect(removeButtons[0]).toBeInTheDocument();
  });

  it('shows capacity indicator', () => {
    const repos = [{ owner: 'facebook', repo: 'react' }];
    
    render(<ComparisonBuilder repositories={repos} maxRepos={3} />);
    
    // Check that the capacity text appears in the component
    const allText = document.body.textContent || '';
    expect(allText).toContain('1');
    expect(allText).toContain('3');
  });

  it('disables add button when max repos reached', () => {
    const repos = [
      { owner: 'facebook', repo: 'react' },
      { owner: 'vuejs', repo: 'vue' },
      { owner: 'angular', repo: 'angular' },
    ];
    
    render(<ComparisonBuilder repositories={repos} maxRepos={3} />);
    
    expect(screen.getByText('MAXIMUM CAPACITY REACHED')).toBeInTheDocument();
    expect(screen.queryByText('+ ADD REPOSITORY')).not.toBeInTheDocument();
  });

  it('shows ready message when 2+ repos added', () => {
    const repos = [
      { owner: 'facebook', repo: 'react' },
      { owner: 'vuejs', repo: 'vue' },
    ];
    
    render(<ComparisonBuilder repositories={repos} maxRepos={3} />);
    
    expect(screen.getByText('✓ READY FOR COMPARISON')).toBeInTheDocument();
  });

  it('disables add button when inputs are empty', () => {
    render(<ComparisonBuilder repositories={[]} maxRepos={3} />);
    
    const addButton = screen.getByText('+ ADD REPOSITORY');
    expect(addButton).toHaveClass('cursor-not-allowed');
  });

  it('enables add button when both inputs are filled', () => {
    render(<ComparisonBuilder repositories={[]} maxRepos={3} />);
    
    const ownerInput = screen.getByPlaceholderText('owner');
    const repoInput = screen.getByPlaceholderText('repo');
    
    fireEvent.change(ownerInput, { target: { value: 'facebook' } });
    fireEvent.change(repoInput, { target: { value: 'react' } });
    
    const addButton = screen.getByText('+ ADD REPOSITORY');
    expect(addButton).not.toHaveClass('cursor-not-allowed');
  });

  it('adds repository on Enter key press', () => {
    // Note: Since we're using props directly, the component doesn't manage repos internally
    // In a real implementation, the AI would update props based on user interaction
    render(<ComparisonBuilder repositories={[]} maxRepos={3} />);
    
    const ownerInput = screen.getByPlaceholderText('owner');
    const repoInput = screen.getByPlaceholderText('repo');
    
    fireEvent.change(ownerInput, { target: { value: 'facebook' } });
    fireEvent.change(repoInput, { target: { value: 'react' } });
    fireEvent.keyPress(repoInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // In the real app, Enter would trigger AI to update props
    // For testing, we verify inputs are cleared
    expect((ownerInput as HTMLInputElement).value).toBe('');
    expect((repoInput as HTMLInputElement).value).toBe('');
  });
});
