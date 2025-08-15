import { getConfigFromDistEsm } from "./helpers/esm-config.js";

describe("config build base on environment args", () => {
  it("doesn't use values from .env when NODE_ENV=test", () => {
    process.env.NODE_ENV = "test";

    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from test.json");
  });

  it("doesn't use values from .env when NODE_ENV=test if ALLOW_TEST_ENV_OVERRIDE is set", () => {
    process.env.NODE_ENV = "test";
    process.env.ALLOW_TEST_ENV_OVERRIDE = "true";

    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from test.json");
  });

  it("doesn't use environment variables when NODE_ENV=test", () => {
    process.env.NODE_ENV = "test";
    process.env.overridden = "from environment variable";

    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from test.json");
  });

  it("uses environment variables when NODE_ENV=test if ALLOW_TEST_ENV_OVERRIDE is set", () => {
    process.env.NODE_ENV = "test";
    process.env.ALLOW_TEST_ENV_OVERRIDE = "true";
    process.env.overridden = "from environment variable";

    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from environment variable");
  });
});
