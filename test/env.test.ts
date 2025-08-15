import { getConfigFromDistEsm } from "./helpers/esm-config.js";

describe("config env values", () => {
  it("supports overriding values in .env file", () => {
    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from .env");
  });

  it("retrives values from .env files from <app root>", () => {
    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from .env");
  });

  it("supports overriding values with environment variables", () => {
    process.env.prop = "from environment variable";

    const config = getConfigFromDistEsm();
    config.should.have.property("prop").equal("from environment variable");
  });

  it("gives precedence to environment variables over .env", () => {
    process.env.overridden = "from environment variable";

    const config = getConfigFromDistEsm();
    config.should.have.property("overridden").equal("from environment variable");
  });
});
