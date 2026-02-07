/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { 
  InsightCardStack, 
  insightCardStackSchema,
} from "@/components/tambo/insights";
import { InteractiveGraph, interactiveGraphSchema } from "@/components/tambo/Graph/InteractiveGraph";
import { InteractivePRViewer, interactivePRViewerSchema } from "@/components/tambo/PRViewer/InteractivePRViewer";
import { InteractiveComparisonTable, interactiveComparisonTableSchema } from "@/components/tambo/ComparisonTable/InteractiveComparisonTable";
import { InteractiveDiffViewer, interactiveDiffViewerSchema } from "@/components/tambo/DiffViewer/InteractiveDiffViewer";
import { IssueTriager, issueTriagerSchema } from "@/components/tambo/workflows/IssueTriager";
import { ReleaseNoteBuilder, releaseNoteBuilderSchema } from "@/components/tambo/workflows/ReleaseNoteBuilder";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import {
  getRepoCommits,
  getRepoContributors,
  getRepoDetails,
  getRepoPullRequests,
  getRepoIssues,
  getRepoReleases,
  getPRFiles,
} from "@/services/github/client";
import {
  getRepoLanguages,
  getCommitActivity,
  getParticipation,
  getCommunityProfile,
  searchRepositories,
  getContributorStats,
} from "@/services/github/enhanced-client";

/** Zod schemas for GitHub API tool outputs */
const gitHubRepoSchema = z.object({
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  language: z.string().nullable(),
  html_url: z.string(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
});

const gitHubCommitSchema = z.object({
  sha: z.string(),
  commit: z.object({
    message: z.string(),
    author: z.object({
      name: z.string(),
      date: z.string(),
    }),
  }),
  author: z
    .object({
      login: z.string(),
      avatar_url: z.string(),
    })
    .nullable(),
});

const gitHubContributorSchema = z.object({
  login: z.string(),
  contributions: z.number(),
  avatar_url: z.string(),
});

const gitHubPullRequestSchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  user: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  merged_at: z.string().nullable(),
  html_url: z.string(),
  body: z.string().nullable(),
  labels: z.array(z.object({
    name: z.string(),
    color: z.string(),
  })),
  draft: z.boolean(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  changed_files: z.number().optional(),
});

const gitHubIssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  user: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  html_url: z.string(),
  body: z.string().nullable(),
  labels: z.array(z.object({
    name: z.string(),
    color: z.string(),
  })),
  comments: z.number(),
});

const gitHubReleaseSchema = z.object({
  tag_name: z.string(),
  name: z.string(),
  published_at: z.string(),
  html_url: z.string(),
  body: z.string().nullable(),
  author: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
});

