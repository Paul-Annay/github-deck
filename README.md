# GitHub Command Deck

An AI-powered GitHub repository explorer built with Next.js and Tambo. Chat with an AI assistant to analyze repos, visualize commit activity, and explore contributors—all with a command-center aesthetic.

## 🏆 Hackathon Features

### Interactable Components
This project showcases **2 production-ready interactable components** that demonstrate true bi-directional control:

1. **InsightCardStack** - AI-generated insight cards users can dismiss
2. **ComparisonBuilder** - Build repo comparisons collaboratively with AI

**The Innovation**: Users click, AI responds. AI updates, users see it instantly. True collaborative intelligence.

### Advanced AI Insights
The `generateInsights` tool provides intelligent analysis:
- Repository maturity and growth velocity
- Community engagement and contributor diversity
- Activity patterns and staleness warnings
- Language-specific recommendations
- Severity-based alerting (critical/warning/info/success)

See [FEATURES.md](./docs/FEATURES.md) for complete feature list and [HACKATHON_SUBMISSION.md](./docs/HACKATHON_SUBMISSION.md) for hackathon details.

## Get Started

1. `npm install`

2. Copy `.env.example` to `.env.local` and add your API keys:
   - **NEXT_PUBLIC_TAMBO_API_KEY** (required) – Get your free key at [tambo.co/dashboard](https://tambo.co/dashboard)
   - **GITHUB_TOKEN** (optional) – For higher GitHub API rate limits
   - **NEXT_PUBLIC_TAMBO_URL** (optional) – Custom Tambo server URL

   Or run `npx tambo init` to set up Tambo.

3. **Configure the AI Agent** (CRITICAL):
   - Go to [Tambo Dashboard](https://tambo.co/dashboard) → Your Project → Settings → Agent Configuration
   - Paste the contents of `SYSTEM_PROMPT.md` into the **Custom Instructions** field
   - This ensures the AI renders UI components instead of text responses
   - See [TAMBO_CONFIGURATION.md](./docs/TAMBO_CONFIGURATION.md) for detailed setup

4. Run `npm run dev` and go to `localhost:3000` to use the app!

## Tambo CLI

The Tambo CLI lets you add, update, and manage Tambo components in your project. Use `npx tambo` to run commands (no global install needed).

### Adding Components

Add pre-built Tambo components that are wired up for AI control:

```bash
# Add a single component
npx tambo add form

# Add multiple components at once
npx tambo add form graph canvas-space

# Add to a custom directory
npx tambo add form --prefix=src/components/ui

# Skip confirmation prompts (useful for CI/CD)
npx tambo add form --yes

# Use legacy peer deps (if you hit dependency conflicts)
npx tambo add form --legacy-peer-deps
```

Components are installed into `src/components/tambo/` (or your `--prefix` path). The CLI automatically:

- Installs the component files and any dependencies
- Updates your `src/lib/tambo.ts` registry
- Configures CSS and Tailwind for the new components

### Available Components

| Component | Description |
|-----------|-------------|
| `graph` | Interactive charts (line, bar, pie, scatter) |
| `form` | AI-powered form components |
| `input-fields` | Smart input field components |
| `canvas-space` | Canvas workspace for visual AI interactions |
| `control-bar` | Spotlight-style command palette |
| `message-thread-full` | Full-screen chat with history and typing indicators |
| `message-thread-panel` | Split-view chat with integrated workspace |
| `message-thread-collapsible` | Collapsible chat for sidebars |

### Other CLI Commands

```bash
# List installed components and their locations
npx tambo list

# Update a component to the latest version
npx tambo update graph

# Full project setup (API key + recommended components)
npx tambo full-send

# Migrate from legacy components/ui/ location
npx tambo migrate

# Upgrade entire project (packages + components)
npx tambo upgrade
```

See the [Tambo CLI reference](https://docs.tambo.co/reference/cli) for full documentation.

## Available Tools

The AI can use these tools to fetch GitHub data:

- **getRepoOverview** – Repository details and recent commits (use when the user asks to "analyze" or summarize a repo)
- **getCommitActivity** – Recent commits for visualizing activity trends
- **getContributors** – Top contributors for a repository

## Customizing

### Registering Components for AI Control

Components you add with `npx tambo add` are typically auto-registered. You can also register custom components manually in `src/lib/tambo.ts`:

```tsx
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description: "Displays options as clickable cards with links...",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Add more components here
];
```

### Adding Tools

Tools are defined with `inputSchema` and `outputSchema` in `src/lib/tambo.ts`:

```tsx
export const tools: TamboTool[] = [
  {
    name: "getRepoOverview",
    description: "Fetches repository details and recent commit activity...",
    tool: async ({ owner, repo }) => { ... },
    inputSchema: z.object({
      owner: z.string(),
      repo: z.string(),
    }),
    outputSchema: z.object({ ... }),
  },
];
```

Find more information about tools [here](https://docs.tambo.co/concepts/tools).

### TamboProvider

`TamboProvider` wraps the app in `src/app/page.tsx` with your API key, components, and tools:

```tsx
<TamboProvider
  apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
  components={components}
  tools={tools}
>
  {children}
</TamboProvider>
```

### Voice Input

The template includes a `DictationButton` component using the `useTamboVoice` hook for speech-to-text input.

### MCP (Model Context Protocol)

The template includes MCP support for connecting to external tools and resources. See `src/components/tambo/mcp-components.tsx` for example usage.

### Rendering Components Elsewhere

Components used by Tambo are shown in the chat thread. You can render them in a custom location by accessing the latest thread message's `renderedComponent` field:

```tsx
const { thread } = useTambo();
const latestComponent =
  thread?.messages[thread.messages.length - 1]?.renderedComponent;

return (
  <div>
    {latestComponent && (
      <div className="my-custom-wrapper">{latestComponent}</div>
    )}
  </div>
);
```

For more detailed documentation, visit [Tambo's official docs](https://docs.tambo.co).
