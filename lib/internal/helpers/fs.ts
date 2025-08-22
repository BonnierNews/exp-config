import fs from "fs";
import fsp from "fs/promises";
import path from "path";

function readFileSync(arg: string): null | string {
  if (!fs.existsSync(arg)) return null;

  return fs.readFileSync(arg, "utf8");
}

function readJs(arg: string): null | Record<string, unknown> {
  if (!fs.existsSync(arg)) return null;

  const content = require(arg); // eslint-disable-line import/no-dynamic-require, @typescript-eslint/no-var-requires

  return content || {};
}

function readJson <T extends Record<string, unknown>>(arg: string): T | null {
  try {
    const content = readFileSync(arg);

    return content ? JSON.parse(content) as T : null;
  } catch (error: unknown) {
    console.error(`exp-config: Error reading JSON file at ${arg}:`, error); // eslint-disable-line no-console
    return null;
  }
}

function writeRecursively(arg: string, content: string | Uint8Array): void {
  fs.mkdirSync(path.dirname(arg), { recursive: true });
  fs.writeFileSync(arg, content);
}

async function copyRecursively({ source, destination }: {source: string, destination: string}) {
  const stat = await fsp.stat(source);

  if (stat.isDirectory()) {
    await fsp.mkdir(destination, { recursive: true });
    await fsp.cp(source, destination, { recursive: true });

    return;
  }
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  await fsp.copyFile(source, destination);
}

export {
  copyRecursively,
  readFileSync,
  readJson,
  readJs,
  writeRecursively,
};
