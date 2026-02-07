# GitHub Command Deck - Features

## 🏆 Hackathon-Winning Features

### Interactable Components
The project showcases **2 production-ready interactable components** that demonstrate true bi-directional control:

1. **InsightCardStack** - AI-generated insight cards that users can dismiss
   - AI analyzes repo data and generates tactical insights
   - Users can dismiss individual cards
   - AI sees dismissals via `useTamboComponentState()`
   - Color-coded by severity (success/warning/info/critical)
   - Smooth animations with tactical styling

2. **ComparisonBuilder** - Collaborative repository selection
   - Users can add/remove repositories manually
   - AI can pre-fill repos based on conversation
   - Both sides see the same state in real-time
   - Triggers comparison when 2+ repos added
   - Visual capacity indicators

**The Innovation**: Users click, AI responds. AI updates, users see it instantly. True collaborative intelligence.

---

## 🚀 Core Features

### 1. Advanced Insight Generation
**Tool**: `generateInsights`

AI-powered analysis that goes beyond simple metrics:

**Repository Maturity Analysis**:
- Age and growth velocity calculations
- Star velocity (stars per year)
- Sustainability scoring

**Community Engagement**:
- Fork ratio analysis
- Contributor diversity metrics
- Author distribution patterns

**Activity Pattern Detection**:
- Commit frequency analysis
- Staleness warnings
- Real-time development indicators

**Language-Specific Insights**:
- Stack-appropriate recommendations
- Ecosystem analysis

**Severity-Based Alerting**:
- Critical: Dormant repos, massive issue backlogs
- Warning: Low activity, elevated issues
- Success: Active development, high engagement
- Info: General observations

**Example Insights**:
```
✓ ELITE TIER REPOSITORY
  220K stars places this in top 0.1% of GitHub repositories.
  Exceptional community validation.
  Metric: 220K ⭐

⚠ ELEVATED ISSUE COUNT
  347 open issues may indicate maintenance backlog.
  Monitor resolution velocity.
  Metric: 347 OPEN

✓ DIVERSE CONTRIBUTOR BASE
  47 unique contributors in recent commits.
  High diversity (68%) indicates healthy collaborative development.
  Metric: 47 AUTHORS
```

### 2. Pull Request Viewer
**Component**: `PRViewer`

Display GitHub Pull Requests in a tactical interface:
- PR status (Open, Closed, Merged, Draft)
- Author info with avatars
- Code change statistics (additions/deletions/files)
- PR labels with color coding
- Direct links to GitHub
- Filterable by state

**Usage**:
```
"Show me all pull requests for facebook/react"
"What are the open PRs?"
"Show merged pull requests"
```

### 3. Comparison Table
**Component**: `ComparisonTable`

Side-by-side repository comparison:
- Compare multiple repositories
- Highlight best values automatically
- Tactical styling with monospace fonts
- Responsive design

**Usage**:
```
"Compare facebook/react with vuejs/vue"
"Show me the differences between Next.js and Nuxt"
```

### 4. Code Diff Viewer
**Component**: `DiffViewer`

Syntax-highlighted PR diffs:
- File-by-file changes
- Expandable/collapsible files
- Line-by-line diff with color coding
- Status indicators (Added/Modified/Removed/Renamed)
- Handles binary files gracefully

**Usage**:
```
"Show me the diff for PR #123"
"What changed in pull request 456?"
```

### 5. Data Visualization
**Component**: `Graph`

Charts with tactical styling:
- Bar charts for distributions
- Line charts for trends
- Pie/Donut charts for proportions
- Command Deck themed
- Responsive and error-handled

**Usage**:
```
"Graph the commit activity over time"
"Show me contributor distribution"
"Visualize language breakdown"
```

### 6. GitHub API Tools

**Repository Analysis**:
- `getRepoOverview` - Details and recent commits
- `getCommitActivity` - Commit history and trends
- `getContributors` - Top contributors

**Pull Requests & Issues**:
- `getPullRequests` - Fetch PRs with filtering
- `getIssues` - Repository issues
- `getPRDiff` - File changes and diffs

**Comparison & Releases**:
- `compareRepositories` - Direct repo-to-repo comparison
- `getReleases` - Release history and changelogs

