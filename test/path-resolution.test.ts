import fs from "fs";
import path from "path";

import { copyRecursively, writeRecursively } from "../lib/internal/helpers/fs.js";
import { paths } from "../lib/internal/helpers/paths.js";
import { getConfigFromDistEsm } from "./helpers/esm-config.js";

describe("path resolution", () => {
  before(async () => {
    await Promise.all([
      { source: paths.configDir, destination: path.join(paths.rootDir, "tmp", "config") },
      { source: paths.env, destination: path.join(paths.rootDir, "tmp", ".env") },
    ].map(copyRecursively));
  });

  after(() => fs.rmSync(paths.tmpDir, { recursive: true }));

  it("should still use ENV_PATH even if it points to a non existent file", () => {
    process.env.NODE_ENV = "development";
    process.env.ENV_PATH = "file-that-doesnt-exist";

    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from development.json");
  });

  it("supports reading config from a custom base path", () => {
    process.env.CONFIG_BASE_PATH = paths.tmpDir;
    const mock = { prop: "from custom" };
    const file = path.join(paths.tmpDir, "config/development.json");
    const fileContents = fs.readFileSync(file, "utf8");
    writeRecursively(file, JSON.stringify(mock));

    const config = getConfigFromDistEsm();
    config.should.have.property("prop").equal(mock.prop);
    config.should.have.property("overridden").equal("from .env");

    writeRecursively(file, fileContents);
  });

  it("should use ENV_PATH, if set, to load other .env file", () => {
    process.env.NODE_ENV = "development";
    process.env.ENV_PATH = "tmp/.env";
    const mock = "from /tmp.env";
    const file = path.join(paths.tmpDir, ".env");
    const fileContent = fs.readFileSync(file, "utf8");
    writeRecursively(file, fileContent.replace(/^overridden=.*$/m, `overridden="${mock}"`));

    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal(mock);

    writeRecursively(file, fileContent);
  });
});
