"use client";

import { useCommandPanel } from "@/components/ui/CommandPanelContext";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Maximize2 } from "lucide-react";
import * as React from "react";
import * as RechartsCore from "recharts";
import { z } from "zod";

/**
 * Type for graph variant
 */
type GraphVariant = "default" | "solid" | "bordered";

/**
 * Type for graph size
 */
type GraphSize = "default" | "sm" | "lg";

/**
 * Variants for the Graph component
 */
export const graphVariants = cva(
  "w-full rounded-none overflow-hidden transition-all duration-200 border border-transparent hover:border-neon-cyan/20",
  {
    variants: {
      variant: {
        default: "bg-background/50",
        solid: [
          "shadow-lg shadow-neon-cyan/5",
          "bg-card",
        ].join(" "),
        bordered: ["border", "border-neon-cyan/50"].join(" "),
      },
      size: {
        default: "h-64",
        sm: "h-48",
        lg: "h-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Props for the error boundary
 */
interface GraphErrorBoundaryProps {
  children: React.ReactNode;
  className?: string;
  variant?: GraphVariant;
  size?: GraphSize;
}

/**
 * Error boundary for catching rendering errors in the Graph component
 */
class GraphErrorBoundary extends React.Component<
  GraphErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: GraphErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error rendering chart:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className={cn(
            graphVariants({
              variant: this.props.variant,
              size: this.props.size,
            }),
            this.props.className,
          )}
        >
          <div className="p-4 flex items-center justify-center h-full">
            <div className="text-destructive text-center font-mono">
              <p className="font-medium animate-pulse">SYSTEM ERROR: RENDER FAILED</p>
              <p className="text-xs mt-1 text-muted-foreground">
                Display module offline.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Zod schema for GraphData
 */
export const graphDataSchema = z.object({
  type: z.enum(["bar", "line", "pie"]).describe("Type of graph to render"),
  labels: z.array(z.string()).describe("Labels for the graph"),
  datasets: z
    .array(
      z.object({
        label: z.string().describe("Label for the dataset"),
        data: z.array(z.number()).describe("Data points for the dataset"),
        color: z.string().optional().describe("Optional color for the dataset"),
      }),
    )
    .describe("Data for the graph"),
});

/**
 * Zod schema for Graph
 */
export const graphSchema = z.object({
  data: graphDataSchema.describe(
    "Data object containing chart configuration and values",
  ),
  title: z.string().describe("Title for the chart"),
  showLegend: z
    .boolean()
    .optional()
    .describe("Whether to show the legend (default: true)"),
  variant: z
    .enum(["default", "solid", "bordered"])
    .optional()
    .describe("Visual style variant of the graph"),
  size: z
    .enum(["default", "sm", "lg"])
    .optional()
    .describe("Size of the graph"),
  className: z
    .string()
    .optional()
    .describe("Additional CSS classes for styling"),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type GraphProps = z.infer<typeof graphSchema>;

/**
 * TypeScript type inferred from the Zod schema
 */
export type GraphDataType = z.infer<typeof graphDataSchema>;

/**
 * Default colors for the Graph component. (Command Deck Theme)
 */
const defaultColors = [
  "#00f0ff", // Neon Cyan
  "#ffb000", // Neon Amber
  "#ff2a2a", // Neon Red
  "#9d4edd", // Purple (Accent)
  "#70e000", // Green (Accent)
];

/**
 * A component that renders various types of charts using Recharts
 */
export const Graph = React.forwardRef<HTMLDivElement, GraphProps>(
  (
    { className, variant, size, data, title, showLegend = true, ...props },
    ref,
  ) => {
    const { setPanelContent } = useCommandPanel();

    const handleMaximize = () => {
      setPanelContent(
        <Graph
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
    // Transformation omitted for brevity as it's unchanged in logic
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
      if (!["bar", "line", "pie"].includes(data.type)) {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-destructive text-center font-mono">
              <p className="text-xs">UNKNOWN SIGNAL TYPE: {data.type}</p>
            </div>
          </div>
        );
      }

      switch (data.type) {
        case "bar":
          return (
            <RechartsCore.BarChart data={chartData}>
              <RechartsCore.CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(0, 240, 255, 0.1)"
              />
              <RechartsCore.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <RechartsCore.YAxis
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <RechartsCore.Tooltip
                cursor={{
                  fill: "rgba(0, 240, 255, 0.05)",
                }}
                contentStyle={{
                  backgroundColor: "#0a0a0d",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  borderRadius: "0px",
                  color: "#e0e0e0",
                  fontFamily: "var(--font-geist-mono)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                     paddingTop: "10px",
                     fontFamily: "var(--font-geist-mono)",
                     fontSize: "12px",
                  }}
                />
              )}
              {validDatasets.map((dataset, index) => (
                <RechartsCore.Bar
                  key={dataset.label}
                  dataKey={dataset.label}
                  fill={
                    dataset.color ?? defaultColors[index % defaultColors.length]
                  }
                  radius={[0, 0, 0, 0]} 
                />
              ))}
            </RechartsCore.BarChart>
          );

        case "line":
          return (
            <RechartsCore.LineChart data={chartData}>
              <RechartsCore.CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(0, 240, 255, 0.1)"
              />
              <RechartsCore.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <RechartsCore.YAxis
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <RechartsCore.Tooltip
                cursor={{
                  stroke: "var(--neon-cyan)",
                  strokeWidth: 1,
                  strokeOpacity: 0.5,
                  strokeDasharray: "3 3",
                }}
                contentStyle={{
                  backgroundColor: "#0a0a0d",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  borderRadius: "0px",
                  color: "#e0e0e0",
                  fontFamily: "var(--font-geist-mono)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                     paddingTop: "10px",
                     fontFamily: "var(--font-geist-mono)",
                     fontSize: "12px",
                  }}
                />
              )}
              {validDatasets.map((dataset, index) => (
                <RechartsCore.Line
                  key={dataset.label}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={
                    dataset.color ?? defaultColors[index % defaultColors.length]
                  }
                  dot={{ r: 3, strokeWidth: 0, fill: dataset.color ?? defaultColors[index % defaultColors.length] }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: "#fff" }}
                  strokeWidth={2}
                />
              ))}
            </RechartsCore.LineChart>
          );

        case "pie": {
          const pieDataset = validDatasets[0];
          if (!pieDataset) {
            return (
              <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground text-center font-mono">
                   <p className="text-xs">NO PIE DATASET</p>
                </div>
              </div>
            );
          }

          return (
            <RechartsCore.PieChart>
              <RechartsCore.Pie
                data={pieDataset.data
                  .slice(0, maxDataPoints)
                  .map((value, index) => ({
                    name: data.labels[index],
                    value,
                    fill: defaultColors[index % defaultColors.length],
                  }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50} // Donut style looks more sci-fi
                outerRadius={80}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={2}
                label
              />
              <RechartsCore.Tooltip
                 contentStyle={{
                  backgroundColor: "#0a0a0d",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  borderRadius: "0px",
                  color: "#e0e0e0",
                  fontFamily: "var(--font-geist-mono)",
                }}
              />
              {showLegend && (
                 <RechartsCore.Legend
                  wrapperStyle={{
                     paddingTop: "10px",
                     fontFamily: "var(--font-geist-mono)",
                     fontSize: "12px",
                  }}
                />
              )}
            </RechartsCore.PieChart>
          );
        }
      }
    };

    return (
      <GraphErrorBoundary className={className} variant={variant} size={size}>
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          {...props}
        >
          <div className="p-4 h-full relative group">
            {/* Grid background for the chart area */}
             <div className="absolute inset-0 bg-grid-overlay opacity-10 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 border-b border-neon-cyan/20 pb-2 min-h-[29px]">
               {title ? (
                 <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
                   {title}
                 </h3>
               ) : <span />}
               
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
        </div>
      </GraphErrorBoundary>
    );
  },
);
Graph.displayName = "Graph";
