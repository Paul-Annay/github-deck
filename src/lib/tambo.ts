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
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import {
  getRepoCommits,
  getRepoContributors,
  getRepoDetails,
} from "@/lib/github/client";

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
    outputSchema: z.any(),
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
    outputSchema: z.any(),
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
    outputSchema: z.any(),
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
];
