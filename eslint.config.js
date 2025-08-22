import globals from "globals";
// @ts-ignore
import config from "@bonniernews/eslint-config";
// @ts-ignore
import tsConfig from "@bonniernews/eslint-config/ts";
// @ts-ignore
import eslintPluginFilenameRules from "eslint-plugin-filename-rules";

eslintPluginFilenameRules.rules.match.meta.schema = false;

export default [
  ...config,
  {
    ...tsConfig,
    rules: {
      ...tsConfig.rules,
      "import/no-unresolved": [ "off" ], // using typescript to resolve paths
    },
  },
  { ignores: [ "**/dist/**", "**/tmp/**" ] },
  {
    plugins: { "filename-rules": eslintPluginFilenameRules },
    rules: { "filename-rules/match": [ 2, "kebab-case" ] },
  },
  {
    files: [ "**/test/*.cjs", "./config/template.js" ],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.mocha },
    },
    rules: {
      strict: "off",
      "import/no-commonjs": "off",
      "import/no-dynamic-require": "off",
    },
  },
];
