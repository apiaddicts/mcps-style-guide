# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.0.0] - 2026-11-18

### Changed

- MCR001 - Tool name convention: Rule id `mcp:MCR001` (formerly `tool-name-required-and-casing`). The convention is configurable through the `naming-convention` option (default `snake_case`, previously camelCase only; also `camelCase`, `kebab-case` and `UpperCamelCase`) and the message names it.
- MCR002 - Tool title: Rule id `mcp:MCR002` (formerly `tool-title-not-null`).
- MCR003 - Tool description: Rule id `mcp:MCR003` (formerly `tool-description-required`).
- MCR004 - Duplicate keys: Rule id `mcp:MCR004` (formerly `tool-no-duplicate-keys`); function renamed to `mcp-no-duplicate-keys`.
- MCR005 - Input schema structure: Rule id `mcp:MCR005` (formerly `tool-input-schema-structure`).
- MCR006 - Input property description: Rule id `mcp:MCR006` (formerly `tool-property-description`).
- MCR007 - Embedded OpenAPI version: Rule id `mcp:MCR007` (formerly `openapi-embedded-version-check`).
- MCR008 - Embedded schema required fields: Rule id `mcp:MCR008` (formerly `embedded-schema-required-matches-properties`); function renamed to `mcp-required-matches-properties`.
- MCR009 - Output schema: Rule id `mcp:MCR009` (formerly `tool-output-schema-defined`).
