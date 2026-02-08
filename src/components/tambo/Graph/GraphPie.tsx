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

  // Create array of data with labels and sort by value (descending - largest first)
  const sortedData = pieDataset.data
    .slice(0, maxDataPoints)
    .map((value: number, index: number) => ({
      name: data.labels[index],
      originalValue: value,
      value,
    }))
    .sort((a: any, b: any) => b.originalValue - a.originalValue);

  // Calculate total for percentage-based minimum
  const total = sortedData.reduce((sum: number, item: any) => sum + item.originalValue, 0);
  
  // Apply minimum visible threshold (2% of total) so small slices are visible
  const minVisibleValue = total * 0.02;
  const normalizedData = sortedData.map((item: any, index: number) => ({
    ...item,
    value: Math.max(item.originalValue, minVisibleValue),
    fill: defaultColors[index % defaultColors.length], // Assign colors after sorting
  }));

  return (
    <RechartsCore.PieChart>
      <RechartsCore.Pie
        data={normalizedData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        stroke="#121214"
        strokeWidth={1}
        paddingAngle={3}
        isAnimationActive={false}
      />
      <RechartsCore.Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0];
            return (
              <div
                style={{
                  backgroundColor: "#0a0a0d",
                  border: "1px solid rgba(0, 240, 255, 0.5)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "11px",
                }}
              >
                <div style={{ color: "#e0e0e0", marginBottom: "4px" }}>
                  {data.name}
                </div>
                <div style={{ color: data.payload.fill, fontWeight: "bold" }}>
                  {data.payload.originalValue}
                </div>
              </div>
            );
          }
          return null;
        }}
      />
      {showLegend && (
        <RechartsCore.Legend
          wrapperStyle={{
            paddingTop: "16px",
            fontFamily: "var(--font-geist-mono)",
            fontSize: "11px",
            color: "#e0e0e0",
          }}
          iconType="square"
          content={(props) => {
            const { payload } = props;
            if (!payload) return null;
            
            // Use our sorted data for the legend
            return (
              <ul style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                justifyContent: "center",
                gap: "12px",
                paddingTop: "16px",
                listStyle: "none",
                margin: 0,
              }}>
                {normalizedData.map((item: any, index: number) => (
                  <li key={`legend-${index}`} style={{ 
                    display: "flex", 
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "11px",
                    color: "#fff",
                  }}>
                    <span style={{ 
                      width: "12px", 
                      height: "12px", 
                      backgroundColor: item.fill,
                      display: "inline-block",
                    }} />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            );
          }}
        />
      )}
    </RechartsCore.PieChart>
  );
};

export default GraphPie;
