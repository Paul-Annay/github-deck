"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState } from "react";
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
});

const issueTriagerSchema = z.object({
  issues: z.array(issueSchema).describe("Array of issues to triage"),
  categories: z.array(z.string()).default(["bug", "feature", "documentation", "question", "wontfix"]).describe("Available categories"),
  title: z.string().default("ISSUE TRIAGE STATION").describe("Title for the component"),
});

type IssueTriagerProps = z.infer<typeof issueTriagerSchema>;
type Issue = z.infer<typeof issueSchema>;

function IssueTriagerBase(props: IssueTriagerProps) {
  const [categorized, setCategorized] = useState<Map<number, string>>(new Map());
  const [priorities, setPriorities] = useState<Map<number, "low" | "medium" | "high" | "critical">>(new Map());
  const [notes, setNotes] = useState<Map<number, string>>(new Map());

  // Use default categories if not provided
  const categories = props.categories || ["bug", "feature", "documentation", "question", "wontfix"];

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({
    categorized: Array.from(categorized.entries()),
    priorities: Array.from(priorities.entries()),
    notes: Array.from(notes.entries()),
    triaged: categorized.size,
    total: props.issues?.length || 0,
  }));

  const setCategory = (issueNumber: number, category: string) => {
    setCategorized(prev => new Map(prev).set(issueNumber, category));
  };

  const setPriority = (issueNumber: number, priority: "low" | "medium" | "high" | "critical") => {
    setPriorities(prev => new Map(prev).set(issueNumber, priority));
  };

  const setNote = (issueNumber: number, note: string) => {
    setNotes(prev => new Map(prev).set(issueNumber, note));
  };

  const getPriorityColor = (priority?: "low" | "medium" | "high" | "critical") => {
    switch (priority) {
      case "critical": return "text-destructive border-destructive/30 bg-destructive/10";
      case "high": return "text-neon-amber border-neon-amber/30 bg-neon-amber/10";
      case "medium": return "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10";
      case "low": return "text-muted-foreground border-muted-foreground/30 bg-muted/10";
      default: return "text-muted-foreground border-border bg-background/50";
    }
  };

  if (!props.issues || props.issues.length === 0) {
    return (
      <div className="border border-border bg-background/50 p-4">
        <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
          {props.title}
        </h3>
        <div className="text-center py-8 text-muted-foreground font-mono">
          <p className="text-xs">NO ISSUES TO TRIAGE</p>
        </div>
      </div>
    );
  }

  const triagedCount = categorized.size;
  const progress = (triagedCount / props.issues.length) * 100;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="border border-border bg-background/50 p-4">
        <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2 mb-3">
          {props.title}
        </h3>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">TRIAGE PROGRESS</span>
            <span className="text-neon-cyan">{triagedCount} / {props.issues.length}</span>
          </div>
          <div className="h-2 bg-background border border-border">
            <div 
              className="h-full bg-neon-cyan transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Issues */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {props.issues.map((issue) => {
          const category = categorized.get(issue.number);
          const priority = priorities.get(issue.number);
          const note = notes.get(issue.number);
          const isTriaged = !!category;

          return (
            <div
              key={issue.number}
              className={cn(
                "border p-3 transition-all",
                isTriaged 
                  ? "border-neon-cyan/30 bg-neon-cyan/5" 
                  : "border-border bg-background/50"
              )}
            >
              {/* Issue Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-medium text-foreground hover:text-neon-cyan transition-colors line-clamp-2"
                  >
                    #{issue.number} {issue.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted-foreground">
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    {issue.labels && issue.labels.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {issue.labels.slice(0, 2).map(label => (
                            <span
                              key={label.name}
                              className="px-1 py-0.5 text-[9px] border"
                              style={{
                                color: `#${label.color}`,
                                borderColor: `#${label.color}40`,
                                backgroundColor: `#${label.color}15`,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {isTriaged && (
                  <span className="text-neon-cyan text-xs">✓</span>
                )}
              </div>

              {/* Triage Controls */}
              <div className="space-y-2">
                {/* Category Selection */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(issue.number, cat)}
                        className={cn(
                          "px-2 py-1 text-xs font-mono border transition-all",
                          category === cat
                            ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                            : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                    Priority
                  </label>
                  <div className="flex gap-1">
                    {(["low", "medium", "high", "critical"] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPriority(issue.number, p)}
                        className={cn(
                          "px-2 py-1 text-xs font-mono border transition-all uppercase flex-1",
                          priority === p
                            ? getPriorityColor(p)
                            : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={note || ""}
                    onChange={(e) => setNote(issue.number, e.target.value)}
                    placeholder="Add triage notes..."
                    className="w-full px-2 py-1 bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {triagedCount > 0 && (
        <div className="border border-neon-cyan/30 bg-neon-cyan/5 p-3">
          <div className="text-xs font-mono">
            <div className="text-neon-cyan font-bold mb-2">TRIAGE SUMMARY</div>
            <div className="space-y-1 text-foreground/80">
              {categories.map(cat => {
                const count = Array.from(categorized.values()).filter(c => c === cat).length;
                if (count === 0) return null;
                return (
                  <div key={cat} className="flex justify-between">
                    <span>{cat}:</span>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const IssueTriager = withInteractable(IssueTriagerBase, {
  componentName: "IssueTriager",
  description: "Interactive issue triage component that allows users to categorize, prioritize, and add notes to issues. AI can see triage decisions and help with categorization.",
  propsSchema: issueTriagerSchema,
});

export { issueTriagerSchema };
