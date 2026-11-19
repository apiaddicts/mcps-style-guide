const { tool, result, str, int, bool } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2025-06-18";
const path = (description = "Absolute path inside an allowed directory.") => str(description);

const tools = [
  tool(R, "read_text_file", "Reads a text file.", { path: path(), head: int("First N lines."), tail: int("Last N lines.") }, ["path"]),
  tool(R, "read_media_file", "Reads an image or audio file as base64.", { path: path() }, ["path"]),
  tool(R, "readMultipleFiles", "Reads several files at once.", { paths: { type: "array", items: path("Path."), minItems: 1 } }, ["paths"]),
  tool(R, "write_file", "Creates or overwrites a file.", { path: path(), content: str("New content.") }, ["path", "content"]),
  tool(R, "edit-file", "Applies line edits to a file.", { path: path(), edits: { type: "array", items: { type: "object", properties: { oldText: str("Text to replace."), newText: str("Replacement.") } } }, dryRun: bool("Preview only.") }, ["path", "edits"]),
  tool(R, "create_directory", "Creates a directory and its parents.", { path: path() }, ["path"]),
  tool(R, "list_directory", "Lists a directory.", { path: path() }, ["path"]),
  tool(R, "ListDirectoryWithSizes", "Lists a directory with file sizes.", { path: path(), sortBy: str("Sort order.", { enum: ["name", "size"] }) }, ["path"]),
  tool(R, "directory_tree", "Returns a recursive JSON tree.", { path: path(), excludePatterns: { type: "array", items: str("Glob.") } }, ["path"]),
  tool(R, "move_file", "Moves or renames a file.", { source: path(), destination: path() }, ["source", "destination"]),
  tool(R, "search_files", "Searches files by glob.", { path: path(), pattern: str("Glob pattern.") }, ["path", "pattern"]),
  tool(R, "get_file_info", "Returns file metadata.", { path: path() }, ["path"]),
  tool(R, "list_allowed_directories", "Lists the directories the server can access.", {}),
  tool(R, "db.query", "Runs a read-only SQL query.", { sql: str("SELECT statement.") }, ["sql"]),
  tool(R, "db_execute", "Runs a write SQL statement.", { sql: str("Statement."), params: { type: "array", items: { type: ["string", "number", "boolean", "null"] } } }, ["sql"]),
  tool(R, "list_tables", "Lists the tables of a schema.", { schema: str("Schema name.", { default: "public" }) }),
  tool(R, "describe_table", "Describes the columns of a table.", { table: str("Table name.") }, ["table"]),
  tool(R, "export_table_csv", "Exports a table to CSV.", { table: str("Table name."), path: path() }, ["table", "path"]),
  tool(R, "vacuum_table__full", "Runs VACUUM FULL on a table.", { table: str("Table name.") }, ["table"]),
];

const nameless = { ...tools[12] };
delete nameless.name;
nameless.title = "list_backups";
tools.push(nameless);
tools.push({ ...tools[6], name: "list-backups", _meta: { name: "list_backups" } });

module.exports = result(R, tools, { _meta: { "io.example/server": "fs-db" }, nextCursor: "cGFnZTo=" });
