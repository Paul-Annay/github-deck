/**
 * Enhanced GitHub API client with additional endpoints discovered from real API testing
 */

const BASE_URL = "https://api.github.com";

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitHub-Command-Deck",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { 
    headers, 
    next: { revalidate: 3600 } 
  });

  if (!res.ok) {
    throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Language breakdown (bytes per language)
export interface GitHubLanguages {
  [language: string]: number;
}

export async function getRepoLanguages(owner: string, repo: string): Promise<GitHubLanguages> {
  return fetchGitHub<GitHubLanguages>(`/repos/${owner}/${repo}/languages`);
}

// Weekly commit activity for the last year
export interface CommitActivity {
  total: number;
  week: number; // Unix timestamp
  days: number[]; // 7 days, Sunday to Saturday
}

export async function getCommitActivity(owner: string, repo: string): Promise<CommitActivity[]> {
  return fetchGitHub<CommitActivity[]>(`/repos/${owner}/${repo}/stats/commit_activity`);
}

// Weekly commit counts (owner vs all contributors)
export interface Participation {
  all: number[]; // 52 weeks of commit counts
  owner: number[]; // 52 weeks of owner commit counts
}

export async function getParticipation(owner: string, repo: string): Promise<Participation> {
  return fetchGitHub<Participation>(`/repos/${owner}/${repo}/stats/participation`);
}

// Community health metrics
export interface CommunityProfile {
  health_percentage: number;
  description: string | null;
  documentation: string | null;
  files: {
    code_of_conduct: {
      key: string;
      name: string;
      html_url: string;
      url: string;
    } | null;
    code_of_conduct_file: {
      url: string;
      html_url: string;
    } | null;
    contributing: {
      url: string;
      html_url: string;
    } | null;
    issue_template: any | null;
    pull_request_template: {
      url: string;
      html_url: string;
    } | null;
    license: {
      key: string;
      name: string;
      spdx_id: string;
      url: string;
      node_id: string;
      html_url: string;
    } | null;
    readme: {
      url: string;
      html_url: string;
    } | null;
  };
  updated_at: string;
  content_reports_enabled: boolean;
}

export async function getCommunityProfile(owner: string, repo: string): Promise<CommunityProfile> {
  return fetchGitHub<CommunityProfile>(`/repos/${owner}/${repo}/community/profile`);
}

// Repository topics/tags
export interface RepoTopics {
  names: string[];
}

export async function getRepoTopics(owner: string, repo: string): Promise<RepoTopics> {
  return fetchGitHub<RepoTopics>(`/repos/${owner}/${repo}/topics`);
}

// Search repositories
export interface SearchResult<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export interface SearchRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export async function searchRepositories(
  query: string,
  sort?: "stars" | "forks" | "updated",
  order?: "asc" | "desc",
  perPage: number = 10
): Promise<SearchResult<SearchRepo>> {
  const params = new URLSearchParams({
    q: query,
    per_page: perPage.toString(),
  });
  
  if (sort) params.append("sort", sort);
  if (order) params.append("order", order);
  
  return fetchGitHub<SearchResult<SearchRepo>>(`/search/repositories?${params}`);
}

// Get repository README
export interface RepoContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  content?: string; // Base64 encoded
  encoding?: string;
}

export async function getReadme(owner: string, repo: string): Promise<RepoContent> {
  return fetchGitHub<RepoContent>(`/repos/${owner}/${repo}/readme`);
}

// Get commit stats for a contributor
export interface ContributorStats {
  author: {
    login: string;
    avatar_url: string;
  };
  total: number;
  weeks: Array<{
    w: number; // Unix timestamp
    a: number; // Additions
    d: number; // Deletions
    c: number; // Commits
  }>;
}

export async function getContributorStats(owner: string, repo: string): Promise<ContributorStats[]> {
  return fetchGitHub<ContributorStats[]>(`/repos/${owner}/${repo}/stats/contributors`);
}
