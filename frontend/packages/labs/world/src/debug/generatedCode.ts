// What the JavaScript panel has to say about a file.
//
// A World project is not JavaScript on disk: an `.actor` is a serialized
// Blockly workspace — block ids, coordinates and field values — and the
// JavaScript it becomes is made on the way to the compiler. This is the
// decision of WHAT to show for the file a learner is looking at, kept apart
// from the panel that shows it so the three answers can be tested as three
// answers.
//
// The generation itself is the runtime's (`runtime/WorldRuntimeContext`
// `generateFile`), which loads the file into a headless workspace and emits its
// module. It throws for JSON that will not parse, a block type nothing defines,
// or a root the file's kind forbids — all of which a learner can produce, and
// none of which they can see today except as the whole project failing to run.

import {fileKindOf} from '../blockly/fileKind';

/** What to put in the panel. */
export type CodeView =
  /** The file's module, as the compiler will see it. */
  | {kind: 'code'; code: string}
  /** The file is Blockly-authored and did not generate. */
  | {kind: 'error'; message: string}
  /** There is nothing to generate, which is not a fault. */
  | {kind: 'none'; reason: string};

/** How the runtime generates one file. */
export type GenerateOne = (contents: string, path: string) => string;

/**
 * The panel's contents for one file.
 *
 * `path` and `contents` are the active file's, or undefined when no file is
 * open. `generate` is the runtime's `generateFile`.
 */
export function generatedCodeFor(
  path: string | undefined,
  contents: string | undefined,
  generate: GenerateOne,
): CodeView {
  if (path === undefined || contents === undefined) {
    return {
      kind: 'none',
      reason: 'Open a file to see the JavaScript it makes.',
    };
  }
  // The same question the compiler asks of a path, from the same place
  // (`WorldRuntimeContext.isBlocklyPath`). A `.js` file in a World project is
  // already the code — showing a copy of it beside itself says nothing — and a
  // `.png` is not code at all.
  if (fileKindOf(path) === undefined) {
    return {
      kind: 'none',
      reason: `${path} is not made from blocks, so there is nothing to generate.`,
    };
  }
  try {
    return {kind: 'code', code: generate(contents, path)};
  } catch (thrown) {
    return {
      kind: 'error',
      message: thrown instanceof Error ? thrown.message : String(thrown),
    };
  }
}
