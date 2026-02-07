import { cva } from "class-variance-authority";

export const graphVariants = cva(
  "w-full rounded-none overflow-hidden transition-all duration-200 border hover:border-neon-cyan/30",
  {
    variants: {
      variant: {
        default: "bg-background/50 border-neon-cyan/20",
        solid: [
          "shadow-lg shadow-neon-cyan/5",
          "bg-card",
          "border-neon-cyan/20",
        ].join(" "),
        bordered: ["border-neon-cyan/50"].join(" "),
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

export const defaultColors = [
  "#00f0ff", // Bright Cyan
  "#ff2a2a", // Bright Red
  "#ffb000", // Amber
  "#00d4ff", // Sky Cyan
  "#ff5e5e", // Coral
  "#ffc933", // Gold
  "#00b8e6", // Deep Cyan
  "#ff7b7b", // Light Red
  "#ffe066", // Yellow
  "#0099cc", // Ocean Blue
  "#ff9999", // Pink Red
  "#ffaa33", // Orange
  "#007799", // Teal
  "#ffb3b3", // Pale Red
  "#ffd699", // Peach
  "#005566", // Dark Teal
];
