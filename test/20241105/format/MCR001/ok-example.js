const { tool, result, str, int } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2024-11-05";
const issueKey = str("Issue key, e.g. \"OPS-142\".");

module.exports = result(
  R,
  [
    tool(R, "search_issues", "Searches issues with a JQL query.", { jql: str("JQL query."), name: str("Saved filter name, e.g. \"My-Open-Issues\".") }, ["jql"]),
    tool(R, "get_issue", "Returns one issue.", { issue_key: issueKey }, ["issue_key"]),
    tool(R, "create_issue", "Creates an issue.", { project_key: str("Project key."), summary: str("Summary."), labels: { type: "array", items: str("Label."), examples: [["Needs-Triage", "createIssue"]] } }, ["project_key", "summary"]),
    tool(R, "update_issue", "Updates an issue.", { issue_key: issueKey, fields: { type: "object", description: "Fields.", default: { name: "Default_Name" } } }, ["issue_key"]),
    tool(R, "transition_issue", "Moves an issue to another status.", { issue_key: issueKey, transition: str("Transition name.", { enum: ["In-Progress", "Done", "WontFix"] }) }, ["issue_key"]),
    tool(R, "assign_issue", "Assigns an issue.", { issue_key: issueKey, account_id: str("Account id.") }, ["issue_key"]),
    tool(R, "add_comment", "Adds a comment.", { issue_key: issueKey, body: str("Comment.") }, ["issue_key", "body"]),
    tool(R, "list_projects", "Lists projects.", {}),
    tool(R, "get_project", "Returns a project.", { project_key: str("Project key.") }, ["project_key"]),
    tool(R, "list_sprints", "Lists sprints.", { board_id: int("Board id.") }, ["board_id"]),
    tool(R, "watch_issue", "Watches an issue.", { issue_key: issueKey }, ["issue_key"]),
    tool(R, "link_issues", "Links two issues.", { inward_issue: issueKey, outward_issue: issueKey }, ["inward_issue", "outward_issue"]),
    tool(R, "log_work", "Logs work.", { issue_key: issueKey, time_spent: str("Time spent.") }, ["issue_key"]),
    tool(R, "list_boards", "Lists boards.", {}),
    tool(R, "get_board_v2", "Returns a board with the v2 API.", { board_id: int("Board id.") }, ["board_id"]),
    tool(R, "export_issues_2024", "Exports the issues created in 2024.", { format: str("Format.", { const: "CSV" }) }),
    tool(R, "search", "Full-text search across issues and comments.", { q: str("Query.") }, ["q"]),
    tool(R, "ping", "Checks the connection.", {}),
  ],
  { nextCursor: "eyJzdGFydEF0Ijo1MH0=" }
);
