const { linterForRule, jsonDocument, yamlDocument } = require("../utils");

const RULE = "mcp:MCR001";
const OPTION = "naming-convention";
const REVISIONS = ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25", "2026-07-28"];
const SCHEMA_2020_12 = "https://json-schema.org/draft/2020-12/schema";

const LABELS = {
  snake: "snake_case",
  camel: "camelCase",
  kebab: "kebab-case",
  uppercamel: "UpperCamelCase",
};
const CONVENTIONS = Object.keys(LABELS);

const S = "snake";
const C = "camel";
const K = "kebab";
const U = "uppercamel";

const NAMES = [
  ["search", [S, C, K]],
  ["a", [S, C, K]],
  ["x1", [S, C, K]],
  ["verify2fa", [S, C, K]],
  ["create_issue", [S]],
  ["list_pull_requests", [S]],
  ["get_file_contents_v2", [S]],
  ["run_sql_2", [S]],
  ["verify_2fa", [S]],
  ["s3_upload", [S]],
  ["github_create_issue", [S]],
  ["create_repository", [S]],
  ["merge_pull_request", [S]],
  ["v2_list_charges", [S]],
  ["createIssue", [C]],
  ["runSql", [C]],
  ["createCustomer", [C]],
  ["listPullRequests", [C]],
  ["getFileContentsV2", [C]],
  ["verify2FA", [C]],
  ["getHTTPStatus", [C]],
  ["fetchURL", [C]],
  ["s3Upload", [C]],
  ["getUser", [C]],
  ["gETUSER", [C]],
  ["create-issue", [K]],
  ["run-sql", [K]],
  ["transition-issue", [K]],
  ["create-payment-intent", [K]],
  ["list-pull-requests", [K]],
  ["get-file-contents-v2", [K]],
  ["verify-2fa", [K]],
  ["s3-upload", [K]],
  ["x-create", [K]],
  ["CreateIssue", [U]],
  ["RunSql", [U]],
  ["AssignIssue", [U]],
  ["CreatePaymentIntent", [U]],
  ["ListPullRequests", [U]],
  ["GetFileContentsV2", [U]],
  ["HTTPStatus", [U]],
  ["S3Upload", [U]],
  ["A", [U]],
  ["GETUSER", [U]],
  ["CREATE_ISSUE", []],
  ["Create_Issue", []],
  ["DATA_EXPORT_v2", []],
  ["create__issue", []],
  ["create_issue_", []],
  ["_create_issue", []],
  ["run_sql_", []],
  ["_run_sql", []],
  ["run.sql", []],
  ["issues.watch", []],
  ["create--issue", []],
  ["-create-issue", []],
  ["create-issue-", []],
  ["create_issue-v2", []],
  ["createIssue_v2", []],
  ["create.issue", []],
  ["admin.tools.list", []],
  ["github.create_issue", []],
  ["mcp__github__create_issue", []],
  ["create issue", []],
  [" create_issue", []],
  ["create_issue ", []],
  ["create_issue\n", []],
  ["2fa_verify", []],
  ["2faVerify", []],
  ["créer_ticket", []],
  ["create_issue_\u{1F680}", []],
  ["tool:create", []],
  ["create/issue", []],
  ["create$issue", []],
  ["create_iss​ue", []],
  [" ", []],
];

const LABELLED = new Map(NAMES);

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const byPathAndMessage = (a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]);

const badName = (name, convention = S) => `MCR001: Tool name '${name}' must be ${LABELS[convention]}.`;
const missingName = (convention = S) => `MCR001: Tool must have a ${LABELS[convention]} name.`;
const notAnObject = (convention = S) => `MCR001: Tool must be an object with a ${LABELS[convention]} name.`;
const notAString = (convention = S) => `MCR001: Tool name must be a non-empty ${LABELS[convention]} string.`;

const acceptedBy = (name) => {
  if (!LABELLED.has(name)) throw new Error(`Tool name ${JSON.stringify(name)} has no hand-written label in NAMES`);
  return LABELLED.get(name);
};

const findings = (results) =>
  results
    .filter((r) => r.code === RULE)
    .map((r) => [r.path.join("."), r.message])
    .sort(byPathAndMessage);

