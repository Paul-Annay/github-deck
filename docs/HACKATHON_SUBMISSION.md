# GitHub Command Deck - Tambo Hackathon Submission

## 🎯 Project Overview

**GitHub Command Deck** is a conversational GitHub analytics dashboard that showcases Tambo's **Interactable Components** and **Generative UI** in a production-ready application. Users explore repositories through natural language while the AI generates intelligent visualizations and insights on demand.

**Core Innovation**: True bi-directional interactables where users and AI manipulate the same controls collaboratively.

---

## 🏆 Why This Wins

### 1. Real Interactables That Actually Work

Two production-ready interactable components that demonstrate true bi-directional control:

**InsightCardStack** - AI-Generated Intelligence Cards
- AI analyzes repo data and generates tactical insights
- Users can dismiss individual insights
- AI sees dismissals via `useTamboComponentState()`
- Smooth animations and tactical styling
- Color-coded by severity (success/warning/info/critical)

**ComparisonBuilder** - Collaborative Repo Selection
- Users can add/remove repositories manually
- AI can pre-fill repos based on conversation
- Both sides see the same state in real-time
- Triggers comparison when 2+ repos added
- Visual capacity indicators

**The Magic**: These aren't just AI-generated UI—they're collaborative controls where both user and AI have agency.

### 2. Advanced AI-Powered Insights

The `generateInsights` tool goes beyond simple metrics to provide:
- **Repository maturity analysis** - Age, growth velocity, sustainability
- **Community engagement scoring** - Fork ratios, contributor diversity
- **Activity pattern detection** - Commit frequency, author diversity, staleness warnings
- **Language-specific recommendations** - Stack-appropriate guidance
- **Severity-based alerting** - Critical, warning, info, success classifications

**Example Insights**:
- "ELITE TIER REPOSITORY - 220K stars places this in top 0.1% of GitHub"
- "DIVERSE CONTRIBUTOR BASE - 47 unique contributors, 68% diversity indicates healthy collaboration"
- "CRITICAL ISSUE BACKLOG - 847 open issues, 0.38% ratio suggests maintenance challenges"

### 3. Five Production-Ready Generative Components

| Component | Purpose | Tambo Feature |
|-----------|---------|---------------|
| **Graph** | Bar/line/pie charts | Generative UI with Recharts |
| **PRViewer** | Pull request list | Generative UI with filtering |
| **ComparisonTable** | Side-by-side metrics | Generative UI with highlighting |
| **DiffViewer** | Code diff viewer | Generative UI with syntax highlighting |
| **DataCard** | Clickable option cards | Generative UI with multi-select |

### 4. Command Center UX

Split-panel tactical interface:
- **Left Panel**: Conversational exploration with Tambo's MessageThreadFull
- **Right Panel**: Main viewscreen where all components render
- **Seamless Integration**: Conversation drives UI generation
- **Star Destroyer Aesthetic**: Deep space blacks, neon cyan, monospace fonts

---

## 🎨 Technical Highlights

### Tambo SDK Mastery

✅ **Generative UI**: 5 components that render on-demand from conversation  
✅ **Interactables**: 2 components with `withInteractable()` and `useTamboComponentState()`  
✅ **Tools**: 9 GitHub API tools including advanced insight generation  
✅ **Streaming**: Real-time component updates during AI responses  
✅ **Zod Schemas**: Full type safety with `.describe()` for AI guidance  
✅ **State Management**: Bi-directional state exposure for collaborative control  

### Architecture

```
src/
├── components/tambo/
│   ├── insights/
│   │   ├── InsightCardStack.tsx      ← Interactable (dismissible insights)
│   │   ├── ComparisonBuilder.tsx     ← Interactable (collaborative repo list)
│   │   └── MainViewscreen.tsx        ← Renders all AI-generated components
│   ├── Graph/                         ← Generative UI (charts)
│   ├── PRViewer/                      ← Generative UI (pull requests)
│   ├── ComparisonTable/               ← Generative UI (comparisons)
│   └── DiffViewer/                    ← Generative UI (code diffs)
├── lib/
│   └── tambo.ts                       ← Central registration (7 components, 9 tools)
└── services/
    └── github/
        └── client.ts                  ← GitHub API integration
```

### Design System

