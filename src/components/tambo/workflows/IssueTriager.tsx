"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

const issueSchema = z.object({
  number: z.number().describe("Issue number"),
  title: z.string().describe("Issue title"),
  state: z.enum(["open", "closed"]).describe("Issue state"),
  labels: z.array(z.object({
    name: z.string(),
    color: z.string(),
  })).optional().describe("Issue labels"),
  created_at: z.string().describe("Creation timestamp"),
  html_url: z.string().describe("GitHub URL"),
  comments: z.number().optional().describe("Number of comments"),
});

const issueTriagerSchema = z.object({
  issues: z.array(issueSchema).describe("Array of issues to display"),
  title: z.string().default("ISSUE VIEWER").describe("Title for the component"),
  owner: z.string().optional().describe("Repository owner (for fetching comments and more issues)"),
  repo: z.string().optional().describe("Repository name (for fetching comments and more issues)"),
  state: z.enum(["open", "closed", "all"]).optional().describe("Issue state filter"),
  hasMore: z.boolean().default(true).describe("Whether more issues are available to load"),
});

type IssueTriagerProps = z.infer<typeof issueTriagerSchema>;
type Issue = z.infer<typeof issueSchema>;

interface IssueComment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  } | null;
  created_at: string;
  body: string;
  html_url: string;
}

