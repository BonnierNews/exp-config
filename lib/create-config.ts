import path from "path";
import { deepmergeCustom } from "deepmerge-ts";
import { parse } from "dotenv";

import { Env, Delimiter, Build } from "./internal/constants.js";
import { parseObject } from "./internal/helpers/parse-object.js";
import { readFileSync, readJs, readJson } from "./internal/helpers/fs.js";
import { flattenObject, type FlattenObject } from "./helpers/flatten-object.js";
import { sortObject } from "./helpers/sort-object.js";

const customMerge = deepmergeCustom({ mergeArrays: false });

/**
 * Creates an environment config object from JSON configuration files.
 *
 * Returns an object with the properties:
 *
 * `config`: the parsed environment configuration
 *
 * `flatConfig`: a flattened version of the environment configuration
 *
 * ```ts
 * import createConfig from "exp-config/create-config";
 *
 * createConfig(); // {  config: { envName: "development" }, flatConfig: { "envName": "development" } }
 * ```
 * @since v5.0.0
 */
function createConfig<T extends Record<string, unknown>>(args?: Pick<ApiArgs,
  "allowTestEnvOverride" |
  "basePath" |
  "configToMerge" |
  "delimiter" |
  "envName" |
  "envPath" |
  "envPrefix" |
  "interpretCharAsDot"
>): {
  flatConfig: FlattenObject<T>,
  config: Config<T>
} {
  const allowTestEnvOverride = args?.allowTestEnvOverride || process.env.ALLOW_TEST_ENV_OVERRIDE?.toLowerCase() === "true",
    basePath = args?.basePath || process.env.CONFIG_BASE_PATH || process.cwd(),
    configToMerge = args?.configToMerge,
    delimiter = args?.delimiter || Delimiter,
    envName = args?.envName || process.env.NODE_CONFIG_ENV || process.env.NODE_ENV || Env.Development,
    envPath = args?.envPath || process.env.ENV_PATH,
    envPrefix = args?.envPrefix || process.env.ENV_PREFIX,
    interpretCharAsDot = args?.interpretCharAsDot || process.env.INTERPRET_CHAR_AS_DOT;

  const build = [
    envName === Env.Test && !allowTestEnvOverride && Build.Test,
    envName === Env.Test && allowTestEnvOverride && Build.TestAndHonorNodeEnv,
  ].filter(Boolean)[0] || Build.Default;

  const file = {
    env: path.join(basePath, envPath ?? ".env"),
    jsDefault: path.join(basePath, "config", `${Env.Default}.js`),
    jsEnv: path.join(basePath, "config", `${envName}.js`),
    jsonDefault: path.join(basePath, "config", `${Env.Default}.json`),
    jsonEnv: path.join(basePath, "config", `${envName}.json`),
  };

  const defaultConfig = customMerge(...[
    readJson(file.jsonDefault),
    readJs(file.jsDefault),
    readJs(file.jsEnv),
    readJson(file.jsonEnv),
    configToMerge,
    { envName },
  ].filter(Boolean)) as Record<string, unknown> & Pick<Config<T>, "envName">;

  let config = {};

  switch (build) {
    case Build.Test: {
      config = defaultConfig;
      break;
    }
    case Build.Default:
    case Build.TestAndHonorNodeEnv: {
      const allowedKeys = new Set<string>([
        Object.keys(defaultConfig),
        Object.keys(flattenObject((defaultConfig), delimiter)),
      ].flat(Infinity) as string[]);

      const nodeEnvObj = parseObject({
        allowedKeys,
        delimiter,
        envPrefix,
        interpretCharAsDot,
        obj: process.env,
      });

      switch (build) {
        case Build.TestAndHonorNodeEnv: {
          config = customMerge(
            defaultConfig,
            nodeEnvObj.allow,
            nodeEnvObj.excluded
          );
          break;
        }
        case Build.Default: {
          const dotEnvContent = readFileSync(file.env);
          const dotEnvObj = !dotEnvContent
            ? { allow: {}, excluded: {} }
            : parseObject({
              allowedKeys,
              delimiter,
              envPrefix,
              interpretCharAsDot,
              obj: parse(dotEnvContent),
            });

          config = customMerge(defaultConfig,
            dotEnvObj.allow,
            dotEnvObj.excluded,
            nodeEnvObj.allow,
            nodeEnvObj.excluded
          );
          break;
        }
      }
      break;
    }
    default: {
      throw new Error("Unreachable but reality disagrees sometimes ¯\\_(ツ)_/¯");
    }
  }

  const flatConfig = flattenObject((config), delimiter);

  return {
    config: sortObject(config) as Config<T>,
    flatConfig: sortObject(flatConfig) as FlattenObject<T>,
  };
}

interface ApiArgs {
  allowTestEnvOverride?: boolean
  basePath?: string
  configToMerge?: Record<string, unknown>
  delimiter?: string,
  interpretCharAsDot?: string
  envPath?: string
  envName?: string
  envPrefix?: string
}

type Config<T extends Record<string, unknown>> = { envName: string } & T

export type {
  ApiArgs,
  Config,
  FlattenObject,
};

export { createConfig };
