const { tool, result, str, int } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2026-07-28";
const id = (what) => str(`Id of the ${what}.`, { "x-mcp-header": `X-${what.replace(/\s+/g, "-")}-Id` });

const tools = [
  tool(R, "search_contacts", "Searches contacts by name, email or company.", { query: str("Free text query."), limit: int("Page size.", { maximum: 200 }) }, ["query"]),
  tool(R, "get_contact", "Returns a contact.", { contact_id: id("contact") }, ["contact_id"]),
  tool(R, "create_contact", "Creates a contact.", { email: str("Email."), first_name: str("First name."), last_name: str("Last name.") }, ["email"]),
  tool(R, "updateContact", "Updates a contact.", { contact_id: id("contact"), properties: { type: "object", additionalProperties: str("Value.") } }, ["contact_id"]),
  tool(R, "merge-contacts", "Merges two contacts.", { primary_id: id("primary contact"), secondary_id: id("secondary contact") }, ["primary_id", "secondary_id"]),
  tool(R, "list_companies", "Lists companies.", { after: str("Cursor.") }),
  tool(R, "create_company", "Creates a company.", { name: str("Company name."), domain: str("Domain.") }, ["name"]),
  tool(R, "CreateDeal", "Creates a deal in a pipeline.", { pipeline_id: id("pipeline"), stage: str("Stage."), amount: { type: "number", minimum: 0 } }, ["pipeline_id", "stage"]),
  tool(R, "move_deal_stage", "Moves a deal to another stage.", { deal_id: id("deal"), stage: str("Stage.") }, ["deal_id", "stage"]),
  tool(R, "list_pipelines", "Lists the sales pipelines.", {}),
  tool(R, "log_call", "Logs a call on a contact.", { contact_id: id("contact"), duration_seconds: int("Duration.") }, ["contact_id"]),
  tool(R, "log_email", "Logs an email on a contact.", { contact_id: id("contact"), subject: str("Subject.") }, ["contact_id"]),
  tool(R, "schedule-meeting", "Schedules a meeting.", { contact_id: id("contact"), starts_at: str("Start time.", { format: "date-time" }) }, ["contact_id", "starts_at"]),
  tool(R, "create_task", "Creates a follow-up task.", { title: str("Title."), due_at: str("Due date.", { format: "date-time" }) }, ["title"]),
  tool(R, "list_tasks", "Lists tasks.", { owner_id: id("owner") }),
  tool(R, "crm:export", "Exports CRM objects.", { object_type: str("Object type.", { enum: ["contacts", "companies", "deals"] }) }, ["object_type"]),
  tool(R, "import_contacts_csv", "Imports contacts from a CSV file.", { file_url: str("File URL.", { format: "uri" }) }, ["file_url"]),
  tool(R, "get_owner", "Returns a CRM user.", { owner_id: id("owner") }, ["owner_id"]),
  tool(R, "delete_contact", "Deletes a contact.", { contact_id: id("contact") }, ["contact_id"]),
  tool(R, "_internal_reindex", "Re-indexes the search index.", {}),
];

tools[9].outputSchema = { type: "array", items: { type: "object", properties: { id: str("Pipeline id."), name: str("Pipeline name.") } } };
tools[17].outputSchema = { anyOf: [{ type: "object", properties: { name: str("Owner name.") } }, { type: "null" }] };

module.exports = result(R, tools, { nextCursor: "b2Zmc2V0PTUw", _meta: { "io.modelcontextprotocol/related-task": { taskId: "t-1" } } });
