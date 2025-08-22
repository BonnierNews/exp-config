import path from "path";
import fs from "fs";

import type { ConfigDefaultMock } from "./types.js";
import { writeRecursively } from "../lib/internal/helpers/fs.js";
import { paths } from "../lib/internal/helpers/paths.js";
import { getConfigFromDistEsm } from "./helpers/esm-config.js";

describe("Translates process env key", () => {
  it("should replace dots the given char in INTERPRET_CHAR_AS_DOT", () => {
    process.env.INTERPRET_CHAR_AS_DOT = "_";
    process.env.nested_prop = "from environment variable";

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.nested.prop.should.eql("from environment variable");
    config.should.not.have.property("nested_prop").equal("from environment variable");
  });

  it("should replace dots the given char in INTERPRET_CHAR_AS_DOT multiple times", () => {
    process.env.INTERPRET_CHAR_AS_DOT = "_";
    process.env.nested_nested_prop = "from environment variable";

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.nested.nested.prop.should.eql("from environment variable");
    config.should.not.have.property("nested_nested_prop").equal("from environment variable");
  });

  it("should not replace variables in config file", () => {
    process.env.INTERPRET_CHAR_AS_DOT = "_";

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.should.not.have.property("nested_prop");
    config.nested.prop.should.eql(true);
  });

  it("should replace variables after ENV_PREFIX", () => {
    process.env.INTERPRET_CHAR_AS_DOT = "_";
    process.env.ENV_PREFIX = "MY_ENV_";
    process.env.ALLOW_TEST_ENV_OVERRIDE = "true";
    process.env.MY_ENV_nested_prop = "from environment variable";

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.nested.prop.should.eql("from environment variable");
    config.should.not.have.property("MY_ENV_nested_prop").equal("from environment variable");
    config.should.not.have.property("nested_prop").equal("from environment variable");
  });

  it("should only replace values that exists in config file", () => {
    process.env.INTERPRET_CHAR_AS_DOT = "_";
    process.env.nested_prop2 = "from environment variable";

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.nested.should.not.have.property("prop2").equal("from environment variable");
    config.should.have.property("nested_prop2").equal("from environment variable");
  });

  it("dots should have precedence over INTERPRET_CHAR_AS_DOT", () => {
    process.env.INTERPRET_CHAR_AS_DOT = "_";
    process.env["nested.prop"] = "baz";
    process.env.nested_prop = "foo";

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.nested.prop.should.equal("baz");
  });

  it("should use INTERPRET_CHAR_AS_DOT when reading .env file", () => {
    process.env.INTERPRET_CHAR_AS_DOT = "_";
    process.env.NODE_ENV = "development";
    process.env.ENV_PATH = "./tmp/.test-nested-env";
    const mock = "from .test-nested-env";
    const file = path.join(paths.tmpDir, ".test-nested-env");
    writeRecursively(file, `nested_prop="${mock}"`);

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.nested.should.have.property("prop").equal("from .test-nested-env");

    fs.rmSync(file);
  });

  it("should support a prefix for bash variables", () => {
    process.env.ENV_PREFIX = "MY_ENV_";
    process.env.ALLOW_TEST_ENV_OVERRIDE = "true";
    process.env.MY_ENV_overridden = "from environment variable";

    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.should.not.have.property("MY_ENV_overridden").equal("from environment variable");
    config.should.have.property("overridden").equal("from environment variable");
  });
});
