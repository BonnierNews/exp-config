import Mocha from "mocha";
import process from "node:process";
import fsp from "fs/promises";
import path from "path";
import { should } from "chai";

import { paths } from "../lib/internal/helpers/paths.js";

should();

const mocha = new Mocha({
  rootHooks: {
    beforeEach() {
      void [
        "ALLOW_TEST_ENV_OVERRIDE",
        "CONFIG_BASE_PATH",
        "ENV_PATH",
        "ENV_PREFIX",
        "INTERPRET_CHAR_AS_DOT",
        "MY_ENV_nested_prop",
        "MY_ENV_overridden",
        "nested_nested_prop",
        "nested_prop",
        "nested_prop2",
        "nested.prop",
        "NODE_CONFIG_ENV",
        "NODE_ENV",
        "overridden",
        "prop",
      ].map((envVar) => delete process.env[envVar]);
    },
  },
  allowUncaught: false,
  bail: true,
  fullTrace: true,
  reporter: "spec",
  timeout: 20000,
});

const dirents = await fsp.readdir(paths.testDir, { withFileTypes: true, recursive: true });

for (const dirent of dirents) {
  if (dirent.name.endsWith(".test.ts")) mocha.addFile(path.join(dirent.parentPath, dirent.name));
}

await mocha.loadFilesAsync();

mocha.run((failures) => {
  process.exit(failures > 0 ? 1 : 0); // eslint-disable-line n/no-process-exit
});
