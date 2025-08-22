import { Delimiter } from "../internal/constants.js";

/**
 * Unflattens an object into a nested structure.
 *
 * The `delimiter` parameter is optional and defaults to `"."`.
 *
 * Example:
 * ```ts
 * import { unflattenObject } from "exp-config/helpers/unflatten-object";
 *
 * unflattenObject({ "a.b.c": "" }, ".");  // { a: { b: { c: "" } } }
 * ```
 * @since v5.0.0
 */
function unflattenObject <T = Record<string, unknown>>(arg: T, delimiter?: string): T {
  return Object.entries(arg as Record<string, unknown>).reduce((results, [ flatKey, value ]) => {
    void flatKey.split(delimiter || Delimiter).reduce((prev, curr, idx, arr) => {
      if (idx === arr.length - 1) prev[curr] = value;
      else prev[curr] = prev[curr] ?? {};

      return prev[curr] as Record<string, unknown>;
    }, results as Record<string, unknown>);

    return results;

  }, {} as Record<string, unknown>) as T;
}

export { unflattenObject };
