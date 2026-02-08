# Tools & Components Reference

Quick reference for all Tambo tools and components in GitHub Command Deck.

## Tools (15)

### Core Repository Data
- **getRepoOverview** — Fetch repo details + recent commits (always call first)
  - *"Tell me about facebook/react"*
  - *"Analyze the react repository"*
- **getCommitActivity** — Recent commits for activity trends
  - *"Show me recent commits for facebook/react"*
- **getContributors** — Top contributors list
  - *"Who are the top contributors to facebook/react?"*
- **getLanguageBreakdown** — Language composition (bytes per language)
  - *"What languages are used in facebook/react?"*
- **getWeeklyCommitActivity** — 52-week commit counts
  - *"Show me commit activity over the last year for facebook/react"*
- **getCommunityHealth** — Health score, docs, license, code of conduct
  - *"How healthy is the facebook/react community?"*
- **getContributorActivity** — Detailed contributor stats with weekly data
  - *"Show me detailed contributor stats for facebook/react"*

### Pull Requests & Issues
- **getPullRequests** — Fetch PRs (10/page, filterable by state)
  - *"Show me open PRs for facebook/react"*
  - *"What are the recent pull requests in facebook/react?"*
- **getIssues** — Fetch issues (10/page, minimal data)
  - *"Show me open issues in facebook/react"*
  - *"What bugs are reported in facebook/react?"*
- **getIssueComments** — Comments for specific issue
  - *"Show me comments on issue #12345 in facebook/react"*
- **getPRDiff** — File changes and diffs for a PR
  - *"Show me the diff for PR #28000 in facebook/react"*
  - *"What changed in pull request #28000?"*

### Releases & Search
- **getReleases** — Recent releases and version history
  - *"Show me recent releases for facebook/react"*
  - *"What's the latest version of facebook/react?"*
- **searchRepos** — Search GitHub repos with filters
  - *"Find React alternatives with over 10k stars"*
  - *"Search for TypeScript UI frameworks"*

### AI Analysis
- **generateInsights** — AI-powered pattern detection and tactical insights
  - *"Give me insights on facebook/react"*
  - *"Analyze facebook/react and tell me what stands out"*

## Components (8)

### Data Visualization
- **Graph** — Interactive charts (bar, line, pie) with filtering and time range selection
  - *"Show me a pie chart of languages in facebook/react"*
  - *"Graph the commit activity for facebook/react over time"*
- **InteractiveComparisonTable** — Sortable comparison table with CSV/JSON export
  - *"Compare facebook/react with vuejs/vue and angular/angular"*
- **DataCard** — Clickable cards with links and multi-select
  - *"Show me repository options to explore"*

### Code Review
- **InteractivePRViewer** — PR viewer with filtering, sorting, search, pagination
  - *"Show me all PRs for facebook/react"*
  - *"Display recent pull requests with filtering options"*
- **InteractiveDiffViewer** — Diff viewer with file filtering, search, split/unified views
  - *"Show me what changed in PR #28000"*
  - *"Display the diff for pull request #28000 in facebook/react"*

### Insights & Analysis
- **InsightCardStack** — Dismissible AI insight cards
  - *"Give me insights on facebook/react"*
  - *"Analyze facebook/react and show me key findings"*

### Workflows
- **IssueTriager** — Issue categorization, priority setting, notes
  - *"Help me triage issues in facebook/react"*
  - *"Let me organize and prioritize issues"*
- **ReleaseNoteBuilder** — PR selection, categorization, release note generation
  - *"Help me build release notes for facebook/react"*
  - *"Generate release notes from recent PRs"*
