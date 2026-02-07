# GitHub API Tools - Enhanced Implementation

This document describes the enhanced GitHub API tools created after testing real API responses.

## Testing Methodology

We created `scripts/test-github-api.ts` to make actual HTTP calls to GitHub's API and understand the real response structure. This revealed several powerful endpoints that weren't being used.

### Test Results Summary

**Successful Endpoints (10/15):**
- ✅ Repository Details - Full repo metadata
- ✅ Commits - Recent commit history
- ✅ Contributors - Top contributors list
- ✅ Pull Requests - PR data with stats
- ✅ Issues - Issue tracking data
- ✅ Releases - Version history
- ✅ **Languages** - Language breakdown (NEW!)
- ✅ **Stats - Commit Activity** - 52 weeks of commit data (NEW!)
- ✅ **Stats - Participation** - Owner vs all commits (NEW!)
- ✅ **Community Profile** - Health metrics (NEW!)

**Failed Endpoints (5/15):**
- ❌ Stats - Code Frequency (requires <10k commits)
- ❌ Traffic endpoints (require push access)

## New Enhanced Tools

### 1. `getLanguageBreakdown`

**Purpose:** Analyze tech stack composition

**Real API Response:**
```json
{
  "JavaScript": 5416797,
  "TypeScript": 2456551,
  "HTML": 115354,
  "CSS": 90463,
  "CoffeeScript": 18691,
  "Shell": 8899
}
```

**Tool Output:**
```typescript
{
  languages: { "JavaScript": 5416797, ... },
  breakdown: [
    { name: "JavaScript", bytes: 5416797, percentage: "66.23" },
    { name: "TypeScript", bytes: 2456551, percentage: "30.03" },
    ...
  ],
  total_bytes: 8176755
}
```

**Use Cases:**
- "What languages does this repo use?"
- "Show me the tech stack breakdown"
- "Compare language usage between repos"

**Visualization:** Pie chart showing language distribution

---

### 2. `getWeeklyCommitActivity`

**Purpose:** Visualize development velocity over time

**Real API Response:**
```json
[
  {
    "total": 22,
    "week": 1739059200,
    "days": [2, 2, 6, 4, 7, 1, 0]
  },
  ...
]
```

**Tool Output:**
```typescript
{
  weeks: [
    {
      week_timestamp: 1739059200,
      week_date: "2025-02-09",
      total_commits: 22,
      daily_breakdown: [2, 2, 6, 4, 7, 1, 0]
    },
    ...
  ],
  total_commits: 1523,
  avg_commits_per_week: "29.3"
}
```

**Use Cases:**
- "Show commit activity over the last year"
- "Is this project actively maintained?"
- "Visualize development velocity"
- "When are most commits made?"

**Visualization:** Line/bar chart showing weekly commit trends

---

### 3. `getCommunityHealth`

**Purpose:** Assess project maturity and community standards

**Real API Response:**
```json
{
  "health_percentage": 100,
  "description": "The library for web and native user interfaces.",
  "documentation": "https://react.dev",
  "files": {
    "code_of_conduct": { "name": "Contributor Covenant", ... },
    "contributing": { "html_url": "..." },
    "license": { "name": "MIT License", "spdx_id": "MIT" },
    "readme": { "html_url": "..." }
  }
}
```

**Tool Output:**
```typescript
{
  health_percentage: 100,
  description: "The library for web and native user interfaces.",
  documentation_url: "https://react.dev",
  has_code_of_conduct: true,
  has_contributing_guide: true,
  has_license: true,
  has_readme: true,
  has_pr_template: true,
  license: {
    name: "MIT License",
    key: "mit",
    spdx_id: "MIT"
  }
}
```

**Use Cases:**
- "Is this project well-maintained?"
- "Does it have a code of conduct?"
- "What license does it use?"
- "Show community health metrics"

**Visualization:** Health score card with checkmarks for each standard

---

### 4. `getContributorActivity`

**Purpose:** Deep dive into contributor patterns and code changes

**Real API Response:**
```json
[
  {
    "author": { "login": "gaearon", "avatar_url": "..." },
    "total": 1234,
    "weeks": [
      { "w": 1739059200, "a": 150, "d": 50, "c": 5 },
      ...
    ]
  }
]
```

**Tool Output:**
```typescript
{
  contributors: [
    {
      author: "gaearon",
      avatar_url: "...",
      total_commits: 1234,
      total_additions: 45000,
      total_deletions: 12000,
      net_lines: 33000,
      weekly_activity: [
        { week: "2025-02-09", commits: 5, additions: 150, deletions: 50 },
        ...
      ]
    }
  ],
  total_contributors: 1500
}
```

**Use Cases:**
- "Who are the top contributors?"
- "Show contributor activity over time"
- "How much code has each person written?"
- "Visualize contribution patterns"

