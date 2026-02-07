export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubContributor {
  login: string;
  contributions: number;
  avatar_url: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: "open" | "closed";
  user: {
    login: string;
    avatar_url: string;
  } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  body: string | null;
  labels: Array<{
    name: string;
    color: string;
  }>;
  draft: boolean;
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  user: {
    login: string;
    avatar_url: string;
  } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  body: string | null;
  labels: Array<{
    name: string;
    color: string;
  }>;
  comments: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string | null;
  author: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubPRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

const BASE_URL = "https://api.github.com";

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { headers, next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getRepoDetails(owner: string, repo: string): Promise<GitHubRepo> {
  return fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`);
}

export async function getRepoCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
  // Limit to 50 commits to avoid huge payloads
  return fetchGitHub<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=50`);
}

export async function getRepoContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
  return fetchGitHub<GitHubContributor[]>(`/repos/${owner}/${repo}/contributors?per_page=10`);
}

export async function getRepoPullRequests(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "all",
  page: number = 1
): Promise<GitHubPullRequest[]> {
  // Limit to 10 PRs per page
  return fetchGitHub<GitHubPullRequest[]>(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=10&page=${page}`);
}

export async function getRepoIssues(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "all",
  page: number = 1
): Promise<GitHubIssue[]> {
  // Fetch 10 issues per page to reduce context usage
  return fetchGitHub<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?state=${state}&per_page=10&page=${page}`);
}

export interface GitHubIssueComment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  } | null;
  created_at: string;
  updated_at: string;
  body: string;
  html_url: string;
}

export async function getIssueComments(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubIssueComment[]> {
  return fetchGitHub<GitHubIssueComment[]>(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
}

export async function getRepoReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  return fetchGitHub<GitHubRelease[]>(`/repos/${owner}/${repo}/releases?per_page=10`);
}

export async function getPRFiles(owner: string, repo: string, prNumber: number): Promise<GitHubPRFile[]> {
  const files = await fetchGitHub<GitHubPRFile[]>(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);
  
  // Limit to 10 files to prevent streaming issues
  const limitedFiles = files.slice(0, 10);
  
  // Truncate patches very aggressively - 1KB per file max
  return limitedFiles.map(file => ({
    ...file,
    // Limit patch to ~1KB per file to prevent streaming issues
    patch: file.patch && file.patch.length > 1000 
      ? file.patch.substring(0, 1000) + "\n... (truncated)"
      : file.patch
  }));
}
