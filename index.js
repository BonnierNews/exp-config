var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var _ = require("lodash");

var envName = process.env.NODE_ENV || "development";
var basePath = process.env.CONFIG_BASE_PATH || process.cwd();
var configDir = process.env.CONFIG_DIR || "config";
var defaultConfig = {};
var config = require(path.join(basePath, configDir, envName));

function applyDefault(config) {
  try {
      defaultConfig = require(path.join(basePath, configDir, "default"));
  } catch (e) {}
  return _.merge({}, defaultConfig, config);
}

function expandPath(name) {
  var current = config;
  var parts = name.split(/\./);
  var last = parts.pop();
  parts.forEach(function(part) {
    if (!current.hasOwnProperty(part)) {
      current[part] = {};
    }
    current = current[part];
  });
  return {
    current: current,
    last: last
  };
}

function setConfig(name, value) {
  var expanded = expandPath(name);
  if (/^(true|false)$/i.test(value)) value = (value.toLowerCase() === "true");
  expanded.current[expanded.last] = value;
}

config = applyDefault(config);

if (envName !== "test") {
  // Config from env file path have precedence over environment json config
  var envPath = process.env.ENV_PATH || ".env";
  var dotenvPath = path.join(basePath, envPath);
  if (fs.existsSync(dotenvPath)) {
    var dotenvConfig = dotenv.parse(fs.readFileSync(dotenvPath));
    Object.keys(dotenvConfig).forEach(function(key) {
      setConfig(key, dotenvConfig[key]);
    });
  }
}

if (envName !== "test" || process.env.ALLOW_TEST_ENV_OVERRIDE) {
  // Real env vars should have precedence over .env
  Object.keys(process.env).forEach(function(key) {
    setConfig(key, process.env[key]);
  });
}

config.envName = envName;

config.boolean = function(name) {
  var expanded = expandPath(name);
  var value = expanded.current[expanded.last];
  return (value === true) || (value === "true");
};

module.exports = config;
