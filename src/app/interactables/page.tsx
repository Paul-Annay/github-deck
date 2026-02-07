"use client";

import {
  MessageInput,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SettingsPanel } from "./components/settings-panel";

export default function InteractablesPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
    >
      <div className="flex h-screen bg-background">
        {/* Chat Sidebar */}
        <div
          className={`${
            isChatOpen ? "w-80" : "w-0"
          } border-r border-border bg-card transition-all duration-300 flex flex-col relative`}
        >
          {isChatOpen && (
            <>
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Chat Assistant
                </h2>
              </div>

              <ScrollableMessageContainer className="flex-1 p-4">
                <ThreadContent variant="default">
                  <ThreadContentMessages />
                </ThreadContent>
              </ScrollableMessageContainer>

              <div className="p-4 border-t border-border">
                <MessageInput variant="bordered">
                  <MessageInputTextarea placeholder="Update the settings..." />
                  <MessageInputToolbar>
                    <MessageInputSubmitButton />
                  </MessageInputToolbar>
                </MessageInput>
              </div>
            </>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="absolute -right-10 top-1/2 -translate-y-1/2 bg-card border border-border rounded-r-lg p-2 hover:bg-accent"
          >
            {isChatOpen ? (
              <ChevronLeft className="w-4 h-4 text-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <SettingsPanel />
          </div>
        </div>
      </div>
    </TamboProvider>
  );
}
