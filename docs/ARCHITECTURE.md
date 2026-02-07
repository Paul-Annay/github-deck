# GitHub Command Deck - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Command Deck                          │
│                   (Next.js 15 + Tambo AI)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         TamboProvider                    │
        │  - API Key                               │
        │  - Components (7)                        │
        │  - Tools (9)                             │
        └─────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │   Left Panel      │       │   Right Panel     │
    │   (Chat)          │       │   (Viewscreen)    │
    └───────────────────┘       └───────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │ MessageThreadFull │       │  MainViewscreen   │
    │ - User input      │       │  - Renders all    │
    │ - AI responses    │       │    components     │
    │ - Tool calls      │       │  - Smooth anims   │
    └───────────────────┘       └───────────────────┘
```

## Component Flow

### 1. User Query → AI Analysis → Component Generation

```
User: "Analyze facebook/react"
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Tambo AI interprets intent                              │
└─────────────────────────────────────────────────────────┘
    │
    ├─► Tool: getRepoOverview(owner: "facebook", repo: "react")
    │       │
    │       ▼
    │   ┌─────────────────────────────────────────┐
    │   │ GitHub API Client                       │
    │   │ - Fetches repo details                  │
    │   │ - Fetches recent commits                │
    │   └─────────────────────────────────────────┘
    │       │
    │       ▼
    │   Returns: { details, recent_commits }
    │
    ├─► Tool: generateInsights(owner, repo, repoData)
    │       │
    │       ▼
    │   ┌─────────────────────────────────────────┐
    │   │ Advanced Analysis Engine                │
    │   │ - Repository maturity                   │
    │   │ - Community engagement                  │
    │   │ - Activity patterns                     │
    │   │ - Contributor diversity                 │
    │   │ - Language recommendations              │
    │   └─────────────────────────────────────────┘
    │       │
    │       ▼
    │   Returns: [8+ insight objects]
    │
    └─► Component: InsightCardStack
            │
            ▼
        ┌─────────────────────────────────────────┐
        │ Renders in MainViewscreen               │
        │ - Color-coded cards                     │
        │ - Dismissible by user                   │
        │ - State exposed to AI                   │
        └─────────────────────────────────────────┘
```

## Component Types

### Generative UI Components (5)

These render on-demand based on conversation:

```
┌──────────────────────────────────────────────────────────┐
│ Graph                                                     │
│ - Bar charts, line charts, pie charts                    │
│ - Recharts integration                                   │
│ - Tactical styling                                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PRViewer                                                  │
│ - Pull request list                                      │
│ - Status indicators (open/closed/merged)                 │
│ - Code change statistics                                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ComparisonTable                                           │
│ - Side-by-side metrics                                   │
│ - Automatic highlighting                                 │
│ - Responsive design                                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ DiffViewer                                                │
│ - Syntax-highlighted diffs                               │
│ - File-by-file changes                                   │
│ - Expandable/collapsible                                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ DataCard                                                  │
│ - Clickable option cards                                 │
│ - Multi-select capability                                │
│ - Tactical styling                                       │
└──────────────────────────────────────────────────────────┘
```

### Interactable Components (2)

These have bi-directional control:

```
┌──────────────────────────────────────────────────────────┐
│ InsightCardStack                                          │
│                                                           │
│ User Actions:                                             │
│   - Click X to dismiss card                              │
│   - Smooth animation                                     │
│                                                           │
│ AI Actions:                                               │
│   - Generate new insights                                │
│   - See dismissals via useTamboComponentState()          │
│   - Respond to user preferences                          │
│                                                           │
│ State Exposed:                                            │
│   { visibleInsights: [...], dismissedCount: 2 }          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ComparisonBuilder                                         │
│                                                           │
│ User Actions:                                             │
│   - Add repositories manually                            │
│   - Remove repositories                                  │
│   - Type owner/repo names                                │
│                                                           │
│ AI Actions:                                               │
│   - Pre-fill repos from conversation                     │
│   - See additions via useTamboComponentState()           │
│   - Trigger comparison when ready                        │
│                                                           │
│ State Exposed:                                            │
│   { repositories: [...], count: 2 }                      │
└──────────────────────────────────────────────────────────┘
```

## Tool Architecture

### GitHub API Tools (8)

```
┌─────────────────────────────────────────────────────────┐
│ getRepoOverview                                          │
│ Input:  { owner, repo }                                  │
│ Output: { details, recent_commits }                      │
│ Use:    Initial analysis                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ getCommitActivity                                        │
│ Input:  { owner, repo }                                  │
│ Output: [commits]                                        │
│ Use:    Visualizing trends                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ getContributors                                          │
│ Input:  { owner, repo }                                  │
│ Output: [contributors]                                   │
│ Use:    Team analysis                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ getPullRequests                                          │
│ Input:  { owner, repo, state? }                          │
│ Output: [pull_requests]                                  │
│ Use:    PR analysis                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ getIssues                                                │
│ Input:  { owner, repo, state? }                          │
│ Output: [issues]                                         │
│ Use:    Issue tracking                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ getReleases                                              │
│ Input:  { owner, repo }                                  │
│ Output: [releases]                                       │
│ Use:    Version history                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ compareRepositories                                      │
│ Input:  { owner1, repo1, owner2, repo2 }                 │
│ Output: { repo1, repo2 }                                 │
│ Use:    Side-by-side comparison                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ getPRDiff                                                │
│ Input:  { owner, repo, prNumber }                        │
│ Output: [file_changes]                                   │
│ Use:    Code review                                      │
└─────────────────────────────────────────────────────────┘
```

### AI-Powered Tool (1)

```
┌─────────────────────────────────────────────────────────┐
│ generateInsights                                         │
│ Input:  { owner, repo, repoData }                        │
│ Output: [insights]                                       │
│                                                          │
│ Analysis Performed:                                      │
│   ✓ Repository maturity (age, growth velocity)          │
│   ✓ Community engagement (fork ratios)                  │
│   ✓ Activity patterns (commit frequency)                │
│   ✓ Contributor diversity (author distribution)         │
│   ✓ Language-specific recommendations                   │
│   ✓ Severity classification (critical/warning/info)     │
│                                                          │
│ Returns 8-12 intelligent insights                       │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Example: Analyzing a Repository

