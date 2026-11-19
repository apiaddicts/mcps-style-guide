# mcps-style-guide

A [Spectral](https://github.com/stoplightio/spectral) ruleset that checks MCP (Model Context Protocol) tool definitions against best practices.

It lints documents shaped like an MCP `tools/list` result:

```json
{
  "tools": [
    {
      "name": "create_api",
      "title": "Create API",
      "description": "Creates a new API from an embedded OpenAPI definition.",
      "inputSchema": { "type": "object", "properties": { "...": {} } },
      "outputSchema": { "type": "object", "properties": { "...": {} } }
    }
  ]
}
```

## Requirements

- Node.js 18 or later
- Spectral CLI 6.x

```sh
npm install -g @stoplight/spectral-cli
```

## Usage

Lint a file:

```sh
spectral lint -r mcp-ruleset.yaml path/to/mcp-tools.json
```

Try the bundled examples:

```sh
spectral lint -r mcp-ruleset.yaml examples/valid.json    # no problems
spectral lint -r mcp-ruleset.yaml examples/invalid.json  # triggers every rule
```

By default Spectral lists everything but only exits non-zero on errors. Useful flags:

| Flag | Effect |
|------|--------|
| `-F warn` | Also fail on warnings |
| `-D` | Only show results at or above the fail severity |
| `-f json` / `-f junit` / `-f sarif` | Machine-readable output for CI |

### Using the ruleset from another project

Reference it from a `.spectral.yaml` in your project:

```yaml
extends:
  - https://raw.githubusercontent.com/apiaddicts/mcps-style-guide/main/mcp-ruleset.yaml
```

Or point at a local copy (`extends: ./path/to/mcp-ruleset.yaml`). The `functions/` directory has to stay next to the ruleset.

### CI example (GitHub Actions)

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm install -g @stoplight/spectral-cli
- run: spectral lint -r mcp-ruleset.yaml mcp-tools.json -F warn
```

## Rules

See [docs/rules.md](docs/rules.md) for the full reference: why each rule exists, passing and failing examples, and the Spectral output it produces.

Each rule has a code (`MCR001`...) and its Spectral id is `mcp:<code>`. Every message starts with the code.

| Code | Rule id | Severity | What it checks |
|------|---------|----------|----------------|
| [MCR001](docs/resources/MCR001.md) | `mcp:MCR001` | error | Every tool has a `name` that follows the configured `naming-convention`: `snake_case` (default), `camelCase`, `kebab-case` or `UpperCamelCase` |
| MCR002 | `mcp:MCR002` | warn | `title` is a non-null, non-empty string |
| MCR003 | `mcp:MCR003` | error | `description` is present and not empty |
| MCR004 | `mcp:MCR004` | error | A tool object has no duplicate keys (e.g. two `_meta`) |
| MCR005 | `mcp:MCR005` | error | `inputSchema` exists and its `type` is `object` |
| MCR006 | `mcp:MCR006` | info | Every property in `inputSchema.properties` has a `description` |
| MCR007 | `mcp:MCR007` | error | Any `openapi` field inside the input properties starts with `3.` |
| MCR008 | `mcp:MCR008` | error | In embedded OpenAPI `schemas`, every `required` name exists in `properties` |
| MCR009 | `mcp:MCR009` | warn | `outputSchema` is present and not `null` |

### Examples

**MCR001 · `mcp:MCR001`**

```jsonc
{ "name": "createApi" }   // ✗ with the default snake_case
{ "name": "Create_API" }  // ✗
{ "name": "create_api" }  // ✓
```

The convention is the rule's `naming-convention` option: with `camelCase`, `createApi` passes and `create_api` fails. See [docs/resources/MCR001.md](docs/resources/MCR001.md).

**MCR002 · `mcp:MCR002`**

```jsonc
{ "title": null }          // ✗
{ "title": "Create API" }  // ✓
```

**MCR003 · `mcp:MCR003`**

```jsonc
{ "description": "" }                              // ✗
{ "description": "Creates a new API from ..." }    // ✓
```

**MCR004 · `mcp:MCR004`**

```jsonc
{ "_meta": { "version": 1 }, "_meta": { "version": 2 } }  // ✗
{ "_meta": { "version": 2 } }                             // ✓
```

**MCR005 · `mcp:MCR005`**

```jsonc
{ "inputSchema": { "type": "string" } }                     // ✗
{ "inputSchema": { "type": "object", "properties": {} } }   // ✓
```

**MCR006 · `mcp:MCR006`**

```jsonc
"properties": { "name": { "type": "string" } }                                   // ✗
"properties": { "name": { "type": "string", "description": "API name." } }       // ✓
```

**MCR007 · `mcp:MCR007`**

```jsonc
"default": { "openapi": "2.0" }    // ✗
"default": { "openapi": "3.0.3" }  // ✓
```

An input property that is itself named `openapi` (a schema object, not a version string) doesn't trigger this rule.

**MCR008 · `mcp:MCR008`**

```jsonc
"schemas": {
  "Pet": {
    "required": ["id", "name"],
    "properties": { "id": { "type": "integer" } }   // ✗ "name" missing
  }
}
```

**MCR009 · `mcp:MCR009`**

```jsonc
{ "outputSchema": null }                  // ✗
{ "outputSchema": { "type": "object" } }  // ✓
```

## Notes

- Spectral reports duplicate keys on its own as a `parser` error. `mcp:MCR004` adds a named error for duplicates at the top level of a tool object. When a file has duplicates you will see both.
- To turn off or change the severity of a rule, override it in your own `.spectral.yaml`:

  ```yaml
  extends: [./mcp-ruleset.yaml]
  rules:
    mcp:MCR006: off
    mcp:MCR009: error
  ```

## Project structure

```
mcp-ruleset.yaml                         Spectral ruleset
functions/
  mcp-tool-naming-convention.js          MCR001: tool names vs the configured naming convention
  mcp-no-duplicate-keys.js               MCR004: duplicate keys, read from parser diagnostics
  mcp-required-matches-properties.js     MCR008: `required` names vs `properties`
docs/
  rules.md                               reference of every rule
  resources/MCRNNN.md                    full reference of a rule (MCR001)
examples/
  valid.json                             passes every rule
  invalid.json                           breaks every rule
test/
  <revision>/<category>/mcrNNN-*.test.js unit tests per MCP revision (20241105, 20250326, 20250618, 20251125, 20260728)
  <revision>/<category>/MCRNNN/          their fixtures
  helpers/                               ruleset loader and shared fixtures
```

## Contributing

1. Add or change the rule in `mcp-ruleset.yaml` with its `mcp:MCRNNN` id and an `MCRNNN: ` message prefix (custom logic goes in `functions/`, in a file named `mcp-<name>.js`).
2. Update `examples/valid.json` and `examples/invalid.json` so the rule has a passing and a failing case.
3. Add or update its tests in `test/<revision>/<category>/` and run them with `npm test` (`npm install` first).
4. Run both examples and check the output.
5. Document the rule in `docs/resources/MCRNNN.md` and add it to the tables in this README and `docs/rules.md`.

## License

[Apache License 2.0](LICENSE)
