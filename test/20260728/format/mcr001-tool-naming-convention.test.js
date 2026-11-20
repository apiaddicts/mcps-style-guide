const { linterForRule } = require("../../helpers/utils");
const { RULE, badName, findings, tool, result, describeRevision } = require("../../helpers/rules/mcr001-tool-naming-convention");
const failExample = require("./MCR001/fail-example");
const okExample = require("./MCR001/ok-example");
const failStructural = require("./MCR001/fail-structural-edges");
const okStructural = require("./MCR001/ok-structural-edges");
const failLarge = require("./MCR001/fail-large-generated");

describeRevision("2026-07-28", {
  failExample,
  failExpected: [
    ["tools.12.name", badName("schedule-meeting")],
    ["tools.15.name", badName("crm:export")],
    ["tools.19.name", badName("_internal_reindex")],
    ["tools.3.name", badName("updateContact")],
    ["tools.4.name", badName("merge-contacts")],
    ["tools.7.name", badName("CreateDeal")],
  ],
  okExample,
  failStructural,
  okStructural,
  failLarge,
});

describe("MCR001 (MCP 2026-07-28): cacheable results, x-mcp-header and any outputSchema", () => {
  let linter;

  beforeAll(async () => {
    linter = await linterForRule(RULE);
  });

  test.each([
    ["complete", { resultType: "complete", ttlMs: 0, cacheScope: "private" }],
    ["input_required", { resultType: "input_required", ttlMs: 1000, cacheScope: "public" }],
    ["an unknown resultType", { resultType: "partial", ttlMs: -1, cacheScope: "shared" }],
    ["no cache fields", {}],
  ])("the result fields (%s) do not change the check", async (_, fields) => {
    const results = await linter.run({ ...fields, tools: [{ name: "get_contact" }, { name: "getContact" }] });
    expect(findings(results)).toEqual([["tools.1.name", badName("getContact")]]);
  });

  test("an x-mcp-header value is not a tool name", async () => {
    const shaped = tool("2026-07-28", "get_contact", "Returns a contact.", { contact_id: { type: "string", "x-mcp-header": "X-Contact-Id" } });
    expect(findings(await linter.run(result("2026-07-28", [shaped])))).toEqual([]);
  });

  test.each([
    ["an array root", { type: "array", items: { type: "string" } }],
    ["a string root", { type: "string" }],
    ["a boolean schema", true],
    ["a composed root", { oneOf: [{ type: "object" }, { type: "null" }] }],
  ])("an outputSchema with %s does not change the check", async (_, outputSchema) => {
    const results = await linter.run({ tools: [{ name: "list_pipelines", outputSchema }, { name: "ListPipelines", outputSchema }] });
    expect(findings(results)).toEqual([["tools.1.name", badName("ListPipelines")]]);
  });

  test("a tool without execution, as in this revision, is checked on its name", async () => {
    const shaped = tool("2026-07-28", "exportCrmObjects", "Exports.", {});
    expect(shaped.execution).toBeUndefined();
    expect(findings(await linter.run(result("2026-07-28", [shaped])))).toEqual([["tools.0.name", badName("exportCrmObjects")]]);
  });
});
