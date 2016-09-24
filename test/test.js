var fs = require("fs");
var path = require("path");
require("chai").should();

describe("config", function() {
  before(createTempFiles);

  afterEach(function() {
    delete require.cache[require.resolve("../index")];
    delete require.cache[require.resolve("../tmp/index")];
    delete require.cache[require.resolve("../config/development")];
    delete require.cache[require.resolve("../config/test")];
  });

  it("by default retrives values from properties in development.json", function() {
    require("../index").should.have.property("prop").equal("value");
  });

  it("retrives values from nested properties", function() {
    var config = require("../index");
    config.should.have.property("level1");
    config.level1.should.have.property("level2").equal("nested value");
  });

  it("retrives values from JSON files specified in the NODE_ENV environment variable", function() {
    process.env.NODE_ENV = "test";
    require("../index").should.have.property("prop").equal("from test");
    delete process.env.NODE_ENV;
  });

  it("retrives values from JSON files from <app root>/config", function() {
    require("../tmp/index").should.have.property("prop").equal("value");
  });

  it("supports overriding values in .env file", function() {
    require("../index").should.have.property("overridden").equal("from .env");
  });

  it("parses boolean values from .env file", function() {
    var config = require("../index");
    config.should.have.property("bool1").equal(true);
    config.should.have.property("bool2").equal(true);
    config.should.have.property("bool3").equal(false);
  });

  it("retrives values from .env files from <app root>", function() {
    require("../tmp/index").should.have.property("overridden").equal("from .env");
  });

  it("doesn't use values from .env when NODE_ENV=test", function() {
    process.env.NODE_ENV = "test";
    var config = require("../index");
    config = require("../index");
    config.should.have.property("overridden").equal("from test.json");
    delete process.env.NODE_ENV;
  });

  it("doensn't use values from .env when NODE_ENV=test if ALLOW_TEST_ENV_OVERRIDE is set", function() {
    process.env.NODE_ENV = "test";
    process.env.ALLOW_TEST_ENV_OVERRIDE = "true";
    var config = require("../index");
    config = require("../index");
    config.should.have.property("overridden").equal("from test.json");
    delete process.env.NODE_ENV;
    delete process.env.ALLOW_TEST_ENV_OVERRIDE;
  });

  it("should use ENV_PATH, if set, to load other .env file", function() {
    process.env.NODE_ENV = "development";
    process.env.ENV_PATH = "tmp/.test-env";
    var config = require("../index");
    config.should.have.property("overridden").equal("from .test-env");
    delete process.env.NODE_ENV;
    delete process.env.ENV_PATH;
  });

  it("should still use ENV_PATH even if it points to a non existant file", function() {
    process.env.NODE_ENV = "development";
    process.env.ENV_PATH = "file-that-doesnt-exist";
    var config = require("../index");
    config.should.have.property("overridden").equal("from development.json");
    delete process.env.NODE_ENV;
    delete process.env.ENV_PATH;
  });

  it("parses boolean values from environment variables", function() {
    process.env.BOOL_TEST = "true";
    var config = require("../index");
    config.should.have.property("BOOL_TEST").equal(true);
    delete process.env.BOOL_TEST;
  });

  it("supports overriding values with environment variables", function() {
    process.env.prop = "from environment variable";
    require("../index").should.have.property("prop").equal("from environment variable");
    delete process.env.prop;
  });

  it("gives precedence to environment variables over .env", function() {
    process.env.overridden = "from environment variable";
    require("../index").should.have.property("overridden").equal("from environment variable");
  });

  it("doesn't use environment variables when NODE_ENV=test", function() {
    process.env.NODE_ENV = "test";
    process.env.overridden = "from environment variable";
    require("../index").should.have.property("overridden").equal("from test.json");
    delete process.env.NODE_ENV;
    delete process.env.overridden;
  });

  it("uses environment variables when NODE_ENV=test if ALLOW_TEST_ENV_OVERRIDE is set", function() {
    process.env.NODE_ENV = "test";
    process.env.ALLOW_TEST_ENV_OVERRIDE = "true";
    process.env.overridden = "from environment variable";
    require("../index").should.have.property("overridden").equal("from environment variable");
    delete process.env.NODE_ENV;
    delete process.env.ALLOW_TEST_ENV_OVERRIDE;
    delete process.env.overridden;
  });

  it("supports reading config from a custom base path", function() {
    process.env.CONFIG_BASE_PATH = path.join(__dirname, "../tmp/");
    var config = require("../index");
    config.should.have.property("prop").equal("from custom");
    config.should.have.property("overridden").equal("from .env");
    delete process.env.NODE_ENV;
    delete process.env.overridden;
  });

  it("supports a default.json for default config", function () {
    process.env.NODE_ENV = "development";
    process.env.CONFIG_BASE_PATH = path.join(__dirname, "../tmp/");
    // create default config file
    var originalPath = path.join(__dirname, "../config/default.json");
    var tempPath = path.join(__dirname, "../tmp/config/default.json");
    fs.writeFileSync(tempPath, fs.readFileSync(originalPath));
    // init config
    var config = require("../index");
    config.prop.should.eql("from custom");
    config.overridden.should.eql("from .env");
    config.newProp.should.eql(true);
  });

  describe("config files in .js", function() {
    before(function() {
      process.env.NODE_ENV = "livedata";
      process.env.CONFIG_DIR = "config-js";
      process.env.CONFIG_BASE_PATH = path.join(__dirname, "../tmp/");
      var originalPath = path.join(__dirname, "../config/template.js");
      var tempPath = path.join(__dirname, "../tmp/config-js/livedata.js");
      fs.writeFileSync(tempPath, fs.readFileSync(originalPath));
    });

    it("retrives values from .js files specified in the NODE_ENV environment variable", function() {
      // init config
      var config = require("../index");
      config.overridden.should.equal("from .env");
      config.level1.should.have.property("prop").equal("config");
      config.level1.should.have.property("array").eql(["config"]);
    });

    describe("default file in .js", function() {
      var tempPath;

      afterEach(function() {
        delete require.cache[require.resolve("../tmp/config-js/default")];
        fs.unlinkSync(tempPath);
      });

      it("supports a default.js for default config", function () {
        // create default config file
        tempPath = path.join(__dirname, "../tmp/config-js/default.js");
        fs.writeFileSync(tempPath, "module.exports = { newJsProp: true };");
        // init config
        var config = require("../index");
        config.prop.should.eql("from config");
        config.overridden.should.eql("from .env");
        config.newJsProp.should.eql(true);
      });

      it("should merge config with default file", function() {
        // create default config file
        tempPath = path.join(__dirname, "../tmp/config-js/default.js");
        fs.writeFileSync(tempPath, "module.exports = { level1: { array: [\"default\"], level2: { default: true } } };");
        // init config
        var config = require("../index");
        config.level1.should.have.property("level2").eql({
          default: true,
          config: true
        });
        config.level1.should.have.property("array").eql(["config"]);
      });
    });
  });
});

function createTempFiles() {
  try {
    fs.mkdirSync(path.join(__dirname, "../tmp"));
  } catch(e) {
    if ( e.code !== "EEXIST" ) throw e;
  }

  try {
    fs.mkdirSync(path.join(__dirname, "../tmp/config"));
  } catch(e) {
    if ( e.code !== "EEXIST" ) throw e;
  }

  var originalPath = path.join(__dirname, "../index.js");
  var tempPath = path.join(__dirname, "../tmp/index.js");
  fs.writeFileSync(tempPath, fs.readFileSync(originalPath));

  originalPath = path.join(__dirname, "../config/template.json");
  tempPath = path.join(__dirname, "../tmp/config/development.json");
  fs.writeFileSync(tempPath, fs.readFileSync(originalPath));

  originalPath = path.join(__dirname, "../.env");
  tempPath = path.join(__dirname, "../tmp/.env");
  fs.writeFileSync(tempPath, fs.readFileSync(originalPath));

  tempPath = path.join(__dirname, "../tmp/.test-env");
  fs.writeFileSync(tempPath, "overridden=\"from .test-env\"");
}
