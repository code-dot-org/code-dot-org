// The checks, against a lesson that has been DONE.
//
// A check that fails an unsolved project proves nothing on its own — so does a
// check that always fails. What has to be true is both halves: it refuses the
// starter the lesson ships with, and it accepts the project a learner has when
// they have finished. Nothing but a solved project can show the second, so each
// case here does the lesson, the way its instructions say to, and then plays
// the same script the sandbox would.
//
// The same runner the sandbox uses (`runtime/playCheck`), for the reason that
// module exists: a check tested against a different runner from the one that
// judges a learner is a check nobody has tested.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {importStockSprite} from '../../appearance/importStock';
import {stockSprite} from '../../appearance/stock';
import {playCheck} from '../../runtime/playCheck';
import {projectFiles} from '../../runtime/projectFiles';
import {tile} from '../index';
import {LESSONS} from '../lessons';
import type {TileId} from '../types';

/**
 * Play a tile's check against a project and say whether it passes.
 *
 * Both halves, in the order the lab runs them: the workspace first (it needs no
 * world), then the script. A check with no `inspect` simply skips the first.
 */
const check = async (id: TileId, source: MultiFileSource) => {
  const {check: spec} = tile(id);
  if (!spec.run || !spec.passes) {
    throw new Error(`${id} has no check written`);
  }
  const files = projectFiles(source);
  if (spec.inspect && !spec.inspect(files)) {
    return {passes: false, result: {samples: {}, console: []}};
  }
  const {world} = await compileProject(files);
  const result = playCheck(world, spec.run);
  return {passes: spec.passes(result), result};
};

/**
 * A project with one file rewritten — how a solved lesson is expressed here.
 *
 * By NAME rather than by id: a project's file ids are numbers assigned in
 * order, and a test that named one would be a test about `buildProject`.
 */
const editing = (
  source: MultiFileSource,
  name: string,
  change: (contents: string) => string,
): MultiFileSource => {
  const entry = Object.entries(source.files).find(
    ([, file]) => file.name === name,
  );
  if (!entry) {
    throw new Error(`no file called ${name}`);
  }
  const [id, file] = entry;
  return {
    ...source,
    files: {...source.files, [id]: {...file, contents: change(file.contents)}},
  };
};

/**
 * Add a `use trait` row to an actor file that has none.
 *
 * The lesson's own instruction, carried out on the JSON: the actor's first row
 * gains a sibling. Written as a string edit because the alternative is
 * assembling a Blockly workspace by hand, which is what the fixtures do and
 * what this test is not about.
 */
const electing = (contents: string, trait: string): string => {
  const workspace = JSON.parse(contents) as {
    blocks: {blocks: Array<{next?: unknown}>};
  };
  const actor = workspace.blocks.blocks[0];
  actor.next = {
    block: {
      type: 'world_use_trait',
      fields: {TRAIT: trait},
      ...(actor.next ? {next: actor.next} : {}),
    },
  };
  return JSON.stringify(workspace);
};

/**
 * A row of Blockly, as far as these edits have to see into one.
 *
 * A socket holds a `block` or a `shadow` — a shadow is the pre-filled number a
 * socket arrives with, and the world helpers emit those, which is why an edit
 * that only looked for `block` found nothing.
 */
interface Row {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Row; shadow?: Row} | undefined>;
  next?: {block?: Row};
}

/** Whatever is in a socket, shadow or block. */
const inSocket = (row: Row | undefined, name: string): Row | undefined =>
  row?.inputs?.[name]?.block ?? row?.inputs?.[name]?.shadow;

/** Give the Hero a speed when the world starts — the lesson's step two. */
const setSpeed = (contents: string): string => {
  const workspace = JSON.parse(contents) as {
    blocks: {blocks: Array<Record<string, unknown>>};
  };
  workspace.blocks.blocks.push({
    type: 'world_trait_step',
    x: 20,
    y: 400,
    fields: {PHASE: 'decide', NAME: 'go right'},
    inputs: {
      DO: {
        block: {
          type: 'world_set_Physics_VelocityProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            // A vector is a FIELD, not two sockets: the block draws one little
            // pair of numbers rather than taking two values.
            VALUE: {
              block: {type: 'world_vector', fields: {VECTOR: {x: 1.5, y: 0}}},
            },
          },
        },
      },
    },
  });
  return JSON.stringify(workspace);
};

