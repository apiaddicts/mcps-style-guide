// Parsed objects keep only the last value of a duplicated key, so duplicates are
// detected from the parser diagnostics attached to the source document.
const isPrefix = (prefix, path) => prefix.every((segment, i) => String(segment) === String(path[i]));

export default function noDuplicateKeys(_targetVal, _opts, context) {
  const diagnostics = context.document.diagnostics ?? [];

  return diagnostics
    .filter(d => /duplicate/i.test(d.message) && Array.isArray(d.path))
    .filter(d => d.path.length === context.path.length + 1 && isPrefix(context.path, d.path))
    .map(d => ({
      message: `Tool object contains duplicate key "${d.path[d.path.length - 1]}".`,
      path: d.path,
    }));
}
