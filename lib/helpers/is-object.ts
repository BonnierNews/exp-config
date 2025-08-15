/**
 * Returns a boolean indicating whether the provided value is an object.
 *
 * ```js
 * import isObject from "exp-config/helpers/is-object.js";
 *
 * const results = isObject({ key: "value" });
 *
 * console.log(results);
 *
 *  * true
 * ```
* @since v5.0.0
 */
function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

export default isObject;
