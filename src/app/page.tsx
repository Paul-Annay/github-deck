"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import CommandPanel from "@/components/ui/CommandPanel";
import TargetCursor from "@/components/TargetCursor.jsx"
import { ApiKeyCheck } from "@/components/ApiKeyCheck";

import { GridScan } from "@/components/ui/GridScan/GridScan";

export default function Home() {
  // Load MCP server configurations
  const mcpServers = useMcpServers();
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

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
        <TargetCursor 
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
  hoverDuration={0.2}
/>
      <main className="h-screen w-full p-4 flex flex-col gap-4 overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <GridScan
            scanColor="#00f0ff"
            linesColor="#1a1a1a"
            enablePost={true}
          />
        </div>

        {/* Header */}
        <header className="flex-none flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h1 className="cursor-target text-2xl font-mono font-bold tracking-widest text-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              GITHUB COMMAND DECK
            </h1>
            <div className="h-px w-32" />
            <span className="text-xs text-muted-foreground font-mono">
              SYS.VER.1.0 // ONLINE
            </span>
          </div>
          <div className="flex gap-2">
            <div className="h-2 w-2  animate-pulse rounded-full" />
            <div className="h-2 w-2  animate-pulse delay-75 rounded-full" />
            <div className="h-2 w-2  animate-pulse delay-150 rounded-full" />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 z-10">
          {/* Left Panel: Chat / Command Console */}
          <CommandPanel
            title="COMMUNICATION UPLINK"
            className="lg:col-span-4 flex flex-col min-h-0"
            status="active"
          >
            <MessageThreadFull className="h-full" />
          </CommandPanel>

          {/* Right Panel: Data Visualizations (Placeholder for now) */}
          <CommandPanel
            title="MAIN VIEWSCREEN"
            className="lg:col-span-8 flex flex-col min-h-0"
            status="standby"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 gap-4 p-4">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-current animate-[spin_10s_linear_infinite]" />
              <p className="font-mono text-sm tracking-widest animate-pulse">
                AWAITING DATA STREAM...
              </p>
            </div>
          </CommandPanel>
        </div>
      </main>
    </TamboProvider>
  );
}
