import { z } from "zod";
import { cva } from "class-variance-authority";

/**
 * Zod schema for GraphData
 */
export const graphDataSchema = z.object({
  type: z.enum(["bar", "line", "pie"]).describe("Type of graph to render"),
  labels: z.array(z.string()).min(1, "Labels array must contain at least one element").describe("Labels for the graph (must not be empty)"),
  datasets: z
    .array(
      z.object({
        label: z.string().describe("Label for the dataset"),
        data: z.array(z.number()).min(1, "Data array must contain at least one value").describe("Data points for the dataset (must not be empty)"),
        color: z.string().optional().describe("Optional color for the dataset"),
      }),
    )
    .min(1, "Datasets array must contain at least one dataset")
    .describe("Data for the graph (must not be empty)"),
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
 * Variants for the Graph component
 */
 // Using "cva" here but technically it's styling logic. 
 // If standards require types only, this should be in style file or component. 
 // But it's shared. I'll keep it here or just export it from Graph.tsx.
 // Actually, standards say "Types... in companion file". `graphVariants` is logic/code.
 // I will move `graphVariants` to a separate `Graph.styles.ts` or keep in `Graph.tsx`.
 // Let's keep types pure.
