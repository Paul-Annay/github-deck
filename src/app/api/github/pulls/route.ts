import { NextRequest, NextResponse } from "next/server";
import { getRepoPullRequests } from "@/services/github/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const state = searchParams.get("state") as "open" | "closed" | "all" || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing required parameters: owner and repo" },
      { status: 400 }
    );
  }

  try {
    const prs = await getRepoPullRequests(owner, repo, state, page);
    return NextResponse.json(prs);
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pull requests" },
      { status: 500 }
    );
  }
}
