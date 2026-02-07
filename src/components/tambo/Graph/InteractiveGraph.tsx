"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useState } from "react";
import { z } from "zod";
import Graph from "./Graph";
import { graphSchema } from "./Graph.types";
import { cn } from "@/lib/utils";

// Extend the base graph schema with interactive features
const interactiveGraphSchema = graphSchema.extend({
  enableFiltering: z.boolean().default(true).describe("Allow users to filter datasets (auto-enabled for 2+ datasets)"),
  enableTimeRange: z.boolean().default(true).describe("Allow users to select time ranges (auto-enabled for date-based data)"),
  enableDataPointClick: z.boolean().default(false).describe("Allow clicking on data points for details"),
});

type InteractiveGraphProps = z.infer<typeof interactiveGraphSchema>;

function InteractiveGraphBase(props: InteractiveGraphProps) {
  const { enableFiltering, enableTimeRange, enableDataPointClick, ...graphProps } = props;
  
  // Initialize all hooks before any conditional returns
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(
    new Set(props.data?.datasets?.map(d => d.label) || [])
  );
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month" | "quarter">("all");
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Determine which features are actually usable based on data
  const canFilter = enableFiltering && props.data?.datasets && props.data.datasets.length > 1;
  
  // Time range filtering requires:
  // 1. enableTimeRange prop is true (default: true)
  // 2. Chart type is NOT pie (pie charts don't have time series)
  // 3. At least one label can be parsed as a valid date
  //    Examples of valid date labels: "2024-01-01", "2024-02-15T10:30:00Z"
  //    Examples of invalid labels: "Week 1", "January", "Q1"
  // 4. Data spans at least 8 days (otherwise time range filters don't make sense)
  const hasDateLabels = props.data?.labels && props.data.labels.length > 0 && 
    props.data.labels.some(label => !isNaN(new Date(label).getTime()));
  
  // Calculate the actual date range of the data
  let dataSpanDays = 0;
  if (hasDateLabels && props.data?.labels) {
    const dates = props.data.labels
      .map(label => new Date(label))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (dates.length >= 2) {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      dataSpanDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000));
    }
  }
  
  const canTimeRange = enableTimeRange && props.data?.type !== "pie" && hasDateLabels && dataSpanDays >= 8;

  // Determine which time range options to show based on data span
  const availableTimeRanges: Array<"all" | "week" | "month" | "quarter"> = ["all"];
  if (canTimeRange && dataSpanDays > 0) {
    if (dataSpanDays >= 8) availableTimeRanges.push("week");
    if (dataSpanDays >= 31) availableTimeRanges.push("month");
    if (dataSpanDays >= 91) availableTimeRanges.push("quarter");
  }

  // Expose state to Tambo so AI can see what user selected
  useTamboComponentState(JSON.stringify({
    selectedDatasets: Array.from(selectedDatasets),
    timeRange,
    selectedPoint,
    canFilter,
    canTimeRange,
    dataSpanDays,
    availableTimeRanges,
  }));

  // Early returns after all hooks
  if (!props.data) {
    return null;
  }
  
  // If no interactive features are usable, just render the regular Graph
  if (!canFilter && !canTimeRange && !enableDataPointClick) {
    return <Graph {...graphProps} />;
  }

  // Filter datasets based on user selection
  const filteredData = canFilter
    ? {
        ...props.data,
        datasets: props.data.datasets.filter(d => selectedDatasets.has(d.label)),
      }
    : props.data;

  // ============================================================================
  // TIME RANGE FILTERING
  // ============================================================================
  // This feature allows users to filter time-series data by selecting a time window.
  // 
  // HOW IT WORKS:
  // 1. User selects a time range: "all" (default), "week", "month", or "quarter"
  // 2. We calculate a cutoff date (e.g., 7 days ago for "week")
  // 3. We parse each label as a date and check if it's within the range
  // 4. Only data points with dates >= cutoff are included in the filtered result
  //
  // EXAMPLE:
  // - Original labels: ["2024-01-01", "2024-01-15", "2024-02-01", "2024-02-15"]
  // - User selects "month" (30 days)
  // - Today is 2024-02-20
  // - Cutoff date: 2024-01-21
  // - Filtered labels: ["2024-02-01", "2024-02-15"] (only dates after 2024-01-21)
  //
  // REQUIREMENTS:
  // - Labels must be parseable as dates (e.g., "2024-01-01", ISO strings)
  // - Only works for line/bar charts (not pie charts)
  // - If no labels match the range, original data is kept
  // ============================================================================
  
  let finalData = filteredData;
  if (canTimeRange && timeRange !== "all") {
    const now = new Date();
    
    // Convert time range selection to number of days
    const cutoffDays = timeRange === "week" ? 7 : timeRange === "month" ? 30 : timeRange === "quarter" ? 90 : Infinity;
    
    // Calculate the cutoff date (e.g., 7 days ago)
    const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
    
    // Prepare empty arrays to hold filtered results
    const filteredLabels: string[] = [];
    const filteredDatasets = finalData.datasets.map(dataset => ({
      ...dataset,
      data: [] as number[], // Start with empty data array
    }));

    // Loop through each label (x-axis value) and check if it's within range
    finalData.labels.forEach((label, index) => {
      const labelDate = new Date(label); // Try to parse label as a date
      const isValidDate = !isNaN(labelDate.getTime()); // Check if parsing succeeded
      
      // If label is a valid date AND it's after the cutoff, include this data point
      if (isValidDate && labelDate >= cutoffDate) {
        filteredLabels.push(label); // Add label to filtered list
        
        // Add corresponding data point from each dataset
        filteredDatasets.forEach((dataset, dsIndex) => {
          dataset.data.push(finalData.datasets[dsIndex].data[index]);
        });
      }
    });

    // Only apply the filter if we got at least one matching data point
    // Otherwise, keep the original data (prevents showing empty chart)
    if (filteredLabels.length > 0) {
      finalData = {
        ...finalData,
        labels: filteredLabels,
        datasets: filteredDatasets,
      };
    }
  }

  const toggleDataset = (label: string) => {
    setSelectedDatasets(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Dataset Filters */}
        {canFilter && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider self-center">
              Datasets:
            </span>
            {props.data.datasets.map(dataset => (
              <button
                key={dataset.label}
                onClick={() => toggleDataset(dataset.label)}
                className={cn(
                  "px-2 py-1 text-xs font-mono border transition-all",
                  selectedDatasets.has(dataset.label)
                    ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                    : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                )}
              >
                {selectedDatasets.has(dataset.label) ? "✓ " : ""}
                {dataset.label}
              </button>
            ))}
          </div>
        )}

        {/* Time Range Selector */}
        {canTimeRange && (
          <div className="flex gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider self-center">
              Range:
            </span>
            {availableTimeRanges.map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-2 py-1 text-xs font-mono border transition-all uppercase",
                  timeRange === range
                    ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                    : "border-border bg-background/50 text-muted-foreground hover:border-neon-cyan/50"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Graph */}
      <Graph {...graphProps} data={finalData} />

      {/* Selected Point Details */}
      {enableDataPointClick && selectedPoint && (
        <div className="border border-neon-cyan/30 bg-neon-cyan/5 p-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="text-xs font-mono">
            <div className="text-neon-cyan font-bold mb-1">SELECTED DATA POINT</div>
            <div className="text-foreground/80">
              {Object.entries(selectedPoint).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-bold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const InteractiveGraph = withInteractable(InteractiveGraphBase, {
  componentName: "InteractiveGraph",
  description: "An interactive graph component that allows users to filter datasets, select time ranges, and click on data points. AI can see user selections and respond accordingly.",
  propsSchema: interactiveGraphSchema,
});

export { interactiveGraphSchema };
