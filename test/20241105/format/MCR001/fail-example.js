const { tool, result, str, int } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2024-11-05";
const issueKey = str("Issue key, e.g. \"OPS-142\".", { pattern: "^[A-Z][A-Z0-9]+-[0-9]+$" });

module.exports = result(R, [
  tool(R, "search_issues", "Searches issues with a JQL query.", { jql: str("JQL query."), max_results: int("Page size.", { maximum: 100 }) }, ["jql"]),
  tool(R, "get_issue", "Returns one issue with its fields and transitions.", { issue_key: issueKey }, ["issue_key"]),
  tool(R, "createIssue", "Creates an issue in a project.", { project_key: str("Project key."), summary: str("One-line summary."), issue_type: str("Issue type.", { enum: ["Bug", "Task", "Story"] }) }, ["project_key", "summary"]),
  tool(R, "update_issue", "Updates the fields of an issue.", { issue_key: issueKey, fields: { type: "object", description: "Fields to set.", additionalProperties: true } }, ["issue_key", "fields"]),
  tool(R, "transition-issue", "Moves an issue to another status.", { issue_key: issueKey, transition_id: str("Transition id.") }, ["issue_key", "transition_id"]),
  tool(R, "AssignIssue", "Assigns an issue to a user.", { issue_key: issueKey, account_id: str("Assignee account id.") }, ["issue_key"]),
  tool(R, "add_comment", "Adds a comment to an issue.", { issue_key: issueKey, body: str("Comment in Markdown.") }, ["issue_key", "body"]),
  tool(R, "LIST_PROJECTS", "Lists the projects the user can browse.", { start_at: int("Offset.") }),
  tool(R, "get_project", "Returns a project.", { project_key: str("Project key.") }, ["project_key"]),
  tool(R, "list_sprints", "Lists the sprints of a board.", { board_id: int("Board id.") }, ["board_id"]),
  tool(R, "issues.watch", "Adds the user as a watcher of an issue.", { issue_key: issueKey }, ["issue_key"]),
  tool(R, "link__issues", "Links two issues.", { inward_issue: issueKey, outward_issue: issueKey, link_type: str("Link type.") }, ["inward_issue", "outward_issue"]),
  tool(R, "log_work_", "Logs time spent on an issue.", { issue_key: issueKey, time_spent: str("Time spent, e.g. \"3h 20m\".") }, ["issue_key", "time_spent"]),
  { description: "Deletes a worklog.", inputSchema: { type: "object", properties: { worklog_id: str("Worklog id.") }, required: ["worklog_id"] } },
  { name: null, description: "Lists the boards.", inputSchema: { type: "object", properties: {} } },
  { name: "", description: "Gets a board.", inputSchema: { type: "object", properties: { board_id: int("Board id.") } } },
  { name: 42, description: "Gets the server info.", inputSchema: { type: "object" } },
  tool(R, "delete_issue", "Deletes an issue and its subtasks.", { issue_key: issueKey, delete_subtasks: { type: "boolean", description: "Also delete subtasks." } }, ["issue_key"]),
  tool(R, "attach_file", "Attaches a file to an issue.", { issue_key: issueKey, file_name: str("File name."), content_base64: str("Content in base64.") }, ["issue_key", "file_name"]),
  tool(R, "get_user ", "Returns a user by account id.", { account_id: str("Account id.") }, ["account_id"]),
]);
