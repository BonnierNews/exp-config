import { isPlainObject } from "./is-plain-object.js";

/**
 * Converts nested keys into a single-level object using a delimiter and optional prefix.
 *
 * Example:
 * ```ts
 * import { flattenObject } from "exp-config/helpers/flatten-object";
 *
 * flattenObject({ a: { b: { c: "" } } }, ".", "root") // { "root.a.b.c": "" }
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

    if (isPlainObject(value)) {
      Object.assign(prev, flattenObject(value, delim, fullKey));
    } else prev[fullKey] = value;

    return prev;
  }, {} as Record<string, unknown>) as FlattenObject<T, D, P>;
}

type FlattenObject<T, D extends string = ".", P extends string = ""> = UnionToIntersection<{
  [K in keyof T]: T[K] extends object
    ? T[K] extends any[]
      ? { [Q in `${P}${K & string}`]: T[K] }
      : FlattenObject<T[K], D, `${P}${K & string}${D}`>
    : { [Q in `${P}${K & string}`]: T[K] }
}[keyof T]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export { flattenObject };

export type {
  FlattenObject,
  UnionToIntersection,
};
