# mcps-style-guide

A [Spectral](https://github.com/stoplightio/spectral) ruleset that checks MCP (Model Context Protocol) tool definitions against best practices.

It lints documents shaped like an MCP `tools/list` result:

```json
{
  "tools": [
    {
      "name": "createApi",
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

| Rule | Severity | What it checks |
|------|----------|----------------|
| `tool-name-required-and-casing` | error | Every tool has a `name` in camelCase (`^[a-z][a-zA-Z0-9]*$`) |
| `tool-title-not-null` | warn | `title` is a non-null, non-empty string |
| `tool-description-required` | error | `description` is present and not empty |
| `tool-no-duplicate-keys` | error | A tool object has no duplicate keys (e.g. two `_meta`) |
| `tool-input-schema-structure` | error | `inputSchema` exists and its `type` is `object` |
| `tool-property-description` | info | Every property in `inputSchema.properties` has a `description` |
| `openapi-embedded-version-check` | error | Any `openapi` field inside the input properties starts with `3.` |
| `embedded-schema-required-matches-properties` | error | In embedded OpenAPI `schemas`, every `required` name exists in `properties` |
| `tool-output-schema-defined` | warn | `outputSchema` is present and not `null` |

### Examples

**`tool-name-required-and-casing`**

```jsonc
{ "name": "Create_API" }  // ✗
{ "name": "createApi" }   // ✓
```

**`tool-title-not-null`**

```jsonc
{ "title": null }          // ✗
{ "title": "Create API" }  // ✓
```

**`tool-description-required`**

```jsonc
{ "description": "" }                              // ✗
{ "description": "Creates a new API from ..." }    // ✓
```

**`tool-no-duplicate-keys`**

```jsonc
{ "_meta": { "version": 1 }, "_meta": { "version": 2 } }  // ✗
{ "_meta": { "version": 2 } }                             // ✓
```

**`tool-input-schema-structure`**

```jsonc
{ "inputSchema": { "type": "string" } }                     // ✗
{ "inputSchema": { "type": "object", "properties": {} } }   // ✓
```

**`tool-property-description`**

```jsonc
"properties": { "name": { "type": "string" } }                                   // ✗
"properties": { "name": { "type": "string", "description": "API name." } }       // ✓
```

**`openapi-embedded-version-check`**

```jsonc
"default": { "openapi": "2.0" }    // ✗
"default": { "openapi": "3.0.3" }  // ✓
```

An input property that is itself named `openapi` (a schema object, not a version string) doesn't trigger this rule.

**`embedded-schema-required-matches-properties`**

```jsonc
"schemas": {
  "Pet": {
    "required": ["id", "name"],
    "properties": { "id": { "type": "integer" } }   // ✗ "name" missing
  }
}
```

**`tool-output-schema-defined`**

```jsonc
{ "outputSchema": null }                  // ✗
{ "outputSchema": { "type": "object" } }  // ✓
```

## Notes

- Spectral reports duplicate keys on its own as a `parser` error. `tool-no-duplicate-keys` adds a named error for duplicates at the top level of a tool object. When a file has duplicates you will see both.
- To turn off or change the severity of a rule, override it in your own `.spectral.yaml`:

  ```yaml
  extends: [./mcp-ruleset.yaml]
  rules:
    tool-property-description: off
    tool-output-schema-defined: error
  ```

## Project structure

```
mcp-ruleset.yaml                     Spectral ruleset
functions/
  noDuplicateKeys.js                 duplicate keys, read from parser diagnostics
  requiredMatchesProperties.js       `required` names vs `properties`
examples/
  valid.json                         passes every rule
  invalid.json                       breaks every rule
```

## Contributing

1. Add or change the rule in `mcp-ruleset.yaml` (custom logic goes in `functions/`).
2. Update `examples/valid.json` and `examples/invalid.json` so the rule has a passing and a failing case.
3. Run both examples and check the output.
4. Add the rule to the tables in this README.

## License

[Apache License 2.0](LICENSE)
