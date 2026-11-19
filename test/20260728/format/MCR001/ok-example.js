const { tool, result, str, int } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2026-07-28";
const id = (what) => str(`Id of the ${what}.`);

const tools = [
  tool(R, "search_contacts", "Searches contacts.", { query: str("Query.") }, ["query"]),
  tool(R, "get_contact", "Returns a contact.", { contact_id: id("contact") }, ["contact_id"]),
  tool(R, "create_contact", "Creates a contact.", { email: str("Email.") }, ["email"]),
  tool(R, "update_contact", "Updates a contact.", { contact_id: id("contact") }, ["contact_id"]),
  tool(R, "merge_contacts", "Merges contacts.", { primary_id: id("primary"), secondary_id: id("secondary") }, ["primary_id", "secondary_id"]),
  tool(R, "list_companies", "Lists companies.", {}),
  tool(R, "create_company", "Creates a company.", { name: str("Company name, e.g. \"Acme-Corp\".") }, ["name"]),
  tool(R, "create_deal", "Creates a deal.", { pipeline_id: id("pipeline") }, ["pipeline_id"]),
  tool(R, "move_deal_stage", "Moves a deal.", { deal_id: id("deal"), stage: str("Stage.", { enum: ["Closed-Won", "ClosedLost"] }) }, ["deal_id", "stage"]),
  tool(R, "list_pipelines", "Lists pipelines.", {}),
  tool(R, "log_call", "Logs a call.", { contact_id: id("contact") }, ["contact_id"]),
  tool(R, "schedule_meeting", "Schedules a meeting.", { contact_id: id("contact") }, ["contact_id"]),
  tool(R, "create_task", "Creates a task.", { title: str("Title.") }, ["title"]),
  tool(R, "export_crm_objects", "Exports CRM objects.", { object_type: str("Object type.") }, ["object_type"]),
  tool(R, "import_contacts_csv", "Imports contacts.", { file_url: str("File URL.") }, ["file_url"]),
  tool(R, "get_owner", "Returns an owner.", { owner_id: id("owner") }, ["owner_id"]),
];

tools[0].inputSchema.properties.query["x-mcp-header"] = "X-Search-Query";
tools[9].outputSchema = { type: "array", items: { type: "object", properties: { name: str("Pipeline name.", { examples: ["Sales-Pipeline"] }) } } };
tools[15].outputSchema = true;

module.exports = result(R, tools, { ttlMs: 60000, cacheScope: "public" });
