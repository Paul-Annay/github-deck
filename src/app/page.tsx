"use client";

import Link from "next/link";
import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { GridScan } from "@/components/ui/GridScan/GridScan";

export default function OnboardingPage() {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (!apiKey) {
    return <ApiKeyCheck />;
  }

  return (
    <div className="min-h-screen h-full w-full overflow-y-auto overflow-x-hidden mb-5">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <GridScan
           scanColor="#00F0FF"
           linesColor="#00F0FF"
           enablePost={true}           
          />
        </div>
      <main className="w-full p-4 md:p-8 relative h-full">
        {/* Background Grid Overlay */}
        <div className="fixed inset-0 bg-grid-overlay opacity-20 pointer-events-none -z-10" />
      
      {/* Animated corner accents 
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/30 animate-pulse pointer-events-none" />
      <div className="fixed top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/30 animate-pulse delay-75 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/30 animate-pulse delay-150 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/30 animate-pulse pointer-events-none" />
      */}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-16 py-12 backdrop-blur-md bg-background/90 rounded-lg p-8 border-2 border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
        {/* Decorative Corner Brackets 
        <div className="absolute top-0 left-0 h-4 w-12 border-t-2 border-l-2 border-primary opacity-80" aria-hidden="true"/>
        <div className="absolute top-0 right-0 h-4 w-12 border-t-2 border-r-2 border-primary opacity-80" aria-hidden="true"/>
        <div className="absolute bottom-0 left-0 h-4 w-8 border-b-2 border-l-2 border-primary opacity-80" aria-hidden="true"/>
        <div className="absolute bottom-0 right-0 h-4 w-8 border-b-2 border-r-2 border-primary opacity-80" aria-hidden="true"/>
        */}
        
        {/* Decorative Notches 
        <div className="absolute top-[50%] left-0 w-1 h-8 bg-primary opacity-20 -translate-y-1/2" aria-hidden="true" />
        <div className="absolute top-[50%] right-0 w-1 h-8 bg-primary opacity-20 -translate-y-1/2" aria-hidden="true" />
        */}
        
        
        {/* Header */}
        <div className="text-center space-y-6">
          {/* Status Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="h-2 w-2 bg-destructive animate-pulse rounded-full" />
            <div className="h-2 w-2 bg-secondary animate-pulse delay-75 rounded-full" />
            <div className="h-2 w-2 bg-primary animate-pulse delay-150 rounded-full" />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-mono font-bold tracking-widest text-primary drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              GITHUB COMMAND DECK
            </h1>
            {/* 
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 max-w-32 bg-primary/30" />
              <span className="text-xs md:text-sm text-muted-foreground font-mono whitespace-nowrap">
                TAMBO HACKATHON SUBMISSION
              </span>
              <div className="h-px flex-1 max-w-32 bg-primary/30" />
            </div>
            */}
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-foreground/90 font-mono leading-relaxed max-w-3xl mx-auto">
            Conversational GitHub analytics with <span className="text-primary">true bi-directional interactables</span>. 
            Talk to your repository, generate insights on demand.
          </p>

          {/* Hero CTA */}
          <div className="pt-6">
            <Link
              href="/command-deck"
              className="inline-block px-10 py-4 bg-primary/10 border-2 border-primary text-primary font-mono font-bold text-lg tracking-wider hover:bg-primary hover:text-background transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]"
            >
              LAUNCH COMMAND DECK →
            </Link>
          </div>
        </div>

        {/* Core Innovation */}
        <div className="border-2 border-primary/30 bg-background/80 p-8 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
          <div className="text-center space-y-4">
            <div className="text-sm text-primary font-mono tracking-wider">{'//'} CORE INNOVATION</div>
            <h2 className="text-3xl font-mono font-bold text-primary">TRUE BI-DIRECTIONAL INTERACTABLES</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Not just AI-generated UI. These are collaborative controls where <span className="text-foreground">users click, AI responds</span>. 
              <span className="text-foreground"> AI updates, users see it instantly</span>. Shared agency between human and AI.
            </p>
          </div>
        </div>

        {/* Interactable Components */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-mono font-bold text-primary mb-2">INTERACTABLE COMPONENTS</h3>
            <p className="text-sm text-muted-foreground font-mono">Production-ready bi-directional controls</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* InsightCardStack */}
            <div className="border border-primary/20 bg-background/80 p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-mono font-bold text-primary">InsightCardStack</h4>
                  <p className="text-xs text-muted-foreground font-mono">AI-Generated Intelligence Cards</p>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>AI analyzes repo data and generates tactical insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Users dismiss individual cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>AI sees dismissals via <code className="text-primary">useTamboComponentState()</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Color-coded by severity (critical/warning/info/success)</span>
                </li>
              </ul>
            </div>

            {/* ComparisonBuilder */}
            <div className="border border-primary/20 bg-background/80 p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-mono font-bold text-primary">ComparisonBuilder</h4>
                  <p className="text-xs text-muted-foreground font-mono">Collaborative Repository Selection</p>
                </div>
                <div className="text-2xl">🤝</div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Users add/remove repositories manually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>AI pre-fills repos based on conversation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Both sides see the same state in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Triggers comparison when 2+ repos added</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Generative Components */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-mono font-bold text-primary mb-2">GENERATIVE UI COMPONENTS</h3>
            <p className="text-sm text-muted-foreground font-mono">AI-rendered visualizations on demand</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-primary/20 bg-background/80 p-4 text-center space-y-2">
              <div className="text-3xl">📊</div>
              <h4 className="font-mono font-bold text-primary">Graph</h4>
              <p className="text-xs text-muted-foreground">Bar, line, pie charts with Recharts</p>
            </div>
            <div className="border border-primary/20 bg-background/80 p-4 text-center space-y-2">
              <div className="text-3xl">🔀</div>
              <h4 className="font-mono font-bold text-primary">PRViewer</h4>
              <p className="text-xs text-muted-foreground">Pull request list with filtering</p>
            </div>
            <div className="border border-primary/20 bg-background/80 p-4 text-center space-y-2">
              <div className="text-3xl">⚖️</div>
              <h4 className="font-mono font-bold text-primary">ComparisonTable</h4>
              <p className="text-xs text-muted-foreground">Side-by-side repo metrics</p>
            </div>
            <div className="border border-primary/20 bg-background/80 p-4 text-center space-y-2">
              <div className="text-3xl">📝</div>
              <h4 className="font-mono font-bold text-primary">DiffViewer</h4>
              <p className="text-xs text-muted-foreground">Syntax-highlighted code diffs</p>
            </div>
            <div className="border border-primary/20 bg-background/80 p-4 text-center space-y-2">
              <div className="text-3xl">🎴</div>
              <h4 className="font-mono font-bold text-primary">DataCard</h4>
              <p className="text-xs text-muted-foreground">Clickable option cards</p>
            </div>
            <div className="border border-primary/20 bg-background/80 p-4 text-center space-y-2">
              <div className="text-3xl">🧠</div>
              <h4 className="font-mono font-bold text-primary">AI Insights</h4>
              <p className="text-xs text-muted-foreground">Advanced pattern detection</p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-primary/20 bg-background/80 p-6 space-y-3">
            <div className="text-primary font-mono text-sm tracking-wider">{'//'} ADVANCED AI</div>
            <h4 className="text-lg font-mono font-bold">Intelligent Insights</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Repository maturity analysis</li>
              <li>• Community engagement scoring</li>
              <li>• Activity pattern detection</li>
              <li>• Severity-based alerting</li>
            </ul>
          </div>

          <div className="border border-primary/20 bg-background/80 p-6 space-y-3">
            <div className="text-primary font-mono text-sm tracking-wider">{'//'} GITHUB DATA</div>
            <h4 className="text-lg font-mono font-bold">Complete Analytics</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Pull requests & issues</li>
              <li>• Commit activity & trends</li>
              <li>• Contributor analysis</li>
              <li>• Release history</li>
            </ul>
          </div>

          <div className="border border-primary/20 bg-background/80 p-6 space-y-3">
            <div className="text-primary font-mono text-sm tracking-wider">{'//'} COMMAND DECK</div>
            <h4 className="text-lg font-mono font-bold">Tactical UX</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Star Destroyer aesthetic</li>
              <li>• Split-panel interface</li>
              <li>• Neon cyan accents</li>
              <li>• Smooth animations</li>
            </ul>
          </div>
        </div>

        {/* Demo Queries */}
        <div className="border-2 border-primary/20 bg-background/80 p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-mono font-bold text-primary mb-2">TRY THESE QUERIES</h3>
            <p className="text-sm text-muted-foreground font-mono">Natural language commands that generate UI</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
            <div className="bg-background/50 p-4 border border-primary/10">
              <span className="text-primary">$</span> &quot;Analyze facebook/react&quot;
            </div>
            <div className="bg-background/50 p-4 border border-primary/10">
              <span className="text-primary">$</span> &quot;Show me the pull requests&quot;
            </div>
            <div className="bg-background/50 p-4 border border-primary/10">
              <span className="text-primary">$</span> &quot;Compare with vuejs/vue&quot;
            </div>
            <div className="bg-background/50 p-4 border border-primary/10">
              <span className="text-primary">$</span> &quot;Graph commit activity&quot;
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6">
          <Link
            href="/command-deck"
            className="inline-block px-12 py-5 bg-primary/10 border-2 border-primary text-primary font-mono font-bold text-lg tracking-wider hover:bg-primary hover:text-background transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]"
          >
            ENTER COMMAND DECK →
          </Link>
          
          <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground font-mono">
            <span>SYSTEM VERSION 1.0</span>
            <span className="text-primary">•</span>
            <span>POWERED BY TAMBO AI</span>
            <span className="text-primary">•</span>
            <span>NEXT.JS 15</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-primary/20">
          <p className="text-xs text-muted-foreground font-mono">
            Built for <a href="https://www.wemakedevs.org/hackathons/tambo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">The UI Strikes Back Hackathon</a>
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-2">
            May the components be with you 🚀
          </p>
        </div>
      </div>
      </main>
    </div>
  );
}
