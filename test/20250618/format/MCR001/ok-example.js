const { tool, result, str, int, bool } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2025-06-18";
const path = () => str("Absolute path inside an allowed directory.");

const tools = [
  tool(R, "read_text_file", "Reads a text file.", { path: path(), head: int("First N lines.") }, ["path"]),
  tool(R, "read_media_file", "Reads a media file.", { path: path() }, ["path"]),
  tool(R, "read_multiple_files", "Reads several files.", { paths: { type: "array", items: path() } }, ["paths"]),
  tool(R, "write_file", "Writes a file.", { path: path(), content: str("Content.") }, ["path", "content"]),
  tool(R, "edit_file", "Edits a file.", { path: path(), dryRun: bool("Preview only.") }, ["path"]),
  tool(R, "create_directory", "Creates a directory.", { path: path() }, ["path"]),
  tool(R, "list_directory", "Lists a directory.", { path: path() }, ["path"]),
  tool(R, "list_directory_with_sizes", "Lists a directory with sizes.", { path: path() }, ["path"]),
  tool(R, "directory_tree", "Returns a JSON tree.", { path: path() }, ["path"]),
  tool(R, "move_file", "Moves a file.", { source: path(), destination: path() }, ["source", "destination"]),
  tool(R, "search_files", "Searches files.", { path: path(), pattern: str("Glob.") }, ["path", "pattern"]),
  tool(R, "get_file_info", "Returns metadata.", { path: path() }, ["path"]),
  tool(R, "list_allowed_directories", "Lists allowed directories.", {}),
  tool(R, "db_query", "Runs a read-only SQL query.", { sql: str("SELECT statement.") }, ["sql"]),
  tool(R, "db_execute", "Runs a write statement.", { sql: str("Statement.") }, ["sql"]),
  tool(R, "list_tables", "Lists tables.", {}),
  tool(R, "describe_table", "Describes a table.", { table: str("Table name.") }, ["table"]),
  tool(R, "export_table_csv", "Exports a table.", { table: str("Table name.") }, ["table"]),
];

tools[0].title = "Read-Text-File";
tools[0]._meta = { "com.example/name": "ReadTextFile", name: "read-text-file" };
tools[1].outputSchema = { type: "object", properties: { name: str("File name.", { default: "Image.PNG" }), mimeType: str("MIME type."), data: str("Base64.") } };
tools[2].outputSchema = { type: "object", properties: { files: { type: "array", items: { $ref: "#/$defs/File" } } }, $defs: { File: { type: "object", properties: { name: str("File name.") } } } };

module.exports = result(R, tools, { nextCursor: "cGFnZToy" });
