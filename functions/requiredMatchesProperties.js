// Every name listed in `required` must exist in `properties`.
export default function requiredMatchesProperties(targetVal, _opts, context) {
  if (targetVal === null || typeof targetVal !== 'object' || !Array.isArray(targetVal.required)) {
    return [];
  }

  const properties =
    targetVal.properties !== null && typeof targetVal.properties === 'object' ? targetVal.properties : {};

  return targetVal.required
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(properties, name))
    .map(({ name, index }) => ({
      message: `Required field "${name}" is not defined in properties.`,
      path: [...context.path, 'required', index],
    }));
}
