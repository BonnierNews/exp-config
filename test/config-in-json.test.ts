import type { ConfigDevelopmentMock, ConfigDefaultMock } from "./types.js";
import { getConfigFromDistEsm } from "./helpers/esm-config.js";

describe("config", () => {
  it("retrives values from JSON files from <app root>/config", () => {
    const config = getConfigFromDistEsm();
    config.should.have.property("prop").equal("value");
  });

  it("by default retrives values from properties in development.json", () => {
    const config = getConfigFromDistEsm();
    config.should.have.property("prop").equal("value");
  });

  it("retrives values from nested properties", () => {

    const config = getConfigFromDistEsm<ConfigDevelopmentMock>();
    config.should.have.property("level1");
    config.level1.should.have.property("level2").equal("nested value");
  });

  it("retrives values from JSON files specified in the NODE_ENV environment variable", () => {
    process.env.NODE_ENV = "test";

    const config = getConfigFromDistEsm();
    config.should.have.property("prop").equal("from test");
  });

  it("retrives values from JSON files specified in the NODE_CONFIG_ENV environment variable", () => {
    process.env.NODE_ENV = "development";
    process.env.NODE_CONFIG_ENV = "test";

    const config = getConfigFromDistEsm();
    config.should.have.property("prop").equal("from test");
  });

  it("supports a default.json for default config", () => {
    const config = getConfigFromDistEsm<ConfigDefaultMock>();
    config.nested.nested.prop.should.eql(false);
    config.overridden.should.eql("from .env");
    config.newProp.should.eql(true);
  });
});
