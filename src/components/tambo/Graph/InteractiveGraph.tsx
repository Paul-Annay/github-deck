"use client";

import React, { useState } from "react";
import { GraphProps, GraphDataType } from "./Graph.types";
import Graph from "./Graph";
import { cn } from "@/lib/utils";
import { BarChart, LineChart, PieChart, Eye, EyeOff } from "lucide-react";

interface InteractiveGraphProps extends GraphProps {}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  data,
  title,
  className,
  ...props
}) => {
  // State for chart type
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">(
    data.type as "bar" | "line" | "pie"
  );

  // State for visible datasets (store label strings)
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<string>>(new Set());

  // Derive transformed data based on state
  const activeData: GraphDataType = {
    ...data,
    type: chartType,
    datasets: data.datasets.filter((d) => !hiddenDatasets.has(d.label)),
  };

  const toggleDataset = (label: string) => {
    const newHidden = new Set(hiddenDatasets);
    if (newHidden.has(label)) {
      newHidden.delete(label);
    } else {
      // Prevent hiding the last dataset
      if (data.datasets.length - newHidden.size > 1) {
        newHidden.add(label);
      }
    }
    setHiddenDatasets(newHidden);
  };

  return (
    <div className={cn("flex flex-col h-full w-full gap-4", className)}>
      {/* Control Bar */}
      <div className="flex items-center justify-between bg-card/50 p-2 rounded-md border border-border">
        {/* Chart Type Selector */}
        <div className="flex items-center gap-1">
          <ControlButton
            active={chartType === "bar"}
            onClick={() => setChartType("bar")}
            icon={<BarChart size={16} />}
            label="Bar"
          />
          <ControlButton
            active={chartType === "line"}
            onClick={() => setChartType("line")}
            icon={<LineChart size={16} />}
            label="Line"
          />
          <ControlButton
            active={chartType === "pie"}
            onClick={() => setChartType("pie")}
            icon={<PieChart size={16} />}
            label="Pie"
          />
        </div>

        {/* Dataset Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-[50%] no-scrollbar">
          {data.datasets.map((d) => {
            const isHidden = hiddenDatasets.has(d.label);
            return (
              <button
                key={d.label}
                onClick={() => toggleDataset(d.label)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all whitespace-nowrap",
                  isHidden
                    ? "border-muted bg-muted/20 text-muted-foreground opacity-50"
                    : "border-primary/20 bg-primary/10 text-primary"
                )}
                title={isHidden ? "Show dataset" : "Hide dataset"}
              >
                {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Graph Display */}
      <div className="flex-1 min-h-0 relative">
         <Graph
            {...props}
            data={activeData}
            title={title}
            className="h-full w-full border-0 shadow-none bg-transparent"
            showLegend={true}
            size="lg" // Force LG for interactivity
         />
      </div>
    </div>
  );
};

const ControlButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 rounded transition-all flex items-center gap-2 text-sm",
      active
        ? "bg-primary text-primary-foreground shadow-sm font-medium"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
    title={`Switch to ${label} Chart`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);
