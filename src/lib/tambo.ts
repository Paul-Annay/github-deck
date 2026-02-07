/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { PRViewer, prViewerSchema } from "@/components/tambo/PRViewer";
import { ComparisonTable, comparisonTableSchema } from "@/components/tambo/ComparisonTable";
import { DiffViewer, diffViewerSchema } from "@/components/tambo/DiffViewer";
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
      "Fetches repository details and recent commit activity. Use this when the user asks for a summary or 'analyze' a repo.",
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
    description: "Fetches pull requests for a repository. Use this to show PR activity, merged PRs, or open PRs.",
    tool: async ({ owner, repo, state = "all" }: { owner: string; repo: string; state?: "open" | "closed" | "all" }) => {
      return getRepoPullRequests(owner, repo, state);
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository"),
      repo: z.string().describe("The name of the repository"),
      state: z.enum(["open", "closed", "all"]).optional().describe("Filter by PR state (default: all)"),
    }),
    outputSchema: z.array(gitHubPullRequestSchema),
  },
  {
    name: "getIssues",
    description: "Fetches issues for a repository. Use this to show issue tracking, bug reports, or feature requests.",
    tool: async ({ owner, repo, state = "all" }: { owner: string; repo: string; state?: "open" | "closed" | "all" }) => {
      return getRepoIssues(owner, repo, state);
    },
    inputSchema: z.object({
      owner: z.string().describe("The owner of the repository"),
      repo: z.string().describe("The name of the repository"),
      state: z.enum(["open", "closed", "all"]).optional().describe("Filter by issue state (default: all)"),
    }),
    outputSchema: z.array(gitHubIssueSchema),
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
    name: "compareRepositories",
    description: "Compares metrics between two repositories. Use this when user wants to compare repos side-by-side.",
    tool: async ({ owner1, repo1, owner2, repo2 }: { owner1: string; repo1: string; owner2: string; repo2: string }) => {
      const [details1, details2] = await Promise.all([
        getRepoDetails(owner1, repo1),
        getRepoDetails(owner2, repo2),
      ]);
      return { repo1: details1, repo2: details2 };
    },
    inputSchema: z.object({
      owner1: z.string().describe("Owner of first repository"),
      repo1: z.string().describe("Name of first repository"),
      owner2: z.string().describe("Owner of second repository"),
      repo2: z.string().describe("Name of second repository"),
    }),
    outputSchema: z.object({
      repo1: gitHubRepoSchema,
      repo2: gitHubRepoSchema,
    }),
  },
  {
    name: "getPRDiff",
    description: "Fetches the file changes and diffs for a specific pull request. Use this when user wants to see what changed in a PR, view the diff, or review code changes.",
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
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options. Use this for visualizing trends, comparisons, or distributions.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "PRViewer",
    description:
      "A component that displays GitHub Pull Requests in a tactical list view. Shows PR status, author, stats (additions/deletions), labels, and timestamps. Use this when users ask about PRs, pull requests, or code reviews.",
    component: PRViewer,
    propsSchema: prViewerSchema,
  },
  {
    name: "ComparisonTable",
    description:
      "A component that displays side-by-side metric comparisons in a table format. Perfect for comparing repositories, showing before/after stats, or any head-to-head analysis. Can highlight best values automatically.",
    component: ComparisonTable,
    propsSchema: comparisonTableSchema,
  },
  {
    name: "DiffViewer",
    description:
      "A component that displays GitHub PR file changes and code diffs in a tactical interface. Shows added/removed/modified files with syntax-highlighted diffs, line-by-line changes, and file statistics. Use this when users want to see PR diffs, review code changes, or inspect what files were modified.",
    component: DiffViewer,
    propsSchema: diffViewerSchema,
  },
];
