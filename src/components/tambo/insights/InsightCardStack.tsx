"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

const insightCardSchema = z.object({
  id: z.string().describe("Unique identifier for the insight"),
  type: z.enum(["success", "warning", "info", "critical"]).describe("Type of insight"),
  title: z.string().describe("Short title for the insight"),
  message: z.string().describe("Detailed insight message"),
  metric: z.string().optional().describe("Optional metric to display (e.g., '847/mo', '+60%')"),
  timestamp: z.string().optional().describe("When this insight was generated"),
});

const insightCardStackSchema = z.object({
  insights: z.array(insightCardSchema).describe("Array of insight cards to display"),
  maxVisible: z.number().default(5).describe("Maximum number of insights to show at once"),
});

type InsightCard = z.infer<typeof insightCardSchema>;
type InsightCardStackProps = z.infer<typeof insightCardStackSchema>;

function InsightCardStackBase(props: InsightCardStackProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  // Use props directly instead of local state
  const insights = props.insights || [];

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({ 
    visibleInsights: insights.filter(i => !dismissedIds.has(i.id)),
    dismissedCount: dismissedIds.size 
  }));

  const dismissInsight = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const getTypeStyles = (type: InsightCard["type"]) => {
    switch (type) {
      case "success":
        return {
          border: "border-green-400/50",
          bg: "bg-green-400/10",
          text: "text-green-400",
          icon: "✓",
        };
      case "warning":
        return {
          border: "border-amber-400/50",
          bg: "bg-amber-400/10",
          text: "text-amber-400",
          icon: "⚠",
        };
      case "critical":
        return {
          border: "border-destructive/50",
          bg: "bg-destructive/10",
          text: "text-destructive",
          icon: "✕",
        };
      case "info":
      default:
        return {
          border: "border-neon-cyan/50",
          bg: "bg-neon-cyan/10",
          text: "text-neon-cyan",
          icon: "ℹ",
        };
    }
  };

  // Ensure unique IDs and filter dismissed insights
  const visibleInsights = insights
    .filter(i => i && i.id && !dismissedIds.has(i.id))
    .slice(0, props.maxVisible);

  if (visibleInsights.length === 0) {
    return (
      <div className="w-full border border-neon-cyan/20 bg-card/50">
        <div className="p-4 border-b border-neon-cyan/20">
          <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
            TACTICAL INSIGHTS
          </h3>
        </div>
        <div className="p-8 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
          <div className="w-12 h-12 border border-dashed border-current rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl">◎</span>
          </div>
          <p className="font-mono text-xs tracking-widest">AWAITING ANALYSIS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-neon-cyan/20 bg-card/50">
      <div className="p-4 border-b border-neon-cyan/20 flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
          TACTICAL INSIGHTS
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {visibleInsights.length} ACTIVE
        </span>
      </div>
      
      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {visibleInsights.map((insight) => {
          const styles = getTypeStyles(insight.type);
          return (
            <div
              key={insight.id}
              className={cn(
                "border p-3 animate-in fade-in slide-in-from-top-2 duration-300",
                styles.border,
                styles.bg
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className={cn("text-sm font-bold", styles.text)}>
                    {styles.icon}
                  </span>
                  <span className={cn("text-xs font-mono font-bold tracking-wider uppercase", styles.text)}>
                    {insight.title}
                  </span>
                </div>
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                  aria-label="Dismiss insight"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-xs font-mono text-foreground/80 leading-relaxed mb-2">
                {insight.message}
              </p>
              
              {insight.metric && (
                <div className={cn(
                  "inline-block px-2 py-1 text-xs font-mono font-bold border",
                  styles.border,
                  styles.text
                )}>
                  {insight.metric}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const InsightCardStack = withInteractable(InsightCardStackBase, {
  componentName: "InsightCardStack",
  description: "Displays a stack of AI-generated insights about the repository. AI can add new insights as it discovers patterns. Users can dismiss individual insights. Use this to surface important findings, warnings, or recommendations.",
  propsSchema: insightCardStackSchema,
});

export { insightCardStackSchema, insightCardSchema };
