import { build, type Format } from "esbuild";
import fsp from "fs/promises";
import path from "path";
import ts from "typescript";

import { paths } from "../lib/internal/helpers/paths.js";
import { writeRecursively } from "../lib/internal/helpers/fs.js";

async function esbuild(entryPoints: string[]) {
  await Promise.all(([
    {
      banner: {
        // https://github.com/evanw/esbuild/issues/1944
        js: "import \"dotenv/config\"; import { createRequire } from \"module\"; const require = createRequire(import.meta.url);",
      },
      format: "esm" as Format,
    },
    {
      format: "cjs" as Format,
      outExtension: { ".js": ".cjs" },
    },
  ]).map(async (args) => {
    await build({
      ...args,
      entryPoints,
      outdir: paths.distDir,
      allowOverwrite: true,
      bundle: true,
      external: [ "typescript" ],
      platform: "node",
    });
  }));

}

async function buildScripts() {
  try {
    await fsp.rm(paths.distDir, { recursive: true });
  } catch { /* */ }

  const files = await fsp.readdir(paths.libDir, { withFileTypes: true, recursive: true });

  const entryPoints = files.reduce((prev, curr) => {
    if (!curr.isFile()) return prev;
    if (curr.parentPath.includes("internal")) return prev;
    if (curr.name === "types.ts") return prev;

    prev.push(path.join(curr.parentPath, curr.name));
    return prev;
  }, [] as string[]);

  await esbuild(entryPoints);

  const program = ts.createProgram(entryPoints, {
    declaration: true,
    declarationDir: paths.distDir,
    declarationMap: true,
    emitDeclarationOnly: true,
    esModuleInterop: true,
    sourceMap: true,
    skipLibCheck: true,
  });

  program.emit(undefined, (outputPath, content) => {
    if (outputPath.includes("internal")) return;

    writeRecursively(outputPath, content);
  });
}

await buildScripts();
