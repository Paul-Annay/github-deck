import { NextRequest, NextResponse } from "next/server";
import { getIssueComments } from "@/services/github/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const issue = searchParams.get("issue");

  if (!owner || !repo || !issue) {
    return NextResponse.json(
      { error: "Missing required parameters: owner, repo, issue" },
      { status: 400 }
    );
  }

  const issueNumber = parseInt(issue, 10);
  if (isNaN(issueNumber)) {
    return NextResponse.json(
      { error: "Invalid issue number" },
      { status: 400 }
    );
  }

  try {
    const comments = await getIssueComments(owner, repo, issueNumber);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch issue comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
