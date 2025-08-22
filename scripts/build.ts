import { build, type Format } from "esbuild";
import fsp from "fs/promises";
import path from "path";
import ts from "typescript";
import { Buffer } from "node:buffer";

import { paths } from "../lib/internal/helpers/paths.js";
import { writeRecursively } from "../lib/internal/helpers/fs.js";

async function esbuild(entryPoints: string[]) {
  const esmRequireFiles = [ "config.js", "create-config.js" ];
  const esmRequire = Buffer.from([
    'import "dotenv/config";',
    'import { createRequire } from "module";',
    "let require = createRequire(import.meta.url);\n",
  ].join("\n"), "utf8");

  await Promise.all(([
    { format: "esm" as Format },
    { format: "cjs" as Format, outExtension: { ".js": ".cjs" } },
  ]).map(async (args) => {
    const results = await build({
      ...args,
      write: false,
      bundle: true,
      entryPoints,
      external: [ "typescript" ],
      outdir: paths.distDir,
      platform: "node",
    });

    for (const out of results.outputFiles) {
      writeRecursively(
        out.path,
        args.format === "esm" && esmRequireFiles.includes(path.basename(out.path))
          ? Buffer.concat([ esmRequire, out.contents ]) // https://github.com/evanw/esbuild/issues/1944;
          : out.contents
      );
    }
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
