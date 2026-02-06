import React from "react";

export interface CommandPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  status?: "active" | "standby" | "alert" | "warning";
  children: React.ReactNode;
}
