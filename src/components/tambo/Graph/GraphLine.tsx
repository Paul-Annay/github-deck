import React from "react";
import * as RechartsCore from "recharts";
import { defaultColors } from "./Graph.styles";

interface GraphLineProps {
  chartData: any[];
  validDatasets: any[];
  showLegend?: boolean;
}

const GraphLine = ({ chartData, validDatasets, showLegend }: GraphLineProps) => {
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
          stroke={dataset.color ?? defaultColors[index % defaultColors.length]}
          dot={{
            r: 3,
            strokeWidth: 0,
            fill: dataset.color ?? defaultColors[index % defaultColors.length],
          }}
          activeDot={{ r: 5, strokeWidth: 0, fill: "#fff" }}
          strokeWidth={2}
        />
      ))}
    </RechartsCore.LineChart>
  );
};

export default GraphLine;
