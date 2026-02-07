"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

const prItemSchema = z.object({
  number: z.number().describe("PR number"),
  title: z.string().describe("PR title"),
  user: z.object({
    login: z.string(),
  }).nullable().optional().describe("PR author"),
  merged_at: z.string().nullable().optional().describe("Merge timestamp"),
  html_url: z.string().describe("GitHub URL"),
  labels: z.array(z.object({
    name: z.string(),
    color: z.string(),
  })).optional().describe("PR labels"),
});

const releaseNoteBuilderSchema = z.object({
  prs: z.array(prItemSchema).describe("Array of merged PRs to include"),
  version: z.string().optional().describe("Release version number"),
  title: z.string().default("RELEASE NOTE BUILDER").describe("Title for the component"),
});

type ReleaseNoteBuilderProps = z.infer<typeof releaseNoteBuilderSchema>;
type PRItem = z.infer<typeof prItemSchema>;

type PRCategory = "features" | "fixes" | "improvements" | "breaking" | "docs" | "other";

function ReleaseNoteBuilderBase(props: ReleaseNoteBuilderProps) {
  const [selectedPRs, setSelectedPRs] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Map<number, PRCategory>>(new Map());
  const [customDescriptions, setCustomDescriptions] = useState<Map<number, string>>(new Map());

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({
    selectedPRs: Array.from(selectedPRs),
    categories: Array.from(categories.entries()),
    customDescriptions: Array.from(customDescriptions.entries()),
  }));

  const togglePR = (prNumber: number) => {
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

  const setCategory = (prNumber: number, category: PRCategory) => {
    setCategories(prev => new Map(prev).set(prNumber, category));
  };

  const setDescription = (prNumber: number, description: string) => {
    setCustomDescriptions(prev => new Map(prev).set(prNumber, description));
  };

  const selectAll = () => {
    setSelectedPRs(new Set(props.prs?.map(pr => pr.number) || []));
  };

  const clearAll = () => {
    setSelectedPRs(new Set());
  };

  const generateMarkdown = () => {
    const categoryLabels: Record<PRCategory, string> = {
      features: "✨ New Features",
      fixes: "🐛 Bug Fixes",
      improvements: "⚡ Improvements",
      breaking: "💥 Breaking Changes",
      docs: "📚 Documentation",
      other: "🔧 Other Changes",
    };

    const grouped = new Map<PRCategory, PRItem[]>();
    
    props.prs?.forEach(pr => {
      if (!selectedPRs.has(pr.number)) return;
      
      const category = categories.get(pr.number) || "other";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(pr);
    });

    let markdown = `# Release ${props.version || "vX.X.X"}\n\n`;
    
    const categoryOrder: PRCategory[] = ["breaking", "features", "improvements", "fixes", "docs", "other"];
    
    categoryOrder.forEach(category => {
      const prs = grouped.get(category);
      if (!prs || prs.length === 0) return;
      
      markdown += `## ${categoryLabels[category]}\n\n`;
      
      prs.forEach(pr => {
        const description = customDescriptions.get(pr.number) || pr.title;
        const author = pr.user?.login || "unknown";
        markdown += `- ${description} (#${pr.number}) @${author}\n`;
      });
      
      markdown += "\n";
    });

    return markdown;
  };

  const copyToClipboard = () => {
    const markdown = generateMarkdown();
    navigator.clipboard.writeText(markdown);
  };

  if (!props.prs || props.prs.length === 0) {
    return (
      <div className="border border-border bg-background/50 p-4">
        <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
          {props.title}
        </h3>
        <div className="text-center py-8 text-muted-foreground font-mono">
          <p className="text-xs">NO MERGED PRS AVAILABLE</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="border border-border bg-background/50 p-4">
        <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2 mb-3">
          {props.title}
          {props.version && (
            <span className="ml-2 text-muted-foreground text-xs">v{props.version}</span>
          )}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-muted-foreground">
            {selectedPRs.size} of {props.prs.length} PRs selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-2 py-1 text-xs font-mono border border-border bg-background/50 text-foreground hover:border-neon-cyan/50"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="px-2 py-1 text-xs font-mono border border-border bg-background/50 text-foreground hover:border-destructive/50"
            >
              Clear
            </button>
            <button
              onClick={copyToClipboard}
              disabled={selectedPRs.size === 0}
              className="px-2 py-1 text-xs font-mono border border-neon-cyan bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy Markdown
            </button>
          </div>
        </div>
      </div>

      {/* PR List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {props.prs.map((pr) => {
          const isSelected = selectedPRs.has(pr.number);
          const category = categories.get(pr.number);
          const customDesc = customDescriptions.get(pr.number);

          return (
            <div
              key={pr.number}
              className={cn(
                "border p-3 transition-all",
                isSelected 
                  ? "border-neon-cyan/30 bg-neon-cyan/5" 
                  : "border-border bg-background/50"
              )}
            >
              {/* PR Header */}
              <div className="flex items-start gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePR(pr.number)}
                  className="mt-1 w-4 h-4 accent-neon-cyan"
                />
                <div className="flex-1 min-w-0">
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-medium text-foreground hover:text-neon-cyan transition-colors line-clamp-2"
                  >
                    #{pr.number} {pr.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted-foreground">
                    <span>@{pr.user?.login || "unknown"}</span>
                    {pr.merged_at && (
                      <>
                        <span>•</span>
                        <span>Merged {new Date(pr.merged_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Selection (only if selected) */}
              {isSelected && (
                <div className="space-y-2 ml-6">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {(["features", "fixes", "improvements", "breaking", "docs", "other"] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(pr.number, cat)}
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

                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                      Custom Description (optional)
                    </label>
                    <input
                      type="text"
                      value={customDesc || ""}
                      onChange={(e) => setDescription(pr.number, e.target.value)}
                      placeholder={pr.title}
                      className="w-full px-2 py-1 bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-neon-cyan transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview */}
      {selectedPRs.size > 0 && (
        <div className="border border-neon-cyan/30 bg-neon-cyan/5 p-3">
          <div className="text-xs font-mono">
            <div className="text-neon-cyan font-bold mb-2">RELEASE NOTES PREVIEW</div>
            <pre className="text-foreground/80 whitespace-pre-wrap overflow-x-auto custom-scrollbar max-h-[300px]">
              {generateMarkdown()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export const ReleaseNoteBuilder = withInteractable(ReleaseNoteBuilderBase, {
  componentName: "ReleaseNoteBuilder",
  description: "Interactive release note builder that allows users to select PRs, categorize them, and generate formatted release notes. AI can help with categorization and description writing.",
  propsSchema: releaseNoteBuilderSchema,
});

export { releaseNoteBuilderSchema };
