"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { prViewerSchema, PRItem } from "./PRViewer";
import { cn } from "@/lib/utils";

// Import PRCard component from PRViewer
const PRCard: React.FC<{ pr: PRItem }> = ({ pr }) => {
  const isMerged = pr.merged_at !== null && pr.merged_at !== undefined;
  const isClosed = pr.state === "closed";
  const isDraft = pr.draft ?? false;

  const statusColor = isMerged 
    ? "text-purple-400 border-purple-400/30 bg-purple-400/5"
    : isClosed 
    ? "text-destructive border-destructive/30 bg-destructive/5"
    : isDraft
    ? "text-muted-foreground border-muted-foreground/30 bg-muted/5"
    : "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5";

  const statusLabel = isMerged ? "MERGED" : isClosed ? "CLOSED" : isDraft ? "DRAFT" : "OPEN";

  const userLogin = pr.user?.login ?? "unknown";
  let userAvatar = pr.user?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=32`;
  
  try {
    new URL(userAvatar);
  } catch {
    userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=32`;
  }

  return (
    <a
      href={pr.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block p-3 border transition-all duration-200 hover:border-neon-cyan/50 hover:bg-card/80 group",
        statusColor
      )}
    >
      <div className="flex items-start gap-3">
        <img
          src={userAvatar}
          alt={userLogin}
          className="w-8 h-8 rounded-sm border border-current/30"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=32`;
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-mono text-sm font-medium text-foreground group-hover:text-neon-cyan transition-colors line-clamp-2">
              #{pr.number} {pr.title}
            </h4>
            <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 border whitespace-nowrap", statusColor)}>
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
            <span>@{userLogin}</span>
            <span>•</span>
            <span>{new Date(pr.created_at).toLocaleDateString()}</span>
            
            {(pr.additions !== undefined || pr.deletions !== undefined) && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  {pr.additions !== undefined && (
                    <span className="text-green-400">+{pr.additions}</span>
                  )}
                  {pr.deletions !== undefined && (
                    <span className="text-destructive">-{pr.deletions}</span>
                  )}
                </div>
              </>
            )}

            {pr.changed_files !== undefined && (
              <>
                <span>•</span>
                <span>{pr.changed_files} files</span>
              </>
            )}
          </div>

          {pr.labels && pr.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {pr.labels.slice(0, 3).map((label) => (
                <span
                  key={label.name}
                  className="text-[9px] font-mono px-1.5 py-0.5 border border-current/30"
                  style={{ 
                    color: `#${label.color}`,
                    backgroundColor: `#${label.color}15`
                  }}
                >
                  {label.name}
                </span>
              ))}
              {pr.labels.length > 3 && (
                <span className="text-[9px] font-mono text-muted-foreground">
                  +{pr.labels.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
};

// Extend the base schema with interactive features
const interactivePRViewerSchema = prViewerSchema.extend({
  enableFiltering: z.boolean().default(true).describe("Allow users to filter PRs"),
  enableSorting: z.boolean().default(true).describe("Allow users to sort PRs"),
  owner: z.string().optional().describe("Repository owner for fetching more PRs"),
  repo: z.string().optional().describe("Repository name for fetching more PRs"),
  initialState: z.enum(["all", "open", "closed"]).default("all").describe("Initial state filter used in the tool call"),
});

type InteractivePRViewerProps = z.infer<typeof interactivePRViewerSchema>;

type SortOption = "newest" | "oldest" | "most-changed" | "most-comments";
type FilterState = "all" | "open" | "closed" | "merged" | "draft";

function InteractivePRViewerBase(props: InteractivePRViewerProps) {
  const [filterState, setFilterState] = useState<FilterState>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [allPRs, setAllPRs] = useState<PRItem[]>(props.prs || []);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Sync allPRs with props.prs when it changes
  useEffect(() => {
    if (props.prs) {
      setAllPRs(props.prs);
    }
  }, [props.prs]);

  // Filter and sort PRs
  const filteredAndSortedPRs = useMemo(() => {
    if (!allPRs) return [];

    let filtered = [...allPRs];

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
  }, [allPRs, filterState, sortBy, searchQuery]);

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
    searchQuery,
    filteredCount: filteredAndSortedPRs.length,
    currentPage,
  }));

  const loadMorePRs = async () => {
    if (!props.owner || !props.repo || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetch(
        `/api/github/pulls?owner=${props.owner}&repo=${props.repo}&state=${props.initialState}&page=${nextPage}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch more PRs");
      
      const newPRs = await response.json();
      
      if (newPRs.length < 10) {
        setHasMore(false);
      }
      
      if (newPRs.length > 0) {
        // Deduplicate PRs by number
        setAllPRs(prev => {
          const existingNumbers = new Set(prev.map(pr => pr.number));
          const uniqueNewPRs = newPRs.filter((pr: PRItem) => !existingNumbers.has(pr.number));
          return [...prev, ...uniqueNewPRs];
        });
        setCurrentPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more PRs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Only allow status filtering if initial state was "all"
  const canFilterByStatus = props.initialState === "all";

  return (
    <div className="w-full border border-neon-cyan/20 bg-card/50">
      {/* Integrated Header with Controls */}
      <div className="p-4 space-y-3 border-b border-neon-cyan/20">
        <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
          {props.title || "PULL REQUEST MANIFEST"}
        </h3>

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
          {/* State Filter - only if initial state was "all" */}
          {props.enableFiltering && canFilterByStatus && (
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

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>Showing {filteredAndSortedPRs.length} of {allPRs.length} PRs</span>
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
        <div className="p-8 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            {searchQuery ? "No PRs match the current search" : "NO PULL REQUESTS DETECTED"}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
          {filteredAndSortedPRs.map((pr) => (
            <PRCard key={pr.number} pr={pr} />
          ))}
        </div>
      )}

      {/* Show More Button */}
      {hasMore && !searchQuery && filterState === "all" && (
        <div className="p-4 border-t border-neon-cyan/20">
          <button
            onClick={loadMorePRs}
            disabled={isLoadingMore}
            className={cn(
              "w-full px-4 py-2 text-xs font-mono border transition-all uppercase",
              isLoadingMore
                ? "border-border bg-background/50 text-muted-foreground cursor-wait"
                : "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20"
            )}
          >
            {isLoadingMore ? "LOADING..." : "SHOW MORE"}
          </button>
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
