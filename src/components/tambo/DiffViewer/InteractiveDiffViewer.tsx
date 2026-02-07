"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState, useMemo } from "react";
import { z } from "zod";
import { DiffViewer, diffViewerSchema } from "./DiffViewer";
import { cn } from "@/lib/utils";

const interactiveDiffViewerSchema = diffViewerSchema.extend({
  enableFiltering: z.boolean().default(true).describe("Allow users to filter files by type"),
  enableSearch: z.boolean().default(true).describe("Allow users to search files"),
  enableViewToggle: z.boolean().default(true).describe("Allow toggling between unified and split view"),
});

type InteractiveDiffViewerProps = z.infer<typeof interactiveDiffViewerSchema>;

type FileStatus = "all" | "added" | "removed" | "modified" | "renamed";

function InteractiveDiffViewerBase(props: InteractiveDiffViewerProps) {
  const [filterStatus, setFilterStatus] = useState<FileStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [expandAll, setExpandAll] = useState(false);

  // Filter files
  const filteredFiles = useMemo(() => {
    if (!props.files) return [];

    let filtered = [...props.files];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(file => file.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file =>
        file.filename.toLowerCase().includes(query) ||
        file.previous_filename?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [props.files, filterStatus, searchQuery]);

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({
    filterStatus,
    searchQuery,
    viewMode,
    expandAll,
    filteredCount: filteredFiles.length,
  }));

  // Calculate stats
  const stats = useMemo(() => {
    if (!props.files) return { added: 0, removed: 0, modified: 0, renamed: 0 };
    
    return props.files.reduce((acc, file) => {
      const status = file.status || "modified";
      if (status in acc) {
        acc[status as keyof typeof acc]++;
      }
      return acc;
    }, { added: 0, removed: 0, modified: 0, renamed: 0 });
  }, [props.files]);

  const totalAdditions = filteredFiles.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = filteredFiles.reduce((sum, f) => sum + f.deletions, 0);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="border border-border bg-background/50 p-3 space-y-3">
        {/* Search */}
        {props.enableSearch && (
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by path..."
              className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Status Filter */}
          {props.enableFiltering && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider self-center">
                Status:
              </span>
              {(["all", "added", "removed", "modified", "renamed"] as const).map(status => {
                const count = status === "all" ? props.files?.length : stats[status as keyof typeof stats];
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "px-2 py-1 text-xs font-mono border transition-all uppercase",
                      filterStatus === status
                        ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                        : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                    )}
                  >
                    {status} {count !== undefined && `(${count})`}
                  </button>
                );
              })}
            </div>
          )}

          {/* View Toggle */}
          {props.enableViewToggle && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("split")}
                className={cn(
                  "px-2 py-1 text-xs font-mono border transition-all",
                  viewMode === "split"
                    ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                    : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                )}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode("unified")}
                className={cn(
                  "px-2 py-1 text-xs font-mono border transition-all",
                  viewMode === "unified"
                    ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                    : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                )}
              >
                Unified View
              </button>
            </div>
          )}
        </div>

        {/* Expand/Collapse All */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-xs font-mono text-muted-foreground">
            Showing {filteredFiles.length} of {props.files?.length || 0} files
            {filteredFiles.length > 0 && (
              <>
                {" • "}
                <span className="text-green-400">+{totalAdditions}</span>
                {" "}
                <span className="text-destructive">-{totalDeletions}</span>
              </>
            )}
          </div>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="px-2 py-1 text-xs font-mono border border-border bg-background/50 text-foreground hover:border-neon-cyan/50"
          >
            {expandAll ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      {/* Diff Viewer */}
      <DiffViewer {...props} files={filteredFiles} />

      {/* Summary */}
      {filteredFiles.length === 0 && props.files && props.files.length > 0 && (
        <div className="border border-neon-amber/30 bg-neon-amber/5 p-3 text-center">
          <p className="text-xs font-mono text-neon-amber">
            No files match the current filters
          </p>
        </div>
      )}
    </div>
  );
}

export const InteractiveDiffViewer = withInteractable(InteractiveDiffViewerBase, {
  componentName: "InteractiveDiffViewer",
  description: "Interactive diff viewer with file filtering, search, and view mode toggle. AI can see user preferences and filtered results.",
  propsSchema: interactiveDiffViewerSchema,
});

export { interactiveDiffViewerSchema };
