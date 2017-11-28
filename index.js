"use strict";

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const merge = require("lodash.merge");

const envName = process.env.NODE_ENV || "development";
const basePath = process.env.CONFIG_BASE_PATH || process.cwd();
const prefix = process.env.ENV_PREFIX;
const charToConvert = process.env.CONVERT_CHAR_TO_DOTS;
let defaultConfig = {};
let config = require(path.join(basePath, "config", envName));

function applyDefault(sourceConfig) {
  try {
      defaultConfig = require(path.join(basePath, "config", "default"));
  } catch (e) {} // eslint-disable-line
  return merge({}, defaultConfig, sourceConfig);
}

function expandPath(name) {
  let current = config;
  const parts = name.split(/\./);
  const last = parts.pop();
  parts.forEach((part) => {
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
  const expanded = expandPath(name);
  if (/^(true|false)$/i.test(value)) value = (value.toLowerCase() === "true");
  expanded.current[expanded.last] = value;
}

config = applyDefault(config);

if (envName !== "test") {
  // Config from env file path have precedence over environment json config
  const envPath = process.env.ENV_PATH || ".env";
  const dotenvPath = path.join(basePath, envPath);
  if (fs.existsSync(dotenvPath)) {
    const dotenvConfig = dotenv.parse(fs.readFileSync(dotenvPath));
    Object.keys(dotenvConfig).forEach((key) => {
      setConfig(key, dotenvConfig[key]);
    });
  }
}

if (envName !== "test" || process.env.ALLOW_TEST_ENV_OVERRIDE) {
  // Real env vars should have precedence over .env
  Object.keys(process.env).forEach((key) => {
    setConfig(convertKey(key), process.env[key]);
  });
}

function convertKey(key) {
    const envKey = prefix ? key.replace(prefix, "") : key;
    const replacedEnvKey = charToConvert ? envKey.replace(new RegExp(charToConvert, "g"), ".") : envKey;
    if (existsInConfig(replacedEnvKey) && !process.env[replacedEnvKey]) {
      return replacedEnvKey;
    }
    return envKey;
}

function existsInConfig(key) {
    const parts = key.split(".");
    let current = config;
    const last = parts.pop();
    parts.forEach((part) => {
      if (current.hasOwnProperty(part)) {
        current = current[part];
      }
    });
    return current.hasOwnProperty(last);
}


config.envName = envName;

config.boolean = function (name) {
  const expanded = expandPath(name);
  const value = expanded.current[expanded.last];
  return (value === true) || (value === "true");
};

module.exports = config;