**AI-Powered**:
- `generateInsights` - Advanced pattern detection and analysis

---

## 🎨 Design System

### Command Deck Theme
- **Deep Space Black** (#0a0a0d)
- **Neon Cyan** accents (#00f0ff) with glow effects
- **Amber** warnings (#ffb000)
- **Red** alerts (#ff2a2a)
- Monospace typography (Geist Mono)
- Sharp borders (no rounded corners)
- Grid overlays for tactical feel
- Custom scrollbars with cyan highlights

### Tactical UI Elements
- Status indicators with glow effects
- Uppercase labels for headers
- Scan line animations
- Hover states with border glow
- Loading states with pulse animations

---

## 💬 Conversational Interface

Powered by **Tambo AI** for natural language interactions:

```
User: "Analyze facebook/react"
→ Fetches repo data
→ Generates 8+ tactical insights
→ Displays InsightCardStack
→ Shows repo overview

User: [Dismisses an insight card]
→ AI sees the dismissal via useTamboComponentState()
→ Can respond to user preferences

User: "Show me the pull requests"
→ Fetches PRs
→ Renders PRViewer
→ Adds PR-specific insights

User: "Compare with vuejs/vue"
→ Renders ComparisonBuilder with both repos
→ Fetches comparison data
→ Displays ComparisonTable

User: "Graph the commit activity"
→ Fetches commits
→ Renders line chart
→ Shows activity trends
```

**The Magic**: Every interactable uses `useTamboComponentState()` to expose state to the AI. When users interact, the AI sees it and can respond intelligently.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **TypeScript**: Full type safety
- **AI/Agent**: Tambo SDK with Interactables
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Validation**: Zod schemas
- **API**: GitHub REST API v3

---

## 📦 Component Registration

All components and tools are registered in `src/lib/tambo.ts`:

```typescript
export const components: TamboComponent[] = [
  // Generative UI Components
  Graph,
  DataCard,
  PRViewer,
  ComparisonTable,
  DiffViewer,
  
  // Interactable Components
  InsightCardStack,      // ← AI-generated insights
  ComparisonBuilder,     // ← Collaborative repo selection
];

export const tools: TamboTool[] = [
  getRepoOverview,
  getCommitActivity,
  getContributors,
  getPullRequests,
  getIssues,
  getReleases,
  compareRepositories,
  getPRDiff,
  generateInsights,      // ← Advanced AI analysis
];
```

---

## 🎯 Use Cases

### For Developers
- Quick repo health checks with AI insights
- PR review queue monitoring
- Contributor activity tracking
- Release history overview

### For Teams
- Sprint planning with issue tracking
- Code review metrics with AI analysis
- Repository comparisons for tech decisions
- Activity trends over time

### For Open Source
- Community engagement metrics
- Contribution patterns
- Release cadence analysis
- Issue resolution tracking with AI recommendations

---

## 🚀 Getting Started

1. Set your GitHub token (optional, for higher rate limits):
```bash
GITHUB_TOKEN=your_token_here
```

2. Set your Tambo API key:
```bash
NEXT_PUBLIC_TAMBO_API_KEY=your_key_here
```

3. Start the dev server:
```bash
npm run dev
```

4. Open the Command Deck and start talking to your repos!

---

## 🎮 Example Queries

```
"Analyze facebook/react"
"Show me the pull requests"
"Graph commit activity for the last 100 commits"
"Who are the top 10 contributors?"
"Compare facebook/react with preactjs/preact"
"Show me the latest releases"
"What issues are currently open?"
"Show merged PRs from this month"
"Show me the diff for PR #123"
```

---

## 🎯 What Makes This Hackathon-Worthy

### 1. Real Interactables
Not just AI-generated UI—these are **bi-directional controls** where:
- Users can click and manipulate
- AI can see user actions via `useTamboComponentState()`
- AI can update the same controls
- State persists across conversation

### 2. Advanced AI Insights
The `generateInsights` tool analyzes patterns and surfaces:
- Repository maturity and growth velocity
- Community engagement and contributor diversity
- Activity patterns and staleness warnings
- Language-specific recommendations
- Severity-based alerting

### 3. Production-Ready Polish
- Tactical Command Deck theme
- Smooth animations
- Error handling
- Loading states
- Responsive design
- Full TypeScript
- Clean architecture

### 4. Conversation-Driven UI
The split-panel design creates a **command center** where:
- Left: Conversational data exploration
- Right: AI-generated visualizations
- Both sides work together seamlessly

---

Built with ❤️ for the [Tambo Hackathon](https://www.wemakedevs.org/hackathons/tambo)


### 1. Pull Request Viewer
**Component**: `PRViewer`

Display GitHub Pull Requests in a tactical, command-deck style interface.

**Features**:
- Shows PR status (Open, Closed, Merged, Draft)
- Displays author info with avatar
- Code change statistics (additions/deletions/files changed)
- PR labels with color coding
- Direct links to GitHub
- Filterable by state (all/open/closed)

**Usage Example**:
```
"Show me all pull requests for facebook/react"
"What are the open PRs?"
"Show merged pull requests"
```

### 2. Comparison Table
**Component**: `ComparisonTable`

Side-by-side repository comparison in a tactical table format.

**Features**:
- Compare multiple repositories
- Highlight best values automatically
- Clean, monospace typography
- Tactical color scheme
- Responsive design

**Usage Example**:
```
"Compare facebook/react with vuejs/vue"
"Show me the differences between Next.js and Nuxt"
```

### 3. Enhanced GitHub Tools

#### New API Tools:
- **`getPullRequests`** - Fetch PRs with filtering by state
- **`getIssues`** - Fetch repository issues
- **`getReleases`** - Get release history and changelogs
- **`compareRepositories`** - Direct repo-to-repo comparison
- **`getPRDiff`** - Fetch file changes and diffs for a specific PR
- **`generateInsights`** - AI-powered insight generation

#### Existing Tools:
- `getRepoOverview` - Repository details and recent commits
- `getCommitActivity` - Commit history and trends
- `getContributors` - Top contributors

### 4. UI Components

#### Interactable Components (🎯 Hackathon Feature)

**RepoHealthMonitor**
- Circular health gauge with score (0-100)
- Status indicators (excellent/healthy/warning/critical)
- Expandable detailed metrics
- AI updates score based on analysis
- Users can expand/collapse details

**InsightCardStack**
- AI-generated insight cards
- Color-coded by type (success/warning/info/critical)
- Users can dismiss individual insights
- AI adds new insights as it discovers patterns
- Smooth animations and tactical styling

**QuickFilterPanel**
- Toggle buttons for PRs, Issues, Releases, Contributors
- Both user and AI can toggle filters
- When toggled, AI automatically fetches data
- Visual feedback with neon glow effects
- Shows active repository target

**ComparisonBuilder**
- Add/remove repositories for comparison
- Users type repos, AI can pre-fill
- Max 3 repos with visual capacity indicator
- When 2+ repos added, triggers comparison
- Real-time validation and feedback

**ActivityFeed**
- Live scrolling feed of repo activity
- Shows commits, PRs, issues, releases
- Users can pause/resume feed
- Relative timestamps (e.g., "2h AGO")
- Links to GitHub for each item

#### DiffViewer Component
- Displays PR file changes and code diffs
- Syntax-highlighted diff view
- Expandable/collapsible files
- Shows additions/deletions per file
- Status indicators (Added/Modified/Removed/Renamed)
- Line-by-line diff with color coding
- Handles binary files gracefully

#### Graph Component
- Bar charts
- Line charts  
- Pie/Donut charts
- Command Deck themed styling
- Responsive and error-handled

#### DataCard Component
- Clickable cards with links
- Multi-select capability
- Tactical styling

## 🎨 Design System

### Command Deck Theme
- **Deep Space Black** backgrounds (#0a0a0d)
- **Neon Cyan** accents (#00f0ff)
- **Amber** warnings (#ffb000)
- **Red** alerts (#ff2a2a)
- Monospace typography (JetBrains Mono / Geist Mono)
- Sharp borders (no rounded corners)
- Grid overlays for tactical feel
- Custom scrollbars

### Tactical UI Elements
- Status indicators with glow effects
- Uppercase labels for headers
- Scan line animations
- Hover states with border glow
- Loading states with pulse animations

## 💬 Conversational Interface with Interactables

The dashboard is powered by **Tambo AI** for natural language interactions with **bi-directional control**:

```
User: "Analyze facebook/react"
→ Left: Shows repo overview, recent commits
→ Right: Health monitor updates to 82/100, insights populate automatically

User: [Clicks "Show PRs" in QuickFilterPanel]
→ AI sees the toggle and automatically fetches PRs
→ Left: Displays PRViewer with all PRs
→ Right: Insights update with PR-specific analysis

User: "Show me the pull requests"
→ AI toggles the filter in QuickFilterPanel
→ Fetches and displays PRs

User: [Types "vuejs/vue" in ComparisonBuilder]
→ AI sees the new repo added
→ Automatically triggers comparison
→ Left: Shows ComparisonTable

User: "Compare it with vuejs/vue"
→ AI updates ComparisonBuilder with both repos
→ Generates side-by-side comparison

User: "Graph the commit activity over time"
→ Creates a line chart of commits
→ Activity feed updates with recent commits
```

**The Magic**: Every interactable component uses `useTamboComponentState()` to expose its state to the AI. When users interact with the dashboard, the AI sees it and responds. When the AI updates components, users see it instantly.

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **TypeScript**: Full type safety
- **AI/Agent**: Tambo SDK with Interactables
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Validation**: Zod schemas
- **API**: GitHub REST API v3

## 📦 Component Registration

All components and tools are registered in `src/lib/tambo.ts`:

```typescript
export const components: TamboComponent[] = [
  Graph,
  DataCard,
  PRViewer,
  ComparisonTable,
  DiffViewer,
  // Interactable Components (NEW!)
  InsightCardStack,      // ← AI-generated insights
  RepoHealthMonitor,     // ← Health score gauge
  QuickFilterPanel,      // ← Toggle filters
  ComparisonBuilder,     // ← Build comparisons
  ActivityFeed,          // ← Live activity stream
];

export const tools: TamboTool[] = [
  getRepoOverview,
  getCommitActivity,
  getContributors,
  getPullRequests,
  getIssues,
  getReleases,
  compareRepositories,
  getPRDiff,
  generateInsights,      // ← NEW: Auto-generate insights
];
```

## 🎯 Use Cases

### For Developers
- Quick repo health checks with AI insights
- PR review queue monitoring with interactive filters
- Contributor activity tracking
- Release history overview

### For Teams
- Sprint planning with issue tracking
- Code review metrics with AI analysis
- Repository comparisons for tech decisions
- Activity trends over time

### For Open Source
- Community engagement metrics
- Contribution patterns
- Release cadence analysis
- Issue resolution tracking with AI recommendations

## 🚀 Getting Started

1. Set your GitHub token (optional, for higher rate limits):
```bash
GITHUB_TOKEN=your_token_here
```

2. Set your Tambo API key:
```bash
NEXT_PUBLIC_TAMBO_API_KEY=your_key_here
```

3. Start the dev server:
```bash
npm run dev
```

4. Open the Command Deck and start talking to your repos!

## 🎮 Example Queries

```
"Show me facebook/react"
"What are the open pull requests?"
"Graph commit activity for the last 100 commits"
"Who are the top 10 contributors?"
"Compare facebook/react with preactjs/preact"
"Show me the latest releases"
"What issues are currently open?"
"Show merged PRs from this month"
"Generate insights for this repository"
```

## 🎯 What Makes This Hackathon-Worthy

### 1. True Interactables
Not just AI-generated UI—these are **bi-directional controls** where:
- Users can click and manipulate
- AI can see user actions via `useTamboComponentState()`
- AI can update the same controls
- State persists across conversation

### 2. Intelligent Insights
The `generateInsights` tool analyzes repo data and automatically surfaces:
- Health warnings
- Activity patterns
- Community engagement metrics
- Maintenance recommendations

### 3. Collaborative Interface
The split-panel design creates a **command center** where:
- Left: Conversational data exploration
- Right: Persistent intelligence dashboard
- Both sides work together seamlessly

### 4. Production-Ready Polish
- Tactical Command Deck theme
- Smooth animations
- Error handling
- Loading states
- Responsive design

---

Built with ❤️ for the [Tambo Hackathon](https://www.wemakedevs.org/hackathons/tambo)
