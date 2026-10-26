// What World Lab tells the tutor about the project.
//
// A world project is not text. Web Lab's files are HTML and CSS, which a model
// reads as-is; a `.world`, `.actor` or `.rule` is a serialized Blockly
// workspace. So the question is which serialization to send, and the answer is
// different per file kind — because their sizes differ by three orders of
// magnitude. Measured on the starter project:
//
//     solid.rule       390,714      player.actor      5,310
//     gravity.rule     145,790      healthBar.actor   9,773
//     collisions.rule  122,117      coin.actor          588
//     health.rule       72,968      ball.actor          358
//     ────────────────────────      main.world          790
//     all rules        ~950,000     all actors+world  ~24,000
//
// ACTORS AND WORLDS GO AS THEY ARE. Twenty-four thousand characters for the
// whole project, and it is the form the agent has to write back, so sending
// anything else would mean asking it to author a shape it has never seen.
//
// RULES GO AS METADATA (`ruleSummary`). The big ones are machine-generated from
// `scripts/rules/*.mjs` and no context is worth 390,000 characters of one. It
// is also the wrong content: what a student needs from `Gravity` is that
// electing "Falls" makes a thing fall and that it raises `starts falling` — not
// the four hundred blocks behind that. What the game does, not how it works.
//
// AND THE BLOCK CATALOGUE, so the agent can write blocks that exist
// (`blockCatalogue`).
//
// AND THE MEASUREMENTS (`worldMeasurements`), because a model shown
// `set position x 208 y 112` and told nothing else asks how big a tile is —
// or, worse, assumes 16.

import type {AiTutorContext} from '@code-dot-org/aitutor';

import type {RuleMeta} from '../blockly/ruleMeta';

import {blockCatalogue} from './blockCatalogue';
import {worldMeasurements} from './measurements';
import {importableRules} from './ruleShelf';
import {summarizeRules} from './ruleSummary';

/** Kinds whose workspace is small enough to send whole. */
const SENT_WHOLE = ['world', 'actor'];

/** Editable files that are already text a model can read. */
const READABLE_TYPES = ['js', 'ts', 'json', 'md', 'txt'];

/**
 * A ceiling on any single workspace, in characters.
 *
 * Actors are hundreds to low thousands; the biggest in the starter project is
 * under ten thousand. A file past this is not the kind of thing this budget was
 * measured against — a generated actor, or a rule mis-named — and sending it
 * would crowd out everything else. Named rather than dropped, so the tutor can
 * say it did not look.
 */
export const MAX_FILE_CHARS = 24_000;

/** A ceiling on everything, so one enormous project cannot fill the window. */
export const MAX_CONTEXT_CHARS = 120_000;

const extensionOf = (path: string): string =>
  path.split('.').pop()?.toLowerCase() ?? '';

const fence = (contents: string, language = '') =>
  `\`\`\`${language}\n${contents}\n\`\`\``;

export interface WorldContextFacts {
  /** Every project file, by path. */
  files: Record<string, string>;
  /** The rules the project has, as the editor builds them for its palette. */
  rules: readonly RuleMeta[];
  longInstructions?: string;
  consoleOutput?: string;
  hasRun?: boolean;
  hasEdited?: boolean;
}

/**
 * The project, told in three registers.
 *
 * Order matters: the rules first, because they are the vocabulary everything
 * else is written in; then the actors and world, which are what the student
 * actually built; then the catalogue, which is reference material and the
 * least likely thing to need re-reading.
 */
