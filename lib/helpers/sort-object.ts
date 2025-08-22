/**
 * Recursively sorts the keys of an object
 *
 * Example:
 * ```ts
 * import { sortObject } from "exp-config/helpers/sort-object";
 *
 * sortObject({ z: "z", a: "a" }); // { a: "a", z: "z" }
 * ```
 * @since v5.0.0
 */
function sortObject<T = Record<string, unknown>>(arg: T | unknown): T {
  if (typeof arg !== "object" || arg === null) return arg as T;

  if (Array.isArray(arg)) return arg.map(sortObject) as T;

  return Object.keys(arg).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).reduce((prev, curr) => {
    prev[curr] = sortObject((arg as Record<string, unknown>)[curr]);
    return prev;
  }, {} as Record<string, unknown>) as T;
}

export { sortObject };
