/**
 * Late binding to `@code-dot-org/authoring`.
 *
 * The package is authored in parallel with this service and resolves through
 * its `dist/`, so it is unimportable until it builds. Resolving it at boot
 * instead of importing it statically means the service still serves state,
 * widgets, chat and the level catalog meanwhile — the parts that need it
 * degrade to a loud error rather than a failed process start.
 *
 * The specifiers are held in variables so TypeScript does not resolve them at
 * compile time. Swap these for static imports once the package has landed.
 */

import type {
  ApplyChange,
  LoadedCourse,
  ParseLevelXml,
  PatchLevelFile,
} from './model.js';

const AUTHORING = '@code-dot-org/authoring';
const AUTHORING_NODE = '@code-dot-org/authoring/node';

export interface AuthoringBridge {
  applyChange: ApplyChange;
  parseLevelXml?: ParseLevelXml;
  patchLevelFile?: PatchLevelFile;
  loadCourse?: (
    repoRoot: string,
    courseName: string,
  ) => LoadedCourse | Promise<LoadedCourse>;
  /** False when the package could not be resolved; the ops above then throw. */
  available: boolean;
}

const unavailable: ApplyChange = () => {
  throw new Error(
    '@code-dot-org/authoring is not installed; curriculum mutation is unavailable',
  );
};

async function importOptional(
  specifier: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    return (await import(specifier)) as Record<string, unknown>;
  } catch (error) {
    console.warn(
      `[authoring-service] could not load ${specifier}: ${String(error)}`,
    );
    return undefined;
  }
}

export async function loadAuthoringBridge(): Promise<AuthoringBridge> {
  const [core, node] = await Promise.all([
    importOptional(AUTHORING),
    importOptional(AUTHORING_NODE),
  ]);

  const applyChange = core?.applyChange as ApplyChange | undefined;
  if (!applyChange) {
    console.warn(
      '[authoring-service] running WITHOUT @code-dot-org/authoring: no course ' +
        'import, no level resolution, curriculum changes will be rejected',
    );
  }

  return {
    applyChange: applyChange ?? unavailable,
    parseLevelXml: core?.parseLevelXml as ParseLevelXml | undefined,
    patchLevelFile: core?.patchLevelFile as PatchLevelFile | undefined,
    loadCourse: node?.loadCourse as AuthoringBridge['loadCourse'],
    available: Boolean(applyChange),
  };
}
