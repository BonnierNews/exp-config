import { expect } from "chai";

import { isPlainObject } from "../lib/helpers/is-plain-object.js";
import { sortObject } from "../lib/helpers/sort-object.js";
import { flattenObject } from "../lib/helpers/flatten-object.js";
import { generateTypeDeclarations } from "../lib/helpers/generate-type-declarations.js";

describe("helper fn flattenObject()", () => {
  [
    { desc: "empty object", expect: {}, input: {} },
    { desc: "nested object", expect: { "a.b": 1, "a.c": 2, d: 3 }, input: { a: { b: 1, c: 2 }, d: 3 } },
    { desc: "deeply nested object", expect: { "a.b.c.d": 1 }, input: { a: { b: { c: { d: 1 } } } } },
    { desc: "object with array (array stays intact)", expect: { "a.b": [ 1, 2, 3 ] }, input: { a: { b: [ 1, 2, 3 ] } } },
  ].forEach((params) => {
    it(`should flatten object for ${params.desc}`, () => {
      expect(flattenObject(params.input)).to.deep.equal(params.expect);
    });
  });
});

describe("helper fn isPlainObject()", () => {
  [
    { desc: "array", expect: false, input: [] },
    { desc: "date", expect: false, input: new Date() },
    { desc: "null", expect: false, input: null },
    { desc: "number", expect: false, input: 42 },
    { desc: "plain object", expect: true, input: {} },
    { desc: "string", expect: false, input: "hello" },
    { desc: "undefined", expect: false, input: undefined },
  ].forEach((params) => {
    it(`should return ${params.expect} for ${params.desc}`, () => {
      expect(isPlainObject(params.input)).to.equal(params.expect);
    });
  });
});

describe("helper fn sortObject()", () => {
  [
    { desc: "empty object", expect: {}, input: {} },
    { desc: "case-sensitive keys (uppercase first in ASCII)", expect: { A: 2, a: 1 }, input: { a: 1, A: 2 } },
    { desc: "unordered keys", expect: { a: 1, b: 2, c: 3 }, input: { c: 3, a: 1, b: 2 } },
    { desc: "deeply nested object", expect: { obj: { a: { x: 1, y: 2 }, z: 1 } }, input: { obj: { z: 1, a: { y: 2, x: 1 } } } },
  ].forEach((params) => {
    it(`should sort object for ${params.desc}`, () => {
      expect(sortObject(params.input)).to.deep.equal(params.expect);
    });
  });
});

describe("helper fn generateTypeDeclarations()", () => {
  [
    {
      desc: "empty object",
      expect: "declare const config: {};",
      input: { name: "config", obj: {} },
    },
    {
      desc: "object with primitives",
      expect: "declare const config: { number: number; boolean: boolean; };",
      input: { name: "config", obj: { number: 1, boolean: true } },
    },
    {
      desc: "object with nested object",
      expect: "declare const config: { db: { host: string; port: number; }; };",
      input: { name: "config", obj: { db: { host: "host", port: 3000 } } },
    },
    {
      desc: "object with array primitives",
      expect: "declare const config: { array: (string | number | boolean)[]; };",
      input: { name: "config", obj: { array: [ 1, "one", true ] } },
    },
    {
      desc: "object with function properties removed",
      expect: "declare const config: { nested: {}; keep: number; };",
      input: { name: "config", obj: { remove: () => undefined, nested: { remove: () => undefined }, keep: 1 } },
    },
    {
      desc: "object with Node process environment like keys removed",
      expect: "declare const config: { keep: number; };",
      input: { name: "config", obj: { UPPERCASE: "remove", _underscore: "remove", npm: "remove", keep: 1 } },
    },
  ].forEach((params) => {
    it(`should generate declaration for ${params.desc}`, () => {
      const result = generateTypeDeclarations(params.input.name, params.input.obj).replace(/\s+/g, " ").trim();
      expect(result).to.include(params.expect);
    });
  });
});
