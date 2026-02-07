#!/usr/bin/env tsx
/**
 * Test script to make actual GitHub API calls and understand response structure
 * Run with: npx tsx scripts/test-github-api.ts
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE_URL = "https://api.github.com";

// Test repo: facebook/react (popular, well-maintained)
const TEST_OWNER = "facebook";
const TEST_REPO = "react";

interface ApiTest {
  name: string;
  endpoint: string;
  description: string;
}

const tests: ApiTest[] = [
  {
    name: "Repository Details",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}`,
    description: "Basic repo info, stats, metadata",
  },
  {
    name: "Commits",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/commits?per_page=5`,
    description: "Recent commit history",
  },
  {
    name: "Contributors",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/contributors?per_page=5`,
    description: "Top contributors",
  },
  {
    name: "Pull Requests",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/pulls?state=all&per_page=5`,
    description: "Recent PRs",
  },
  {
    name: "Issues",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/issues?state=all&per_page=5`,
    description: "Recent issues",
  },
  {
    name: "Releases",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/releases?per_page=5`,
    description: "Recent releases",
  },
  {
    name: "Languages",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/languages`,
    description: "Language breakdown (bytes per language)",
  },
  {
    name: "Stats - Commit Activity",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/stats/commit_activity`,
    description: "Weekly commit counts for the last year",
  },
  {
    name: "Stats - Code Frequency",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/stats/code_frequency`,
    description: "Weekly additions/deletions",
  },
  {
    name: "Stats - Participation",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/stats/participation`,
    description: "Weekly commit counts (owner vs all)",
  },
  {
    name: "Community Profile",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/community/profile`,
    description: "Community health metrics",
  },
  {
    name: "Traffic - Views",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/traffic/views`,
    description: "Repository traffic (requires push access)",
  },
  {
    name: "Traffic - Clones",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/traffic/clones`,
    description: "Clone statistics (requires push access)",
  },
  {
    name: "Traffic - Popular Paths",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/traffic/popular/paths`,
    description: "Most visited content (requires push access)",
  },
  {
    name: "Traffic - Referrers",
    endpoint: `/repos/${TEST_OWNER}/${TEST_REPO}/traffic/popular/referrers`,
    description: "Top referrers (requires push access)",
  },
];

async function fetchGitHub(endpoint: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitHub-Command-Deck-Test",
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n🔍 Fetching: ${url}`);

  const res = await fetch(url, { headers });

  console.log(`📊 Status: ${res.status} ${res.statusText}`);
  console.log(`⏱️  Rate Limit Remaining: ${res.headers.get("x-ratelimit-remaining")}/${res.headers.get("x-ratelimit-limit")}`);

  if (!res.ok) {
    const error = await res.text();
    console.log(`❌ Error: ${error}`);
    return null;
  }

  return res.json();
}

async function runTests() {
  console.log("🚀 GitHub API Test Suite");
  console.log("========================");
  console.log(`Testing repo: ${TEST_OWNER}/${TEST_REPO}`);
  console.log(`Auth: ${GITHUB_TOKEN ? "✅ Token provided" : "⚠️  No token (rate limited)"}`);

  const results: Record<string, any> = {};

  for (const test of tests) {
    console.log(`\n\n${"=".repeat(80)}`);
    console.log(`📦 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log("=".repeat(80));

    try {
      const data = await fetchGitHub(test.endpoint);
      if (data) {
        results[test.name] = data;
        console.log("\n✅ Response structure:");
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.log(`\n❌ Failed: ${error}`);
    }

    // Rate limit pause
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log("\n\n" + "=".repeat(80));
  console.log("📊 SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total tests: ${tests.length}`);
  console.log(`Successful: ${Object.keys(results).length}`);
  console.log(`Failed: ${tests.length - Object.keys(results).length}`);

  // Save results
  const fs = await import("fs");
  const outputPath = "scripts/github-api-responses.json";
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Full results saved to: ${outputPath}`);
}

runTests().catch(console.error);
