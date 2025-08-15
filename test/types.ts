import defaultConfigJson from "../config/default.json" with { type: "json"};
import development from "../config/development.json" with { type: "json"};

export type ConfigDefaultMock = typeof defaultConfigJson
export type ConfigDevelopmentMock = typeof development