const expectedFor = (data, convention = S, label = acceptedBy) => {
  if (!isObject(data) || !Array.isArray(data.tools)) return [];
  const expected = [];
  data.tools.forEach((tool, index) => {
    const at = `tools.${index}`;
    if (!isObject(tool)) expected.push([at, notAnObject(convention)]);
    else if (!has(tool, "name") || tool.name === undefined) expected.push([at, missingName(convention)]);
    else if (typeof tool.name !== "string" || tool.name === "") expected.push([`${at}.name`, notAString(convention)]);
    else if (!label(tool.name).includes(convention)) expected.push([`${at}.name`, badName(tool.name, convention)]);
  });
  return expected.sort(byPathAndMessage);
};

const str = (description, extra = {}) => ({ type: "string", description, ...extra });
const int = (description, extra = {}) => ({ type: "integer", description, ...extra });
const bool = (description, extra = {}) => ({ type: "boolean", description, ...extra });

const atLeast = (revision, other) => REVISIONS.indexOf(revision) >= REVISIONS.indexOf(other);

const humanize = (name) =>
  String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const tool = (revision, name, description, properties = {}, required = [], extra = {}) => {
  const inputSchema = { type: "object", properties, ...(required.length ? { required } : {}) };
  const readOnly = /^(get|list|search|fetch|read|describe|query)/i.test(String(name));
  const shaped = { name, description, inputSchema };

  if (atLeast(revision, "2025-03-26")) {
    shaped.annotations = {
      title: humanize(name),
      readOnlyHint: readOnly,
      destructiveHint: /delete|remove|drop|purge|cancel|refund/i.test(String(name)),
      idempotentHint: readOnly,
      openWorldHint: false,
    };
  }
  if (atLeast(revision, "2025-06-18")) {
    shaped.title = humanize(name);
    shaped.outputSchema = {
      type: "object",
      properties: {
        id: str("Identifier of the affected resource."),
        name: str("Display name of the affected resource."),
        status: str("Status after the call.", { enum: ["ok", "pending", "failed"] }),
      },
      required: ["id"],
    };
    shaped._meta = { "io.modelcontextprotocol/ui": { visibility: "default" }, "com.example/owner": "platform-team" };
  }
  if (atLeast(revision, "2025-11-25")) {
    inputSchema.$schema = SCHEMA_2020_12;
    shaped.outputSchema.$schema = SCHEMA_2020_12;
    shaped.icons = [{ src: `https://cdn.example.com/icons/${encodeURIComponent(String(name))}.svg`, mimeType: "image/svg+xml", sizes: ["any"] }];
  }
  if (revision === "2025-11-25") {
    shaped.execution = { taskSupport: readOnly ? "forbidden" : "optional" };
  }
  if (revision === "2026-07-28") {
    shaped.icons[0].theme = "light";
  }
  return { ...shaped, ...extra };
};

const result = (revision, tools, extra = {}) => ({
  ...(revision === "2026-07-28" ? { resultType: "complete", ttlMs: 300000, cacheScope: "private" } : {}),
  tools,
  ...extra,
});

const nestedSchema = (depth, leafName = "name") => {
  let node = { type: "object", properties: { [leafName]: str("Name at the deepest level.", { default: "Deep_Value", examples: ["Bad-Name"] }) } };
  for (let level = depth; level > 0; level--) {
    const variant = level % 6;
    if (variant === 0) node = { type: "object", properties: { name: str(`Name at level ${level}.`), child: node } };
    else if (variant === 1) node = { type: "array", items: node, description: `List at level ${level}.` };
    else if (variant === 2) node = { allOf: [{ type: "object", properties: { name: { const: "Const_Name" } } }, node] };
    else if (variant === 3) node = { anyOf: [node, { type: "null" }] };
    else if (variant === 4) node = { oneOf: [node, { type: ["string", "null"], enum: ["CreateIssue", null] }] };
    else node = { type: "object", properties: { tools: { type: "array", default: [{ name: "BadNestedTool" }], items: node } } };
  }
  return node;
};

const STYLES = {
  snake: (words) => words.join("_"),
  camel: (words) => words[0] + words.slice(1).map((w) => w[0].toUpperCase() + w.slice(1)).join(""),
  kebab: (words) => words.join("-"),
  uppercamel: (words) => words.map((w) => w[0].toUpperCase() + w.slice(1)).join(""),
  screaming: (words) => words.join("_").toUpperCase(),
  dotted: (words) => words.join("."),
};
const STYLE_ACCEPTED_BY = { snake: [S], camel: [C], kebab: [K], uppercamel: [U], screaming: [], dotted: [] };

