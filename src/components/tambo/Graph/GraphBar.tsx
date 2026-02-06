import React from "react";
import * as RechartsCore from "recharts";
import { defaultColors } from "./Graph.styles";

interface GraphBarProps {
  chartData: any[];
  validDatasets: any[];
  showLegend?: boolean;
}

const GraphBar = ({ chartData, validDatasets, showLegend }: GraphBarProps) => {
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
        tick={{
          fill: "var(--muted-foreground)",
          fontSize: 10,
          fontFamily: "var(--font-geist-mono)",
        }}
      />
      <RechartsCore.YAxis
        stroke="var(--muted-foreground)"
        axisLine={false}
        tickLine={false}
        tick={{
          fill: "var(--muted-foreground)",
          fontSize: 10,
          fontFamily: "var(--font-geist-mono)",
        }}
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
          fill={dataset.color ?? defaultColors[index % defaultColors.length]}
          radius={[0, 0, 0, 0]}
        />
      ))}
    </RechartsCore.BarChart>
  );
};

export default GraphBar;
