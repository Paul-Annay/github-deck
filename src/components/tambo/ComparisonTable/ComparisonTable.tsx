"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod";

/**
 * Zod schema for comparison row
 */
export const comparisonRowSchema = z.object({
  metric: z.string().describe("Metric name"),
  values: z.array(z.union([z.string(), z.number()])).describe("Values for each entity being compared"),
});

/**
 * Zod schema for ComparisonTable
 */
export const comparisonTableSchema = z.object({
  title: z.string().describe("Title for the comparison table"),
  headers: z.array(z.string()).describe("Column headers (entity names)"),
  rows: z.array(comparisonRowSchema).describe("Comparison data rows"),
  highlightBest: z.boolean().optional().describe("Highlight best values in each row"),
  className: z.string().optional().describe("Additional CSS classes"),
});

export type ComparisonTableProps = z.infer<typeof comparisonTableSchema>;
export type ComparisonRow = z.infer<typeof comparisonRowSchema>;

/**
 * ComparisonTable Component - Displays side-by-side comparisons in Command Deck style
 */
export const ComparisonTable = React.forwardRef<HTMLDivElement, ComparisonTableProps>(
  ({ title, headers, rows, highlightBest = false, className }, ref) => {
    // Loading state
    if (!headers || !rows) {
      return (
        <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
          <div className="flex flex-col items-center justify-center gap-2 text-neon-cyan/50 font-mono py-8">
            <div className="flex items-center gap-1 h-4">
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.2s]"></span>
              <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.1s]"></span>
            </div>
            <span className="text-xs tracking-widest">COMPILING COMPARISON DATA...</span>
          </div>
        </div>
      );
    }

    // Empty state
    if (rows.length === 0) {
      return (
        <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
          <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
            {title}
          </h3>
          <div className="text-center py-8 text-muted-foreground font-mono">
            <p className="text-xs">NO COMPARISON DATA AVAILABLE</p>
          </div>
        </div>
      );
    }

    const findBestValue = (values: (string | number)[]): number | null => {
      if (!highlightBest) return null;
      
      const numericValues = values
        .map((v, idx) => ({ value: typeof v === "number" ? v : parseFloat(String(v)), idx }))
        .filter(({ value }) => !isNaN(value));
      
      if (numericValues.length === 0) return null;
      
      const max = Math.max(...numericValues.map(v => v.value));
      return numericValues.find(v => v.value === max)?.idx ?? null;
    };

    return (
      <div ref={ref} className={cn("w-full p-4 bg-card/50 border border-neon-cyan/20", className)}>
        <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
          {title}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-neon-cyan/20">
                <th className="text-left py-2 px-3 text-muted-foreground font-bold tracking-wider uppercase">
                  METRIC
                </th>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="text-right py-2 px-3 text-neon-cyan font-bold tracking-wider uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                // Guard against missing values array
                if (!row.values || !Array.isArray(row.values)) {
                  return null;
                }
                
                const bestIdx = findBestValue(row.values);
                
                return (
                  <tr
                    key={rowIdx}
                    className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5 transition-colors"
                  >
                    <td className="py-2 px-3 text-foreground font-medium">
                      {row.metric}
                    </td>
                    {row.values.map((value, valueIdx) => {
                      const isBest = bestIdx === valueIdx;
                      return (
                        <td
                          key={valueIdx}
                          className={cn(
                            "text-right py-2 px-3",
                            isBest
                              ? "text-neon-cyan font-bold"
                              : "text-muted-foreground"
                          )}
                        >
                          {isBest && <span className="mr-1">▸</span>}
                          {typeof value === "number" ? value.toLocaleString() : value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

ComparisonTable.displayName = "ComparisonTable";
