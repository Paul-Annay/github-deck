"use client";

import React from "react";
import { cn } from "@/lib/utils";
import * as RechartsCore from "recharts";
import { GraphProps } from "./Graph.types";
import { graphVariants } from "./Graph.styles";
import GraphErrorBoundary from "./GraphErrorBoundary";
import GraphBar from "./GraphBar";
import GraphLine from "./GraphLine";
import GraphPie from "./GraphPie";
import { useCommandPanel } from "@/components/ui/CommandPanelContext";
import { Maximize2 } from "lucide-react";

const Graph = React.forwardRef<HTMLDivElement, GraphProps>(
  (
    { className, variant, size, data, title, showLegend = true, ...props },
    ref,
  ) => {
    const { setPanelContent } = useCommandPanel();

    const handleMaximize = () => {
      setPanelContent(
        <InteractiveGraph
          data={data}
          title={title}
          showLegend={showLegend}
          variant="solid"
          size="lg"
          className="h-full w-full border-0"
        />,
        title || "DATA VISUALIZATION",
        "active"
      );
    };

    // If no data received yet, show loading
    if (!data) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          role="status"
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-neon-cyan/50 font-mono">
              <div className="flex items-center gap-1 h-4">
                <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.2s]"></span>
                <span className="w-2 h-2 bg-current animate-pulse [animation-delay:-0.1s]"></span>
              </div>
              <span className="text-xs tracking-widest">AWAITING DATALINK...</span>
            </div>
          </div>
        </div>
      );
    }

    // Check if we have the minimum viable data structure
    const hasValidStructure =
      data.type &&
      data.labels &&
      data.datasets &&
      Array.isArray(data.labels) &&
      Array.isArray(data.datasets) &&
      data.labels.length > 0 &&
      data.datasets.length > 0;

    if (!hasValidStructure) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          role="status"
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-muted-foreground text-center font-mono">
              <p className="text-xs animate-pulse">CALIBRATING DISPLAY...</p>
            </div>
          </div>
        </div>
      );
    }

    // Filter datasets to only include those with valid data
    const validDatasets = data.datasets.filter(
      (dataset) =>
        dataset.label &&
        dataset.data &&
        Array.isArray(dataset.data) &&
        dataset.data.length > 0,
    );

    if (validDatasets.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          role="status"
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-muted-foreground text-center font-mono">
              <p className="text-xs">NO SIGNAL DETECTED</p>
            </div>
          </div>
        </div>
      );
    }

    // Use the minimum length between labels and the shortest dataset
    const maxDataPoints = Math.min(
      data.labels.length,
      Math.min(...validDatasets.map((d) => d.data.length)),
    );

    // Transform data for Recharts using only available data points
    // Note: GraphPie handles its own data slicing
    const chartData = data.labels
      .slice(0, maxDataPoints)
      .map((label, index) => ({
        name: label,
        ...Object.fromEntries(
          validDatasets.map((dataset) => [
            dataset.label,
            dataset.data[index] ?? 0,
          ]),
        ),
      }));

    const renderChart = () => {
      switch (data.type) {
        case "bar":
          return <GraphBar chartData={chartData} validDatasets={validDatasets} showLegend={showLegend} />;
        case "line":
          return <GraphLine chartData={chartData} validDatasets={validDatasets} showLegend={showLegend} />;
        case "pie":
          return <GraphPie data={data} validDatasets={validDatasets} maxDataPoints={maxDataPoints} showLegend={showLegend} />;
        default:
          return (
            <div className="h-full flex items-center justify-center">
              <div className="text-destructive text-center font-mono">
                <p className="text-xs">UNKNOWN SIGNAL TYPE: {data.type}</p>
              </div>
            </div>
          );
      }
    };

    return (
      <GraphErrorBoundary className={className} variant={variant} size={size}>
        <figure
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          {...props}
        >
          <div className="p-4 h-full relative group">
            {/* Grid background for the chart area */}
             <div className="absolute inset-0 bg-grid-overlay opacity-10 pointer-events-none" aria-hidden="true" />
            
            <div className="flex items-center justify-between mb-4 border-b border-neon-cyan/20 pb-2">
              {title && (
                <figcaption className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
                  {title}
                </figcaption>
              )}
              <button 
                onClick={handleMaximize}
                className="text-neon-cyan/50 hover:text-neon-cyan hover:bg-neon-cyan/10 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Open in Main Viewscreen"
                aria-label="Maximize to Main Viewscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            <div className="w-full h-[calc(100%-2.5rem)] relative z-10">
              <RechartsCore.ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </RechartsCore.ResponsiveContainer>
            </div>
          </div>
        </figure>
      </GraphErrorBoundary>
    );
  },
);

Graph.displayName = "Graph";
export default Graph;
