"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type PanelStatus = "active" | "standby" | "alert" | "warning";

interface CommandPanelState {
  content: ReactNode | null;
  title: string;
  status: PanelStatus;
  setPanelContent: (content: ReactNode, title?: string, status?: PanelStatus) => void;
  resetPanel: () => void;
}

const CommandPanelContext = createContext<CommandPanelState | undefined>(undefined);

export const CommandPanelProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState<string>("MAIN VIEWSCREEN");
  const [status, setStatus] = useState<PanelStatus>("standby");

  const setPanelContent = (
    newContent: ReactNode,
    newTitle: string = "MAIN VIEWSCREEN",
    newStatus: PanelStatus = "active"
  ) => {
    setContent(newContent);
    setTitle(newTitle);
    setStatus(newStatus);
  };

  const resetPanel = () => {
    setContent(null);
    setTitle("MAIN VIEWSCREEN");
    setStatus("standby");
  };

  return (
    <CommandPanelContext.Provider
      value={{ content, title, status, setPanelContent, resetPanel }}
    >
      {children}
    </CommandPanelContext.Provider>
  );
};

export const useCommandPanel = () => {
  const context = useContext(CommandPanelContext);
  if (!context) {
    throw new Error("useCommandPanel must be used within a CommandPanelProvider");
  }
  return context;
};
