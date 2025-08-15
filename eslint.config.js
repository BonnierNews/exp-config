import config from "@bonniernews/eslint-config";
import eslintPluginFilenameRules from "eslint-plugin-filename-rules";

eslintPluginFilenameRules.rules.match.meta.schema = false;

export default [
  ...config,
  { ignores: [ "**/dist/**", "**/tmp/**" ] },
  {
    files: [ "**/*.ts" ],
    rules: { "import/no-unresolved": [ "error", { ignore: [ "^\\..*\\.js$" ] } ] },
  },
  {
    files: [ "./config/template.js" ],
    rules: { strict: "off", "import/no-commonjs": "off" },
  },
  {
    plugins: { "filename-rules": eslintPluginFilenameRules },
    rules: { "filename-rules/match": [ 2, "kebab-case" ] },
  },
];
