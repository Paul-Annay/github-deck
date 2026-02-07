# Troubleshooting Guide

## AI Generating Text Instead of UI Components

### Symptom
When you ask "tell me about facebook/react", the AI responds with text descriptions like:
```
TARGET: facebook/react
INTEL TIMESTAMP: 2026-02-07 UTC
DESCRIPTION: The library for web and native user interfaces
242.8K ⭐ VISIBILITY
...
```

Instead of rendering actual Graph, InsightCardStack, and other UI components.

### Root Cause
The AI agent doesn't have the system prompt instructions that tell it to render components.

### Solution

#### 1. Configure Tambo Project Settings (REQUIRED)

The system prompt **must be configured in your Tambo project settings**:

1. Go to [Tambo Dashboard](https://tambo.co/dashboard)
2. Select your project
3. Navigate to **Settings** → **Agent Configuration**
4. In **Custom Instructions**, paste the entire contents of `SYSTEM_PROMPT.md`
5. Click **Save**

**Why this matters**: Tambo's AI agent reads custom instructions from the cloud-based project settings, not from code. The system prompt defines the agent's behavior, personality, and most importantly, the rules for when to render components.

#### 2. Verify Tool Descriptions

The tool descriptions in `src/lib/tambo.ts` have been enhanced with **CRITICAL** and **MUST** directives:

```typescript
{
  name: "getRepoOverview",
  description: "CRITICAL FIRST STEP: ... MANDATORY WORKFLOW: After calling this tool, you MUST immediately: 1) Call getLanguageBreakdown and render a Graph component..."
}
```

These act as inline instructions that reinforce the system prompt.

#### 3. Test the Configuration

After configuring the system prompt, test with these queries:

**Test 1: Repository Analysis**
```
User: "Tell me about facebook/react"
Expected: 
- Calls getRepoOverview, getLanguageBreakdown, getWeeklyCommitActivity, getCommunityHealth, generateInsights
- Renders Graph (pie chart for languages)
- Renders Graph (line chart for commits)
- Renders InsightCardStack with insights
```

**Test 2: Pull Requests**
```
User: "Show me the pull requests for vercel/next.js"
Expected:
- Calls getPullRequests
- Renders PRViewer component with PR list
```

**Test 3: Comparison**
```
User: "Compare react with vue"
Expected:
- Calls compareRepositories
- Renders ComparisonTable with side-by-side metrics
```

### Still Not Working?

#### Check 1: Verify System Prompt is Active
- Go to Tambo Dashboard → Your Project → Settings
- Confirm custom instructions are saved and not empty
- Try refreshing the page and starting a new conversation

#### Check 2: Check Browser Console
Open browser DevTools (F12) and look for:
- React errors (component prop validation)
- Network errors (API calls failing)
- Tambo SDK errors

#### Check 3: Verify Component Registration
In `src/lib/tambo.ts`, ensure all components are exported:
```typescript
export const components: TamboComponent[] = [
  { name: "Graph", component: Graph, propsSchema: graphSchema, ... },
  { name: "InsightCardStack", component: InsightCardStack, ... },
  // etc.
];
```

#### Check 4: Test with Explicit Commands
Instead of "tell me about react", try:
- "Render a pie chart of language breakdown for facebook/react"
- "Show me a graph of commit activity"
- "Display the InsightCardStack for this repo"

More explicit commands can help the AI understand you want visual components.

## Components Not Rendering Properly

### Symptom
Components render but show errors, missing data, or broken layouts.

### Common Issues

#### Issue 1: Props Don't Match Schema
**Error**: "Invalid prop type" or "Zod validation error"

**Solution**: Check that tool output matches component prop schema:
```typescript
// Tool output
return {
  breakdown: [
    { name: "JavaScript", bytes: 1000, percentage: "50.00" }
  ]
};

// Component expects
propsSchema: z.object({
  data: z.array(z.object({
    name: z.string(),
    value: z.number() // ← Note: expects number, not string
  }))
});
```

Fix: Transform data in the AI's component call or update the schema.

#### Issue 2: Streaming State Issues
**Error**: Component shows "undefined" or flickers during streaming

**Solution**: Use optional chaining and nullish coalescing:
```typescript
function MyComponent({ data }: { data?: DataType }) {
  const items = data?.items ?? [];
  const title = data?.title ?? "Loading...";
  
  return <div>{title}</div>;
}
```

#### Issue 3: Missing Dependencies
**Error**: "Module not found" or "Cannot find package"

**Solution**: Install missing packages:
```bash
npm install recharts zod @tambo-ai/react
```

## GitHub API Rate Limiting

### Symptom
Error: "API rate limit exceeded" or "403 Forbidden"

### Solution

#### Option 1: Wait
GitHub's unauthenticated rate limit is 60 requests/hour. Wait 60 minutes and try again.

#### Option 2: Add GitHub Token
1. Create a GitHub Personal Access Token at [github.com/settings/tokens](https://github.com/settings/tokens)
2. Add to `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```
3. Update `src/services/github/client.ts` to use the token:
   ```typescript
   headers: {
     Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
   }
   ```

This increases your rate limit to 5,000 requests/hour.

#### Option 3: Cache Responses
Implement caching in the GitHub client to reduce API calls:
```typescript
const cache = new Map();

export async function getRepoDetails(owner: string, repo: string) {
  const key = `${owner}/${repo}`;
  if (cache.has(key)) return cache.get(key);
  
  const data = await fetch(...);
  cache.set(key, data);
  return data;
}
```

## MCP Server Issues

### Symptom
MCP tools not available or failing

### Solution
1. Check `src/app/page.tsx` - ensure `mcpServers` prop is passed to TamboProvider
2. Verify MCP server configuration in Tambo Dashboard
3. Check browser console for MCP connection errors
4. See [Tambo MCP docs](https://docs.tambo.co/concepts/mcp) for setup

## Performance Issues

### Symptom
Slow rendering, laggy interactions, or high memory usage

### Solutions

#### Optimize Graph Rendering
Limit data points for large datasets:
```typescript
// Instead of all 52 weeks
const weeks = activity.slice(-12); // Last 12 weeks only
```

#### Lazy Load Components
Use React.lazy for heavy components:
```typescript
const Graph = React.lazy(() => import("@/components/tambo/graph"));
```

#### Memoize Expensive Calculations
```typescript
const processedData = useMemo(() => {
  return rawData.map(item => /* expensive transform */);
}, [rawData]);
```

## Getting Help

If you're still stuck:

1. **Check Tambo Docs**: [docs.tambo.co](https://docs.tambo.co)
2. **Review Example Code**: See `src/components/tambo/` for working examples
3. **Check GitHub Issues**: [github.com/tambo-ai/tambo/issues](https://github.com/tambo-ai/tambo/issues)
4. **Tambo Discord**: Join the community for support

## Quick Diagnostic Checklist

- [ ] System prompt configured in Tambo Dashboard
- [ ] Tool descriptions include "MUST render" directives
- [ ] Components registered in `src/lib/tambo.ts`
- [ ] Component prop schemas match tool outputs
- [ ] Browser console shows no errors
- [ ] GitHub API rate limit not exceeded
- [ ] Tambo API key is valid and active
- [ ] All dependencies installed (`npm install`)
