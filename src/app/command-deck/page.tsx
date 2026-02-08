"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import CommandPanel from "@/components/ui/CommandPanel";
import { MainViewscreen } from "@/components/tambo/insights/MainViewscreen";
import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import GridScan from "@/components/ui/GridScan/GridScan";

const MIN_CHAT_WIDTH = 320;
const MIN_VIEWSCREEN_WIDTH = 400;
const DEFAULT_CHAT_WIDTH_PERCENT = 33.33; // 4/12 columns = 33.33%

export default function Home() {
  // Load MCP server configurations
  const mcpServers = useMcpServers();
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
  
  const [chatWidthPercent, setChatWidthPercent] = useState(DEFAULT_CHAT_WIDTH_PERCENT);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const newWidth = e.clientX - containerRect.left;
      const newWidthPercent = (newWidth / containerWidth) * 100;

      // Calculate minimum percentages based on container width
      const minChatPercent = (MIN_CHAT_WIDTH / containerWidth) * 100;
      const minViewscreenPercent = (MIN_VIEWSCREEN_WIDTH / containerWidth) * 100;
      const maxChatPercent = 100 - minViewscreenPercent;

      // Clamp width between min and max
      const clampedPercent = Math.max(minChatPercent, Math.min(maxChatPercent, newWidthPercent));
      setChatWidthPercent(clampedPercent);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  if (!apiKey) {
    return <ApiKeyCheck />;
  }

  return (
    <TamboProvider
      apiKey={apiKey}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <main className="h-screen w-full p-4 flex flex-col gap-4 overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <GridScan
           scanColor="#00F0FF"
           linesColor="#00F0FF"
           enablePost={true}           
          />
        </div>
        {/* Background Grid Overlay (extra depth) */}
        <div className="absolute inset-0 bg-grid-overlay opacity-20 pointer-events-none z-0" />

        {/* Header */}
        <header className="flex-none flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1 className="text-2xl font-mono font-bold tracking-widest text-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] hover:text-primary/80 transition-colors cursor-pointer">
                GITHUB COMMAND DECK
              </h1>
            </Link>
            <div className="h-px w-32 bg-primary/50" />
            <span className="text-xs text-muted-foreground font-mono">
              SYS.VER.1.0 // ONLINE
            </span>
          </div>
          <div className="flex gap-2">
             <div className="h-2 w-2 bg-destructive animate-pulse rounded-full" />
             <div className="h-2 w-2 bg-secondary animate-pulse delay-75 rounded-full" />
             <div className="h-2 w-2 bg-primary animate-pulse delay-150 rounded-full" />
          </div>
        </header>

        {/* Main Content Grid */}
        <div 
          ref={containerRef}
          className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 z-10"
        >
          
          {/* Left Panel: Chat / Command Console */}
          <CommandPanel 
            title="COMMUNICATION UPLINK" 
            className="flex flex-col min-h-0 lg:min-w-[320px]"
            style={{ width: `${chatWidthPercent}%` }}
            status="active"
          >
            <MessageThreadFull className="h-full" />
          </CommandPanel>

          {/* Resize Handle - Desktop Only */}
          <div className="hidden lg:block relative">
            <div
              onMouseDown={handleMouseDown}
              className="w-1 h-full bg-primary/20 hover:bg-primary/40 cursor-col-resize relative group"
            >
              <div className="absolute inset-y-0 -left-2 -right-2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-primary opacity-0 group-hover:opacity-100 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            </div>
          </div>

          {/* Right Panel: Main Viewscreen */}
          <CommandPanel 
            title="MAIN VIEWSCREEN" 
            className="flex flex-col min-h-0 lg:min-w-[500px] flex-1"
            status="active"
          >
            <MainViewscreen />
          </CommandPanel>
        
        </div>
      </main>
    </TamboProvider>
  );
}