const VERBS = ["list", "get", "create", "update", "delete", "search", "export", "archive", "assign", "sync"];
const ENTITIES = [
  ["issues"], ["pull", "requests"], ["files"], ["tables"], ["charges"], ["customers"], ["invoices"], ["deals"],
  ["contacts"], ["pipelines"], ["webhooks"], ["audit", "logs"], ["releases"], ["branches"], ["refunds"],
];
const SERVERS = ["tracker", "repo", "fs", "db", "payments", "crm"];

const largeCatalog = (revision, count = 600, depth = 30) => {
  const tools = [];
  const labels = new Map();
  const styles = Object.keys(STYLES);
  for (let i = 0; i < count; i++) {
    const words = [SERVERS[i % SERVERS.length], VERBS[i % VERBS.length], ...ENTITIES[i % ENTITIES.length], `v${Math.floor(i / 60) + 1}`];
    const style = styles[i % 7 === 3 ? 0 : i % styles.length];
    const name = STYLES[style](words);
    labels.set(name, STYLE_ACCEPTED_BY[style]);
    const properties = {
      name: str("Name of the resource, not of the tool.", { default: "Not_A_Tool_Name" }),
      filter: i % 5 === 0 ? nestedSchema(depth) : str("Free text filter."),
      page_size: int("Page size.", { minimum: 1, maximum: 100, default: 25 }),
    };
    tools.push(tool(revision, name, `Generated tool ${i} of the ${words[0]} server.`, properties, ["name"]));
  }
  const document = result(revision, tools, { nextCursor: "eyJwYWdlIjoyfQ==" });
  const label = (name) => {
    if (!labels.has(name)) throw new Error(`Unexpected generated name ${name}`);
    return labels.get(name);
  };
  return { document, label, expected: (convention = S) => expectedFor(document, convention, label) };
};

const toYaml = (value, indent = "") => {
  if (Array.isArray(value)) {
    if (value.length === 0) return " []";
    return value
      .map((item) => {
        const rendered = toYaml(item, `${indent}  `);
        return `\n${indent}- ${rendered.startsWith("\n") ? rendered.trimStart() : rendered.trim()}`;
      })
      .join("");
  }
  if (isObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return " {}";
    return keys
      .map((key) => {
        const rendered = toYaml(value[key], `${indent}  `);
        return `\n${indent}${JSON.stringify(key)}:${rendered.startsWith("\n") ? rendered : ` ${rendered.trim()}`}`;
      })
      .join("");
  }
  return ` ${JSON.stringify(value)}`;
};
const yamlText = (value) => `${toYaml(value).trim()}\n`;

const reportedCase = (revision) =>
  result(revision, [
    tool(revision, "create_issue", "Creates an issue in a project.", { project: str("Project key.") }, ["project"]),
    tool(revision, "listPullRequests", "Lists the pull requests of a repository.", { repo: str("owner/name.") }, ["repo"]),
    tool(revision, "search-code", "Searches code across repositories.", { q: str("Query.") }, ["q"]),
  ]);