const gitHubPRFileSchema = z.object({
  filename: z.string(),
  status: z.string(),
  additions: z.number(),
  deletions: z.number(),
  changes: z.number(),
  patch: z.string().optional(),
  previous_filename: z.string().optional(),
});

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "getRepoOverview",
    description:
      "CRITICAL FIRST STEP: Fetches repository details and recent commit activity. ALWAYS call this FIRST when user asks about any repository (e.g., 'tell me about react', 'analyze facebook/react'). MANDATORY WORKFLOW: After calling this tool, you MUST immediately: 1) Call getLanguageBreakdown and render a Graph component (type: 'pie') with the language data, 2) Call getWeeklyCommitActivity and render a Graph component (type: 'line') with commit trends, 3) Call getCommunityHealth, 4) Call generateInsights with the repo data, 5) Render InsightCardStack component with the insights. DO NOT just describe the data in text - you MUST render the actual UI components.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      const details = await getRepoDetails(owner, repo);
      const commits = await getRepoCommits(owner, repo);
      return { details, recent_commits: commits.slice(0, 10) };
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository (e.g. 'facebook')"),
      repo: z.string().describe("The name of the repository (e.g. 'react')"),
    }),
    outputSchema: z.object({
      details: gitHubRepoSchema,
      recent_commits: z.array(gitHubCommitSchema),
    }),
  },
  {
    name: "getCommitActivity",
    description:
      "Fetches recent commits for a repository to visualize activity trends.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      return getRepoCommits(owner, repo);
    },
    inputSchema: z.object({
      owner: z.string(),
      repo: z.string(),
    }),
    outputSchema: z.array(gitHubCommitSchema),
  },
  {
    name: "getContributors",
    description: "Fetches top contributors for a repository.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      return getRepoContributors(owner, repo);
    },
    inputSchema: z.object({
      owner: z.string(),
      repo: z.string(),
    }),
    outputSchema: z.array(gitHubContributorSchema),
  },
  {
    name: "getPullRequests",
    description: "Fetches pull requests for a repository (10 per page). Use this to show PR activity, merged PRs, or open PRs. CRITICAL: After calling this tool, you MUST immediately render an InteractivePRViewer component with the pull requests data. DO NOT just list PRs in text - render the actual InteractivePRViewer component.",
    tool: async ({ owner, repo, state = "all", page = 1 }: { owner: string; repo: string; state?: "open" | "closed" | "all"; page?: number }) => {
      return getRepoPullRequests(owner, repo, state, page);
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository"),
      repo: z.string().describe("The name of the repository"),
      state: z.enum(["open", "closed", "all"]).optional().describe("Filter by PR state (default: all)"),
      page: z.number().optional().describe("Page number for pagination (default: 1, 10 PRs per page)"),
    }),
    outputSchema: z.array(gitHubPullRequestSchema),
  },
  {
    name: "getIssues",
    description: "Fetches issues for a repository (10 per page). Returns minimal essential data to reduce context usage. Use this to show issue tracking, bug reports, or feature requests. For issue comments, use getIssueComments tool separately. For more issues, increment the page parameter.",
    tool: async ({ owner, repo, state = "all", page = 1 }: { owner: string; repo: string; state?: "open" | "closed" | "all"; page?: number }) => {
      const issues = await getRepoIssues(owner, repo, state, page);
      // Return only essential fields to minimize context usage
      return issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        created_at: issue.created_at,
        html_url: issue.html_url,
        labels: issue.labels,
        comments: issue.comments,
      }));
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository"),
      repo: z.string().describe("The name of the repository"),
      state: z.enum(["open", "closed", "all"]).optional().describe("Filter by issue state (default: all)"),
      page: z.number().optional().describe("Page number for pagination (default: 1, 10 issues per page)"),
    }),
    outputSchema: z.array(z.object({
      number: z.number(),
      title: z.string(),
      state: z.enum(["open", "closed"]),
      created_at: z.string(),
      html_url: z.string(),
      labels: z.array(z.object({
        name: z.string(),
        color: z.string(),
      })),
      comments: z.number(),
    })),
  },
  {
    name: "getIssueComments",
    description: "Fetches comments for a specific issue. Use this when user wants to see discussion on an issue. Call this on-demand when user expands an issue to view comments.",
    tool: async ({ owner, repo, issueNumber }: { owner: string; repo: string; issueNumber: number }) => {
      const { getIssueComments } = await import("@/services/github/client");
      return getIssueComments(owner, repo, issueNumber);
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository"),
      repo: z.string().describe("The name of the repository"),
      issueNumber: z.number().describe("The issue number"),
    }),
    outputSchema: z.array(z.object({
      id: z.number(),
      user: z.object({
        login: z.string(),
        avatar_url: z.string(),
      }).nullable(),
      created_at: z.string(),
      updated_at: z.string(),
      body: z.string(),
      html_url: z.string(),
    })),
  },
  {
    name: "getReleases",
    description: "Fetches recent releases for a repository. Use this to show version history and release notes.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      return getRepoReleases(owner, repo);
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository"),
      repo: z.string().describe("The name of the repository"),
    }),
    outputSchema: z.array(gitHubReleaseSchema),
  },
  {
    name: "getPRDiff",
    description: "Fetches the file changes and diffs for a specific pull request. Use this when user wants to see what changed in a PR, view the diff, or review code changes. CRITICAL: After calling this tool, you MUST immediately render an InteractiveDiffViewer component with the file changes data. DO NOT just describe the changes in text - render the actual InteractiveDiffViewer component with syntax-highlighted diffs.",
    tool: async ({ owner, repo, prNumber }: { owner: string; repo: string; prNumber: number }) => {
      return getPRFiles(owner, repo, prNumber);
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository"),
      repo: z.string().describe("The name of the repository"),
      prNumber: z.number().describe("The pull request number"),
    }),
    outputSchema: z.array(gitHubPRFileSchema),
  },
  {
    name: "getLanguageBreakdown",
    description: "REQUIRED FOR REPO ANALYSIS: Fetches the language composition of a repository (bytes per language). ALWAYS call this when analyzing a repo. CRITICAL: After getting results, you MUST immediately render a Graph component with type='pie', title='LANGUAGE COMPOSITION', and data formatted as [{name: languageName, value: percentage}]. DO NOT just describe the languages in text - render the actual pie chart component.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      const languages = await getRepoLanguages(owner, repo);
      const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
      
      return {
        languages,
        breakdown: Object.entries(languages).map(([name, bytes]) => ({
          name,
          bytes,
          percentage: ((bytes / total) * 100).toFixed(2),
        })).sort((a, b) => b.bytes - a.bytes),
        total_bytes: total,
      };
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    }),
    outputSchema: z.object({
      languages: z.record(z.number()),
      breakdown: z.array(z.object({
        name: z.string(),
        bytes: z.number(),
        percentage: z.string(),
      })),
      total_bytes: z.number(),
    }),
  },
  {
    name: "getWeeklyCommitActivity",
    description: "REQUIRED FOR REPO ANALYSIS: Fetches weekly commit counts for the last 52 weeks. ALWAYS call this when analyzing a repo or when user asks about activity/commits. CRITICAL: After getting results, you MUST immediately render a Graph component with type='line', title='52-WEEK COMMIT ACTIVITY', xAxisKey='week_date', and datasets=[{name: 'Commits', dataKey: 'total_commits', color: '#00f0ff'}]. DO NOT just describe the activity in text - render the actual line chart component.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      const activity = await getCommitActivity(owner, repo);
      
      return {
        weeks: activity.map(week => ({
          week_timestamp: week.week,
          week_date: new Date(week.week * 1000).toISOString().split('T')[0],
          total_commits: week.total,
          daily_breakdown: week.days,
        })),
        total_commits: activity.reduce((sum, week) => sum + week.total, 0),
        avg_commits_per_week: (activity.reduce((sum, week) => sum + week.total, 0) / activity.length).toFixed(1),
      };
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    }),
    outputSchema: z.object({
      weeks: z.array(z.object({
        week_timestamp: z.number(),
        week_date: z.string(),
        total_commits: z.number(),
        daily_breakdown: z.array(z.number()),
      })),
      total_commits: z.number(),
      avg_commits_per_week: z.string(),
    }),
  },
  {
    name: "getCommunityHealth",
    description: "REQUIRED FOR REPO ANALYSIS: Fetches community health metrics including health score, documentation, code of conduct, contributing guidelines, and license info. ALWAYS call this when analyzing a repo to assess project maturity and community standards.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      const profile = await getCommunityProfile(owner, repo);
      
      return {
        health_percentage: profile.health_percentage,
        description: profile.description,
        documentation_url: profile.documentation,
        has_code_of_conduct: !!profile.files.code_of_conduct,
        has_contributing_guide: !!profile.files.contributing,
        has_license: !!profile.files.license,
        has_readme: !!profile.files.readme,
        has_pr_template: !!profile.files.pull_request_template,
        license: profile.files.license ? {
          name: profile.files.license.name,
          key: profile.files.license.key,
          spdx_id: profile.files.license.spdx_id,
        } : null,
        updated_at: profile.updated_at,
      };
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    }),
    outputSchema: z.object({
      health_percentage: z.number(),
      description: z.string().nullable(),
      documentation_url: z.string().nullable(),
      has_code_of_conduct: z.boolean(),
      has_contributing_guide: z.boolean(),
      has_license: z.boolean(),
      has_readme: z.boolean(),
      has_pr_template: z.boolean(),
      license: z.object({
        name: z.string(),
        key: z.string(),
        spdx_id: z.string(),
      }).nullable(),
      updated_at: z.string(),
    }),
  },
  {
    name: "getContributorActivity",
    description: "Fetches detailed contribution statistics for all contributors including weekly additions, deletions, and commit counts. Use this to analyze contributor patterns and identify top contributors over time.",
    tool: async ({ owner, repo, limit = 10 }: { owner: string; repo: string; limit?: number }) => {
      const stats = await getContributorStats(owner, repo);
      
      // Sort by total commits and limit
      const topContributors = stats
        .sort((a, b) => b.total - a.total)
        .slice(0, limit)
        .map(contributor => {
          const totalAdditions = contributor.weeks.reduce((sum, week) => sum + week.a, 0);
          const totalDeletions = contributor.weeks.reduce((sum, week) => sum + week.d, 0);
          
          return {
            author: contributor.author.login,
            avatar_url: contributor.author.avatar_url,
            total_commits: contributor.total,
            total_additions: totalAdditions,
            total_deletions: totalDeletions,
            net_lines: totalAdditions - totalDeletions,
            weekly_activity: contributor.weeks.slice(-12).map(week => ({
              week: new Date(week.w * 1000).toISOString().split('T')[0],
              commits: week.c,
              additions: week.a,
              deletions: week.d,
            })),
          };
        });
      
      return {
        contributors: topContributors,
        total_contributors: stats.length,
      };
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      limit: z.number().optional().describe("Number of top contributors to return (default: 10)"),
    }),
    outputSchema: z.object({
      contributors: z.array(z.object({
        author: z.string(),
        avatar_url: z.string(),
        total_commits: z.number(),
        total_additions: z.number(),
        total_deletions: z.number(),
        net_lines: z.number(),
        weekly_activity: z.array(z.object({
          week: z.string(),
          commits: z.number(),
          additions: z.number(),
          deletions: z.number(),
        })),
      })),
      total_contributors: z.number(),
    }),
  },
  {
    name: "searchRepos",
    description: "Search GitHub repositories by query. Supports filtering by language, stars, topics, etc. Use this when users want to find repos, compare similar projects, or discover alternatives. Query examples: 'react stars:>10000', 'language:typescript', 'topic:machine-learning'.",
    tool: async ({ 
      query, 
      sort = "stars", 
      order = "desc", 
      limit = 10 
    }: { 
      query: string; 
      sort?: "stars" | "forks" | "updated"; 
      order?: "asc" | "desc"; 
      limit?: number;
    }) => {
      const results = await searchRepositories(query, sort, order, limit);
      
      return {
        total_count: results.total_count,
        repositories: results.items.map(repo => ({
          name: repo.name,
          full_name: repo.full_name,
          owner: repo.owner.login,
          description: repo.description,
          html_url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          topics: repo.topics,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
        })),
      };
    },
    inputSchema: z.object({
      query: z.string().describe("Search query (supports GitHub search syntax)"),
      sort: z.enum(["stars", "forks", "updated"]).optional().describe("Sort field (default: stars)"),
      order: z.enum(["asc", "desc"]).optional().describe("Sort order (default: desc)"),
      limit: z.number().optional().describe("Number of results (default: 10, max: 100)"),
    }),
    outputSchema: z.object({
      total_count: z.number(),
      repositories: z.array(z.object({
        name: z.string(),
        full_name: z.string(),
        owner: z.string(),
        description: z.string().nullable(),
        html_url: z.string(),
        stars: z.number(),
        forks: z.number(),
        language: z.string().nullable(),
        topics: z.array(z.string()),
        created_at: z.string(),
        updated_at: z.string(),
        pushed_at: z.string(),
      })),
    }),
  },
  {
    name: "generateInsights",
    description: "Analyzes repository data and generates tactical insights with AI-powered pattern detection. Use this after fetching repo data. CRITICAL: After calling this tool, you MUST immediately render an InsightCardStack component with the insights array returned by this tool. DO NOT just list the insights in text - render the actual InsightCardStack component so users can see and interact with the insight cards.",
    tool: async ({ owner, repo, repoData }: { owner: string; repo: string; repoData: any }) => {
      const insights = [];
      
      if (repoData.details) {
        const { stargazers_count, forks_count, open_issues_count, language, created_at } = repoData.details;
        
        // Repository age analysis
        const createdDate = new Date(created_at);
        const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        const ageInYears = (ageInDays / 365).toFixed(1);
        
        // Star velocity (stars per year)
        const starVelocity = Math.floor(stargazers_count / (ageInDays / 365));
        
        // Community engagement score
        const engagementRatio = forks_count / Math.max(stargazers_count, 1);
        
        // Star analysis with context
        if (stargazers_count > 50000) {
          insights.push({
            id: `stars-elite-${Date.now()}`,
            type: "success",
            title: "ELITE TIER REPOSITORY",
            message: `${stargazers_count.toLocaleString()} stars places this in the top 0.1% of GitHub repositories. Exceptional community validation.`,
            metric: `${(stargazers_count / 1000).toFixed(1)}K ⭐`,
          });
        } else if (stargazers_count > 10000) {
          insights.push({
            id: `stars-high-${Date.now()}`,
            type: "success",
            title: "HIGH VISIBILITY",
            message: `${stargazers_count.toLocaleString()} stars indicate strong community interest and adoption. Growing at ${starVelocity.toLocaleString()} stars/year.`,
            metric: `${(stargazers_count / 1000).toFixed(1)}K ⭐`,
          });
        } else if (stargazers_count > 1000) {
          insights.push({
            id: `stars-moderate-${Date.now()}`,
            type: "info",
            title: "ESTABLISHED PROJECT",
            message: `${stargazers_count.toLocaleString()} stars show solid community adoption over ${ageInYears} years.`,
            metric: `${stargazers_count} ⭐`,
          });
        }
        
        // Fork analysis with engagement ratio
        if (engagementRatio > 0.3) {
          insights.push({
            id: `forks-high-${Date.now()}`,
            type: "success",
            title: "ACTIVE CONTRIBUTOR ECOSYSTEM",
            message: `High fork ratio (${(engagementRatio * 100).toFixed(0)}%) indicates strong developer engagement. ${forks_count.toLocaleString()} developers have forked this project.`,
            metric: `${(forks_count / 1000).toFixed(1)}K FORKS`,
          });
        } else if (forks_count > 1000) {
          insights.push({
            id: `forks-moderate-${Date.now()}`,
            type: "info",
            title: "DEVELOPER INTEREST",
            message: `${forks_count.toLocaleString()} forks demonstrate active reuse and contribution potential.`,
            metric: `${(forks_count / 1000).toFixed(1)}K FORKS`,
          });
        }
        
        // Issue analysis with severity levels
        const issueRatio = open_issues_count / Math.max(stargazers_count, 1);
        if (open_issues_count > 500) {
          insights.push({
            id: `issues-critical-${Date.now()}`,
            type: "critical",
            title: "CRITICAL ISSUE BACKLOG",
            message: `${open_issues_count} open issues detected. Issue ratio of ${(issueRatio * 100).toFixed(2)}% suggests maintenance challenges. Immediate attention recommended.`,
            metric: `${open_issues_count} OPEN`,
          });
        } else if (open_issues_count > 100) {
          insights.push({
            id: `issues-warning-${Date.now()}`,
            type: "warning",
            title: "ELEVATED ISSUE COUNT",
            message: `${open_issues_count} open issues may indicate maintenance backlog. Monitor resolution velocity.`,
            metric: `${open_issues_count} OPEN`,
          });
        } else if (open_issues_count < 10 && stargazers_count > 1000) {
          insights.push({
            id: `issues-excellent-${Date.now()}`,
            type: "success",
            title: "EXCEPTIONAL MAINTENANCE",
            message: `Only ${open_issues_count} open issues for a project of this scale. Demonstrates excellent issue resolution and maintenance practices.`,
            metric: `${open_issues_count} OPEN`,
          });
        }
        
        // Language-specific insights
        if (language) {
          const languageInsights: Record<string, string> = {
            "TypeScript": "Strong type safety and modern JavaScript ecosystem. Excellent for large-scale applications.",
            "JavaScript": "Flexible and widely adopted. Consider TypeScript migration for better maintainability.",
            "Python": "Versatile language with strong data science and ML ecosystem. Great for rapid development.",
            "Rust": "Memory-safe systems programming. Excellent performance and reliability guarantees.",
            "Go": "Simple, fast, and great for concurrent systems. Strong standard library.",
            "Java": "Enterprise-grade with mature ecosystem. Excellent for large-scale distributed systems.",
          };
          
          if (languageInsights[language]) {
            insights.push({
              id: `language-${Date.now()}`,
              type: "info",
              title: `${language.toUpperCase()} STACK`,
              message: languageInsights[language],
              metric: language,
            });
          }
        }
        
        // Repository maturity analysis
        if (ageInDays < 180) {
          insights.push({
            id: `age-new-${Date.now()}`,
            type: "info",
            title: "EMERGING PROJECT",
            message: `Repository is ${Math.floor(ageInDays / 30)} months old. Early stage with ${starVelocity} stars/year growth rate.`,
            metric: `${Math.floor(ageInDays / 30)}mo OLD`,
          });
        } else if (parseFloat(ageInYears) > 5 && starVelocity > 1000) {
          insights.push({
            id: `age-sustained-${Date.now()}`,
            type: "success",
            title: "SUSTAINED GROWTH",
            message: `${ageInYears} years old and still growing at ${starVelocity.toLocaleString()} stars/year. Demonstrates long-term viability.`,
            metric: `${ageInYears}y OLD`,
          });
        }
      }
      
      // Commit activity analysis with patterns
      if (repoData.recent_commits && repoData.recent_commits.length > 0) {
        const commits = repoData.recent_commits;
        const recentCommit = new Date(commits[0].commit.author.date);
        const daysSinceLastCommit = Math.floor((Date.now() - recentCommit.getTime()) / (1000 * 60 * 60 * 24));
        
        // Analyze commit frequency
        const commitDates = commits.map((c: any) => new Date(c.commit.author.date).getTime());
        const oldestCommit = Math.min(...commitDates);
        const newestCommit = Math.max(...commitDates);
        const timeSpan = (newestCommit - oldestCommit) / (1000 * 60 * 60 * 24);
        const commitsPerDay = commits.length / Math.max(timeSpan, 1);
        
        // Analyze commit authors diversity
        const uniqueAuthors = new Set(commits.map((c: any) => c.commit.author.name)).size;
        const authorDiversity = uniqueAuthors / commits.length;
        
        if (daysSinceLastCommit < 1) {
          insights.push({
            id: `activity-realtime-${Date.now()}`,
            type: "success",
            title: "REAL-TIME DEVELOPMENT",
            message: `Last commit was ${daysSinceLastCommit === 0 ? 'today' : 'yesterday'}. ${commitsPerDay.toFixed(1)} commits/day with ${uniqueAuthors} active contributors. Highly active development.`,
            metric: `${daysSinceLastCommit}d AGO`,
          });
        } else if (daysSinceLastCommit < 7) {
          insights.push({
            id: `activity-active-${Date.now()}`,
            type: "success",
            title: "ACTIVE DEVELOPMENT",
            message: `Last commit ${daysSinceLastCommit} days ago. Repository shows consistent activity with ${uniqueAuthors} contributors.`,
            metric: `${daysSinceLastCommit}d AGO`,
          });
        } else if (daysSinceLastCommit > 180) {
          insights.push({
            id: `activity-dormant-${Date.now()}`,
            type: "critical",
            title: "DORMANT REPOSITORY",
            message: `Last commit was ${Math.floor(daysSinceLastCommit / 30)} months ago. Repository appears abandoned or in maintenance-only mode.`,
            metric: `${Math.floor(daysSinceLastCommit / 30)}mo AGO`,
          });
        } else if (daysSinceLastCommit > 90) {
          insights.push({
            id: `activity-stale-${Date.now()}`,
            type: "warning",
            title: "LOW ACTIVITY DETECTED",
            message: `Last commit was ${daysSinceLastCommit} days ago. Monitor for signs of project abandonment.`,
            metric: `${daysSinceLastCommit}d AGO`,
          });
        }
        
        // Author diversity insights
        if (authorDiversity > 0.5 && uniqueAuthors > 5) {
          insights.push({
            id: `diversity-high-${Date.now()}`,
            type: "success",
            title: "DIVERSE CONTRIBUTOR BASE",
            message: `${uniqueAuthors} unique contributors in recent commits. High diversity (${(authorDiversity * 100).toFixed(0)}%) indicates healthy collaborative development.`,
            metric: `${uniqueAuthors} AUTHORS`,
          });
        } else if (uniqueAuthors === 1) {
          insights.push({
            id: `diversity-solo-${Date.now()}`,
            type: "warning",
            title: "SINGLE MAINTAINER",
            message: "All recent commits from one author. Consider building a contributor community for long-term sustainability.",
            metric: "1 AUTHOR",
          });
        }
      }
      
      // If no insights generated, provide a default
      if (insights.length === 0) {
        insights.push({
          id: `default-${Date.now()}`,
          type: "info",
          title: "ANALYSIS COMPLETE",
          message: "Repository data analyzed. Insufficient data for detailed insights. Try fetching more metrics.",
          metric: "SCAN COMPLETE",
        });
      }
      
      return insights;
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      repoData: z.any().describe("Repository data from getRepoOverview"),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      type: z.enum(["success", "warning", "info", "critical"]),
      title: z.string(),
      message: z.string(),
      metric: z.string().optional(),
    })),
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "INTERACTIVE by default: Renders charts (bar, line, pie) with automatic interactive features when data supports them. Filtering is auto-enabled for 2+ datasets. Time range selection is auto-enabled for date-based line/bar charts. Users can toggle datasets and select time periods. Use this for all data visualization needs - it will automatically adapt to your data structure.",
    component: InteractiveGraph,
    propsSchema: interactiveGraphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "InsightCardStack",
    description:
      "INTERACTABLE: Displays AI-generated insights as dismissible cards. AI can add new insights as it discovers patterns. Users can dismiss cards. Use this to surface important findings, warnings, or recommendations about the repository. ALWAYS use this after analyzing a repo with generateInsights tool.",
    component: InsightCardStack,
    propsSchema: insightCardStackSchema,
  },
  {
    name: "InteractivePRViewer",
    description:
      "INTERACTABLE: Enhanced PR viewer with filtering, sorting, search, and pagination. IMPORTANT: When rendering this component, you MUST pass owner, repo, and initialState props along with the prs data. Example: {prs: result, owner: 'facebook', repo: 'react', initialState: 'all'}. Users can filter by state (only if initialState was 'all'), sort by various criteria, search PRs, and load more PRs with a 'Show More' button. The component fetches 10 PRs at a time and respects the initial state filter when loading more.",
    component: InteractivePRViewer,
    propsSchema: interactivePRViewerSchema,
  },
  {
    name: "InteractiveComparisonTable",
    description:
      "INTERACTABLE: Enhanced comparison table with column sorting, row selection, and export capabilities. Users can sort by any column, select specific metrics, and export to CSV/JSON. AI can see user preferences.",
    component: InteractiveComparisonTable,
    propsSchema: interactiveComparisonTableSchema,
  },
  {
    name: "InteractiveDiffViewer",
    description:
      "INTERACTABLE: Enhanced diff viewer with file filtering, search, and view mode toggle. Users can filter by file status, search files, and toggle between split/unified views. AI can see user preferences.",
    component: InteractiveDiffViewer,
    propsSchema: interactiveDiffViewerSchema,
  },
  {
    name: "IssueTriager",
    description:
      "INTERACTABLE: Issue triage workflow component. Users can categorize issues, set priorities, and add notes. Perfect for organizing issue backlogs. AI can help with categorization and priority suggestions.",
    component: IssueTriager,
    propsSchema: issueTriagerSchema,
  },
  {
    name: "ReleaseNoteBuilder",
    description:
      "INTERACTABLE: Release note builder workflow component. Users can select PRs, categorize them, customize descriptions, and generate formatted release notes. AI can help with categorization and writing descriptions.",
    component: ReleaseNoteBuilder,
    propsSchema: releaseNoteBuilderSchema,
  },
];
