"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState, useMemo } from "react";
import { z } from "zod";
import { ComparisonTable, comparisonTableSchema } from "./ComparisonTable";
import { cn } from "@/lib/utils";

const interactiveComparisonTableSchema = comparisonTableSchema.extend({
  enableSorting: z.boolean().default(true).describe("Allow users to sort by columns"),
  enableRowSelection: z.boolean().default(false).describe("Allow users to select rows"),
  enableExport: z.boolean().default(false).describe("Allow users to export data"),
});

type InteractiveComparisonTableProps = z.infer<typeof interactiveComparisonTableSchema>;

function InteractiveComparisonTableBase(props: InteractiveComparisonTableProps) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Expose state to Tambo
  useTamboComponentState(JSON.stringify({
    sortColumn,
    sortDirection,
    selectedRows: Array.from(selectedRows),
  }));

  // Sort rows based on selected column
  const sortedRows = useMemo(() => {
    if (!props.rows || sortColumn === null) return props.rows;

    const sorted = [...props.rows].sort((a, b) => {
      const aVal = a.values[sortColumn];
      const bVal = b.values[sortColumn];

      // Handle numeric comparison
      const aNum = typeof aVal === "number" ? aVal : parseFloat(String(aVal));
      const bNum = typeof bVal === "number" ? bVal : parseFloat(String(bVal));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === "asc" 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [props.rows, sortColumn, sortDirection]);

  const handleColumnSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnIndex);
      setSortDirection("desc");
    }
  };

  const toggleRowSelection = (rowIndex: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  };

  const exportToCSV = () => {
    if (!props.headers || !sortedRows) return;

    const csv = [
      ["Metric", ...props.headers].join(","),
      ...sortedRows.map(row => 
        [row.metric, ...row.values.map(v => `"${v}"`)].join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!props.headers || !sortedRows) return;

    const data = sortedRows.map(row => ({
      metric: row.metric,
      ...Object.fromEntries(
        props.headers.map((header, idx) => [header, row.values[idx]])
      )
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="border border-border bg-background/50 p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          {props.enableSorting && sortColumn !== null && (
            <div className="text-xs font-mono text-muted-foreground">
              Sorted by: <span className="text-neon-cyan">{props.headers?.[sortColumn]}</span>
              <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
            </div>
          )}
          
          {props.enableRowSelection && selectedRows.size > 0 && (
            <div className="text-xs font-mono text-neon-cyan">
              {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>

        {props.enableExport && (
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-2 py-1 text-xs font-mono border border-border bg-background/50 text-foreground hover:border-neon-cyan/50 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-2 py-1 text-xs font-mono border border-border bg-background/50 text-foreground hover:border-neon-cyan/50 transition-colors"
            >
              Export JSON
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Table */}
      <div className="w-full p-4 bg-card/50 border border-neon-cyan/20">
        <h3 className="text-sm font-mono font-bold tracking-widest mb-4 text-neon-cyan/80 uppercase border-b border-neon-cyan/20 pb-2">
          {props.title}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-neon-cyan/20">
                {props.enableRowSelection && (
                  <th className="py-2 px-2 w-8"></th>
                )}
                <th className="text-left py-2 px-3 text-muted-foreground font-bold tracking-wider uppercase">
                  METRIC
                </th>
                {props.headers?.map((header, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "text-right py-2 px-3 text-neon-cyan font-bold tracking-wider uppercase",
                      props.enableSorting && "cursor-pointer hover:text-neon-cyan/70 transition-colors"
                    )}
                    onClick={() => props.enableSorting && handleColumnSort(idx)}
                  >
                    {header}
                    {props.enableSorting && sortColumn === idx && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows?.map((row, rowIdx) => {
                if (!row.values || !Array.isArray(row.values)) return null;
                
                const isSelected = selectedRows.has(rowIdx);
                
                return (
                  <tr
                    key={rowIdx}
                    className={cn(
                      "border-b border-neon-cyan/10 hover:bg-neon-cyan/5 transition-colors",
                      isSelected && "bg-neon-cyan/10"
                    )}
                  >
                    {props.enableRowSelection && (
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(rowIdx)}
                          className="w-3 h-3 accent-neon-cyan"
                        />
                      </td>
                    )}
                    <td className="py-2 px-3 text-foreground font-medium">
                      {row.metric}
                    </td>
                    {row.values.map((value, valueIdx) => (
                      <td
                        key={valueIdx}
                        className="text-right py-2 px-3 text-muted-foreground"
                      >
                        {typeof value === "number" ? value.toLocaleString() : value}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selection Summary */}
      {props.enableRowSelection && selectedRows.size > 0 && (
        <div className="border border-neon-cyan/30 bg-neon-cyan/5 p-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="text-xs font-mono">
            <div className="text-neon-cyan font-bold mb-2">SELECTED METRICS</div>
            <div className="space-y-1">
              {Array.from(selectedRows).map(rowIdx => {
                const row = sortedRows?.[rowIdx];
                if (!row) return null;
                return (
                  <div key={rowIdx} className="text-foreground/80">
                    • {row.metric}
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

export const InteractiveComparisonTable = withInteractable(InteractiveComparisonTableBase, {
  componentName: "InteractiveComparisonTable",
  description: "Interactive comparison table with column sorting, row selection, and export capabilities. AI can see user selections and sorting preferences.",
  propsSchema: interactiveComparisonTableSchema,
});

export { interactiveComparisonTableSchema };
