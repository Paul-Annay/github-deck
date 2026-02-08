"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { diffViewerSchema, FileChange } from "./DiffViewer";
import { cn } from "@/lib/utils";

const interactiveDiffViewerSchema = diffViewerSchema.extend({
  enableFiltering: z.boolean().default(true).describe("Allow users to filter files by type"),
  enableSearch: z.boolean().default(true).describe("Allow users to search files"),
});

type InteractiveDiffViewerProps = z.infer<typeof interactiveDiffViewerSchema>;

type FileStatus = "all" | "added" | "removed" | "modified" | "renamed";

function InteractiveDiffViewerBase(props: InteractiveDiffViewerProps) {
  const [filterStatus, setFilterStatus] = useState<FileStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

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

  // Compute expanded files based on expandAll state
  const effectiveExpandedFiles = useMemo(() => {
    if (expandAll) {
      return new Set(filteredFiles.map(f => f.filename));
    }
    return expandedFiles;
  }, [expandAll, filteredFiles, expandedFiles]);

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({
    filterStatus,
    searchQuery,
    expandAll,
    filteredCount: filteredFiles.length,
    expandedCount: effectiveExpandedFiles.size,
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

  const toggleFile = (filename: string) => {
    // When toggling a file, disable expandAll mode
    setExpandAll(false);
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  return (
    <div className="w-full border border-neon-cyan/20 bg-card/50">
      {/* Integrated Header with Controls */}
      <div className="p-4 space-y-3 border-b border-neon-cyan/20">
        <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
          {props.title || "CODE DIFFERENTIAL ANALYSIS"}
          {props.prNumber && props.repoName && (
            <span className="ml-2 text-muted-foreground text-xs">
              {props.repoName} #{props.prNumber}
            </span>
          )}
        </h3>

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

        {/* Results Count and Expand/Collapse */}
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>
            Showing {filteredFiles.length} of {props.files?.length || 0} files
            {filteredFiles.length > 0 && (
              <>
                {" • "}
                <span className="text-green-400">+{totalAdditions}</span>
                {" "}
                <span className="text-destructive">-{totalDeletions}</span>
              </>
            )}
          </span>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="px-2 py-1 text-xs font-mono border border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-all uppercase"
          >
            {expandAll ? "COLLAPSE ALL" : "EXPAND ALL"}
          </button>
        </div>

        {filteredFiles.length >= 20 && (
          <div className="px-3 py-1 bg-neon-amber/10 border border-neon-amber/20 text-neon-amber text-xs font-mono">
            ⚠ SHOWING FIRST 20 FILES - View full diff on GitHub
          </div>
        )}
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            {searchQuery || filterStatus !== "all" 
              ? "No files match the current filters" 
              : "NO FILE CHANGES DETECTED"}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
          {filteredFiles.map((file) => (
            <FileChangeCard
              key={file.filename}
              file={file}
              isExpanded={effectiveExpandedFiles.has(file.filename)}
              onToggle={() => toggleFile(file.filename)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual File Change Card Component
 */
const FileChangeCard: React.FC<{
  file: FileChange;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ file, isExpanded, onToggle }) => {
  const statusConfig: Record<string, { color: string; label: string }> = {
    added: { color: "text-green-400 border-green-400/30 bg-green-400/5", label: "ADDED" },
    removed: { color: "text-destructive border-destructive/30 bg-destructive/5", label: "REMOVED" },
    modified: { color: "text-neon-amber border-neon-amber/30 bg-neon-amber/5", label: "MODIFIED" },
    renamed: { color: "text-purple-400 border-purple-400/30 bg-purple-400/5", label: "RENAMED" },
  };

  const fileStatus = file.status || "modified";
  const config = statusConfig[fileStatus] ?? {
    color: "text-muted-foreground border-muted-foreground/30 bg-muted/5",
    label: String(fileStatus).toUpperCase(),
  };

  return (
    <div className={cn("border transition-all duration-200", config.color, !isExpanded && "hover:border-neon-cyan/50 hover:bg-card/80")}>
      {/* File Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 border whitespace-nowrap", config.color)}>
            {config.label}
          </span>
          <span className="font-mono text-sm text-foreground group-hover:text-neon-cyan transition-colors truncate">
            {file.filename}
          </span>
          {file.status === "renamed" && file.previous_filename && (
            <span className="text-xs text-muted-foreground font-mono">
              ← {file.previous_filename}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-green-400">+{file.additions}</span>
          <span className="text-destructive">-{file.deletions}</span>
          <span className="text-neon-cyan ml-2">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </button>

      {/* Diff Content */}
      {isExpanded && file.patch && (
        <div className="border-t border-current/20 bg-void-black/50">
          {file.patch.includes("(truncated)") && (
            <div className="px-4 py-2 bg-neon-amber/10 border-b border-neon-amber/20 text-neon-amber text-xs font-mono">
              ⚠ PATCH TRUNCATED - View full diff on GitHub
            </div>
          )}
          <DiffContent patch={file.patch} />
        </div>
      )}

      {isExpanded && !file.patch && (
        <div className="border-t border-current/20 p-4 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            {file.status === "added" || file.status === "removed" 
              ? "BINARY FILE OR TOO LARGE TO DISPLAY"
              : "NO DIFF AVAILABLE"}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Diff Content Component - Renders side-by-side diff like GitHub
 */
const DiffContent: React.FC<{ patch: string }> = ({ patch }) => {
  const lines = patch.split("\n");
  const diffLines: Array<{
    leftNum: number | null;
    rightNum: number | null;
    leftContent: string;
    rightContent: string;
    type: "add" | "remove" | "context" | "hunk";
  }> = [];

  let leftLineNum = 0;
  let rightLineNum = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      // Hunk header - extract line numbers
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        leftLineNum = parseInt(match[1], 10) - 1;
        rightLineNum = parseInt(match[2], 10) - 1;
      }
      diffLines.push({
        leftNum: null,
        rightNum: null,
        leftContent: line,
        rightContent: line,
        type: "hunk",
      });
    } else if (line.startsWith("+")) {
      // Addition - only on right side
      rightLineNum++;
      diffLines.push({
        leftNum: null,
        rightNum: rightLineNum,
        leftContent: "",
        rightContent: line.substring(1),
        type: "add",
      });
    } else if (line.startsWith("-")) {
      // Deletion - only on left side
      leftLineNum++;
      diffLines.push({
        leftNum: leftLineNum,
        rightNum: null,
        leftContent: line.substring(1),
        rightContent: "",
        type: "remove",
      });
    } else {
      // Context line - on both sides
      leftLineNum++;
      rightLineNum++;
      const content = line.substring(1) || " ";
      diffLines.push({
        leftNum: leftLineNum,
        rightNum: rightLineNum,
        leftContent: content,
        rightContent: content,
        type: "context",
      });
    }
  }

  return (
    <div className="font-mono text-xs overflow-x-auto custom-scrollbar">
      <table className="w-full border-collapse">
        <tbody>
          {diffLines.map((diffLine, idx) => {
            const uniqueKey = `${idx}-${diffLine.type}-${diffLine.leftNum ?? 'x'}-${diffLine.rightNum ?? 'x'}`;
            
            if (diffLine.type === "hunk") {
              return (
                <tr key={uniqueKey} className="bg-neon-cyan/10">
                  <td colSpan={4} className="px-4 py-1 text-neon-cyan font-bold">
                    {diffLine.leftContent}
                  </td>
                </tr>
              );
            }

            const leftBg = diffLine.type === "remove" ? "bg-destructive/10" : "";
            const rightBg = diffLine.type === "add" ? "bg-green-400/10" : "";
            const leftText = diffLine.type === "remove" ? "text-destructive" : "text-muted-foreground";
            const rightText = diffLine.type === "add" ? "text-green-400" : "text-muted-foreground";

            return (
              <tr key={uniqueKey} className="border-b border-neon-cyan/5">
                {/* Left side (deletions) */}
                <td className={cn("w-10 px-2 py-0.5 text-right select-none border-r border-neon-cyan/10", leftBg)}>
                  <span className="text-muted-foreground/50 text-[10px]">
                    {diffLine.leftNum ?? ""}
                  </span>
                </td>
                <td className={cn("px-4 py-0.5 w-1/2", leftBg, leftText)}>
                  <pre className="whitespace-pre-wrap break-all">{diffLine.leftContent || " "}</pre>
                </td>

                {/* Right side (additions) */}
                <td className={cn("w-10 px-2 py-0.5 text-right select-none border-r border-neon-cyan/10", rightBg)}>
                  <span className="text-muted-foreground/50 text-[10px]">
                    {diffLine.rightNum ?? ""}
                  </span>
                </td>
                <td className={cn("px-4 py-0.5 w-1/2", rightBg, rightText)}>
                  <pre className="whitespace-pre-wrap break-all">{diffLine.rightContent || " "}</pre>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const InteractiveDiffViewer = withInteractable(InteractiveDiffViewerBase, {
  componentName: "InteractiveDiffViewer",
  description: "Interactive diff viewer with file filtering and search. Users can expand/collapse individual files or all files at once. AI can see user preferences and filtered results.",
  propsSchema: interactiveDiffViewerSchema,
});

export { interactiveDiffViewerSchema };
