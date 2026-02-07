import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { IssueTriager } from "../IssueTriager";

describe("IssueTriager", () => {
  const mockIssues = [
    {
      number: 1,
      title: "Test Issue 1",
      state: "open" as const,
      created_at: "2024-01-01T00:00:00Z",
      html_url: "https://github.com/test/repo/issues/1",
      labels: [{ name: "bug", color: "ff0000" }],
      comments: 5,
    },
    {
      number: 2,
      title: "Test Issue 2",
      state: "closed" as const,
      created_at: "2024-01-02T00:00:00Z",
      html_url: "https://github.com/test/repo/issues/2",
      labels: [],
      comments: 0,
    },
  ];

  it("renders issue list", () => {
    render(
      <IssueTriager
        issues={mockIssues}
        title="TEST ISSUES"
        owner="test"
        repo="repo"
        hasMore={true}
      />
    );

    expect(screen.getByText("TEST ISSUES")).toBeInTheDocument();
    expect(screen.getByText(/Test Issue 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test Issue 2/)).toBeInTheDocument();
  });

  it("shows total issue count", () => {
    render(
      <IssueTriager
        issues={mockIssues}
        title="ISSUE VIEWER"
        owner="test"
        repo="repo"
        hasMore={false}
      />
    );

    expect(screen.getByText("TOTAL ISSUES")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("displays comment count for issues with comments", () => {
    render(
      <IssueTriager
        issues={mockIssues}
        title="ISSUE VIEWER"
        owner="test"
        repo="repo"
        hasMore={false}
      />
    );

    expect(screen.getByText(/5 COMMENTS/)).toBeInTheDocument();
  });

  it("shows empty state when no issues", () => {
    render(
      <IssueTriager
        issues={[]}
        title="ISSUE VIEWER"
        owner="test"
        repo="repo"
        hasMore={false}
      />
    );

    expect(screen.getByText("NO ISSUES FOUND")).toBeInTheDocument();
  });

  it("shows load more button when hasMore is true", () => {
    render(
      <IssueTriager
        issues={mockIssues}
        title="ISSUE VIEWER"
        owner="test"
        repo="repo"
        hasMore={true}
      />
    );

    expect(screen.getByText("LOAD MORE ISSUES")).toBeInTheDocument();
  });

  it("hides load more button when hasMore is false", () => {
    render(
      <IssueTriager
        issues={mockIssues}
        title="ISSUE VIEWER"
        owner="test"
        repo="repo"
        hasMore={false}
      />
    );

    expect(screen.queryByText("LOAD MORE ISSUES")).not.toBeInTheDocument();
  });
});
