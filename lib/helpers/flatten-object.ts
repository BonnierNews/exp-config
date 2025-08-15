import isObject from "./is-object.js";

/**
 * Flattens an object recursively, converts nested keys into a string key.
 * Parameters `delimiter` and `prefix` can be used to customize the key format.
 * ```js
 * import flattenObject from "exp-config/helpers/flatten-object.js";
 *
 * const results = flattenObject({
 *   a: {
 *      b: { a: "" },
 *      c: { a: "" },
 *    },
 *  },
 *  ".",
 *  "prefix"
 * );
 *
 * console.log(results);
 *
 *    * {
 *    *   "prefix.a.b.a": "",
 *    *   "prefix.a.c.a": ""
 *    * }
 * ```
* @since v5.0.0
 */
function flattenObject<T extends Record<string, unknown>, D extends string = ".", P extends string = "">(
  obj: T,
  delimiter?: D,
  prefix?: P
) {
  return Object.entries(obj).reduce((prev, [ key, value ]) => {
    const fullKey = (prefix ? `${prefix}${delimiter}${key}` : key) as `${P}${string}${D}${string}`;
    const delim = (delimiter ?? ".") as D;

    if (isObject(value)) {
      Object.assign(prev, flattenObject(value, delim, fullKey));
    } else prev[fullKey] = value;

    return prev;
  }, {} as Record<string, unknown>) as FlattenObject<T, D, P>;
}

export default flattenObject;

export type FlattenObject<T, D extends string = ".", P extends string = ""> = UnionToIntersection<{
  [K in keyof T]: T[K] extends object
    ? T[K] extends any[]
      ? { [Q in `${P}${K & string}`]: T[K] }
      : FlattenObject<T[K], D, `${P}${K & string}${D}`>
    : { [Q in `${P}${K & string}`]: T[K] }
}[keyof T]>;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