const withDistractors = (revision) => {
  const repository = tool(
    revision,
    "create_repository",
    "Creates a repository.",
    {
      name: str("Repository name, e.g. My-Repo.", { examples: ["My-Repo", "createIssue"] }),
      description: str("Repository description."),
      type: str("Visibility.", { enum: ["Public", "Private"] }),
      properties: { type: "object", description: "Custom properties.", additionalProperties: str("Value.") },
      tools: { type: "array", description: "Tools to enable.", default: [{ name: "BadTool" }, { name: "another-bad-tool" }], items: { $ref: "#/$defs/ToolRef" } },
      openapi: str("OpenAPI version to scaffold.", { const: "3.1.0" }),
      schemas: { type: "object", description: "Schemas map.", default: { Pet: { name: "Pet_Name" } } },
      owner: { type: ["object", "null"], description: "Owner.", properties: { name: { const: "Owner-Name" } } },
      flag: true,
      never: false,
    },
    ["name"]
  );
  repository.inputSchema.$defs = { ToolRef: { type: "object", properties: { name: str("Tool name to enable.", { pattern: "^[A-Z].*$", default: "EnableMe" }) } } };
  repository.inputSchema.definitions = { Legacy: { type: "object", properties: { name: { enum: ["Legacy-Name"] } } } };
  if (atLeast(revision, "2025-03-26")) repository.annotations.title = "Create-Repository";
  if (atLeast(revision, "2025-06-18")) {
    repository.title = "Create Repository";
    repository.outputSchema.properties.tools = { type: "array", items: { type: "object", properties: { name: str("Tool name.", { default: "OutputTool" }) } } };
    repository._meta = { name: "BadMetaName", "com.example/tool": { name: "Another-Bad-Name" } };
  }

  const composed = tool(revision, "merge_pull_request", "Merges a pull request.", {}, []);
  composed.inputSchema = {
    ...(atLeast(revision, "2025-11-25") ? { $schema: SCHEMA_2020_12 } : {}),
    type: "object",
    allOf: [{ properties: { name: str("Branch name.") } }, { $ref: "#/$defs/Merge" }],
    anyOf: [{ required: ["name"] }, { required: ["number"] }],
    oneOf: [{ properties: { method: { const: "Squash-Merge" } } }, { properties: { method: { const: "Rebase_Merge" } } }],
    $defs: { Merge: { properties: { name: { type: ["string", "null"], default: "Merge-Name" }, number: int("Pull request number.") } } },
  };

  return result(revision, [repository, composed], {
    nextCursor: "c2VhcmNoOm5hbWU=",
    _meta: { name: "Root-Meta-Name", tools: [{ name: "MetaTool" }] },
  });
};

const namesCatalog = (revision) =>
  result(
    revision,
    NAMES.map(([name], index) => tool(revision, name, `Labelled tool ${index}.`, { query: str("Query.") }, ["query"]))
  );

const structuralFail = (revision) => {
  const named = tool(revision, "list_projects", "Lists the projects.", { limit: int("Maximum projects.") });
  const nameless = { ...named };
  delete nameless.name;
  return result(revision, [
    named,
    null,
    "create_issue",
    7,
    true,
    [{ name: "create_issue" }],
    nameless,
    { ...named, name: null },
    { ...named, name: "" },
    { ...named, name: 42 },
    { ...named, name: false },
    { ...named, name: ["create_issue"] },
    { ...named, name: { text: "create_issue" } },
    { ...nameless, Name: "create_issue" },
    { ...nameless, title: "Create issue" },
    { $ref: "#/tools/0" },
    { ...named, name: { $ref: "#/tools/0/name" } },
    {},
  ]);
};

const STRUCTURAL_FAIL_EXPECTED = [
  ["tools.1", notAnObject()],
  ["tools.10.name", notAString()],
  ["tools.11.name", notAString()],
  ["tools.12.name", notAString()],
  ["tools.13", missingName()],
  ["tools.14", missingName()],
  ["tools.15", missingName()],
  ["tools.16.name", notAString()],
  ["tools.17", missingName()],
  ["tools.2", notAnObject()],
  ["tools.3", notAnObject()],
  ["tools.4", notAnObject()],
  ["tools.5", notAnObject()],
  ["tools.6", missingName()],
  ["tools.7.name", notAString()],
  ["tools.8.name", notAString()],
  ["tools.9.name", notAString()],
];

const structuralOk = (revision) => {
  const bad = tool(revision, "CreateIssue", "Bad name outside a tools array.", {});
  return [
    ["a document without tools", revision === "2026-07-28" ? { resultType: "complete", ttlMs: 0, cacheScope: "public" } : {}],
    ["a null tools", result(revision, null)],
    ["an empty tools array", result(revision, [])],
    ["a tools object keyed by name", result(revision, { CreateIssue: bad, "create-issue": bad })],
    ["a tools string", result(revision, "CreateIssue")],
    ["a tools number", result(revision, 3)],
    ["a root array of tools", [bad]],
    ["a root string", "CreateIssue"],
    ["a root null", null],
    ["the JSON-RPC envelope around the result", { jsonrpc: "2.0", id: 1, result: result(revision, [bad]) }],
    ["tools nested under another key", { servers: [{ id: "github", tools: [bad] }], result: { tools: [bad] } }],
    ["only a nextCursor", { nextCursor: "abc" }],
    ["tools with snake_case names and malformed schemas", result(revision, [
      { name: "get_status" },
      { name: "get_version", inputSchema: null, description: null },
      { name: "get_health", inputSchema: { type: "string" }, outputSchema: false, annotations: "none", _meta: [] },
    ])],
  ];
};

