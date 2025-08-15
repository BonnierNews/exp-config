import fs from "fs";
import path from "path";

import { paths } from "../lib/internal/helpers/paths.js";
import { copyRecursively, writeRecursively } from "../lib/internal/helpers/fs.js";
import type { ConfigDevelopmentMock } from "./types.js";
import { getConfigFromDistEsm } from "./helpers/esm-config.js";

describe("config in .js", () => {
  const jsTestDir = path.join(paths.tmpDir, "js-base-path");

  before(async () => {
    await Promise.all([
      { source: path.join(paths.configDir, "template.js"), destination: path.join(jsTestDir, "/config/livedata.js") },
    ].map(copyRecursively));
  });

  after(() => {
    fs.rmSync(paths.tmpDir, { recursive: true });
  });

  it("retrives values from .js files specified in the NODE_ENV environment variable", () => {
    process.env.NODE_ENV = "livedata";
    process.env.CONFIG_BASE_PATH = jsTestDir;

    const config = getConfigFromDistEsm<ConfigDevelopmentMock>();
    config.level1.should.have.property("prop").equal("config");
    config.level1.should.have.property("array").eql([ "config" ]);
  });

  // Combine two tests into one related to importing JS because ESM modules are cached on first import.
  // Splitting them would result in the second test using the cached module state.
  it("supports a default.js for default config and merging livedata.js with default.js configs", () => {
    process.env.NODE_ENV = "livedata";
    process.env.CONFIG_BASE_PATH = jsTestDir;
    const file = path.join(jsTestDir, "config/default.js");
    writeRecursively(file, `"use strict";
    module.exports = {
      newJsProp: true,
      level1: {
        array: ["default"],
        level2: {
          default: true,
        },
      },
    };`);

    const config = getConfigFromDistEsm<ConfigDevelopmentMock& { newJsProp: boolean }>();

    config.prop.should.eql("from config");
    config.newJsProp.should.eql(true);
    config.level1.should.have.property("level2").eql({
      default: true,
      config: true,
    });
    config.level1.should.have.property("array").eql([ "config" ]);
  });
});