describe('the gravity lesson’s check', () => {
  const lesson = LESSONS['motion/gravity'];

  it('refuses the project the lesson starts with', async () => {
    // Nothing has elected anything, so nothing falls — which is the lesson's
    // own first line, and a check that passed here would be checking nothing.
    const {passes} = await check('motion/gravity', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the project once the lesson is done', async () => {
    const solved = editing(
      editing(lesson.source, 'hero.actor', contents =>
        electing(contents, 'Gravity#AffectedByGravityTrait'),
      ),
      'ground.actor',
      contents => electing(contents, 'Gravity#ActsAsGroundTrait'),
    );
    const {passes, result} = await check('motion/gravity', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a Hero that falls forever, which is half the lesson', async () => {
    // Step one of the instructions without step two: it falls, and it keeps
    // falling straight through the floor. The check has to be able to tell the
    // difference between falling and LANDING, and one sample at the end cannot.
    const half = editing(lesson.source, 'hero.actor', contents =>
      electing(contents, 'Gravity#AffectedByGravityTrait'),
    );
    const {passes} = await check('motion/gravity', half);
    expect(passes).toBe(false);
  });
});

describe('the first world lesson’s check', () => {
  const lesson = LESSONS['origin/first-world'];

  it('refuses a world with one actor in it', async () => {
    const {passes} = await check('origin/first-world', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a world with a second actor that draws something', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {
        blocks: {blocks: Array<{next?: {block?: Record<string, unknown>}}>};
      };
      // Chain a second `add actor` under the first — the lesson's step two.
      let row = workspace.blocks.blocks[0].next?.block;
      while (row?.next) {
        row = (row.next as {block: Record<string, unknown>}).block;
      }
      if (row) {
        row.next = {
          block: {type: 'world_add_actor', fields: {ACTOR: 'actors/hero'}},
        };
      }
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('origin/first-world', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the speed lesson’s check', () => {
  const lesson = LESSONS['motion/speed'];

  // The one check with a workspace half, and this is why it needs one: the
  // starter ALREADY crosses the screen. What the lesson changes is how.
  it('refuses the starter, which moves by hand', async () => {
    const {passes} = await check('motion/speed', lesson.source);
    expect(passes).toBe(false);
  });

  it('refuses a Hero that has a speed and still has the handler', async () => {
    const half = editing(lesson.source, 'hero.actor', contents =>
      electing(contents, 'Physics#CanMoveTrait'),
    );
    const {passes} = await check('motion/speed', half);
    expect(passes).toBe(false);
  });

  it('accepts a Hero that moves because it has a speed', async () => {
    const solved = editing(lesson.source, 'hero.actor', contents => {
      const workspace = JSON.parse(contents) as {
        blocks: {blocks: Array<Record<string, unknown>>};
      };
      // Drop the `each frame` handler — it is a root of its own beside the
      // actor — and elect Physics instead, with a speed to start it off.
      workspace.blocks.blocks = workspace.blocks.blocks.filter(
        block => block.type !== 'world_trait_step',
      );
      return setSpeed(
        electing(JSON.stringify(workspace), 'Physics#CanMoveTrait'),
      );
    });
    const {passes, result} = await check('motion/speed', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the position lesson’s check', () => {
  const lesson = LESSONS['place/position'];

  it('refuses three Markers in a heap', async () => {
    const {passes} = await check('place/position', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one in each corner and one in the middle', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const places = [
        {x: 48, y: 48},
        {x: 336, y: 240},
        {x: 192, y: 144},
      ];
      // Walk the chain of rows under the world and move each `set position`
      // to the next place. By walking rather than by regex: three actors are
      // three identical pairs of numbers, and a text substitution cannot tell
      // which pair belongs to which.
      const workspace = JSON.parse(contents) as {
        blocks: {blocks: Array<{next?: {block?: Row}}>};
      };
      let row = workspace.blocks.blocks[0].next?.block;
      let index = 0;
      while (row) {
        const at = inSocket(row, 'DO');
        if (at?.type === 'world_set_position' && index < places.length) {
          inSocket(at, 'X')!.fields!.NUM = places[index].x;
          inSocket(at, 'Y')!.fields!.NUM = places[index].y;
          index++;
        }
        row = row.next?.block;
      }
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('place/position', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the sprite lesson’s check', () => {
  const lesson = LESSONS['look/sprite'];

  it('refuses an actor that only draws itself a box', async () => {
    const {passes} = await check('look/sprite', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that draws a picture the project holds', async () => {
    // What importing does, in the two moves it makes: the file lands in
    // `sprites/`, and the actor names it.
    const withSprite = importStockSprite(
      lesson.source,
      stockSprite('player')!,
    ).source;
    const solved = editing(withSprite, 'hero.actor', contents => {
      const workspace = JSON.parse(contents) as {
        blocks: {blocks: Array<{type?: string; next?: unknown}>};
      };
      const actor = workspace.blocks.blocks.find(
        block => block.type === 'world_actor',
      )!;
      actor.next = {
        block: {type: 'world_set_sprite', fields: {SPRITE: 'player.png'}},
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('look/sprite', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the arrow keys lesson’s check', () => {
  const lesson = LESSONS['input/arrows'];

  it('refuses a Hero that ignores the keys', async () => {
    const {passes} = await check('input/arrows', lesson.source);
    expect(passes).toBe(false);
  });

  // Across only is step two of three, and the lesson goes on to ask for down.
  // A check that stopped at "it moved" would call the lesson done halfway.
  it('refuses a Hero that only walks across', async () => {
    const half = editing(lesson.source, 'hero.actor', contents =>
      electing(contents, 'Arrow Keys#MovesAcrossTrait'),
    );
    const {passes} = await check('input/arrows', half);
    expect(passes).toBe(false);
  });

  it('accepts a Hero that walks in both directions', async () => {
    const solved = editing(lesson.source, 'hero.actor', contents =>
      electing(
        electing(contents, 'Arrow Keys#MovesAcrossTrait'),
        'Arrow Keys#MovesDownTrait',
      ),
    );
    const {passes, result} = await check('input/arrows', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('every lesson that has a check', () => {
  // The invariant behind all of the above: a check is written as a pair, and a
  // `run` with no `passes` is a button that measures a world and then throws
  // the numbers away.
  it('has both halves of it', () => {
    for (const id of Object.keys(LESSONS) as TileId[]) {
      const {check: spec} = tile(id);
      expect(Boolean(spec.run), `${id} run`).toBe(Boolean(spec.passes));
    }
  });

  it('is written for every lesson there is', () => {
    const without = (Object.keys(LESSONS) as TileId[]).filter(
      id => !tile(id).check.run,
    );
    expect(without).toEqual([]);
  });
});
