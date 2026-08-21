// What World Lab tells the tutor about the project.
//
// THE HARD PART IS THAT A WORLD PROJECT IS NOT TEXT. Web Lab's files are HTML,
// CSS and JavaScript — a model reads them as-is. A `.world`, `.actor` or `.rule`
// is a serialized Blockly workspace: block ids, x/y coordinates, field values,
// nested `inputs` maps. Sent raw it is enormous, mostly positional, and says
// almost nothing about what the program DOES.
//
// So the tutor is shown what the project GENERATES — the JavaScript the
// compiler builds and the sandbox runs (`runtime/WorldRuntimeContext`'s
// `generatedProject`). That is a real program describing real behaviour, and it
// is derived from the blocks by the same transform that makes the game run, so
// it cannot drift from what the student built.
//
// THE STUDENT CANNOT EDIT IT, and that is the thing the model must be told.
// They drag blocks; the JavaScript is an artifact they never see. A tutor that
// says "change line 12 of actors/player.js" has given a useless instruction.
// The system prompt below exists to prevent exactly that, and it is why this
// lab offers no code proposals at all (`useWorldTutor`).

import type {AiTutorContext} from '@code-dot-org/aitutor';

/** The Blockly-backed kinds, whose on-disk form is a workspace rather than code. */
const BLOCKLY_TYPES = ['world', 'actor', 'rule', 'behavior'];

/** Editable files whose contents are already prose or code the model can read. */
const READABLE_TYPES = ['js', 'ts', 'json', 'md', 'txt'];

/**
 * Kinds that generate nothing worth reading.
 *
 * A `.map` is a list of placements, a `.anim` a list of frames, an `.effect` a
 * shader graph, a `.sheet` an image's companion. All are data the game consumes
 * rather than behaviour the student wrote, and none of them explains why a game
 * is doing the wrong thing.
 */
const extensionOf = (path: string): string =>
  path.split('.').pop()?.toLowerCase() ?? '';

/**
 * How much generated code to send.
 *
 * A big world generates a lot, and the whole point of the context window is
 * that it is finite. Cut at a size that comfortably holds a starter project
 * whole; past it the model is told what was left out rather than silently
 * given a truncated program, because a program that stops mid-function reads
 * as a bug the student did not write.
 */
export const MAX_CONTEXT_CHARS = 60_000;

const fence = (contents: string) => `\`\`\`\n${contents}\n\`\`\``;

/**
 * The project as the model should see it: generated code, named by its source.
 *
 * Named by the file the STUDENT knows — `actors/player.actor`, not the module
 * path — so that when the tutor says "in your Player actor" the student knows
 * where to look.
 */
export const worldSourceCode = (
  generated: Record<string, string>,
): string | undefined => {
  const parts: string[] = [];
  let budget = MAX_CONTEXT_CHARS;
  const omitted: string[] = [];

  for (const path of Object.keys(generated).sort()) {
    const extension = extensionOf(path);
    if (
      !BLOCKLY_TYPES.includes(extension) &&
      !READABLE_TYPES.includes(extension)
    ) {
      continue;
    }
    const contents = generated[path];
    if (!contents?.trim()) {
      continue;
    }
    const kind = BLOCKLY_TYPES.includes(extension)
      ? `${path} (blocks, shown as the code they generate)`
      : path;
    const block = `filename: ${kind}\n${fence(contents)}`;
    if (block.length > budget) {
      omitted.push(path);
      continue;
    }
    budget -= block.length;
    parts.push(block);
  }

  if (omitted.length) {
    parts.push(
      `These files were left out because the whole project did not fit: ${omitted.join(', ')}. Ask the student to describe them if they matter.`,
    );
  }

  return parts.length ? parts.join('\n\n') : undefined;
};

/**
 * What the tutor is told about the medium, once per turn.
 *
 * Not a nicety. Without it a model reads JavaScript and answers about
 * JavaScript — line numbers, syntax, edits to files the student cannot open.
 */
export const WORLD_SYSTEM_PROMPT = [
  'You are helping a student who is building a game with BLOCKS, not with text.',
  'They drag blocks together in a visual editor. The code you are shown is',
  'GENERATED from those blocks by the lab; the student never sees it and cannot',
  'edit it.',
  '',
  'So: never tell them to edit a line, a file, or any JavaScript. Answer in',
  'terms of the blocks they work with — the actors they have defined, the rules',
  'those actors use, the traits a rule provides, the events a handler responds',
  'to. "Add a `when Player touches Coin` handler to your Player actor" is useful.',
  '"Change line 12 of actors/player.js" is not.',
  '',
  'A `.world` file defines the world and which actors are in it. An `.actor`',
  'defines a kind of thing in the world. A `.rule` defines a mechanic that',
  'actors opt into by electing one of its traits.',
].join('\n');

export interface WorldContextFacts {
  /** The project after `generatedProject` — Blockly files as their code. */
  generated: Record<string, string>;
  longInstructions?: string;
  /** The game's console output, most recent last. */
  consoleOutput?: string;
  /** Whether the game has been compiled and run at least once. */
  hasRun?: boolean;
  hasEdited?: boolean;
}

export const worldContext = ({
  generated,
  longInstructions,
  consoleOutput,
  hasRun,
  hasEdited,
}: WorldContextFacts): AiTutorContext => ({
  sourceCode: worldSourceCode(generated),
  longInstructions,
  consoleOutput,
  hasRun,
  hasEdited,
});
