import createEnvConfig from "./create-config.js";

type ConfigLegacy = {
  boolean: (name: string) => boolean | unknown
  envName: string,
  expandPath: (name: string) => { current: unknown, last?: string}
} & Record<string, unknown>

const { config, flatConfig } = createEnvConfig();

// TODO: No automated tests yet—manually verify correctness
config.expandPath = (arg: string) => ({
  current: flatConfig[arg],
  last: arg?.split(".").at(-1),
});

// TODO: No automated tests yet—manually verify correctness
config.boolean = (arg: string) => flatConfig[arg];

/**
 * Return the environment configuration
 * ```js
 * import config from "exp-config/config.js";
 *
 * console.log(config);
 *
 *  * {
 *  *    boolean: (name) => boolean | unknown,
 *  *    envName: "development",
 *  *    expandPath: (name) => { current: unknown, last?: string
 *  * }
 * ```
 * @since v5.0.0
 */
export default config as ConfigLegacy;
