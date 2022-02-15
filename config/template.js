"use strict";

module.exports = {
  prop: "from config",
  level1: {
    prop: "config",
    array: [ "config" ],
    level2: { config: true },
  },
  overridden: "from config.js",
};
