import React from "react";
import { cn } from "@/lib/utils";

interface CommandPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  status?: "active" | "standby" | "alert" | "warning";
  children: React.ReactNode;
}

export function CommandPanel({
  title,
  status = "active",
  className,
  children,
  ...props
}: CommandPanelProps) {
  const statusColor = {
    active: "bg-neon-cyan",
    standby: "bg-gray-500",
    alert: "bg-neon-red",
    warning: "bg-neon-amber",
  };

  const statusBorder = {
    active: "border-neon-cyan/50",
    standby: "border-gray-500/50",
    alert: "border-neon-red/50",
    warning: "border-neon-amber/50",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col border-2 bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-300",
        statusBorder[status],
        status === "active" && "shadow-[0_0_15px_rgba(0,240,255,0.15)]",
        className
      )}
      {...props}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-inherit bg-background/90 relative z-20">
        <div className="flex items-center gap-3">
          {/* Status Light */}
          <div
            className={cn(
              "h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]",
              statusColor[status],
              status === "active" && "animate-pulse"
            )}
          />
          <span className={cn(
            "font-mono text-sm font-bold uppercase tracking-[0.2em]",
            status === "active" ? "text-neon-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" : "text-muted-foreground"
          )}>
            {title || "SYSTEM_MODULE"}
          </span>
        </div>
        
        {/* Technical Deco on Header */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/40 font-bold">
           <span>OP-{(Math.random() * 1000).toFixed(0)}</span>
           <div className="flex gap-1">
             <div className="h-4 w-1 bg-current opacity-20" />
             <div className="h-4 w-2 bg-current opacity-20" />
             <div className="h-4 w-1 bg-current opacity-20" />
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 min-h-0 container-query">
        {/* Inner Grid for Depth */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: "linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)", 
               backgroundSize: "20px 20px" 
             }} 
        />
        
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>

      {/* Decorative Corner Brackets (The "Tech" Look) */}
      <div className={cn("absolute top-0 left-0 h-4 w-12 border-t-2 border-l-2 opacity-80", statusBorder[status].replace("/50", ""))}/>
      <div className={cn("absolute top-0 right-0 h-4 w-12 border-t-2 border-r-2 opacity-80", statusBorder[status].replace("/50", ""))}/>
      <div className={cn("absolute bottom-0 left-0 h-4 w-8 border-b-2 border-l-2 opacity-80", statusBorder[status].replace("/50", ""))}/>
      <div className={cn("absolute bottom-0 right-0 h-4 w-8 border-b-2 border-r-2 opacity-80", statusBorder[status].replace("/50", ""))}/>
      
      {/* Decorative Notches */}
      <div className="absolute top-[50%] left-0 w-1 h-8 bg-current opacity-20 -translate-y-1/2" />
      <div className="absolute top-[50%] right-0 w-1 h-8 bg-current opacity-20 -translate-y-1/2" />
    </div>
  );
}
