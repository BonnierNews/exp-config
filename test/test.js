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
}