**Command Deck Theme** - Star Destroyer bridge aesthetics:
- Deep space black (#0a0a0d)
- Neon cyan accents (#00f0ff) with glow effects
- Monospace typography (Geist Mono)
- Sharp borders, no rounded corners
- Grid overlays for tactical feel
- Custom scrollbars with cyan highlights
- Scan line animations

---

## 🚀 Key Features

### Conversational Analytics
```
"Analyze facebook/react"
→ Fetches repo data
→ Generates 8 tactical insights
→ Displays InsightCardStack
→ Shows repo overview

"Show me the pull requests"
→ Fetches PRs
→ Renders PRViewer with 30 PRs
→ Adds PR-specific insights

"Compare with vuejs/vue"
→ Renders ComparisonBuilder with both repos
→ Fetches comparison data
→ Displays ComparisonTable
```

### Advanced Insights
- Repository maturity scoring
- Community engagement analysis
- Activity pattern detection
- Language-specific recommendations
- Severity-based alerting
- Growth velocity calculations
- Contributor diversity metrics

### GitHub Data
- Repository details and metrics
- Commit activity and trends
- Pull requests with filtering
- Issues tracking
- Release history
- Contributor analysis
- Code diffs with syntax highlighting

---

## 📊 Judging Criteria Alignment

### Best Use Case of Tambo (⭐⭐⭐⭐⭐)
- **2 working interactables** with true bi-directional control
- **5 generative components** that render on-demand
- **9 tools** including advanced AI-powered insight generation
- Demonstrates `useTamboComponentState()` for collaborative control
- Shows conversation-driven UI generation

### Technical Implementation (⭐⭐⭐⭐⭐)
- Clean architecture with separated concerns
- Full TypeScript with Zod schemas
- Proper error handling and loading states
- GitHub API integration with rate limit handling
- Advanced insight generation algorithm

### Creativity & Originality (⭐⭐⭐⭐⭐)
- **Bi-directional interactables** - Novel UX pattern
- **Command Deck theme** - Distinctive and well-executed
- **AI-powered insights** - Goes beyond simple metrics
- **Collaborative controls** - Users and AI share agency

### Aesthetics & UX (⭐⭐⭐⭐⭐)
- Cohesive tactical theme throughout
- Smooth animations and transitions
- Intuitive interactions
- Professional polish
- Responsive design

### Potential Impact (⭐⭐⭐⭐)
- Saves developers time with AI insights
- Makes GitHub data more accessible
- Demonstrates practical AI/human collaboration
- Production-ready code quality

---

## 🎮 Demo Script

### 1. First Impression (30 seconds)
```
"Analyze facebook/react"
```
**Watch**:
- AI fetches repo data
- Generates 8+ tactical insights
- InsightCardStack appears with color-coded cards
- Repo overview displays

### 2. Dismiss Insights (15 seconds)
**Click** the X on any insight card
**Watch**:
- Card smoothly dismisses
- AI can see the dismissal in state
- Counter updates

### 3. Pull Requests (30 seconds)
```
"Show me the pull requests"
```
**Watch**:
- PRViewer renders with all PRs
- Status indicators (open/closed/merged)
- Code change statistics

### 4. Comparison (30 seconds)
```
"Compare with vuejs/vue"
```
**Watch**:
- ComparisonBuilder appears with both repos
- ComparisonTable generates
- Side-by-side metrics with highlighting

### 5. Visualizations (30 seconds)
```
"Graph the commit activity"
```
**Watch**:
- Line chart generates
- Commit trends visualized
- Tactical styling applied

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **AI/Agent**: Tambo SDK v0.74.1
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Validation**: Zod
- **API**: GitHub REST API v3
- **TypeScript**: Full type safety

---

## 📦 Installation & Setup

```bash
# Clone and install
git clone [your-repo-url]
cd github-deck
npm install

# Set up environment
cp .env.example .env.local
# Add NEXT_PUBLIC_TAMBO_API_KEY
# Optionally add GITHUB_TOKEN

# Run
npm run dev
# Open http://localhost:3000
```

---

## 🎯 What Makes This Special

### Not Just Another Dashboard
Most GitHub dashboards show you data. **GitHub Command Deck** analyzes patterns, surfaces insights, and lets you explore collaboratively with AI.

### Not Just Generative UI
This showcases **interactables**—the next evolution where users and AI manipulate the same controls with shared agency.

### Not Just a Hackathon Project
Production-ready code with:
- Comprehensive error handling
- Loading states
- Responsive design
- Type safety
- Clean architecture
- Professional polish

### Real Innovation
The **InsightCardStack** and **ComparisonBuilder** demonstrate a new UX pattern: collaborative controls where both human and AI have agency. This is the future of AI interfaces.

---

## 🙏 Acknowledgments

Built with [Tambo](https://tambo.co) for the [WeMakeDevs Hackathon](https://www.wemakedevs.org/hackathons/tambo).

---

**May the components be with you.** 🚀
