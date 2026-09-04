// What a NEW file holds, given the name the learner typed.
//
// "New actor" used to write an empty file. Blockly opened it with a blank
// canvas, the learner dragged a `define actor` and typed the name a second
// time — and until they did, the project had an actor called `chaser.actor`
// and nothing that agreed. The menus name a file by what it DECLARES
// (specs/FILES.md), so a file that declared nothing was a file with no name in
// the only place that reads one.
//
// So one name, said once: it becomes the file's stem AND the thing's own name.
// `Coin Spin` writes `coinSpin.anim` holding `"name": "Coin Spin"` — the same
// pair an import leaves behind (`appearance/importStock`).
//
// A `.map` carries no name — it is an arrangement rather than a thing with one
// — but it is still seeded, with the empty map the editor would have made. A
// file created with no contents at all gets Codebridge's "Add your changes to
// …" placeholder, and that sentence inside a `.map` is a document nothing can
// parse.

import {createEffectDocument} from '../effect/model/document';
import {DEFAULT_MAP_SIZE, DEFAULT_TILE} from '../mapEditor/mapModel';

/** What a new file is made of: text, or bytes that live on a URL. */
export type Seed = {contents: string} | {url: string; mimeType: string};

/**
 * A blank 32 x 32 sprite: transparent, the size of a tile.
 *
 * Written out rather than drawn on a canvas at run time, because a canvas is a
 * browser and a seed is a value — this is the same encoder the stock sprites
 * come from (`scripts/generate-sprites`), run once.
 */
const BLANK_SPRITE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGkl' +
  'EQVR4nO3BAQEAAACCIP+vbkhAAQAAAO8GECAAARlDNO4AAAAASUVORK5CYII=';

/**
 * A rule, with the ceremony written for you.
 *
 * A rule is three sentences before it does anything: what it is called, what
 * carrying it is called, and when it runs. Left to a learner those are three
 * blocks to find, two names to invent and a phase to pick — which was enough
 * ceremony that the lab once grew a second file type, the `.behavior`, whose
 * whole purpose was to skip them (specs/BEHAVIORS.md). Nobody reached for it:
 * the lab's own authors wrote a `.rule` forty-seven times out of forty-seven,
 * and the one behavior that existed was the one written to demonstrate the
 * construct.
 *
 * So the sentences are pre-written instead. A new rule opens on `define rule
 * ⟨Bob⟩`, a `define trait ⟨Bob⟩ for actor` beside it, and `each frame during
 * decide` under the trait, and what a learner does is drop their blocks into
 * the mouth and give an actor `use trait ⟨Bob⟩`. One name, the same as a
 * behavior cost — and the two sentences it hid are on the screen to be read.
 *
 * The ability is seeded as the name, which is exactly what `parseRuleMeta`
 * falls back to when the field is empty. Left to the block's own default a new
 * rule called Bob read "which adds ability Has My Rule".
 *
 * The trait's step names no NAME and so takes the block's own placeholder:
 * seeding one would be inventing a second placeholder for the same thing.
 */
const newRule = (name: string): Seed => ({
  contents: `${JSON.stringify(
    {
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            x: 20,
            y: 20,
            fields: {NAME: name, ABILITY: name},
          },
          {
            type: 'world_rule_trait',
            x: 20,
            y: 120,
            fields: {NAME: name, SUBJECT: 'actor'},
            next: {
              block: {
                type: 'world_trait_step',
                fields: {PHASE: 'decide'},
              },
            },
          },
        ],
      },
    },
    null,
    2,
  )}\n`,
});

/** A Blockly file holding one root, named — what the editor opens onto. */
const rootNamed = (type: string, name: string): Seed => ({
  contents: `${JSON.stringify(
    {blocks: {blocks: [{type, x: 20, y: 20, fields: {NAME: name}}]}},
    null,
    2,
  )}\n`,
});

/**
 * What each kind of new file starts as, by extension.
 *
 * Undefined for a kind that starts empty — an extension absent from here makes
 * a file with no contents, which is what every `New` did before.
 */
export const seedFor = (extension: string, name: string): Seed | undefined => {
  switch (extension) {
    case 'world':
      return rootNamed('world_world', name);
    case 'actor':
      return rootNamed('world_actor', name);
    case 'rule':
      return newRule(name);
    case 'anim':
      // No animations in it yet — the editor adds the first one, and asks for
      // its id there. What this carries is the FILE's name.
      return {
        contents: `${JSON.stringify({type: 'animation', name, animations: {}}, null, 2)}\n`,
      };
    case 'effect':
      // A passthrough graph, which is what the effect editor makes for a new
      // one anywhere else: an effect that draws what it was given, and a place
      // to start changing that (`effect/model/document`).
      return {
        contents: `${JSON.stringify(createEffectDocument(name), null, 2)}\n`,
      };
    case 'map':
      // The empty map the editor would make, rather than nothing (see above).
      return {
        contents: `${JSON.stringify(
          {
            type: 'map',
            size: {...DEFAULT_MAP_SIZE},
            tile: {width: DEFAULT_TILE, height: DEFAULT_TILE},
            actors: [],
          },
          null,
          2,
        )}\n`,
      };
    case 'png':
      return {url: BLANK_SPRITE, mimeType: 'image/png'};
    default:
      return undefined;
  }
};

/**
 * The file name for a thing called `name` — `Health Bar` becomes `healthBar`.
 *
 * The house shape for a stem, which every shipped file already has: lower
 * camel, no spaces, nothing a path has to quote. The NAME the learner typed is
 * kept as they typed it, inside the file.
 */
export const fileStem = (name: string): string => {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  return words
    .map((word, at) =>
      at === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
};

/**
 * The same file, calling itself something else — what a CLONE writes.
 *
 * Rewrites the one name a file declares, wherever it keeps it: a Blockly
 * root's NAME field, or a document's own `name` (`authoredName` reads the same
 * two). Contents it does not recognise come back unchanged, so cloning a map
 * copies it and renames only the file.
 *
 * NOT a general rename. It runs on a copy nothing references yet, which is why
 * it can change a name without hunting for the blocks that say it — the reason
 * renaming an existing thing is a bigger job than this one.
 */
export const renamed = (contents: string, name: string): string => {
  const trimmed = contents.trim();
  if (!trimmed.startsWith('{')) {
    return contents;
  }
  try {
    const parsed = JSON.parse(trimmed) as {
      blocks?: {blocks?: Array<{type?: string; fields?: {NAME?: string}}>};
      name?: unknown;
    };
    const root = parsed.blocks?.blocks?.find(
      block => block?.fields?.NAME !== undefined,
    );
    if (root?.fields) {
      root.fields.NAME = name;
      return `${JSON.stringify(parsed, null, 2)}\n`;
    }
    if (typeof parsed.name === 'string') {
      return `${JSON.stringify({...parsed, name}, null, 2)}\n`;
    }
    return contents;
  } catch {
    return contents; // mid-edit, or not JSON: copy it as it stands
  }
};
