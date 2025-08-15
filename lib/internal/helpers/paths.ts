import { fileURLToPath } from "node:url";
import path from "path";

const getDirPath = (metaUrl = import.meta.url) => path.dirname(fileURLToPath(metaUrl));

const rootDir = path.resolve(getDirPath(), "..", "..", "..");

const paths = {
  configDir: path.join(rootDir, "config"),
  distDir: path.join(rootDir, "dist"),
  distEsmConfig: path.join(rootDir, "dist", "config.js"),
  entry: path.join(rootDir, "app.ts"),
  env: path.join(rootDir, ".env"),
  libDir: path.join(rootDir, "lib"),
  rootDir,
  testDir: path.join(rootDir, "test"),
  tmpDir: path.join(rootDir, "tmp"),
};

export {
  paths,
  getDirPath,
};