const refsDocument = (revision) => {
  const issue = tool(revision, "create_issue", "Creates an issue.", {
    fields: { $ref: "#/$defs/Fields" },
    legacy: { $ref: "#/definitions/Legacy" },
    reporter: { $ref: "#/tools/1/inputSchema/properties/assignee" },
    chained: { $ref: "#/x-shared/first" },
    missing: { $ref: "#/x-shared/does-not-exist" },
    external: { $ref: "https://schemas.example.com/issue.json#/Fields" },
  });
  issue.inputSchema.$defs = { Fields: { type: "object", properties: { name: str("Field name.") } } };
  issue.inputSchema.definitions = { Legacy: { type: "string" } };
  const assign = tool(revision, "assign_issue", "Assigns an issue.", { assignee: str("Account id.") }, ["assignee"]);
  return {
    ...result(revision, [
      issue,
      assign,
      { $ref: "#/tools/1" },
      { ...assign, name: { $ref: "#/x-names/list" } },
      { ...assign, name: "list_issues", inputSchema: { $ref: "#/tools/0/inputSchema" } },
      { ...assign, name: "listIssues", inputSchema: { $ref: "#/x-shared/does-not-exist" } },
    ]),
    "x-names": { list: "list_issues" },
    "x-shared": { first: { $ref: "#/x-shared/second" }, second: { type: "string" } },
  };
};

const REFS_EXPECTED = [
  ["tools.2", missingName()],
  ["tools.3.name", notAString()],
  ["tools.5.name", badName("listIssues")],
];

const timed = async (work) => {
  const started = Date.now();
  const value = await work();
  return { value, ms: Date.now() - started };
};

