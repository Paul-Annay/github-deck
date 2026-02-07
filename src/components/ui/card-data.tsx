"use client";

import { cn } from "@/lib/utils";
import { useTamboComponentState, useTamboContextHelpers } from "@tambo-ai/react";
import * as React from "react";
import { z } from "zod";
import { Check } from "lucide-react";

// Define option type for individual options in the multi-select
export type DataCardItem = {
  id: string;
  label: string;
  value: string;
  description?: string;
  url?: string;
};

// Define the component state type
export type DataCardState = {
  selectedValues: string[];
  selectedItems: DataCardItem[];
};

// Define the component props schema with Zod
export const dataCardSchema = z.object({
  title: z.string().describe("Title displayed above the data cards"),
  options: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for this card"),
        label: z.string().describe("Display text for the card title"),
        value: z.string().describe("Value associated with this card"),
        description: z
          .string()
          .optional()
          .describe("Optional summary for the card"),
        url: z
          .string()
          .optional()
          .describe("Optional URL for the card to navigate to"),
      }),
    )
    .describe("Array of selectable cards to display"),
});

// Define the props type based on the Zod schema
export type DataCardProps = z.infer<typeof dataCardSchema> &
  React.HTMLAttributes<HTMLDivElement>;

/**
 * DataCard Component
 *
 * A component that displays options as clickable cards with links and summaries
 * with the ability to select multiple items.
 */
export const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  ({ title, options, className, ...props }, ref) => {
    // Initialize Tambo component state
    const [state, setState] = useTamboComponentState<DataCardState>(
      `data-card`,
      { selectedValues: [], selectedItems: [] },
    );

    const { addContextHelper, removeContextHelper } = useTamboContextHelpers();
    const uniqueId = React.useId();
    
    // Broadcast selected items to context
    React.useEffect(() => {
      const contextKey = `data-card-selection-${uniqueId}`;
      const selectedItems = state?.selectedItems || [];
      
      if (selectedItems.length > 0) {
        addContextHelper(contextKey, () => ({
          component: "DataCard",
          title: title || "Untitled Card",
          selectedItems: selectedItems
        }));
      } else {
        removeContextHelper(contextKey);
      }
      
      return () => {
        removeContextHelper(contextKey);
      };
    }, [state?.selectedItems, title, uniqueId, addContextHelper, removeContextHelper]);

    // Handle option selection
    const handleToggleCard = (value: string) => {
      if (!state) return;

      const selectedValues = [...state.selectedValues];
      const selectedItems = [...(state.selectedItems || [])];
      
      const index = selectedValues.indexOf(value);
      const item = options?.find((o) => o.value === value);

      if (!item) return;

      // Toggle selection
      if (index > -1) {
        // Remove if already selected
        selectedValues.splice(index, 1);
        const itemIndex = selectedItems.findIndex((i) => i.value === value);
        if (itemIndex > -1) {
          selectedItems.splice(itemIndex, 1);
        }
      } else {
        selectedValues.push(value);
        selectedItems.push(item);
      }

      // Update component state
      setState({ selectedValues, selectedItems });
    };

    // Handle navigation to URL
    const handleNavigate = (url?: string) => {
      if (url) {
        window.open(url, "_blank");
      }
    };

    return (
      <div ref={ref} className={cn("w-full border border-neon-cyan/20 bg-card/50", className)} {...props}>
        {title && (
          <div className="p-4 border-b border-neon-cyan/20">
            <h3 className="text-sm font-mono font-bold tracking-widest text-neon-cyan/80 uppercase">
              {title}
            </h3>
          </div>
        )}

        <div className="p-4 space-y-2">
          {options?.map((card, index) => (
            <div
              key={`${card.id || "card"}-${index}`}
              className={cn(
                "group flex items-start p-3 border transition-all duration-200",
                state && state.selectedValues.includes(card.value)
                  ? "border-neon-cyan/30 bg-neon-cyan/5"
                  : "border-border bg-background/50 hover:border-neon-cyan/50 hover:bg-card/80"
              )}
            >
              <div
                className="flex-shrink-0 mr-3 mt-0.5 cursor-pointer"
                onClick={() => handleToggleCard(card.value)}
              >
                <div
                  className={cn(
                    "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors",
                    state && state.selectedValues.includes(card.value)
                      ? "bg-neon-cyan border-neon-cyan text-void-black"
                      : "border-muted-foreground/50 hover:border-neon-cyan/50",
                  )}
                >
                  {state && state.selectedValues.includes(card.value) && (
                    <Check className="h-2.5 w-2.5" />
                  )}
                </div>
              </div>
              <div
                className="flex-1 cursor-pointer"
                onClick={() =>
                  card.url
                    ? handleNavigate(card.url)
                    : handleToggleCard(card.value)
                }
              >
                <h4
                  className={cn(
                    "text-sm font-mono font-medium",
                    state && state.selectedValues.includes(card.value)
                      ? "text-neon-cyan"
                      : "text-foreground group-hover:text-neon-cyan",
                  )}
                >
                  {card.label}
                </h4>
                {card.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-mono">
                    {card.description}
                  </p>
                )}
                {card.url && (
                  <span className="text-xs text-neon-amber/80 mt-1 block truncate font-mono">
                    {card.url}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

DataCard.displayName = "DataCard";

export default DataCard;
