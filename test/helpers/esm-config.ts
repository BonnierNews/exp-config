import { createRequire } from "module";

import { paths } from "../../lib/internal/helpers/paths.js";

const require = createRequire(import.meta.url);

const getConfigFromDistEsm = <T = Record<string, unknown>>() => {
  const { config } = require(`${paths.distEsmConfig}?${new Date().getTime()}`); // eslint-disable-line import/no-dynamic-require
  return config as T;
};

export { getConfigFromDistEsm };
