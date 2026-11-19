/**
 * @param {object} result - The tools/list result (given: "$", resolved: false)
 * @param {object} options - Function options
 * @param {string} options["naming-convention"] - snake_case (default), camelCase, kebab-case or UpperCamelCase. Letter case,
 *   spaces, hyphens, underscores and a trailing "case" are ignored, PascalCase is read as UpperCamelCase and lowerCamelCase as
 *   camelCase; any other value falls back to snake_case
 * @param {import('@stoplight/spectral-core').RulesetFunctionContext} context
 * @returns {Array<{message: string, path: Array<string|number>}>} one result per entry of the root tools array that is not an
 *   object or has no name (reported on the entry), and per name that is not a non-empty string following the convention
 *   (reported on the name)
 */
const DEFAULT_CONVENTION = "snake";

const CASES = {
  snake: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/,
  kebab: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  camel: /^[a-z][a-zA-Z0-9]*$/,
  uppercamel: /^[A-Z][a-zA-Z0-9]*$/,
};

const ALIASES = { lowercamel: "camel", pascal: "uppercamel" };

const LABELS = {
  snake: "snake_case",
  kebab: "kebab-case",
  camel: "camelCase",
  uppercamel: "UpperCamelCase",
};

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const resolveConvention = (options) => {
  const value = isObject(options) ? options["naming-convention"] : undefined;
  if (typeof value !== "string") return DEFAULT_CONVENTION;
  const normalized = value.toLowerCase().replace(/[\s_-]/g, "").replace(/case$/, "");
  if (has(CASES, normalized)) return normalized;
  return has(ALIASES, normalized) ? ALIASES[normalized] : DEFAULT_CONVENTION;
};

module.exports = (result, options, context) => {
  if (!isObject(result) || !Array.isArray(result.tools)) return [];

  const convention = resolveConvention(options);
  const pattern = CASES[convention];
  const label = LABELS[convention];
  const errors = [];

  result.tools.forEach((tool, index) => {
    const path = [...context.path, "tools", index];

    if (!isObject(tool)) {
      errors.push({ message: `Tool must be an object with a ${label} name.`, path });
      return;
    }

    if (!has(tool, "name") || tool.name === undefined) {
      errors.push({ message: `Tool must have a ${label} name.`, path });
      return;
    }

    const { name } = tool;
    if (typeof name !== "string" || name === "") {
      errors.push({ message: `Tool name must be a non-empty ${label} string.`, path: [...path, "name"] });
      return;
    }

    if (!pattern.test(name)) {
      errors.push({ message: `Tool name '${name}' must be ${label}.`, path: [...path, "name"] });
    }
  });

  return errors;
};