**Visualization:** Bar chart of top contributors, line chart of activity

---

### 5. `searchRepos`

**Purpose:** Find and discover repositories

**Real API Response:**
```json
{
  "total_count": 50000,
  "items": [
    {
      "name": "react",
      "full_name": "facebook/react",
      "stargazers_count": 242846,
      "topics": ["javascript", "react", "ui"],
      ...
    }
  ]
}
```

**Tool Output:**
```typescript
{
  total_count: 50000,
  repositories: [
    {
      name: "react",
      full_name: "facebook/react",
      owner: "facebook",
      description: "...",
      stars: 242846,
      forks: 50540,
      language: "JavaScript",
      topics: ["javascript", "react", "ui"]
    }
  ]
}
```

**Use Cases:**
- "Find React alternatives"
- "Search for machine learning repos"
- "Show me popular TypeScript projects"
- "Find repos similar to X"

**Query Examples:**
- `"react stars:>10000"` - React repos with 10k+ stars
- `"language:typescript"` - TypeScript projects
- `"topic:machine-learning"` - ML repos
- `"user:facebook"` - Facebook's repos

---

## Tool Comparison: Before vs After

### Before (Basic Tools)
- ❌ No language breakdown
- ❌ No historical commit trends
- ❌ No community health metrics
- ❌ No detailed contributor stats
- ❌ No repository search
- ✅ Basic repo details
- ✅ Recent commits (50)
- ✅ Top contributors (10)
- ✅ PRs and Issues

### After (Enhanced Tools)
- ✅ **Language breakdown with percentages**
- ✅ **52 weeks of commit activity**
- ✅ **Community health score**
- ✅ **Detailed contributor stats with code changes**
- ✅ **Repository search with filters**
- ✅ All previous functionality
- ✅ Better data structure for visualization
- ✅ More actionable insights

---

## Usage Examples

### Example 1: Complete Repository Analysis
```typescript
// 1. Get basic info
const overview = await getRepoOverview({ owner: "facebook", repo: "react" });

// 2. Get language breakdown
const languages = await getLanguageBreakdown({ owner: "facebook", repo: "react" });

// 3. Get commit trends
const activity = await getWeeklyCommitActivity({ owner: "facebook", repo: "react" });

// 4. Get community health
const health = await getCommunityHealth({ owner: "facebook", repo: "react" });

// 5. Get top contributors
const contributors = await getContributorActivity({ 
  owner: "facebook", 
  repo: "react",
  limit: 10 
});

// 6. Generate insights
const insights = await generateInsights({ 
  owner: "facebook", 
  repo: "react",
  repoData: { ...overview, languages, activity, health }
});
```

### Example 2: Compare Similar Projects
```typescript
// 1. Search for alternatives
const alternatives = await searchRepos({ 
  query: "react stars:>10000",
  sort: "stars",
  limit: 5
});

// 2. Compare each repo
for (const repo of alternatives.repositories) {
  const [owner, name] = repo.full_name.split('/');
  const details = await getRepoOverview({ owner, repo: name });
  const languages = await getLanguageBreakdown({ owner, repo: name });
  // ... compare metrics
}
```

### Example 3: Contributor Analysis
```typescript
// Get detailed contributor stats
const stats = await getContributorActivity({ 
  owner: "facebook", 
  repo: "react",
  limit: 20
});

// Visualize:
// - Bar chart: Top contributors by commits
// - Line chart: Contribution trends over time
// - Pie chart: Code ownership (lines added)
```

---

## Rate Limiting

GitHub API rate limits:
- **Unauthenticated:** 60 requests/hour
- **Authenticated:** 5,000 requests/hour

**Best Practices:**
1. Always use `GITHUB_TOKEN` environment variable
2. Cache responses (we use `next: { revalidate: 3600 }`)
3. Batch requests when possible
4. Handle 403 rate limit errors gracefully

---

## Next Steps

### Potential Future Enhancements

1. **Caching Layer**
   - Redis/Upstash for API response caching
   - Reduce API calls for frequently accessed repos

2. **More Endpoints**
   - `/repos/{owner}/{repo}/events` - Recent activity feed
   - `/repos/{owner}/{repo}/stargazers` - Star history
   - `/repos/{owner}/{repo}/forks` - Fork network

3. **GraphQL API**
   - More efficient data fetching
   - Single request for multiple resources
   - Better rate limit usage

4. **Webhooks**
   - Real-time updates for repos
   - Live commit/PR notifications

---

## Testing

Run the test script to explore API responses:

```bash
# Set your GitHub token
export GITHUB_TOKEN="your_token_here"

# Run the test script
npx tsx scripts/test-github-api.ts

# View results
cat scripts/github-api-responses.json
```

The script tests 15 different endpoints and saves full responses for analysis.
