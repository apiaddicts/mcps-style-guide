const { linterForRule } = require("../../helpers/utils");
const { RULE, badName, findings, tool, result, describeRevision } = require("../../helpers/rules/mcr001-tool-naming-convention");
const failExample = require("./MCR001/fail-example");
const okExample = require("./MCR001/ok-example");
const failStructural = require("./MCR001/fail-structural-edges");
const okStructural = require("./MCR001/ok-structural-edges");
const failLarge = require("./MCR001/fail-large-generated");

describeRevision("2025-11-25", {
  failExample,
  failExpected: [
    ["tools.13.name", badName("UPDATE_SUBSCRIPTION")],
    ["tools.15.name", badName("payouts.create")],
    ["tools.19.name", badName("create_payment_link ")],
    ["tools.20.name", badName("create_checkout_session_\u{1F6D2}")],
    ["tools.3.name", badName("confirmPaymentIntent")],
    ["tools.4.name", badName("capture-payment-intent")],
    ["tools.7.name", badName("CreateInvoice")],
  ],
  okExample,
  failStructural,
  okStructural,
  failLarge,
});

describe("MCR001 (MCP 2025-11-25): tool name guidance, icons, execution and $schema", () => {
  let linter;

  beforeAll(async () => {
    linter = await linterForRule(RULE);
  });

  test("the spec's example names are only accepted when they follow the configured convention", async () => {
    const results = await linter.run({ tools: ["getUser", "DATA_EXPORT_v2", "admin.tools.list"].map((name) => ({ name, inputSchema: { type: "object" } })) });
    expect(findings(results)).toEqual([
      ["tools.0.name", badName("getUser")],
      ["tools.1.name", badName("DATA_EXPORT_v2")],
      ["tools.2.name", badName("admin.tools.list")],
    ]);
  });

  test("a 128+ character snake_case name passes: length is not part of the convention", async () => {
    const name = Array.from({ length: 30 }, (_, i) => `segment${i}`).join("_");
    expect(name.length).toBeGreaterThan(128);
    expect(findings(await linter.run({ tools: [{ name, inputSchema: { type: "object" } }] }))).toEqual([]);
  });

  test("names are case-sensitive: create_issue passes and Create_issue does not", async () => {
    const results = await linter.run({ tools: [{ name: "create_issue" }, { name: "Create_issue" }] });
    expect(findings(results)).toEqual([["tools.1.name", badName("Create_issue")]]);
  });

  test.each([
    ["draft 2020-12", "https://json-schema.org/draft/2020-12/schema"],
    ["draft-07", "http://json-schema.org/draft-07/schema#"],
    ["an unknown dialect", "https://example.com/my-dialect"],
    ["a non-string", 2020],
  ])("the inputSchema and outputSchema $schema (%s) does not change the check", async (_, $schema) => {
    const results = await linter.run({
      tools: [
        { name: "list_charges", inputSchema: { $schema, type: "object" }, outputSchema: { $schema, type: "object" } },
        { name: "listCharges", inputSchema: { $schema, type: "object" } },
      ],
    });
    expect(findings(results)).toEqual([["tools.1.name", badName("listCharges")]]);
  });

  test.each(["forbidden", "optional", "required", "unknown", null])("execution.taskSupport %s does not change the check", async (taskSupport) => {
    const shaped = tool("2025-11-25", "createRefund", "Refunds.", {});
    shaped.execution = { taskSupport };
    expect(findings(await linter.run(result("2025-11-25", [shaped])))).toEqual([["tools.0.name", badName("createRefund")]]);
  });

  test("icons whose src or title break the convention are not tool names", async () => {
    const shaped = tool("2025-11-25", "create_refund", "Refunds.", {});
    shaped.icons = [{ src: "https://cdn.example.com/Create-Refund.png", mimeType: "image/png", sizes: ["48x48"] }];
    expect(findings(await linter.run(result("2025-11-25", [shaped])))).toEqual([]);
  });
});
