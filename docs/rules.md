# MCP Ruleset Reference

This document explains every rule in [`mcp-ruleset.yaml`](../mcp-ruleset.yaml): what it checks, why it matters, and what passing and failing definitions look like.

## Contents

- [How the ruleset works](#how-the-ruleset-works)
- [Severity levels](#severity-levels)
- Rules
  - [tool-name-required-and-casing](#tool-name-required-and-casing)
  - [tool-title-not-null](#tool-title-not-null)
  - [tool-description-required](#tool-description-required)
  - [tool-no-duplicate-keys](#tool-no-duplicate-keys)
  - [tool-input-schema-structure](#tool-input-schema-structure)
  - [tool-property-description](#tool-property-description)
  - [openapi-embedded-version-check](#openapi-embedded-version-check)
  - [embedded-schema-required-matches-properties](#embedded-schema-required-matches-properties)
  - [tool-output-schema-defined](#tool-output-schema-defined)
- [A complete example](#a-complete-example)

## How the ruleset works

An MCP server advertises its tools through the `tools/list` method. The response is a JSON object with a `tools` array, and each entry describes one tool:

```json
{
  "tools": [
    {
      "name": "getWeather",
      "title": "Get weather",
      "description": "Returns the current weather for a city.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "city": { "type": "string", "description": "City name, e.g. \"Madrid\"." }
        },
        "required": ["city"]
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "temperature": { "type": "number" }
        }
      }
    }
  ]
}
```

The client (usually an LLM) never sees the tool's code. It chooses a tool and builds its arguments from this definition alone. A missing description or a loose input schema makes the model guess, and guesses turn into wrong calls. The rules below catch those gaps before the server ships.

Each rule targets part of the document with a JSONPath expression (`given`) and runs a check on it (`then`). Paths in Spectral's output point at the exact spot that failed, e.g. `tools[0].inputSchema.type`.

## Severity levels

| Severity | Meaning | Fails `spectral lint` by default |
|----------|---------|----------------------------------|
| `error` | The definition is broken or unusable by clients | Yes |
| `warn` | The definition works but is missing something clients rely on | No (use `-F warn`) |
| `info` | A recommendation that improves quality | No (use `-F info`) |

---

## tool-name-required-and-casing

| | |
|---|---|
| **Severity** | error |
| **Target** | `$.tools[*].name` |
| **Check** | `name` is present and matches `^[a-z][a-zA-Z0-9]*$` |

### Why

The name is the identifier clients use to call the tool. It must exist, and a single casing convention across tools makes them predictable to models and humans alike. camelCase also avoids characters (spaces, dots, dashes) that some clients reject in tool names.

### Fails

```json
{ "tools": [ { "name": "Create_API" } ] }
```

```json
{ "tools": [ { "name": "create-api" } ] }
```

```json
{ "tools": [ { "description": "No name at all" } ] }
```

### Passes

```json
{ "tools": [ { "name": "createApi" } ] }
```

### Output

```
4:15  error  tool-name-required-and-casing  Every tool must have a camelCase name. "Create_API" must match the pattern "^[a-z][a-zA-Z0-9]*$"  tools[0].name
33:5  error  tool-name-required-and-casing  Every tool must have a camelCase name. "[1].name" property must be truthy                          tools[1]
```

---

## tool-title-not-null

| | |
|---|---|
| **Severity** | warn |
| **Target** | `$.tools[*].title` |
| **Check** | `title` is a string with at least one character |

### Why

`title` is the human-readable label that client UIs show instead of the machine name. Leaving it out, or setting it to `null`, means users see `createApi` in menus and confirmation prompts.

### Fails

```json
{ "name": "createApi", "title": null }
```

```json
{ "name": "createApi", "title": "" }
```

```json
{ "name": "createApi" }
```

### Passes

```json
{ "name": "createApi", "title": "Create API" }
```

### Output

```
5:16  warning  tool-title-not-null  Tool title should be a valid non-null string. "title" property type must be string  tools[0].title
33:5  warning  tool-title-not-null  Tool title should be a valid non-null string. "[1].title" property must exist      tools[1]
```

---

## tool-description-required

| | |
|---|---|
| **Severity** | error |
| **Target** | `$.tools[*].description` |
| **Check** | `description` is present and not empty |

### Why

The description is what the model reads to decide *whether* to call a tool. Without it, the model has only the name to go on. A good description says what the tool does, when to use it, and anything it will not do.

### Fails

```json
{ "name": "createApi", "description": "" }
```

```json
{ "name": "createApi" }
```

### Passes

```json
{
  "name": "createApi",
  "description": "Creates a new API in the catalog from an OpenAPI 3.x definition. Returns the new API's id."
}
```

### Output

```
6:22  error  tool-description-required  Tools must have a clear description. "description" property must be truthy  tools[0].description
```

---

## tool-no-duplicate-keys

| | |
|---|---|
| **Severity** | error |
| **Target** | `$.tools[*]` |
| **Check** | No key appears twice at the top level of a tool object |
| **Function** | [`functions/noDuplicateKeys.js`](../functions/noDuplicateKeys.js) |

### Why

JSON parsers keep only the last value of a repeated key and silently drop the rest. A tool with two `_meta` blocks looks fine to whoever wrote it, but clients will only ever see the second one. This usually comes from a bad merge or hand-edited definitions.

### Fails

```json
{
  "name": "createApi",
  "_meta": { "version": 1 },
  "_meta": { "version": 2 }
}
```

### Passes

```json
{
  "name": "createApi",
  "_meta": { "version": 2 }
}
```

### Output

```
8:7   error  parser                  Duplicate key: _meta                         tools[0]._meta
8:15  error  tool-no-duplicate-keys  Tool object contains duplicate key "_meta".  tools[0]._meta
```

Spectral's own parser also reports duplicate keys, so you see two lines for the same problem. The `parser` line covers duplicates anywhere in the file; the `tool-no-duplicate-keys` line is scoped to tool objects and can be turned off or re-leveled like any other rule.

---

## tool-input-schema-structure

| | |
|---|---|
| **Severity** | error |
| **Target** | `$.tools[*].inputSchema` |
| **Check** | `inputSchema` exists and `inputSchema.type` is `object` |

### Why

MCP passes tool arguments as a named JSON object. The input schema must describe that object, so its root type has to be `object`. A root of `string` or `array`, or no `type` at all, gives the model no valid shape to fill in.

### Fails

```json
{ "inputSchema": { "type": "string" } }
```

```json
{ "inputSchema": {} }
```

```json
{ "name": "createApi" }
```

### Passes

```json
{
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Name of the API." }
    },
    "required": ["name"]
  }
}
```

A tool that takes no arguments still needs an object schema:

```json
{ "inputSchema": { "type": "object", "properties": {} } }
```

### Output

```
10:17  error  tool-input-schema-structure  Input schemas must be defined as an object type. "string" must match the pattern "^object$"              tools[0].inputSchema.type
34:21  error  tool-input-schema-structure  Input schemas must be defined as an object type. "inputSchema.type" property must be truthy          tools[1].inputSchema
```

---

## tool-property-description

| | |
|---|---|
| **Severity** | info |
| **Target** | `$.tools[*].inputSchema.properties[*]` |
| **Check** | Every input property has a `description` |

### Why

Property names are often short or ambiguous (`id`, `q`, `mode`). A description tells the model what value to supply: its meaning, format, units, or allowed values. It's `info` rather than `error` because some properties really are self-explanatory, but most benefit from one.

### Fails

```json
"properties": {
  "definition": { "type": "object" }
}
```

### Passes

```json
"properties": {
  "definition": {
    "type": "object",
    "description": "Full OpenAPI 3.x document for the API, as a JSON object."
  }
}
```

### Output

```
12:24  information  tool-property-description  Every input property should have a description detailing its usage. "definition.description" property must be defined  tools[0].inputSchema.properties.definition
```

---

## openapi-embedded-version-check

| | |
|---|---|
| **Severity** | error |
| **Target** | `$.tools[*].inputSchema.properties..openapi` (any depth) |
| **Check** | The `openapi` value starts with `3.` |

### Why

Some tools accept an OpenAPI document as input and include one in the schema, typically as a `default` or an example. If that embedded document claims Swagger 2.0 or an unknown version, the model will copy it and produce input the tool can't handle.

### Fails

```json
"properties": {
  "definition": {
    "type": "object",
    "default": {
      "openapi": "2.0",
      "info": { "title": "Pets", "version": "1.0.0" }
    }
  }
}
```

### Passes

```json
"properties": {
  "definition": {
    "type": "object",
    "default": {
      "openapi": "3.0.3",
      "info": { "title": "Pets", "version": "1.0.0" }
    }
  }
}
```

Also passes: an input property that is itself *named* `openapi`. Its value is a schema object, not a version string, so the rule leaves it alone.

```json
"properties": {
  "openapi": { "type": "string", "description": "OpenAPI version to target." }
}
```

### Output

```
15:26  error  openapi-embedded-version-check  Embedded OpenAPI definitions must specify a valid OpenAPI 3.x version. "2.0" must match the pattern "^3\\."  tools[0].inputSchema.properties.definition.default.openapi
```

---

## embedded-schema-required-matches-properties

| | |
|---|---|
| **Severity** | error |
| **Target** | `$.tools[*].inputSchema.properties..schemas[*]` |
| **Check** | Every name in a schema's `required` array exists in its `properties` |
| **Function** | [`functions/requiredMatchesProperties.js`](../functions/requiredMatchesProperties.js) |

### Why

In an embedded OpenAPI document (under `components.schemas`), a `required` field that isn't defined in `properties` is a contradiction: the value is mandatory, but nothing says what it looks like. This usually means a property was renamed or removed and `required` wasn't updated.

### Fails

```json
"components": {
  "schemas": {
    "Pet": {
      "type": "object",
      "required": ["id", "name"],
      "properties": {
        "id": { "type": "integer" }
      }
    }
  }
}
```

### Passes

```json
"components": {
  "schemas": {
    "Pet": {
      "type": "object",
      "required": ["id", "name"],
      "properties": {
        "id": { "type": "integer" },
        "name": { "type": "string" }
      }
    }
  }
}
```

### Output

Each missing name is reported at its position in the `required` array:

```
20:40  error  embedded-schema-required-matches-properties  Required field "name" is not defined in properties.  tools[0].inputSchema.properties.definition.default.components.schemas.Pet.required[1]
```

---

## tool-output-schema-defined

| | |
|---|---|
| **Severity** | warn |
| **Target** | `$.tools[*].outputSchema` |
| **Check** | `outputSchema` is present and not `null` |

### Why

An output schema tells clients what shape the tool's structured result will have, so they can validate it and the model can use it reliably in the next step. Without one, clients have to treat the result as opaque text.

### Fails

```json
{ "name": "createApi", "outputSchema": null }
```

```json
{ "name": "createApi" }
```

### Passes

```json
{
  "name": "createApi",
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "description": "Id of the created API." }
    },
    "required": ["id"]
  }
}
```

### Output

```
31:23  warning  tool-output-schema-defined  outputSchema should be provided or mapped rather than left null. "outputSchema" property must be truthy      tools[0].outputSchema
33:5   warning  tool-output-schema-defined  outputSchema should be provided or mapped rather than left null. "[1].outputSchema" property must be truthy  tools[1]
```

---

## A complete example

This definition passes every rule. It's the same as [`examples/valid.json`](../examples/valid.json).

```json
{
  "tools": [
    {
      "name": "createApi",
      "title": "Create API",
      "description": "Creates a new API from an embedded OpenAPI definition.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Name of the API to create."
          },
          "definition": {
            "type": "object",
            "description": "OpenAPI definition of the API.",
            "default": {
              "openapi": "3.0.3",
              "info": { "title": "Pets", "version": "1.0.0" },
              "paths": {},
              "components": {
                "schemas": {
                  "Pet": {
                    "type": "object",
                    "required": ["id", "name"],
                    "properties": {
                      "id": { "type": "integer" },
                      "name": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        },
        "required": ["name", "definition"]
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "id": { "type": "string" }
        }
      }
    }
  ]
}
```

```sh
$ spectral lint -r mcp-ruleset.yaml examples/valid.json -F hint
No results with a severity of 'hint' or higher found!
```

[`examples/invalid.json`](../examples/invalid.json) breaks every rule at once. Run it to see all the output above in one report:

```sh
spectral lint -r mcp-ruleset.yaml examples/invalid.json
```