```
1. User Input
   "Analyze facebook/react"
        │
        ▼
2. Tambo AI Parsing
   Intent: ANALYZE_REPOSITORY
   Entities: { owner: "facebook", repo: "react" }
        │
        ▼
3. Tool Execution (Parallel)
   ├─► getRepoOverview("facebook", "react")
   │       │
   │       ▼
   │   GitHub API
   │       │
   │       ▼
   │   { details: {...}, recent_commits: [...] }
   │
   └─► generateInsights("facebook", "react", repoData)
           │
           ▼
       Analysis Engine
           │
           ├─► Calculate star velocity
           ├─► Analyze fork ratio
           ├─► Detect activity patterns
           ├─► Measure contributor diversity
           └─► Generate recommendations
           │
           ▼
       [8+ insight objects]
        │
        ▼
4. Component Rendering
   ├─► InsightCardStack (interactable)
   │   - Renders insights
   │   - User can dismiss
   │   - State exposed to AI
   │
   └─► Text response
       "ANALYSIS COMPLETE. React repository shows..."
        │
        ▼
5. User Interaction
   User clicks X on insight card
        │
        ▼
   useTamboComponentState() updates
        │
        ▼
   AI sees: { visibleInsights: [...], dismissedCount: 1 }
        │
        ▼
   AI can respond to user preference
```

## State Management

### Interactable State Flow

```
┌─────────────────────────────────────────────────────────┐
│ InsightCardStack Component                               │
│                                                          │
│ Local State:                                             │
│   const [dismissedIds, setDismissedIds] = useState()    │
│                                                          │
│ Props (from AI):                                         │
│   { insights: [...] }                                    │
│                                                          │
│ Exposed State (to AI):                                   │
│   useTamboComponentState(JSON.stringify({               │
│     visibleInsights: [...],                             │
│     dismissedCount: 2                                   │
│   }))                                                    │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ Tambo AI                                                 │
│ - Sees exposed state                                     │
│ - Can respond to changes                                 │
│ - Can update props                                       │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main app with TamboProvider
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
│
├── components/
│   ├── tambo/
│   │   ├── insights/
│   │   │   ├── InsightCardStack.tsx      # Interactable
│   │   │   ├── ComparisonBuilder.tsx     # Interactable
│   │   │   ├── MainViewscreen.tsx        # Container
│   │   │   └── index.ts                  # Exports
│   │   │
│   │   ├── Graph/
│   │   │   ├── Graph.tsx                 # Main component
│   │   │   ├── GraphBar.tsx              # Bar chart
│   │   │   ├── GraphLine.tsx             # Line chart
│   │   │   ├── GraphPie.tsx              # Pie chart
│   │   │   └── index.ts
│   │   │
│   │   ├── PRViewer/
│   │   │   ├── PRViewer.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ComparisonTable/
│   │   │   ├── ComparisonTable.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── DiffViewer/
│   │   │   ├── DiffViewer.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── message-thread-full.tsx       # Chat UI
│   │
│   └── ui/
│       ├── CommandPanel.tsx              # Panel wrapper
│       └── card-data.tsx                 # DataCard
│
├── lib/
│   ├── tambo.ts                          # Central registration
│   └── utils.ts                          # Utilities
│
└── services/
    └── github/
        └── client.ts                     # GitHub API
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│ Frontend Framework                                       │
│ - Next.js 15 (App Router)                               │
│ - React 19                                               │
│ - TypeScript                                             │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ AI/Agent Layer                                           │
│ - Tambo SDK v0.74.1                                     │
│ - Generative UI                                          │
│ - Interactables                                          │
│ - Tools                                                  │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ Styling                                                  │
│ - Tailwind CSS v4                                       │
│ - Custom Command Deck theme                             │
│ - Responsive design                                      │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ Data Visualization                                       │
│ - Recharts                                               │
│ - Custom tactical styling                               │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ Validation                                               │
│ - Zod schemas                                            │
│ - Type safety                                            │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ External APIs                                            │
│ - GitHub REST API v3                                    │
│ - Rate limit handling                                    │
└─────────────────────────────────────────────────────────┘
```

## Key Innovations

### 1. Bi-Directional Interactables
```
Traditional UI:        User → UI → Done
Generative UI:         User → AI → UI → Done
Interactable UI:       User ⇄ AI ⇄ UI (continuous loop)
```

### 2. Advanced Insight Generation
```
Basic Dashboard:       Shows metrics
GitHub Command Deck:   Analyzes patterns, surfaces insights
```

### 3. Conversation-Driven
```
Traditional:           Click buttons → See data
Command Deck:          Talk to AI → AI generates UI
```

## Performance Considerations

- **Lazy Loading**: Components render only when needed
- **Memoization**: useMemo for expensive calculations
- **Streaming**: Real-time updates during AI responses
- **Optimistic UI**: Smooth animations while loading
- **Error Boundaries**: Graceful error handling

## Security

- **Public Repos Only**: No authentication required
- **Rate Limiting**: GitHub API limits handled gracefully
- **Input Validation**: Zod schemas validate all inputs
- **XSS Protection**: React's built-in escaping
- **HTTPS Only**: Secure API communication

---

This architecture demonstrates production-ready code with clean separation of concerns, type safety, and innovative use of Tambo's interactable components.
