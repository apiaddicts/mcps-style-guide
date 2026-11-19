const { linterForRule } = require("../../helpers/utils");
const { RULE, badName, missingName, notAString, findings, describeRevision } = require("../../helpers/rules/mcr001-tool-naming-convention");
const failExample = require("./MCR001/fail-example");
const okExample = require("./MCR001/ok-example");
const failStructural = require("./MCR001/fail-structural-edges");
const okStructural = require("./MCR001/ok-structural-edges");
const failLarge = require("./MCR001/fail-large-generated");

describeRevision("2024-11-05", {
  failExample,
  failExpected: [
    ["tools.10.name", badName("issues.watch")],
    ["tools.11.name", badName("link__issues")],
    ["tools.12.name", badName("log_work_")],
    ["tools.13", missingName()],
    ["tools.14.name", notAString()],
    ["tools.15.name", notAString()],
    ["tools.16.name", notAString()],
    ["tools.19.name", badName("get_user ")],
    ["tools.2.name", badName("createIssue")],
    ["tools.4.name", badName("transition-issue")],
    ["tools.5.name", badName("AssignIssue")],
    ["tools.7.name", badName("LIST_PROJECTS")],
  ],
  okExample,
  failStructural,
  okStructural,
  failLarge,
});

describe("MCR001 (MCP 2024-11-05): tools with only name, description and inputSchema", () => {
  let linter;

  beforeAll(async () => {
    linter = await linterForRule(RULE);
  });

  test("a tool with only a name is checked like any other", async () => {
    const results = await linter.run({ tools: [{ name: "ping" }, { name: "Ping" }] });
    expect(findings(results)).toEqual([["tools.1.name", badName("Ping")]]);
  });

  test("a tool without arguments is checked on its name only", async () => {
    const results = await linter.run({
      tools: [
        { name: "list_projects", inputSchema: { type: "object" } },
        { name: "list_boards", inputSchema: { type: "object", properties: {} } },
        { name: "listSprints", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
      ],
    });
    expect(findings(results)).toEqual([["tools.2.name", badName("listSprints")]]);
  });
});
