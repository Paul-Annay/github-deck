"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

const repoInputSchema = z.object({
  owner: z.string().describe("Repository owner/organization"),
  repo: z.string().describe("Repository name"),
});

const comparisonBuilderSchema = z.object({
  repositories: z.array(repoInputSchema).describe("List of repositories to compare"),
  maxRepos: z.number().default(3).describe("Maximum number of repositories allowed"),
});

type RepoInput = z.infer<typeof repoInputSchema>;
type ComparisonBuilderProps = z.infer<typeof comparisonBuilderSchema>;

function ComparisonBuilderBase(props: ComparisonBuilderProps) {
  const [newOwner, setNewOwner] = useState("");
  const [newRepo, setNewRepo] = useState("");
  
  // Use props directly instead of local state
  const repos = props.repositories || [];

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({ repositories: repos, count: repos.length }));

  const addRepo = () => {
    if (newOwner && newRepo && repos.length < props.maxRepos) {
      // Note: In a real implementation with interactables, this would trigger
      // a prop update from the parent/AI. For now, we just clear inputs.
      setNewOwner("");
      setNewRepo("");
    }
  };

  const removeRepo = (index: number) => {
    // Note: In a real implementation with interactables, this would trigger
    // a prop update from the parent/AI to remove the repo.
    console.log('Remove repo at index:', index);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addRepo();
    }
  };

  return (
    <div className="border border-border bg-background/50 backdrop-blur-sm">
      <div className="border-b border-border bg-background/80 px-4 py-2">
        <h3 className="text-xs font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
          COMPARISON BUILDER
        </h3>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Current Repositories */}
        {repos.length > 0 && (
          <div className="space-y-2 mb-4">
            {repos.map((repo, index) => (
              <div
                key={`${repo.owner}/${repo.repo}`}
                className="flex items-center justify-between px-3 py-2 border border-neon-cyan/30 bg-neon-cyan/5 animate-in fade-in slide-in-from-left duration-300"
              >
                <div className="flex items-center gap-2">
                  <span className="text-neon-cyan font-mono text-xs font-bold">
                    {index + 1}.
                  </span>
                  <span className="font-mono text-sm text-foreground">
                    {repo.owner}/{repo.repo}
                  </span>
                </div>
                <button
                  onClick={() => removeRepo(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                  aria-label="Remove repository"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Repository */}
        {repos.length < props.maxRepos && (
          <div className="space-y-2">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Add Repository {repos.length > 0 && `(${repos.length}/${props.maxRepos})`}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="owner"
                className="flex-1 px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-neon-cyan transition-colors"
              />
              <span className="text-muted-foreground self-center">/</span>
              <input
                type="text"
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="repo"
                className="flex-1 px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-neon-cyan transition-colors"
              />
            </div>
            <button
              onClick={addRepo}
              disabled={!newOwner || !newRepo}
              className={cn(
                "w-full px-3 py-2 border font-mono text-xs font-bold tracking-wider uppercase transition-all",
                newOwner && newRepo
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20"
                  : "border-border bg-background/50 text-muted-foreground cursor-not-allowed"
              )}
            >
              + ADD REPOSITORY
            </button>
          </div>
        )}

        {/* Status */}
        {repos.length === 0 && (
          <div className="text-center py-6 text-muted-foreground/50">
            <div className="text-2xl mb-2">⊕</div>
            <p className="font-mono text-xs tracking-widest">NO TARGETS SELECTED</p>
          </div>
        )}

        {repos.length >= props.maxRepos && (
          <div className="text-center py-2 text-amber-400 border border-amber-400/30 bg-amber-400/5">
            <p className="font-mono text-xs tracking-wider">MAXIMUM CAPACITY REACHED</p>
          </div>
        )}

        {repos.length >= 2 && (
          <div className="text-center py-2 text-neon-cyan border border-neon-cyan/30 bg-neon-cyan/5">
            <p className="font-mono text-xs tracking-wider">✓ READY FOR COMPARISON</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const ComparisonBuilder = withInteractable(ComparisonBuilderBase, {
  componentName: "ComparisonBuilder",
  description: "Allows users to build a list of repositories to compare. Users can add/remove repos manually, and AI can pre-fill or suggest repositories based on conversation. When 2+ repos are added, AI should trigger a comparison.",
  propsSchema: comparisonBuilderSchema,
});

export { comparisonBuilderSchema };
