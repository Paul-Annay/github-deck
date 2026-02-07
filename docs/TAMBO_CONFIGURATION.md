# Tambo Configuration Guide

This guide explains how to configure the Tambo AI agent to properly generate UI components instead of text responses.

## Problem

If the AI is generating text descriptions instead of rendering UI components (graphs, tables, etc.), it means the agent isn't following the system prompt instructions.

## Solution

The system prompt needs to be configured in your **Tambo project settings** (cloud-based configuration).

### Step 1: Access Tambo Project Settings

1. Go to [Tambo Dashboard](https://tambo.co/dashboard)
2. Select your project (GitHub Command Deck)
3. Navigate to **Settings** → **Agent Configuration**

### Step 2: Add Custom Instructions

In the **Custom Instructions** section, paste the contents of `SYSTEM_PROMPT.md` from this repository.

The system prompt includes:
- **Core Identity**: Tactical intelligence officer persona
- **Tool Usage Protocols**: When and how to call each tool
- **Component Rendering Rules**: MUST render components, not text
- **Workflow Patterns**: Step-by-step procedures for common tasks
- **Tactical Communication Style**: Command-deck aesthetic

### Step 3: Key Configuration Points

Make sure these critical rules are in the system prompt:

```
CRITICAL RULES:
1. Always Visualize: Don't just describe data—render components to show it
2. After calling getRepoOverview → MUST render Graph + InsightCardStack
3. After calling getPullRequests → MUST render PRViewer
4. After calling compareRepositories → MUST render ComparisonTable
5. After calling getPRDiff → MUST render DiffViewer
6. After calling generateInsights → MUST render InsightCardStack
```

### Step 4: Verify Configuration

Test the configuration by asking:
- "Tell me about facebook/react" → Should render graphs and insight cards
- "Show me the pull requests" → Should render PRViewer component
- "Compare react with vue" → Should render ComparisonTable

## Tool Descriptions as Instructions

The tool descriptions in `src/lib/tambo.ts` have been enhanced to include **CRITICAL** and **MUST** directives that tell the AI exactly what to do after calling each tool.

Example:
```typescript
{
  name: "getRepoOverview",
  description: "CRITICAL FIRST STEP: ... MANDATORY WORKFLOW: After calling this tool, you MUST immediately: 1) Call getLanguageBreakdown and render a Graph component (type: 'pie')..."
}
```

These descriptions act as inline instructions that the AI sees when deciding which tools to use.

## Component Registration

All components are registered in `src/lib/tambo.ts`:
- **Graph** - Charts (line, bar, pie)
- **PRViewer** - Pull request list
- **ComparisonTable** - Side-by-side comparison
- **DiffViewer** - Code diffs
- **InsightCardStack** - AI-generated insights (interactable)
- **ComparisonBuilder** - Repo comparison builder (interactable)

## Troubleshooting

### AI still generating text instead of components

1. **Check Tambo project settings**: Ensure custom instructions are saved
2. **Verify tool descriptions**: Make sure they include "MUST render" directives
3. **Check component schemas**: Ensure Zod schemas have `.describe()` for all props
4. **Test with explicit commands**: Try "render a graph of..." instead of "show me..."

### Components not rendering properly

1. **Check browser console**: Look for React errors or prop validation issues
2. **Verify data format**: Ensure tool output matches component prop schema
3. **Check streaming state**: Use `useTamboStreamStatus` to handle loading states

### Rate limiting issues

If you hit GitHub API rate limits:
- The AI should display: "COMMUNICATION DISRUPTED - API rate limit reached"
- Wait 60 minutes or use authenticated requests (requires GitHub token)

## Additional Resources

- [Tambo Documentation](https://docs.tambo.co)
- [Agent Configuration Guide](https://docs.tambo.co/concepts/agent-configuration)
- [Generative UI Best Practices](https://docs.tambo.co/concepts/streaming-props)
- System Prompt: `SYSTEM_PROMPT.md` in this repository
