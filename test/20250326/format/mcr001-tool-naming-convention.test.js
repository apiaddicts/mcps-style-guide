const { linterForRule } = require("../../helpers/utils");
const { RULE, badName, missingName, findings, tool, result, describeRevision } = require("../../helpers/rules/mcr001-tool-naming-convention");
const failExample = require("./MCR001/fail-example");
const okExample = require("./MCR001/ok-example");
const failStructural = require("./MCR001/fail-structural-edges");
const okStructural = require("./MCR001/ok-structural-edges");
const failLarge = require("./MCR001/fail-large-generated");

describeRevision("2025-03-26", {
  failExample,
  failExpected: [
    ["tools.10.name", badName("listPullRequestReviews")],
    ["tools.13.name", badName("search.issues")],
    ["tools.15.name", badName("Fork_Repository_Async")],
    ["tools.17.name", badName("rerun-failed-jobs")],
    ["tools.18", missingName()],
    ["tools.3.name", badName("createOrUpdateFile")],
    ["tools.4.name", badName("push-files")],
    ["tools.7.name", badName("CreatePullRequest")],
  ],
  okExample,
  failStructural,
  okStructural,
  failLarge,
});

describe("MCR001 (MCP 2025-03-26): annotations", () => {
  let linter;

  beforeAll(async () => {
    linter = await linterForRule(RULE);
  });

  test("annotations.title is a display label, never the tool name: a tool with only annotations.title has no name", async () => {
    const results = await linter.run({ tools: [{ annotations: { title: "create_issue" }, inputSchema: { type: "object" } }] });
    expect(findings(results)).toEqual([["tools.0", missingName()]]);
  });

  test("an annotations.title that breaks the convention is not reported", async () => {
    const named = tool("2025-03-26", "create_issue", "Creates an issue.", {});
    named.annotations.title = "Create-Issue NOW";
    expect(findings(await linter.run(result("2025-03-26", [named])))).toEqual([]);
  });

  test.each([
    ["read-only", { readOnlyHint: true }],
    ["destructive", { destructiveHint: true, readOnlyHint: false }],
    ["idempotent", { idempotentHint: true }],
    ["open-world", { openWorldHint: true }],
    ["unknown", { "x-custom": "createIssue" }],
  ])("the %s hint does not change the check", async (_, hints) => {
    const results = await linter.run({ tools: [{ name: "deleteIssue", annotations: hints, inputSchema: { type: "object" } }] });
    expect(findings(results)).toEqual([["tools.0.name", badName("deleteIssue")]]);
  });
});
