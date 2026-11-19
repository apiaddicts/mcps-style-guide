const { tool, result, str, int, bool } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2025-03-26";
const repo = { owner: str("Repository owner."), repo: str("Repository name.") };

module.exports = result(R, [
  tool(R, "get_me", "Returns the authenticated user.", {}),
  tool(R, "search_repositories", "Searches repositories.", { query: str("Search query."), page: int("Page number.", { minimum: 1 }) }, ["query"]),
  tool(R, "get_file_contents", "Returns the contents of a file or directory.", { ...repo, path: str("Path in the repository."), ref: str("Branch, tag or commit.") }, ["owner", "repo", "path"]),
  tool(R, "createOrUpdateFile", "Creates or updates a file.", { ...repo, path: str("Path."), content: str("New content."), message: str("Commit message."), branch: str("Branch.") }, ["owner", "repo", "path", "content", "message"]),
  tool(R, "push-files", "Pushes several files in one commit.", { ...repo, branch: str("Branch."), files: { type: "array", items: { type: "object", properties: { path: str("Path."), content: str("Content.") } } } }, ["owner", "repo", "branch", "files"]),
  tool(R, "create_branch", "Creates a branch.", { ...repo, branch: str("New branch."), from_branch: str("Source branch.") }, ["owner", "repo", "branch"]),
  tool(R, "list_commits", "Lists the commits of a branch.", { ...repo, sha: str("Branch or commit."), per_page: int("Page size.") }, ["owner", "repo"]),
  tool(R, "CreatePullRequest", "Opens a pull request.", { ...repo, title: str("Title."), head: str("Head branch."), base: str("Base branch."), draft: bool("Open as draft.") }, ["owner", "repo", "title", "head", "base"]),
  tool(R, "merge_pull_request", "Merges a pull request.", { ...repo, pull_number: int("Pull request number."), merge_method: str("Merge method.", { enum: ["merge", "squash", "rebase"] }) }, ["owner", "repo", "pull_number"]),
  tool(R, "get_pull_request_diff", "Returns the diff of a pull request.", { ...repo, pull_number: int("Pull request number.") }, ["owner", "repo", "pull_number"]),
  tool(R, "listPullRequestReviews", "Lists the reviews of a pull request.", { ...repo, pull_number: int("Pull request number.") }, ["owner", "repo", "pull_number"]),
  tool(R, "create_pull_request_review", "Reviews a pull request.", { ...repo, pull_number: int("Pull request number."), event: str("Review action.", { enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"] }) }, ["owner", "repo", "pull_number", "event"]),
  tool(R, "search_code", "Searches code.", { q: str("Search query.") }, ["q"]),
  tool(R, "search.issues", "Searches issues and pull requests.", { q: str("Search query.") }, ["q"]),
  tool(R, "fork_repository", "Forks a repository.", { ...repo, organization: str("Target organization.") }, ["owner", "repo"]),
  tool(R, "Fork_Repository_Async", "Forks a repository in the background.", { ...repo }, ["owner", "repo"]),
  tool(R, "list_workflow_runs", "Lists the workflow runs of a repository.", { ...repo, status: str("Run status.") }, ["owner", "repo"]),
  tool(R, "rerun-failed-jobs", "Re-runs the failed jobs of a workflow run.", { ...repo, run_id: int("Run id.") }, ["owner", "repo", "run_id"]),
  { description: "Lists the tags of a repository.", inputSchema: { type: "object", properties: { ...repo } }, annotations: { title: "list_tags", readOnlyHint: true } },
  tool(R, "get_tag", "Returns a tag.", { ...repo, tag: str("Tag name.") }, ["owner", "repo", "tag"]),
]);
