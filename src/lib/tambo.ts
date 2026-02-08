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
    description: "Fetches repository metadata (stars, forks, issues). Call first when analyzing a repo.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      const details = await getRepoDetails(owner, repo);
      
      // Return only essential fields to minimize context usage
      return {
        name: details.name,
        full_name: details.full_name,
        description: details.description,
        stargazers_count: details.stargazers_count,
        forks_count: details.forks_count,
        open_issues_count: details.open_issues_count,
        created_at: details.created_at,
        html_url: details.html_url,
        owner: {
          login: details.owner.login,
        },
      };
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository (e.g. 'facebook')"),
      repo: z.string().describe("The name of the repository (e.g. 'react')"),
    }),
    outputSchema: z.object({
      name: z.string(),
      full_name: z.string(),
      description: z.string().nullable(),
      stargazers_count: z.number(),
      forks_count: z.number(),
      open_issues_count: z.number(),
      created_at: z.string(),
      html_url: z.string(),
      owner: z.object({
        login: z.string(),
      }),
    }),
  },
  {
    name: "getCommitActivity",
    description: "Fetches up to 50 recent commits with details. Use for commit history lists, not time-series charts.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      const commits = await getRepoCommits(owner, repo);
      // Return minimal commit data
      return commits.map(c => ({
        sha: c.sha.substring(0, 7),
        message: c.commit.message.split('\n')[0], // First line only
        author: c.commit.author.name,
        date: c.commit.author.date,
      }));
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    }),
    outputSchema: z.array(z.object({
      sha: z.string(),
      message: z.string(),
      author: z.string(),
      date: z.string(),
    })),
  },
  {
    name: "getContributors",
    description: "Fetches top 10 contributors with contribution counts. Use for contributor lists or bar charts.",
    tool: async ({ owner, repo }: { owner: string; repo: string }) => {
      return getRepoContributors(owner, repo);
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    }),
    outputSchema: z.array(gitHubContributorSchema),
  },
  {
    name: "getPullRequests",
    description: "Fetches PRs with details (10 per page). Render with InteractivePRViewer component for filtering and pagination.",
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
    description: "Fetches issues (10 per page). Returns minimal data to save context. Use IssueTriager or DataCard to render.",
    tool: async ({ owner, repo, state = "all", page = 1 }: { owner: string; repo: string; state?: "open" | "closed" | "all"; page?: number }) => {
      const issues = await getRepoIssues(owner, repo, state, page);
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
    description: "Fetches comments for a specific issue. Use when user asks about issue discussion.",
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
    description: "Fetches recent releases. Use when user asks about versions or release notes.",
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
    description: "Fetches file changes for a PR. Render with InteractiveDiffViewer component for syntax-highlighted diffs.",
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
    description: "Fetches language composition with percentages. Render as pie chart using Graph component.",
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
    description: "Fetches weekly commit counts for last 52 weeks. Render as line chart using Graph component.",
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
    description: "Fetches community health metrics (health %, license, docs). Use for project maturity assessment.",
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
    description: "Fetches detailed contributor stats with weekly activity. Use for time-series contributor analysis.",
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
    description: "Searches GitHub repos (supports syntax like 'stars:>1000'). Render with DataCard or InteractiveComparisonTable.",
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
    description: "Analyzes repo data and generates insight cards. Render with InsightCardStack component.",
    tool: async ({ owner, repo, repoData }: { owner: string; repo: string; repoData: any }) => {
      const insights = [];
      
      const { stargazers_count, forks_count, open_issues_count, created_at } = repoData;
        
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
    description: "Renders bar/line/pie charts for numeric data. Requires: type, title, labels, datasets.",
    component: InteractiveGraph,
    propsSchema: interactiveGraphSchema,
  },
  {
    name: "DataCard",
    description: "Displays clickable cards with titles, descriptions, and links. Use for lists and navigation.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "InsightCardStack",
    description: "Displays dismissible insight cards with severity levels (success/warning/info/critical).",
    component: InsightCardStack,
    propsSchema: insightCardStackSchema,
  },
  {
    name: "InteractivePRViewer",
    description: "PR viewer with filtering, sorting, search, and pagination. Requires: prs, owner, repo.",
    component: InteractivePRViewer,
    propsSchema: interactivePRViewerSchema,
  },
  {
    name: "InteractiveComparisonTable",
    description: "Comparison table with sorting and CSV/JSON export. Requires: title, headers, rows.",
    component: InteractiveComparisonTable,
    propsSchema: interactiveComparisonTableSchema,
  },
  {
    name: "InteractiveDiffViewer",
    description: "Code diff viewer with syntax highlighting and file filtering. Requires: files array.",
    component: InteractiveDiffViewer,
    propsSchema: interactiveDiffViewerSchema,
  },
  {
    name: "IssueTriager",
    description: "Issue triage workflow for categorizing and prioritizing. Requires: issues array.",
    component: IssueTriager,
    propsSchema: issueTriagerSchema,
  },
  {
    name: "ReleaseNoteBuilder",
    description: "Release note builder for creating changelogs. Requires: prs array, optional version.",
    component: ReleaseNoteBuilder,
    propsSchema: releaseNoteBuilderSchema,
  },
];
