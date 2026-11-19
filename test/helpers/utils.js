const { Spectral, Document } = require("@stoplight/spectral-core");
const { migrateRuleset } = require("@stoplight/spectral-ruleset-migrator");
const Parsers = require("@stoplight/spectral-parsers");
const fs = require("fs");
const path = require("path");

const AsyncFunction = (async () => {}).constructor;
const rulesetFile = path.resolve(__dirname, "../../mcp-ruleset.yaml");
const functionsDir = path.resolve(__dirname, "../../functions");

const lazyFunction = (file) => {
  let fn;
  return function (...args) {
    fn = fn || require(file);
    return fn.apply(this, args);
  };
};

/**
 * @param {string} rule - The rule id (e.g. 'mcp:MCR001')
 * @param {object} [opts] - Optional overrides
 * @param {object|null} [opts.functionOptions] - Merged into the functionOptions of the rule's then; null removes them
 * @param {object} [opts.rule] - Replaces fields of the rule (given, then, severity...)
 * @returns {Promise<Spectral>} Configured Spectral linter
 */
async function linterForRule(rule, opts = {}) {
  const ruleset = await loadRuleset();
  Object.keys(ruleset.rules).forEach((key) => {
    if (key !== rule) delete ruleset.rules[key];
  });

  if (opts.rule) Object.assign(ruleset.rules[rule], opts.rule);
  if (opts.functionOptions === null) delete ruleset.rules[rule].then.functionOptions;
  if (opts.functionOptions && ruleset.rules[rule] && ruleset.rules[rule].then) {
    ruleset.rules[rule].then.functionOptions = {
      ...ruleset.rules[rule].then.functionOptions,
      ...opts.functionOptions,
    };
  }

  const linter = new Spectral();
  linter.setRuleset(ruleset);
  return linter;
}

/**
 * @param {string} [text] - Ruleset text read in place of mcp-ruleset.yaml (e.g. a profile ruleset served by the back);
 *   functionsDir still resolves next to mcp-ruleset.yaml
 * @returns {Promise<object>} The ruleset, ready for Spectral#setRuleset
 */
async function loadRuleset(text) {
  const m = {};
  const paths = [path.dirname(rulesetFile), __dirname, path.resolve(__dirname, "../..")];
  const source =
    text === undefined
      ? fs
      : {
          ...fs,
          promises: {
            ...fs.promises,
            readFile: (file, ...args) => (path.resolve(String(file)) === rulesetFile ? Promise.resolve(text) : fs.promises.readFile(file, ...args)),
          },
        };
  await AsyncFunction(
    "module, require",
    await migrateRuleset(rulesetFile, { format: "commonjs", fs: source })
  )(m, (text) => {
    const resolved = require.resolve(text, { paths });
    return path.relative(functionsDir, path.dirname(resolved)) === "" ? lazyFunction(resolved) : require(resolved);
  });
  return m.exports;
}

const jsonDocument = (data, source = "tools.json") =>
  new Document(typeof data === "string" ? data : JSON.stringify(data, null, 2), Parsers.Json, source);

const yamlDocument = (text, source = "tools.yaml") => new Document(text, Parsers.Yaml, source);

module.exports = {
  linterForRule,
  loadRuleset,
  jsonDocument,
  yamlDocument,
  rulesetFile,
};
