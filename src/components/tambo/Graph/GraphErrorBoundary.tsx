import React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// Re-defining variants here or importing? strict standards suggest not duplicating.
// Since `graphVariants` was in `graph.tsx`, let's define it in `Graph.styles.ts` or similar to share.
// For now I'll check if I can just inline the styles needed for error state to keep it self contained 
// OR create a `Graph.styles.ts`. Let's create `Graph.styles.ts` next.
// I'll assume `graphVariants` is available from `./Graph.styles`.

import { graphVariants } from "./Graph.styles";
import { GraphProps } from "./Graph.types";

interface GraphErrorBoundaryProps {
  children: React.ReactNode;
  className?: string;
  variant?: GraphProps["variant"];
  size?: GraphProps["size"];
}

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
          role="alert"
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

export default GraphErrorBoundary;
