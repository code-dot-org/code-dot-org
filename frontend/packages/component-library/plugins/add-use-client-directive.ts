import {relative} from 'node:path';
import type {Options} from 'tsup';

// Set to track the imports of each code chunk.
const trackedImports = new Set<string>();

// String directive for indicating a client-side component.
const USE_CLIENT_DIRECTIVE = '"use client"';

// Regular expression to detect React hooks and event handlers, excluding any occurrences within comments.
const HOOK_OR_EVENT_REGEX =
  /(?<!\/\/.*)(?<!\/\*[\s\S]*?\*\/)(?<!['"])\b(?<hookOrEvent>(?<hookOrEventName>use[A-Z]\w*\s*\(.*\)|on[A-Z]\w*)\s*\(?.*\)?|import\s*{[^}]*\buse[A-Z]\w*\b[^}]*})(?!['"])/;

/**
 * Checks if the provided content includes any of the given client libraries or
 * if it contains any React hooks.
 *
 * @param content - The string content to be checked for client libraries or
 *   hooks.
 * @param clientLibs - An array of client library names to check against the
 *   content.
 * @returns `true` if the content includes any of the client libraries or if it
 *   contains any hooks, otherwise `false`.
 */
function containsClientLibsOrHooks(
  content: string,
  clientLibs: RegExp | undefined,
): boolean {
  return clientLibs?.test(content) || HOOK_OR_EVENT_REGEX.test(content);
}

/**
 * Builds a regex to match any of the given client libraries.
 *
 * @param clientLibs - An array of strings representing client libraries.
 * @returns A regex pattern matching any of the provided client libraries.
 */
function buildClientLibsRegex(
  clientLibs: string[] | undefined,
): RegExp | undefined {
  if (!clientLibs || clientLibs.length === 0) {
    return undefined;
  }

  // Escape special characters in each library name to safely use in regex.
  const escapedLibs = clientLibs.map(lib =>
    lib.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`),
  );

  // Return a regex pattern that matches any of the provided client libraries.
  return new RegExp(`(?:${escapedLibs.join('|')})`);
}

/**
 * Adds a "use client" directive to the given code based on the specified
 * client libraries.
 *
 * @param clientLibs - An array of strings representing the client libraries
 *   that should trigger the addition of "use client" directives.
 * @returns A plugin object that contains a `renderChunk` method to process and
 *   potentially modify the code chunks.
 */
export function addUseClientDirective(
  clientLibs?: string[],
): NonNullable<Options['plugins']>[number] {
  const clientLibsRegex = buildClientLibsRegex(clientLibs);

  return {
    name: 'add-use-client-directive',
    renderChunk: (code, {imports, map, path}) => {
      const relativePath = relative(process.cwd(), path);

      // Check if the code already contains the "use client" directive.
      if (code.startsWith(USE_CLIENT_DIRECTIVE)) {
        const importLength = imports ? imports.length : 0;

        // Record the imports of the current chunk to avoid duplication.
        for (let i = 0; i < importLength; i++) {
          const currentImport = imports?.[i];

          // Add the current import path to the tracked imports.
          if (currentImport) {
            trackedImports.add(currentImport.path);
          }
        }

        // Return the original code if the directive is already present.
        return {code, map};
      }

      // If the current path has not been tracked, return unchanged code.
      if (!trackedImports.has(relativePath)) {
        return {code, map};
      }

      // Remove the current path from the tracked imports.
      trackedImports.delete(relativePath);

      // Check if the code contains any client libraries or hooks.
      if (containsClientLibsOrHooks(code, clientLibsRegex)) {
        // Add the "use client" directive to the code.
        return {
          code: `${USE_CLIENT_DIRECTIVE};${code}`,
          map,
        };
      }

      // Return the original code if no client libraries or hooks were found.
      return {code, map};
    },
  };
}
