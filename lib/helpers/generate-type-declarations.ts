import ts from "typescript";

/**
 * Returns a TypeScript declaration string for a given object.
 *
 * Peer Dependency: `typescript`
 *
 * Example: Build a union type that models your application config to enable IntelliSense and compile-time checks.
 * ```ts
 * import { createConfig } from "exp-config/create-config";
 * import { generateTypeDeclarations } from "exp-config/helpers/generate-type-declarations";
 *
 * const envs = [ "development", "test" ];
 * const configType = `export type Config = ${envs.map((arg) => `typeof ${arg}`).join(" | ")};\n`;
 *
 * const value = envs.reduce((prev, env) => {
 *   process.env.NODE_ENV = env;
 *   return (prev + generateTypeDeclarations(env, createConfig()));
 * }, configType);
 * ```
 *
 * Value (_truncated for brevity_)
 * ```ts
 * export type Config = typeof development | typeof test;
 * declare const development: {
 *   config: {
 *       developmentService: string;
 *       envName: string;
 *   }
 * };
 * declare const test: {
 *   config: {
 *       envName: string;
 *       testService: string;
 *   }
 * };
 * ```
 * @since v5.0.0
 */
function generateTypeDeclarations(name: string, obj: Record<string, unknown>): string {
  const mockFile = "exp-config.ts";
  const nodeEnvVarPattern = /^(_|npm|[A-Z])/;

  let results = "";

  const host = ts.createCompilerHost({ declaration: true, emitDeclarationOnly: true });
  const orgReadFile = host.readFile;
  const orgFileExists = host.fileExists;

  host.fileExists = (file) => file === mockFile || orgFileExists.call(host, file);
  host.readFile = (file) => file === mockFile
    ? `const ${name} = ${JSON.stringify(obj, (key, val) => nodeEnvVarPattern.test(key) || typeof val === "function" ? undefined : val)};`
    : orgReadFile.call(host, file);

  const program = ts.createProgram([ mockFile ], { declaration: true, emitDeclarationOnly: true }, host);

  program.emit(program.getSourceFile(mockFile), (_, arg) => (results = arg));

  return results;
}

export { generateTypeDeclarations };
