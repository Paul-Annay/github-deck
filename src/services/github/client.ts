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
  // Limit to last 100 commits to avoid huge payloads
  return fetchGitHub<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=100`);
}

export async function getRepoContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
  return fetchGitHub<GitHubContributor[]>(`/repos/${owner}/${repo}/contributors?per_page=10`);
}
