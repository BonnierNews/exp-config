var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var _ = require("lodash");

var envName = process.env.NODE_ENV || "development";
var basePath = process.env.CONFIG_BASE_PATH || process.cwd();
var defaultConfig = {};
var config = require(path.join(basePath, "config", envName));

function applyDefault(config) {
  try {
    var hasDefaultConf = fs.statSync(path.join(basePath, "config", "default.json"));
    if (hasDefaultConf.isFile()) {
      defaultConfig = require(path.join(basePath, "config", "default.json"));
    }
  } catch (e) {}
  return _.assign({}, defaultConfig, config);
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
  expanded.current[expanded.last] = value;
}

config = applyDefault(config);

if (envName !== "test") {
  // Config from .env file have precedence over environment json config
  var dotenvPath = path.join(basePath, ".env");
  if (fs.existsSync(dotenvPath)) {
    var dotenvConfig = dotenv.parse(fs.readFileSync(dotenvPath));
    Object.keys(dotenvConfig).forEach(function(key) {
      setConfig(key, dotenvConfig[key]);
    });
  }

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
