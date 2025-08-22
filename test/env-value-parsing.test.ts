import process from "node:process";

import { getConfigFromDistEsm } from "./helpers/esm-config.js";

describe("config env value parsing", () => {
  it("parses boolean values from .env file", () => {
    const config = getConfigFromDistEsm();
    config.should.have.property("bool1").equal(true);
    config.should.have.property("bool2").equal(true);
    config.should.have.property("bool3").equal(false);
  });

  it("parses boolean values from environment variables", () => {
    process.env.BOOL_TEST = "true";

    const config = getConfigFromDistEsm();
    config.should.have.property("BOOL_TEST").equal(true);
  });
});
