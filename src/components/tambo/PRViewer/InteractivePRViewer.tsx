"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState, useMemo } from "react";
import { z } from "zod";
import { PRViewer, prViewerSchema, PRItem } from "./PRViewer";
import { cn } from "@/lib/utils";

// Extend the base schema with interactive features
const interactivePRViewerSchema = prViewerSchema.extend({
  enableFiltering: z.boolean().default(true).describe("Allow users to filter PRs"),
  enableSorting: z.boolean().default(true).describe("Allow users to sort PRs"),
  enableSelection: z.boolean().default(false).describe("Allow users to select PRs for batch operations"),
});

type InteractivePRViewerProps = z.infer<typeof interactivePRViewerSchema>;

type SortOption = "newest" | "oldest" | "most-changed" | "most-comments";
type FilterState = "all" | "open" | "closed" | "merged" | "draft";

function InteractivePRViewerBase(props: InteractivePRViewerProps) {
  const [filterState, setFilterState] = useState<FilterState>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedPRs, setSelectedPRs] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort PRs
  const filteredAndSortedPRs = useMemo(() => {
    if (!props.prs) return [];

    let filtered = [...props.prs];

    // Apply state filter
    if (filterState !== "all") {
      filtered = filtered.filter(pr => {
        if (filterState === "merged") return pr.merged_at !== null && pr.merged_at !== undefined;
        if (filterState === "draft") return pr.draft === true;
        return pr.state === filterState;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pr => 
        pr.title.toLowerCase().includes(query) ||
        pr.number.toString().includes(query) ||
        pr.user?.login.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "most-changed":
          const aChanges = (a.additions || 0) + (a.deletions || 0);
          const bChanges = (b.additions || 0) + (b.deletions || 0);
          return bChanges - aChanges;
        case "most-comments":
          // Note: Would need comments count in the data
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [props.prs, filterState, sortBy, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    const additions = filteredAndSortedPRs.reduce((sum, pr) => sum + (pr.additions || 0), 0);
    const deletions = filteredAndSortedPRs.reduce((sum, pr) => sum + (pr.deletions || 0), 0);
    return { additions, deletions };
  }, [filteredAndSortedPRs]);

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({
    filterState,
    sortBy,
    selectedPRs: Array.from(selectedPRs),
    searchQuery,
    filteredCount: filteredAndSortedPRs.length,
  }));

  const togglePRSelection = (prNumber: number) => {
    setSelectedPRs(prev => {
      const next = new Set(prev);
      if (next.has(prNumber)) {
        next.delete(prNumber);
      } else {
        next.add(prNumber);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPRs(new Set(filteredAndSortedPRs.map(pr => pr.number)));
  };

  const clearSelection = () => {
    setSelectedPRs(new Set());
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="border border-border bg-background/50 p-3 space-y-3">
        {/* Search */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PRs by title, number, or author..."
            className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-neon-cyan transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* State Filter */}
          {props.enableFiltering && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider self-center">
                Status:
              </span>
              {(["all", "open", "closed", "merged", "draft"] as const).map(state => (
                <button
                  key={state}
                  onClick={() => setFilterState(state)}
                  className={cn(
                    "px-2 py-1 text-xs font-mono border transition-all uppercase",
                    filterState === state
                      ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                      : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                  )}
                >
                  {state}
                </button>
              ))}
            </div>
          )}

          {/* Sort Options */}
          {props.enableSorting && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider self-center">
                Sort:
              </span>
              {(["newest", "oldest", "most-changed"] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={cn(
                    "px-2 py-1 text-xs font-mono border transition-all",
                    sortBy === sort
                      ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                      : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                  )}
                >
                  {sort.replace("-", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selection Controls */}
        {props.enableSelection && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-xs font-mono text-muted-foreground">
              {selectedPRs.size > 0 ? (
                <span className="text-neon-cyan">
                  {selectedPRs.size} PR{selectedPRs.size !== 1 ? "s" : ""} selected
                </span>
              ) : (
                "No PRs selected"
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={filteredAndSortedPRs.length === 0}
                className="px-2 py-1 text-xs font-mono border border-border bg-background/50 text-foreground hover:border-neon-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                disabled={selectedPRs.size === 0}
                className="px-2 py-1 text-xs font-mono border border-border bg-background/50 text-foreground hover:border-destructive/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>Showing {filteredAndSortedPRs.length} of {props.prs?.length || 0} PRs</span>
          {(totals.additions > 0 || totals.deletions > 0) && (
            <span className="flex gap-2">
              <span className="text-green-400">+{totals.additions}</span>
              <span className="text-destructive">-{totals.deletions}</span>
            </span>
          )}
        </div>
      </div>

      {/* PR List */}
      {filteredAndSortedPRs.length === 0 ? (
        <div className="border border-border bg-background/50 p-8 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            No PRs match the current filters
          </p>
        </div>
      ) : (
        <PRViewer {...props} prs={filteredAndSortedPRs} />
      )}

      {/* Selection Summary */}
      {props.enableSelection && selectedPRs.size > 0 && (
        <div className="border border-neon-cyan/30 bg-neon-cyan/5 p-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="text-xs font-mono">
            <div className="text-neon-cyan font-bold mb-2">SELECTED PRs</div>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedPRs).map(prNum => (
                <span
                  key={prNum}
                  className="px-2 py-1 border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan"
                >
                  #{prNum}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const InteractivePRViewer = withInteractable(InteractivePRViewerBase, {
  componentName: "InteractivePRViewer",
  description: "An interactive PR viewer that allows users to filter by state, sort by various criteria, search PRs, and optionally select multiple PRs. AI can see user selections and respond accordingly.",
  propsSchema: interactivePRViewerSchema,
});

export { interactivePRViewerSchema };
