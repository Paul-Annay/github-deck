import React from "react";
import { cn } from "@/lib/utils";
import { CommandPanelProps } from "./CommandPanel.types";

const CommandPanel = ({
  title,
  status = "active",
  className,
  children,
  ...props
}: CommandPanelProps) => {
  // Use deterministic ID from title to avoid hydration mismatch (Math.random differs on server vs client)
  const opId = React.useMemo(() => {
    let hash = 0;
    const str = title || "unknown";
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 1000)
      .toString()
      .padStart(3, "0");
  }, [title]);

  return (
    <section
      className={cn(
        "relative flex flex-col border-2 bg-transparent overflow-hidden transition-all duration-300",
        status === "active" && "shadow-[0_0_15px_rgba(0,240,255,0.15)]",
        className,
      )}
      aria-label={title || "System Module"}
      {...props}
    >
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-inherit bg-transparent relative z-20">
        <div className="flex items-center gap-3">
          {/* Status Light */}
          <div
            className={cn(
              "h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]",
              status === "active" && "animate-pulse",
            )}
            aria-hidden="true"
          />
          <h2
            className={cn(
              "font-mono text-sm font-bold uppercase tracking-[0.2em]",
              status === "active"
                ? "text-neon-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]"
                : "text-muted-foreground",
            )}
          >
            {title || "SYSTEM_MODULE"}
          </h2>
        </div>

        {/* Technical Deco on Header */}
        <div
          className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/40 font-bold"
          aria-hidden="true"
        >
          <span>OP-{opId}</span>
          <div className="flex gap-1">
            <div className="h-4 w-1 bg-current opacity-20" />
            <div className="h-4 w-2 bg-current opacity-20" />
            <div className="h-4 w-1 bg-current opacity-20" />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="relative flex-1 min-h-0 container-query">
        {/* Inner Grid for Depth */}
        {/* Panel background pattern removed */}

        <div className="relative z-10 h-full w-full">{children}</div>
      </div>

      {/* Decorative Corner Brackets (The "Tech" Look) */}
      <div
        className={cn(
          "absolute top-0 left-0 h-4 w-12 border-t-2 border-l-2 opacity-80",
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute top-0 right-0 h-4 w-12 border-t-2 border-r-2 opacity-80",
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 h-4 w-8 border-b-2 border-l-2 opacity-80",
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute bottom-0 right-0 h-4 w-8 border-b-2 border-r-2 opacity-80",
        )}
        aria-hidden="true"
      />

      {/* Decorative Notches */}
      <div
        className="absolute top-[50%] left-0 w-1 h-8 opacity-20 -translate-y-1/2"
        aria-hidden="true"
      />
      <div
        className="absolute top-[50%] right-0 w-1 h-8 opacity-20 -translate-y-1/2"
        aria-hidden="true"
      />
    </section>
  );
};

export default CommandPanel;