function IssueTriagerBase(props: IssueTriagerProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [commentsCache, setCommentsCache] = useState<Map<number, IssueComment[]>>(new Map());
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [allIssues, setAllIssues] = useState<Issue[]>(props.issues || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(props.hasMore ?? true);

  // Sync allIssues with props.issues when props change
  useEffect(() => {
    if (props.issues && props.issues.length > 0) {
      setAllIssues(props.issues);
    }
  }, [props.issues]);

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({
    expanded: Array.from(expandedIssues),
    total: allIssues.length,
    page: currentPage,
    hasMore,
  }));

  const toggleIssue = async (issueNumber: number) => {
    const newExpanded = new Set(expandedIssues);
    
    if (newExpanded.has(issueNumber)) {
      newExpanded.delete(issueNumber);
      setExpandedIssues(newExpanded);
    } else {
      newExpanded.add(issueNumber);
      setExpandedIssues(newExpanded);
      
      // Fetch comments if not already cached
      if (!commentsCache.has(issueNumber) && props.owner && props.repo) {
        setLoadingComments(prev => new Set(prev).add(issueNumber));
        
        try {
          const response = await fetch(`/api/github/comments?owner=${props.owner}&repo=${props.repo}&issue=${issueNumber}`);
          if (response.ok) {
            const comments = await response.json();
            setCommentsCache(prev => new Map(prev).set(issueNumber, comments));
          }
        } catch (error) {
          console.error("Failed to fetch comments:", error);
        } finally {
          setLoadingComments(prev => {
            const next = new Set(prev);
            next.delete(issueNumber);
            return next;
          });
        }
      }
    }
  };

  const loadMoreIssues = async () => {
    if (!props.owner || !props.repo || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const response = await fetch(
        `/api/github/issues?owner=${props.owner}&repo=${props.repo}&state=${props.state || "all"}&page=${nextPage}`
      );
      
      if (response.ok) {
        const newIssues = await response.json();
        
        if (newIssues.length === 0) {
          setHasMore(false);
        } else {
          setAllIssues(prev => [...prev, ...newIssues]);
          setCurrentPage(nextPage);
          
          // If we got less than 10 issues, there are no more
          if (newIssues.length < 10) {
            setHasMore(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load more issues:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!allIssues || allIssues.length === 0) {
    return (
      <div className="w-full border border-neon-cyan/20 bg-card/50 p-4">
        <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
          {props.title}
        </h3>
        <div className="text-center py-8 text-muted-foreground font-mono">
          <p className="text-xs">NO ISSUES FOUND</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-neon-cyan/20 bg-card/50">
      {/* Header */}
      <div className="p-4 border-b border-neon-cyan/20">
        <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase mb-3">
          {props.title}
        </h3>
        
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Showing {allIssues.length} issues</span>
        </div>
      </div>

      {/* Issues */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
        {allIssues.map((issue) => {
          const isExpanded = expandedIssues.has(issue.number);
          const comments = commentsCache.get(issue.number);
          const isLoading = loadingComments.has(issue.number);

          const statusColor = issue.state === "open"
            ? "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5"
            : issue.state === "closed"
            ? "text-muted-foreground border-muted-foreground/30 bg-muted/5"
            : "text-yellow-500 border-yellow-500/30 bg-yellow-500/5";

          return (
            <div
              key={issue.number}
              className={cn(
                "border transition-all duration-200",
                statusColor,
                !isExpanded && "hover:border-neon-cyan/50 hover:bg-card/80"
              )}
            >
              {/* Issue Header */}
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-mono text-sm font-medium text-foreground group-hover:text-neon-cyan transition-colors line-clamp-2 flex-1">
                    #{issue.number} {issue.title}
                  </h4>
                  <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 border whitespace-nowrap", statusColor)}>
                    {issue.state?.toUpperCase() ?? "UNKNOWN"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                  <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  
                  {issue.comments !== undefined && issue.comments > 0 && (
                    <>
                      <span>•</span>
                      <span>{issue.comments} {issue.comments === 1 ? "comment" : "comments"}</span>
                    </>
                  )}

                  {issue.labels && issue.labels.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex flex-wrap gap-1">
                        {issue.labels.slice(0, 3).map(label => (
                          <span
                            key={label.name}
                            className="text-[9px] font-mono px-1.5 py-0.5 border border-current/30"
                            style={{
                              color: `#${label.color}`,
                              backgroundColor: `#${label.color}15`,
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                        {issue.labels.length > 3 && (
                          <span className="text-[9px] font-mono text-muted-foreground">
                            +{issue.labels.length - 3}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </a>

              {/* Comments Toggle Button */}
              {issue.comments !== undefined && issue.comments > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleIssue(issue.number);
                  }}
                  className="w-full px-3 py-2 text-xs font-mono border-t border-current/20 bg-background/20 text-muted-foreground hover:bg-current/10 hover:text-current transition-all flex items-center justify-between"
                >
                  <span>
                    {isExpanded ? "▼" : "▶"} {issue.comments} {issue.comments === 1 ? "COMMENT" : "COMMENTS"}
                  </span>
                  {isLoading && <span className="animate-pulse">LOADING...</span>}
                </button>
              )}

              {/* Comments Section */}
              {isExpanded && (
                <div className="border-t border-current/20 bg-background/10 p-3 space-y-2">
                  {isLoading ? (
                    <div className="text-center py-4 text-xs font-mono text-muted-foreground">
                      <span className="animate-pulse">FETCHING COMMENTS...</span>
                    </div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment) => {
                      const userLogin = comment.user?.login ?? "unknown";
                      let avatarUrl = comment.user?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=24`;
                      
                      try {
                        new URL(avatarUrl);
                      } catch {
                        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=24`;
                      }

                      return (
                        <div
                          key={comment.id}
                          className="border-l-2 border-neon-cyan/30 bg-background/30 pl-3 pr-2 py-2 space-y-1"
                        >
                          <div className="flex items-center gap-2 text-[10px] font-mono">
                            <img
                              src={avatarUrl}
                              alt={userLogin}
                              className="w-4 h-4 rounded-sm border border-neon-cyan/30"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=24`;
                              }}
                            />
                            <span className="text-neon-cyan">@{userLogin}</span>
                            <span>•</span>
                            <span className="text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-foreground/80 font-mono whitespace-pre-wrap line-clamp-4">
                            {comment.body}
                          </div>
                          <a
                            href={comment.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-neon-cyan/60 hover:text-neon-cyan font-mono inline-block"
                          >
                            VIEW ON GITHUB →
                          </a>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs font-mono text-muted-foreground">
                      NO COMMENTS AVAILABLE
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && props.owner && props.repo && (
        <div className="p-4 border-t border-neon-cyan/20">
          <button
            onClick={loadMoreIssues}
            disabled={loadingMore}
            className={cn(
              "w-full px-4 py-2 text-xs font-mono border transition-all uppercase",
              loadingMore
                ? "border-border bg-background/50 text-muted-foreground cursor-wait"
                : "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20"
            )}
          >
            {loadingMore ? "LOADING..." : "SHOW MORE"}
          </button>
        </div>
      )}
    </div>
  );
}

export const IssueTriager = withInteractable(IssueTriagerBase, {
  componentName: "IssueTriager",
  description: "Interactive issue viewer component that displays issues with collapsible comment sections. Users can expand issues to view comments fetched on-demand.",
  propsSchema: issueTriagerSchema,
});

export { issueTriagerSchema };
