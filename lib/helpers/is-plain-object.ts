/**
 * Returns a `boolean` indicating whether the provided value is an object.
 *
 * Example:
 * ```ts
 * import { isPlainObject } from "exp-config/helpers/is-plain-object";
 *
 * isPlainObject({ key: "value" }); // true
 * ```
 * @since v5.0.0
 */
function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return (
    obj &&
    typeof obj === "object" &&
    obj !== null &&
    !Array.isArray(obj) &&
    obj.constructor === Object
  ) === true;
}

export { isPlainObject };
