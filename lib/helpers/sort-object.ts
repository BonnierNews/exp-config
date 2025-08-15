/**
 * Sorts the keys of an object recursively.
 *
 * ```js
 * import sortObject from "exp-config/helpers/sort-object.js";
 *
 * const results = sortObject({
 *   b: [ { a: "" }, { z: "" }, { 0: "" }, { 9: "" } ],
 *   a: [ 'z', 'a', 9, 0 ],
 * });
 *
 * console.log(results);
 *
 *  * {
 *  *   a: [ 'z', 'a', 9, 0 ],
 *  *   b: [ { a: '' }, { z: '' }, { '0': '' }, { '9': '' } ]
 *  * }
 * ```
* @since v5.0.0
 */
function sortObject<T = Record<string, unknown>>(arg: T | unknown): T {
  if (typeof arg !== "object" || arg === null) return arg as T;

  if (Array.isArray(arg)) return arg.map(sortObject) as T;

  return Object.keys(arg).sort((a, b) => a.localeCompare(b)).reduce((prev, curr) => {
    prev[curr] = sortObject((arg as Record<string, unknown>)[curr]);
    return prev;
  }, {} as Record<string, unknown>) as T;
}

export default sortObject;