const describeRevision = (revision, fixtures) => {
  describe(`MCR001 (MCP ${revision}): every tool name must follow the configured naming convention`, () => {
    let linter;

    beforeAll(async () => {
      linter = await linterForRule(RULE);
    });

    test("reports the camelCase and kebab-case names of the reported issue and passes the snake_case one", async () => {
      expect(findings(await linter.run(reportedCase(revision)))).toEqual([
        ["tools.1.name", badName("listPullRequests")],
        ["tools.2.name", badName("search-code")],
      ]);
    });

    test("reports exactly the tools of the fail example whose name is not snake_case", async () => {
      expect(findings(await linter.run(fixtures.failExample))).toEqual(fixtures.failExpected);
    });

    test("passes the ok example", async () => {
      expect(findings(await linter.run(fixtures.okExample))).toEqual([]);
    });

    test("reports entries that are not objects, have no name, or a name that is not a non-empty string", async () => {
      expect(findings(await linter.run(fixtures.failStructural))).toEqual(STRUCTURAL_FAIL_EXPECTED);
    });

    test.each(fixtures.okStructural)("reports nothing for %s", async (_, doc) => {
      expect(findings(await linter.run(doc))).toEqual([]);
    });

    test("only checks tools[*].name: names in schemas, defaults, examples, enums, const, $defs, titles and _meta are ignored", async () => {
      expect(findings(await linter.run(withDistractors(revision)))).toEqual([]);
    });

    test.each(CONVENTIONS)("labels every hand-labelled name under %s", async (convention) => {
      const configured = await linterForRule(RULE, { functionOptions: { [OPTION]: LABELS[convention] } });
      const doc = namesCatalog(revision);
      const expected = expectedFor(doc, convention);
      expect(findings(await configured.run(doc))).toEqual(expected);
      expect(expected.length).toBe(NAMES.filter(([, accepted]) => !accepted.includes(convention)).length);
    });

    const oneOfEach = () =>
      result(revision, ["create_issue", "createIssue", "create-issue", "CreateIssue"].map((name) => tool(revision, name, "Creates an issue.", {})));
    const onlyAcceptedBy = (convention) =>
      ["create_issue", "createIssue", "create-issue", "CreateIssue"]
        .map((name, index) => [`tools.${index}.name`, name])
        .filter(([, name]) => !acceptedBy(name).includes(convention))
        .map(([at, name]) => [at, badName(name, convention)])
        .sort(byPathAndMessage);

    test.each([
      ["snake_case", S],
      ["SNAKE_CASE", S],
      [" snake ", S],
      ["snake case", S],
      ["Snake-Case", S],
      ["camelCase", C],
      ["camel", C],
      ["lowerCamelCase", C],
      ["CAMELCASE", C],
      ["kebab-case", K],
      ["kebab", K],
      ["Kebab_Case", K],
      ["UpperCamelCase", U],
      ["upper camel case", U],
      ["PascalCase", U],
      ["pascal", U],
    ])("reads the naming-convention value %j as %s", async (value, convention) => {
      const configured = await linterForRule(RULE, { functionOptions: { [OPTION]: value } });
      expect(findings(await configured.run(oneOfEach()))).toEqual(onlyAcceptedBy(convention));
    });

    test.each([[undefined], [null], [""], ["   "], ["case"], ["SCREAMING_SNAKE_CASE"], ["dot.case"], ["camel-case-strict"], [42], [true], [["camelCase"]], [{ value: "camelCase" }]])(
      "falls back to snake_case for the naming-convention value %j",
      async (value) => {
        const configured = await linterForRule(RULE, { functionOptions: { [OPTION]: value } });
        expect(findings(await configured.run(oneOfEach()))).toEqual(onlyAcceptedBy(S));
      }
    );

    test("falls back to snake_case when the rule has no functionOptions", async () => {
      const configured = await linterForRule(RULE, { functionOptions: null });
      expect(findings(await configured.run(oneOfEach()))).toEqual(onlyAcceptedBy(S));
    });

    test("JSON and YAML texts report the same findings as the parsed document", async () => {
      const json = findings(await linter.run(jsonDocument(fixtures.failExample)));
      const yaml = findings(await linter.run(yamlDocument(yamlText(fixtures.failExample))));
      expect(json).toEqual(fixtures.failExpected);
      expect(yaml).toEqual(fixtures.failExpected);
    });

    test.each([
      ["JSON", jsonDocument, (a, b) => `{\n  "tools": [\n    { "name": ${JSON.stringify(a)}, "name": ${JSON.stringify(b)}, "inputSchema": { "type": "object" } }\n  ]\n}\n`],
      ["YAML", yamlDocument, (a, b) => `tools:\n  - name: ${JSON.stringify(a)}\n    name: ${JSON.stringify(b)}\n    inputSchema:\n      type: object\n`],
    ])("%s: a duplicated name key is checked on its last value, as clients read it", async (_, toDocument, render) => {
      expect(findings(await linter.run(toDocument(render("createIssue", "create_issue"))))).toEqual([]);
      expect(findings(await linter.run(toDocument(render("create_issue", "createIssue"))))).toEqual([["tools.0.name", badName("createIssue")]]);
    });

    test("$ref is read as written: a tool or a name given by $ref is not a named tool, refs inside schemas do not matter", async () => {
      const results = await linter.run(jsonDocument(refsDocument(revision)));
      expect(findings(results)).toEqual(REFS_EXPECTED);
      expect(results.some((r) => r.code === "invalid-ref")).toBe(true);
    });

    test("reports every non snake_case name of a very large document with deep schemas", async () => {
      const { document, expected } = fixtures.failLarge;
      const { value, ms } = await timed(() => linter.run(document));
      expect(findings(value)).toEqual(expected());
      expect(expected().length).toBeGreaterThan(300);
      expect(ms).toBeLessThan(20000);
    });
  });
};


module.exports = {
  RULE,
  OPTION,
  REVISIONS,
  SCHEMA_2020_12,
  LABELS,
  CONVENTIONS,
  NAMES,
  badName,
  missingName,
  notAnObject,
  notAString,
  acceptedBy,
  findings,
  expectedFor,
  str,
  int,
  bool,
  tool,
  result,
  atLeast,
  nestedSchema,
  largeCatalog,
  yamlText,
  reportedCase,
  withDistractors,
  linterForRule,
  namesCatalog,
  structuralFail,
  structuralOk,
  refsDocument,
  STRUCTURAL_FAIL_EXPECTED,
  REFS_EXPECTED,
  describeRevision,
};
