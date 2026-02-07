"use client";

import { useTambo } from "@tambo-ai/react";
import { useMemo, useRef, useEffect } from "react";

/**
 * MainViewscreen - The right panel that displays AI-generated components
 * 
 * This is the main display area where all charts, tables, PRs, diffs, etc. are shown.
 * It automatically displays whatever the AI generates in response to user queries.
 */
export function MainViewscreen() {
  const { thread } = useTambo();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef(0);

  // Get all rendered components from the conversation
  const renderedComponents = useMemo(() => {
    if (!thread?.messages) return [];
    
    return thread.messages
      .filter(msg => msg.role === 'assistant' && msg.renderedComponent)
      .map((msg, index) => ({
        id: msg.id || `component-${index}`,
        component: msg.renderedComponent,
        timestamp: msg.createdAt,
      }));
  }, [thread.messages]);

  // Auto-scroll when new components are added
  useEffect(() => {
    const currentCount = renderedComponents.length;
    
    // Only scroll if a new component was added (not on initial load)
    if (currentCount > previousCountRef.current && previousCountRef.current > 0) {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        // Smooth scroll to bottom
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
    
    previousCountRef.current = currentCount;
  }, [renderedComponents.length]);

  // Check if AI is currently generating (check if last message is from assistant and incomplete)
  const isGenerating = thread?.messages?.length > 0 && 
    thread.messages[thread.messages.length - 1]?.role === 'assistant' &&
    !thread.messages[thread.messages.length - 1]?.renderedComponent;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Display Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
        {renderedComponents.length > 0 ? (
          <div className="p-4 space-y-6">
            {renderedComponents.map((item, index) => (
              <div 
                key={item.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.component}
              </div>
            ))}
          </div>
        ) : isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-neon-cyan/50 gap-4">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-neon-cyan/30 rounded-full animate-spin" 
                   style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 w-24 h-24 border-t-2 border-neon-cyan rounded-full animate-spin" 
                   style={{ animationDuration: '1.5s' }} />
            </div>
            <div className="text-center space-y-2">
              <p className="font-mono text-sm tracking-widest animate-pulse">
                PROCESSING REQUEST...
              </p>
              <p className="font-mono text-xs tracking-wider opacity-60">
                Analyzing data streams
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-6 p-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-current animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-current animate-[spin_15s_linear_infinite_reverse]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-current animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-3 max-w-md">
              <p className="font-mono text-sm tracking-widest animate-pulse">
                MAIN VIEWSCREEN READY
              </p>
              <p className="font-mono text-xs tracking-wider opacity-60 leading-relaxed">
                Initiate analysis by querying a repository
              </p>
              <div className="pt-4 space-y-2 text-xs opacity-40">
                <p>• &quot;Analyze facebook/react&quot;</p>
                <p>• &quot;Show me the pull requests&quot;</p>
                <p>• &quot;Compare with vuejs/vue&quot;</p>
                <p>• &quot;Graph commit activity&quot;</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component Counter */}
      {renderedComponents.length > 0 && (
        <div className="flex-none border-t border-border bg-background/80 px-4 py-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">
              ACTIVE COMPONENTS: {renderedComponents.length}
            </span>
            <span className="text-neon-cyan/60">
              TACTICAL DISPLAY ONLINE
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
