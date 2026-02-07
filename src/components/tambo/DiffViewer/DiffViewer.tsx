"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod";

/**
 * Zod schema for a file change
 */
export const fileChangeSchema = z.object({
  filename: z.string().describe("File path"),
  status: z.string().describe("Change type (added, removed, modified, renamed, etc.)"),
  additions: z.number().describe("Lines added"),
  deletions: z.number().describe("Lines deleted"),
  changes: z.number().describe("Total changes"),
  patch: z.string().optional().describe("Unified diff patch"),
  previous_filename: z.string().optional().describe("Previous filename if renamed"),
});

/**
 * Zod schema for DiffViewer
 */
export const diffViewerSchema = z.object({
  files: z.array(fileChangeSchema).describe("Array of file changes to display"),
  title: z.string().optional().describe("Title for the diff viewer"),
  prNumber: z.number().optional().describe("PR number for context"),
  repoName: z.string().optional().describe("Repository name for context"),
  className: z.string().optional().describe("Additional CSS classes"),
});

export type DiffViewerProps = z.infer<typeof diffViewerSchema>;
export type FileChange = z.infer<typeof fileChangeSchema>;

/**
 * DiffViewer Component - Displays GitHub PR file changes and diffs
 */
export const DiffViewer = React.forwardRef<HTMLDivElement, DiffViewerProps>(
  ({ files, title = "CODE DIFFERENTIAL ANALYSIS", prNumber, repoName, className }, ref) => {
    const [expandedFiles, setExpandedFiles] = React.useState<Set<string>>(new Set());

    // Loading state
    if (!files) {
      return (
        <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
          <div className="flex flex-col items-center justify-center gap-2 text-neon-cyan/50 font-mono py-8">
            <div className="flex items-center gap-1 h-4">
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.2s]"></span>
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.1s]"></span>
            </div>
            <span className="text-xs tracking-widest">ANALYZING CODE CHANGES...</span>
          </div>
        </div>
      );
    }

    // Empty state
    if (files.length === 0) {
      return (
        <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
          <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
            {title}
          </h3>
          <div className="text-center py-8 text-muted-foreground font-mono">
            <p className="text-xs">NO FILE CHANGES DETECTED</p>
          </div>
        </div>
      );
    }

    const toggleFile = (filename: string) => {
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

    const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
    const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

    return (
      <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
        <div className="mb-4">
          <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
            {title}
            {prNumber && repoName && (
              <span className="ml-2 text-muted-foreground text-xs">
                {repoName} #{prNumber}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-xs font-mono">
            <span className="text-muted-foreground">
              {files.length} {files.length === 1 ? "FILE" : "FILES"} MODIFIED
            </span>
            <span className="text-green-400">+{totalAdditions}</span>
            <span className="text-destructive">-{totalDeletions}</span>
          </div>
          {files.length >= 20 && (
            <div className="mt-2 px-3 py-1 bg-neon-amber/10 border border-neon-amber/20 text-neon-amber text-xs font-mono">
              ⚠ SHOWING FIRST 20 FILES - View full diff on GitHub
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {files.map((file) => (
            <FileChangeCard
              key={file.filename}
              file={file}
              isExpanded={expandedFiles.has(file.filename)}
              onToggle={() => toggleFile(file.filename)}
            />
          ))}
        </div>
      </div>
    );
  }
);

DiffViewer.displayName = "DiffViewer";

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

  // Fallback for unknown status - handle undefined/null status
  const fileStatus = file.status || "modified";
  const config = statusConfig[fileStatus] ?? {
    color: "text-muted-foreground border-muted-foreground/30 bg-muted/5",
    label: String(fileStatus).toUpperCase(),
  };

  return (
    <div className={cn("border transition-all duration-200", config.color)}>
      {/* File Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-card/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 border whitespace-nowrap", config.color)}>
            {config.label}
          </span>
          <span className="font-mono text-sm text-foreground truncate">
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
            // Create a more unique key
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
