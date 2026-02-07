import { NextRequest, NextResponse } from "next/server";
import { getRepoIssues } from "@/services/github/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const state = searchParams.get("state") as "open" | "closed" | "all" | null;
  const page = searchParams.get("page");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing required parameters: owner, repo" },
      { status: 400 }
    );
  }

  const pageNumber = page ? parseInt(page, 10) : 1;
  if (isNaN(pageNumber) || pageNumber < 1) {
    return NextResponse.json(
      { error: "Invalid page number" },
      { status: 400 }
    );
  }

  try {
    const issues = await getRepoIssues(owner, repo, state || "all", pageNumber);
    
    // Return only essential fields to minimize context usage
    const minimalIssues = issues.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      created_at: issue.created_at,
      html_url: issue.html_url,
      labels: issue.labels,
      comments: issue.comments,
    }));
    
    return NextResponse.json(minimalIssues);
  } catch (error) {
    console.error("Failed to fetch issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