export const worldSourceCode = ({
  files,
  rules,
}: Pick<WorldContextFacts, 'files' | 'rules'>): string | undefined => {
  const sections: string[] = [];
  let budget = MAX_CONTEXT_CHARS;

  const add = (text: string): boolean => {
    if (text.length > budget) {
      return false;
    }
    budget -= text.length;
    sections.push(text);
    return true;
  };

  if (rules.length) {
    add(
      '# The rules this project has\n\n' +
        'Each is a mechanic an actor opts into by electing one of its traits. ' +
        'Their blocks are in the catalogue below; their implementations are not ' +
        'shown, and you do not need them.\n\n' +
        summarizeRules(rules),
    );
  }

  // Straight after the rules the project HAS, because the two are one subject:
  // here is your vocabulary, and here is what else you may send for.
  const shelf = importableRules(rules);
  if (shelf) {
    add(shelf);
  }

  const workspaces: string[] = [];
  const tooBig: string[] = [];
  const readable: string[] = [];
  const worlds: Record<string, string> = {};

  for (const path of Object.keys(files).sort()) {
    const extension = extensionOf(path);
    const contents = files[path];
    if (!contents?.trim()) {
      continue;
    }
    if (extension === 'world') {
      worlds[path] = contents;
    }
    if (SENT_WHOLE.includes(extension)) {
      if (contents.length > MAX_FILE_CHARS) {
        tooBig.push(path);
        continue;
      }
      workspaces.push(`### ${path}\n${fence(contents, 'json')}`);
    } else if (READABLE_TYPES.includes(extension)) {
      readable.push(`### ${path}\n${fence(contents)}`);
    }
  }

  // Before the workspaces, because it is how to read them: a position in one
  // of those files is a number that means nothing without this.
  const measurements = worldMeasurements(worlds);
  if (measurements) {
    add(measurements);
  }

  if (workspaces.length) {
    add(
      '# The actors and worlds the student built\n\n' +
        'These are Blockly workspaces, exactly as stored. This is the form to ' +
        'write back when proposing a change.\n\n' +
        workspaces.join('\n\n'),
    );
  }
  if (tooBig.length) {
    add(`Not shown, too large to send: ${tooBig.join(', ')}.`);
  }
  if (readable.length) {
    add('# Other files\n\n' + readable.join('\n\n'));
  }

  const catalogue = blockCatalogue(rules);
  add(
    '# Every block available in this project\n\n' +
      '`says` is the sentence on the block, with `%1`, `%2` … marking its ' +
      'sockets in order; `args` names them. Use no type that is not here.\n\n' +
      fence(JSON.stringify(catalogue), 'json'),
  );

  return sections.length ? sections.join('\n\n') : undefined;
};

export const worldContext = ({
  files,
  rules,
  longInstructions,
  consoleOutput,
  hasRun,
  hasEdited,
}: WorldContextFacts): AiTutorContext => ({
  sourceCode: worldSourceCode({files, rules}),
  longInstructions,
  consoleOutput,
  hasRun,
  hasEdited,
});

/**
 * What the tutor is told about the medium, once per turn.
 *
 * Without it a model reads JSON and answers about JSON. With it, it answers
 * about blocks — and knows that when it proposes a change, the change is a
 * whole workspace file.
 */
export const WORLD_SYSTEM_PROMPT = [
  'You are helping a student build a game out of BLOCKS, in a visual editor.',
  'They never type code. Everything you are shown is the blocks, serialized.',
  '',
  'A `.world` file defines the world and what is in it. An `.actor` defines a',
  'kind of thing in the world. A `.rule` defines a mechanic that actors opt',
  'into by electing one of its traits — you are shown what each rule offers,',
  'not how it is built, and that is all you need.',
  '',
  'Talk in blocks, never in code. "Add a `when Player touches Coin` handler to',
  'your Player actor" is useful; "change line 12" is not, because there are no',
  'lines.',
  '',
  'HOW TO CHANGE SOMETHING. Answer with type `buildActor`, `buildWorld` or',
  '`buildRule`, and put the WHOLE file in `code` — `filename` is its path and',
  '`sourceCode` is the entire workspace, in the same shape as the ones you were',
  'shown. Never a fragment and never a diff. Use only block types from the',
  'catalogue.',
  '',
  'A workspace written anywhere else cannot be applied. Pasted into your',
  'explanation it is just text on the screen: the student gets no button, and',
  'no way to use it except to retype it by hand. If you have written a file,',
  'it goes in `code`.',
  '',
  'REACH FOR A RULE BEFORE BUILDING ONE. Most of what a game needs already',
  'exists as a mechanic an actor can elect, including mechanics this project has',
  'not imported yet — they are listed for you. Electing “Stays Across” is a',
  'better answer than a wall of tiles round the edge of the map, and saying so',
  'teaches the student something the tiles do not.',
  '',
  'If you are not confident the workspace you would write is valid, explain the',
  'change in words instead and do not claim a rewrite — a broken file loses the',
  'student their work, and an explanation never does.',
].join('\n');
