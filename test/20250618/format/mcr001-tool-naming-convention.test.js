const { linterForRule } = require("../../helpers/utils");
const { RULE, badName, missingName, findings, tool, result, describeRevision } = require("../../helpers/rules/mcr001-tool-naming-convention");
const failExample = require("./MCR001/fail-example");
const okExample = require("./MCR001/ok-example");
const failStructural = require("./MCR001/fail-structural-edges");
const okStructural = require("./MCR001/ok-structural-edges");
const failLarge = require("./MCR001/fail-large-generated");

describeRevision("2025-06-18", {
  failExample,
  failExpected: [
    ["tools.13.name", badName("db.query")],
    ["tools.18.name", badName("vacuum_table__full")],
    ["tools.19", missingName()],
    ["tools.2.name", badName("readMultipleFiles")],
    ["tools.20.name", badName("list-backups")],
    ["tools.4.name", badName("edit-file")],
    ["tools.7.name", badName("ListDirectoryWithSizes")],
  ],
  okExample,
  failStructural,
  okStructural,
  failLarge,
});

describe("MCR001 (MCP 2025-06-18): title, outputSchema and _meta", () => {
  let linter;

  beforeAll(async () => {
    linter = await linterForRule(RULE);
  });

  test("title is a display name: it never replaces a missing name and is never checked", async () => {
    const results = await linter.run({
      tools: [
        { title: "list_files", inputSchema: { type: "object" } },
        { name: "list_files", title: "List-Files NOW", inputSchema: { type: "object" } },
      ],
    });
    expect(findings(results)).toEqual([["tools.0", missingName()]]);
  });

  test("names inside outputSchema and _meta are not tool names", async () => {
    const shaped = tool("2025-06-18", "get_file_info", "Returns metadata.", {});
    shaped.outputSchema = { type: "object", properties: { name: { const: "Bad-Name" } }, required: ["name"] };
    shaped._meta = { name: "BadMetaName", "io.example/aliases": ["getFileInfo"] };
    expect(findings(await linter.run(result("2025-06-18", [shaped])))).toEqual([]);
  });

  test("a valid name is not affected by a null or malformed outputSchema", async () => {
    const results = await linter.run({
      tools: [
        { name: "get_file_info", inputSchema: { type: "object" }, outputSchema: null },
        { name: "getFileInfo", inputSchema: { type: "object" }, outputSchema: "object" },
      ],
    });
    expect(findings(results)).toEqual([["tools.1.name", badName("getFileInfo")]]);
  });
});
