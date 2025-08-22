import { createConfig } from "./create-config.js";

type ConfigLegacy = {
  boolean: (name: string) => boolean | unknown
  envName: string,
  expandPath: (name: string) => { current: unknown, last?: string}
} & Record<string, unknown>

const configs = createConfig();

const config = configs.config as ConfigLegacy;
const flatConfig = configs.flatConfig;

// TODO: No automated tests yet—manually verify correctness
config.expandPath = (arg: string) => ({
  current: configs.flatConfig[arg],
  last: arg?.split(".").at(-1),
});

// TODO: No automated tests yet—manually verify correctness
config.boolean = (arg: string) => configs.flatConfig[arg];

export {
  config,
  flatConfig,
};

export type { ConfigLegacy };
