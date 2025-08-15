import path from "path";
import ts from "typescript";

/**
 * Returns type declarations for the given obj value
 *
 * ```js
 * import generateTypeDeclarations from "exp-config/helpers/generate-type-declarations.js";
 *
 * const results = generateTypeDeclarations({
 *   obj: {
 *     prop: "value",
 *     level1: { level2: "nested value" },
 *     overridden: "from development.json",
 *   },
 *   name: "development",
 * });
 *
 * console.log(results);
 *
 *  *  export type DevelopmentType = typeof development;
 *  *  export declare const development: {
 *  *      prop: string;
 *  *      level1: {
 *  *          level2: string;
 *  *      };
 *  *      overridden: string;
 *  *  };
 * ```
* @since v5.0.0
 */
function generateTypeDeclarations(params: {
  obj: Record<string, unknown>,
  name: string
}): string | void {
  let results = "";

  const typeName = `${params.name[0].toUpperCase()}${params.name.substring(1)}Type`;
  const mockFile = path.join(process.cwd(), `exp-config-${Math.random().toString(36).substring(2, 15)}.ts`);

  const nodeEnvVarPattern = /^(_|npm|[A-Z])/;
  try {
    const config = JSON.stringify(params.obj, (key, value) => !nodeEnvVarPattern.test(key) && value);
    const content = `export type ${typeName} = typeof ${params.name};  export const ${params.name} = ${config};`;

    const host = ts.createCompilerHost({ declaration: true, emitDeclarationOnly: true });
    host.readFile = (fileName) => fileName === mockFile ? content : undefined;
    host.fileExists = (fileName) => fileName === mockFile;

    const program = ts.createProgram([ mockFile ], { declaration: true, emitDeclarationOnly: true }, host);
    program.emit(program.getSourceFile(mockFile), (_, arg) => {
      results = arg;
    });

    return results;
  } catch (error) {
    console.error("exp-config: Error generating TypeScript declarations:", error); // eslint-disable-line no-console
  }
}

export default generateTypeDeclarations;
