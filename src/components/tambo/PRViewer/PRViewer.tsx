"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod";

/**
 * Zod schema for a single PR
 */
export const prItemSchema = z.object({
  number: z.number().describe("PR number"),
  title: z.string().describe("PR title"),
  state: z.enum(["open", "closed"]).describe("PR state"),
  user: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }).nullable().optional().describe("PR author"),
  created_at: z.string().describe("Creation timestamp"),
  merged_at: z.string().nullable().optional().describe("Merge timestamp"),
  html_url: z.string().describe("GitHub URL"),
  additions: z.number().optional().describe("Lines added"),
  deletions: z.number().optional().describe("Lines deleted"),
  changed_files: z.number().optional().describe("Files changed"),
  labels: z.array(z.object({
    name: z.string(),
    color: z.string(),
  })).optional().describe("PR labels"),
  draft: z.boolean().optional().describe("Is draft PR"),
});

/**
 * Zod schema for PRViewer component
 */
export const prViewerSchema = z.object({
  prs: z.array(prItemSchema).describe("Array of pull requests to display"),
  title: z.string().optional().describe("Title for the PR viewer"),
  filterState: z.enum(["all", "open", "closed"]).optional().describe("Filter PRs by state"),
  className: z.string().optional().describe("Additional CSS classes"),
});

export type PRViewerProps = z.infer<typeof prViewerSchema>;
export type PRItem = z.infer<typeof prItemSchema>;

/**
 * PRViewer Component - Displays GitHub Pull Requests in Command Deck style
 */
export const PRViewer = React.forwardRef<HTMLDivElement, PRViewerProps>(
  ({ prs, title = "PULL REQUEST MANIFEST", filterState = "all", className }, ref) => {
    // Loading state
    if (!prs) {
      return (
        <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
          <div className="flex flex-col items-center justify-center gap-2 text-neon-cyan/50 font-mono py-8">
            <div className="flex items-center gap-1 h-4">
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.2s]"></span>
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.1s]"></span>
            </div>
            <span className="text-xs tracking-widest">SCANNING PR DATABASE...</span>
          </div>
        </div>
      );
    }

    // Filter PRs based on state
    const filteredPRs = filterState === "all" 
      ? prs 
      : prs.filter(pr => pr.state === filterState);

    // Empty state
    if (filteredPRs.length === 0) {
      return (
        <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
          <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
            {title}
          </h3>
          <div className="text-center py-8 text-muted-foreground font-mono">
            <p className="text-xs">NO PULL REQUESTS DETECTED</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
        <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
          {title}
        </h3>
        
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredPRs.map((pr) => (
            <PRCard key={pr.number} pr={pr} />
          ))}
        </div>
      </div>
    );
  }
);

PRViewer.displayName = "PRViewer";

/**
 * Individual PR Card Component
 */
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

  // Handle missing user data
  const userLogin = pr.user?.login ?? "unknown";
  let userAvatar = pr.user?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=32`;
  
  // Validate avatar URL - ensure it's a complete URL
  try {
    new URL(userAvatar);
  } catch {
    // If invalid URL, use fallback
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
        {/* Avatar */}
        <img
          src={userAvatar}
          alt={userLogin}
          className="w-8 h-8 rounded-sm border border-current/30"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogin)}&background=1e1e24&color=00f0ff&size=32`;
          }}
        />

        {/* Content */}
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

          {/* Labels */}
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
