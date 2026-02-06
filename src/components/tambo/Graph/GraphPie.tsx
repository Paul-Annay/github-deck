import React from "react";
import * as RechartsCore from "recharts";
import { defaultColors } from "./Graph.styles";

interface GraphPieProps {
  data: any; // Raw data object
  validDatasets: any[];
  maxDataPoints: number;
  showLegend?: boolean;
}

const GraphPie = ({
  data,
  validDatasets,
  maxDataPoints,
  showLegend,
}: GraphPieProps) => {
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
        data={pieDataset.data.slice(0, maxDataPoints).map((value: number, index: number) => ({
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
};

export default GraphPie;
