import { cva } from "class-variance-authority";

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

export const defaultColors = [
  "#00f0ff", // Neon Cyan
  "#ffb000", // Neon Amber
  "#ff2a2a", // Neon Red
  "#9d4edd", // Purple (Accent)
  "#70e000", // Green (Accent)
];
