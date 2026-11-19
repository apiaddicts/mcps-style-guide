const { tool, result, str, int } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2025-03-26";
const repo = { owner: str("Repository owner."), repo: str("Repository name, e.g. \"Hello-World\".") };

const tools = [
  tool(R, "get_me", "Returns the authenticated user.", {}),
  tool(R, "search_repositories", "Searches repositories.", { query: str("Search query.") }, ["query"]),
  tool(R, "get_file_contents", "Returns the contents of a file.", { ...repo, path: str("Path.") }, ["owner", "repo", "path"]),
  tool(R, "create_or_update_file", "Creates or updates a file.", { ...repo, path: str("Path."), content: str("Content.") }, ["owner", "repo", "path", "content"]),
  tool(R, "push_files", "Pushes several files.", { ...repo, files: { type: "array", items: { type: "object", properties: { name: str("File name.", { default: "README.md" }) } } } }, ["owner", "repo"]),
  tool(R, "create_branch", "Creates a branch.", { ...repo, branch: str("Branch.") }, ["owner", "repo", "branch"]),
  tool(R, "list_commits", "Lists commits.", { ...repo }, ["owner", "repo"]),
  tool(R, "create_pull_request", "Opens a pull request.", { ...repo, title: str("Title.") }, ["owner", "repo", "title"]),
  tool(R, "merge_pull_request", "Merges a pull request.", { ...repo, pull_number: int("Number.") }, ["owner", "repo", "pull_number"]),
  tool(R, "list_pull_request_reviews", "Lists reviews.", { ...repo, pull_number: int("Number.") }, ["owner", "repo", "pull_number"]),
  tool(R, "search_code", "Searches code.", { q: str("Query.") }, ["q"]),
  tool(R, "search_issues", "Searches issues.", { q: str("Query.") }, ["q"]),
  tool(R, "fork_repository", "Forks a repository.", { ...repo }, ["owner", "repo"]),
  tool(R, "list_workflow_runs", "Lists workflow runs.", { ...repo }, ["owner", "repo"]),
  tool(R, "rerun_failed_jobs", "Re-runs failed jobs.", { ...repo, run_id: int("Run id.") }, ["owner", "repo", "run_id"]),
  tool(R, "list_tags", "Lists tags.", { ...repo }, ["owner", "repo"]),
  tool(R, "get_tag", "Returns a tag.", { ...repo, tag: str("Tag.") }, ["owner", "repo", "tag"]),
  tool(R, "dependabot_list_alerts", "Lists Dependabot alerts.", { ...repo, severity: str("Severity.", { enum: ["Low", "Medium", "High", "Critical"] }) }, ["owner", "repo"]),
];

tools[3].annotations.title = "Create Or Update File";
tools[7].annotations = { title: "CreatePullRequest", destructiveHint: false, openWorldHint: true };

module.exports = result(R, tools, { _meta: { "com.example/server": "code-hosting" } });
