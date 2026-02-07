"use client";

import { useState } from "react";

interface ApiKeyCheckProps {
  children?: React.ReactNode;
}

const ApiKeyMissingAlert = () => (
  <div className="mb-4 p-6 bg-card border border-neon-amber/40 rounded-sm text-neon-amber">
    <p className="mb-3 text-foreground">To get started, you need to initialize Tambo:</p>
    <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-sm mb-3 border border-border">
      <code className="text-sm grow font-mono text-primary">npx tambo init</code>
      <CopyButton text="npx tambo init" />
    </div>
    <p className="text-sm text-muted-foreground">
      Or visit{" "}
      <a
        href="https://tambo.co/cli-auth"
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-neon-amber hover:text-neon-amber/80"
      >
        tambo.co/cli-auth
      </a>{" "}
      to get your API key and set it in{" "}
      <code className="bg-muted px-2 py-1 rounded-sm font-mono text-primary">.env.local</code>
    </p>
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [showCopied, setShowCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded-sm transition-colors relative group"
      title="Copy to clipboard"
    >
      {showCopied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card border border-primary text-primary px-2 py-1 rounded-sm text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        {showCopied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
};

export function ApiKeyCheck({ children }: ApiKeyCheckProps) {
  const isApiKeyMissing = !process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  return (
    <div className="flex min-h-screen items-center justify-center gap-4 p-8">
      <div className="max-w-lg grow">
        <div className="flex items-center gap-2 font-mono">
          <div className="min-w-6">{isApiKeyMissing ? "❌" : "✅"}</div>
          <p className="text-foreground">
            {isApiKeyMissing ? "Tambo not initialized" : "Tambo initialized"}
          </p>
        </div>
        {isApiKeyMissing && <ApiKeyMissingAlert />}
        {!isApiKeyMissing && children}
      </div>
    </div>
  );
}
