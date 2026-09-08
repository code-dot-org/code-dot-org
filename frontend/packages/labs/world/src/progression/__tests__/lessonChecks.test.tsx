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
import {climbArrowsHandlers} from '../../actors/enhance/climbArrows';
import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import {
  importStockAnimation,
  importStockSprite,
} from '../../appearance/importStock';
import {stockAnimation, stockSprite} from '../../appearance/stock';
import {importStockEffect} from '../../effect/importStockEffect';
import {stockEffect} from '../../effect/stock';
import {importStockRule} from '../../rules/importStockRule';
import {resolveRuleContents} from '../../rules/ruleReference';
import {stockRule} from '../../rules/stock';
import {playCheck} from '../../runtime/playCheck';
import {projectFiles} from '../../runtime/projectFiles';
import {tile} from '../index';
import {LESSONS} from '../lessons';
import {anyKind, local} from '../lessons/worlds';
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
  // Resolved first, the way the editor resolves one to put it on screen: a
  // rule the learner has not touched is stored as a reference to the library's
  // (rules/ruleReference, specs/NEXT.md §2), and there is nothing in a
  // reference to edit. What is written back is the whole workspace, which is
  // what a save does — so this stands in for a learner exactly as it did
  // before, including the part where editing a rule makes it theirs.
  return {
    ...source,
    files: {
      ...source.files,
      [id]: {...file, contents: change(resolveRuleContents(file.contents))},
    },
  };
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
  /** A block's own id, which a local actor and a camera are named by. */
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Row; shadow?: Row} | undefined>;
  next?: {block?: Row};
}

/** Whatever is in a socket, shadow or block. */
const inSocket = (row: Row | undefined, name: string): Row | undefined =>
  row?.inputs?.[name]?.block ?? row?.inputs?.[name]?.shadow;

/**
 * The `define actor ⟨Name⟩` a world defines for itself.
 *
 * Early lessons are ONE FILE (`lessons/index`, `ONE_FILE`), so an edit the
 * instructions describe as "add this to the Hero" is an edit to a root inside
 * `main.world` — found by the name the learner reads, since a world may define
 * several and three of these lessons do.
 */
const actorIn = (workspace: {blocks: {blocks: Row[]}}, name: string): Row => {
  const actor = workspace.blocks.blocks.find(
    block => block.type === 'world_actor' && block.fields?.NAME === name,
  );
  if (!actor) {
    throw new Error(`no actor called ${name}`);
  }
  return actor;
};

/** Chain a row directly under a definition, above whatever it already holds. */
const under = (actor: Row, row: Row): void => {
  actor.next = {block: {...row, ...(actor.next ? {next: actor.next} : {})}};
};

/** The first row of a type in a definition's chain. */
const rowOf = (actor: Row, type: string): Row => {
  for (let at = actor.next?.block; at; at = at.next?.block) {
    if (at.type === type) {
      return at;
    }
  }
  throw new Error(`no ${type} under ${String(actor.fields?.NAME)}`);
};

/** Take the first row of a type out of a definition's chain. */
const without = (actor: Row, type: string): void => {
  let at = actor;
  while (at.next?.block) {
    if (at.next.block.type === type) {
      at.next = at.next.block.next;
      return;
    }
    at = at.next.block;
  }
};

/**
 * Add a `use trait` row to an actor that has none.
 *
 * The lesson's own instruction, carried out on the JSON: the actor's first row
 * gains a sibling. Written as a string edit because the alternative is
 * assembling a Blockly workspace by hand, which is what the fixtures do and
 * what this test is not about.
 */
const electing = (contents: string, trait: string, name: string): string => {
  const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
  under(actorIn(workspace, name), {
    type: 'world_use_trait',
    fields: {TRAIT: trait},
  });
  return JSON.stringify(workspace);
};

/** Give the Hero a speed of its own — the lesson's step two. */
const setSpeed = (contents: string): string => {
  const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
  under(actorIn(workspace, 'Hero'), {
    type: 'world_trait_step',
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
      editing(lesson.source, 'main.world', contents =>
        electing(contents, 'Gravity#AffectedByGravityTrait', 'Hero'),
      ),
      'main.world',
      contents => electing(contents, 'Gravity#ActsAsGroundTrait', 'Ground'),
    );
    const {passes, result} = await check('motion/gravity', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a Hero that falls forever, which is half the lesson', async () => {
    // Step one of the instructions without step two: it falls, and it keeps
    // falling straight through the floor. The check has to be able to tell the
    // difference between falling and LANDING, and one sample at the end cannot.
    const half = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Gravity#AffectedByGravityTrait', 'Hero'),
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
          block: {type: 'world_add_actor', fields: {ACTOR: local('hero')}},
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
    const half = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Physics#CanMoveTrait', 'Hero'),
    );
    const {passes} = await check('motion/speed', half);
    expect(passes).toBe(false);
  });

  it('accepts a Hero that moves because it has a speed', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      // Drop the `each frame` that shuffles it along — a row of the Hero's,
      // like every other — and elect Physics instead, with a speed to start
      // it off.
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      without(actorIn(workspace, 'Hero'), 'world_trait_step');
      return setSpeed(
        electing(JSON.stringify(workspace), 'Physics#CanMoveTrait', 'Hero'),
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
        {x: 272, y: 272},
        {x: 160, y: 160},
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
    const solved = editing(withSprite, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Hero'), {
        type: 'world_set_sprite',
        fields: {SPRITE: 'player.png'},
      });
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
    const half = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Arrow Keys#MovesAcrossTrait', 'Hero'),
    );
    const {passes} = await check('input/arrows', half);
    expect(passes).toBe(false);
  });

  it('accepts a Hero that walks in both directions', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      electing(
        electing(contents, 'Arrow Keys#MovesAcrossTrait', 'Hero'),
        'Arrow Keys#MovesDownTrait',
        'Hero',
      ),
    );
    const {passes, result} = await check('input/arrows', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the flier lesson’s check', () => {
  const lesson = LESSONS['platformer/flier'];

  /** The two edits the lesson asks for, and nothing else. */
  const flapping = editing(lesson.source, 'main.world', contents =>
    contents
      .replaceAll('Steering#ChasesTrait', 'Flapping#FlapsAndGlidesTrait')
      .replaceAll(
        'world_set_Steering_ActorToChaseProperty',
        'world_set_Flapping_ActorToHuntProperty',
      ),
  );

  it('refuses the chaser the lesson starts with', async () => {
    // The false pass, made concrete. The Bat already arrives — it is below
    // the Hero and closing — so a check that asked whether it came nearer
    // would pass the lesson before it had been done.
    const {passes} = await check('platformer/flier', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a Bat that flaps and glides', async () => {
    const {passes, result} = await check('platformer/flier', flapping);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the pads lesson’s check', () => {
  const lesson = LESSONS['platformer/pads'];

  /** The one edit the lesson asks for: the far pad, painted the near one's red. */
  const linked = editing(lesson.source, 'main.world', contents =>
    contents.replaceAll('#3f7fe0', '#e0484a'),
  );

  it('refuses two pads that have nothing to do with each other', async () => {
    // Everything about them works — they are pads, the Hero uses pads, the
    // key is wired. What is missing is the one thing that makes two pads one
    // place, and the check must not read "it is all plugged in" as done.
    const {passes} = await check('platformer/pads', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts two pads of a color', async () => {
    const {passes, result} = await check('platformer/pads', linked);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the walls lesson’s check', () => {
  const lesson = LESSONS['platformer/walls'];

  /** The one edit the lesson asks for: the wall, painted the plate's green. */
  const matched = editing(lesson.source, 'main.world', contents =>
    contents.replaceAll('#e0484a', '#3fbf6a'),
  );

  it('refuses a switch and a wall that have nothing to do with each other', async () => {
    // The plate is real and fires every time. What it is not is the wall's
    // color, and the check must not read "it is all wired up" as done.
    const {passes} = await check('platformer/walls', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a wall painted the switch’s color', async () => {
    const {passes, result} = await check('platformer/walls', matched);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the digging lesson’s check', () => {
  const lesson = LESSONS['platformer/digging'];

  /** The one edit the lesson asks for: soil that says it can be dug. */
  const diggable = editing(lesson.source, 'main.world', contents => {
    const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
    under(actorIn(workspace, 'Soil'), {
      type: 'world_use_trait',
      fields: {TRAIT: 'Digging#CanBeDugTrait'},
    });
    return JSON.stringify(workspace);
  });

  it('refuses a floor that has never heard of a shovel', async () => {
    // The Hero can already dig and the key is already wired, so everything is
    // plugged in and nothing happens. The check must not read that as done.
    const {passes} = await check('platformer/digging', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts soil that can be dug', async () => {
    const {passes, result} = await check('platformer/digging', diggable);
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

/**
 * Replace the body of the first handler root in an actor file.
 *
 * By walking the JSON rather than replacing a string: `actorFile` writes
 * pretty-printed JSON, so a compact `JSON.stringify` of the block being
 * replaced matches nothing at all — and silently, leaving the test to assert
 * against a project it never changed.
 */
const rebody = (contents: string, body: Row): string => {
  const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
  // The HAT: a world's roots are the world, the actors it defines and the
  // handlers, and the first two have a `next` of their own.
  const handler = workspace.blocks.blocks.find(block =>
    block.type?.startsWith('world_on_'),
  );
  if (!handler) {
    throw new Error('no handler to give a body to');
  }
  handler.next = {block: body};
  return JSON.stringify(workspace);
};

/**
 * A handler root to drop into the world, with a `print` inside it.
 *
 * The subject is `any ⟨Kind⟩` rather than `this actor`: a handler beside a
 * definition is about that definition, and one in a world has to say which
 * actor it is about (`lessons/worlds`, `anyKind`).
 */
const saying = (contents: string, hat: Row): string => {
  const workspace = JSON.parse(contents) as {
    blocks: {blocks: Row[]};
  };
  workspace.blocks.blocks.push({
    ...hat,
    x: 420,
    y: 300,
    next: {block: {type: 'world_log', fields: {TEXT: 'yes'}}},
  } as Row);
  return JSON.stringify(workspace);
};

describe('the key-press lesson’s check', () => {
  const lesson = LESSONS['input/press'];

  it('refuses a Hero that hears nothing', async () => {
    const {passes} = await check('input/press', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that says a thing per press', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      saying(electing(contents, 'Input#TakesKeyboardInputTrait', 'Hero'), {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'space'},
        inputs: {ACTOR: anyKind('hero')},
      }),
    );
    const {passes, result} = await check('input/press', solved);
    expect(result.error).toBeUndefined();
    expect(result.console).toHaveLength(2);
    expect(passes).toBe(true);
  });

  it('accepts the last step of it, which hears every key and says which', () => {
    // Step five: the filter comes off and the print says what the event
    // carried. The script only ever presses space, so the count is the same
    // two — what changed is that the handler is now told which key it was.
    const anyKeyAt = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(
        electing(contents, 'Input#TakesKeyboardInputTrait', 'Hero'),
      ) as {blocks: {blocks: Row[]}};
      workspace.blocks.blocks.push({
        type: 'world_on_Input_PressesEvent',
        x: 420,
        y: 300,
        fields: {FILTER0: ''},
        inputs: {ACTOR: anyKind('hero')},
        next: {
          block: {
            type: 'world_print',
            inputs: {VALUE: {block: {type: 'world_event_value'}}},
          },
        },
      } as unknown as Row);
      return JSON.stringify(workspace);
    });
    return check('input/press', anyKeyAt).then(({passes, result}) => {
      expect(result.console).toEqual(['space', 'space']);
      expect(passes).toBe(true);
    });
  });

  // The lesson's whole point: a handler that ran while the key was HELD would
  // say ninety things during the first stretch rather than one.
  it('refuses something that speaks every frame', async () => {
    const chatty = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Hero'), {
        type: 'world_trait_step',
        fields: {PHASE: 'decide', NAME: 'shout'},
        inputs: {DO: {block: {type: 'world_log', fields: {TEXT: 'yes'}}}},
      });
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('input/press', chatty);
    expect(result.console.length).toBeGreaterThan(50);
    expect(passes).toBe(false);
  });
});

describe('the click lesson’s check', () => {
  const lesson = LESSONS['input/mouse'];

  it('refuses a Target that does not know it was clicked', async () => {
    const {passes} = await check('input/mouse', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that answers its own clicks and no others', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      saying(electing(contents, 'Mouse#CanBeClickedTrait', 'Target'), {
        // `IsClickedWith`, and the empty filter means "any button" — the block
        // is "when ⟨Target⟩ is clicked with ⟨any⟩".
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: anyKind('target')},
      }),
    );
    const {passes, result} = await check('input/mouse', solved);
    expect(result.error).toBeUndefined();
    // One, not two: the script clicks the empty space as well, and a handler
    // that answered any click anywhere would say two things.
    expect(result.console).toHaveLength(1);
    expect(passes).toBe(true);
  });
});

describe('the two-hands lesson’s check', () => {
  const lesson = LESSONS['input/two-hands'];

  it('refuses a Ship that walks sideways', async () => {
    const {passes} = await check('input/two-hands', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that turns and thrusts', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      electing(
        // Take the walking off first: two rules over four keys is the mistake
        // the lesson warns about, and the check has to notice it.
        contents.replace(
          'Arrow Keys#MovesAcrossTrait',
          'Arrow Drive#DrivenByArrowKeysTrait',
        ),
        'Physics#CanMoveTrait',
        'Ship',
      ),
    );
    const {passes, result} = await check('input/two-hands', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the shove lesson’s check', () => {
  const lesson = LESSONS['motion/force'];

  it('refuses a Ball that only says bang', async () => {
    const {passes} = await check('motion/force', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that is shoved and coasts', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      // `VALUE`, not `FORCE`: a single-parameter action names its socket by
      // position rather than by the parameter's own name, and the block reads
      // "apply force ⟨VALUE⟩ on ⟨ACTOR⟩". Guessed twice and dumped once — the
      // palette prints the answer (AGENTS.md), and guessing costs more than
      // reading it.
      rebody(contents, {
        type: 'world_do_Physics_ApplyForceAction',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          VALUE: {
            block: {type: 'world_vector', fields: {VECTOR: {x: 3, y: 0}}},
          },
        },
      }),
    );
    const {passes, result} = await check('motion/force', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The lesson's own distinction: a force leaves a speed behind, and a place
  // does not. Moving the Ball by place passes "it moved" and fails "it is still
  // moving", which is the half the check is really about.
  it('refuses a Ball moved by place, which stops the moment you let go', async () => {
    const byPlace = editing(lesson.source, 'main.world', contents =>
      rebody(contents, {
        type: 'world_set_position',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          X: {shadow: {type: 'math_number', fields: {NUM: 200}}},
          Y: {shadow: {type: 'math_number', fields: {NUM: 160}}},
        },
      }),
    );
    const {passes} = await check('motion/force', byPlace);
    expect(passes).toBe(false);
  });
});

describe('the units lesson’s check', () => {
  const lesson = LESSONS['motion/units'];

  it('refuses a Ball that is gone before you see it', async () => {
    const {passes} = await check('motion/units', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the speed that crosses the world in two seconds', async () => {
    // 320 pixels in two seconds is 160 pixels a second, and a unit is a
    // hundred pixels: 1.6.
    const solved = editing(lesson.source, 'main.world', contents =>
      contents.replace('"x": 60', '"x": 1.6'),
    );
    const {passes, result} = await check('motion/units', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses an answer that is out by a factor of a hundred', async () => {
    // The mistake the lesson exists to prevent: pixels per second, written
    // into a field that is counting units.
    const inPixels = editing(lesson.source, 'main.world', contents =>
      contents.replace('"x": 60', '"x": 160'),
    );
    const {passes} = await check('motion/units', inPixels);
    expect(passes).toBe(false);
  });
});

describe('the drag lesson’s check', () => {
  const lesson = LESSONS['motion/drag'];

  it('refuses a Ball that drifts forever', async () => {
    const {passes} = await check('motion/drag', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that coasts to a stop', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Drag#SlowsDownTrait', 'Ball'),
    );
    const {passes, result} = await check('motion/drag', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the tween lesson’s check', () => {
  const lesson = LESSONS['motion/tween'];

  it('refuses a Door that stays shut', async () => {
    const {passes} = await check('motion/tween', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a Door that travels', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      // Chain the tween onto the end of the world's rows.
      let row = workspace.blocks.blocks[0].next?.block;
      while (row?.next?.block) {
        row = row.next.block;
      }
      row!.next = {
        block: {
          type: 'world_play_tween_here',
          fields: {CURVE: 'linear'},
          inputs: {
            ACTOR: {
              block: {type: 'world_actor_kind', fields: {ACTOR: local('door')}},
            },
            SECONDS: {shadow: {type: 'math_number', fields: {NUM: 1}}},
            DO: {
              block: {
                type: 'world_set_position',
                inputs: {
                  ACTOR: {block: {type: 'world_this_actor'}},
                  X: {shadow: {type: 'math_number', fields: {NUM: 256}}},
                  Y: {shadow: {type: 'math_number', fields: {NUM: 160}}},
                },
              },
            },
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('motion/tween', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The lesson's own distinction, and the reason the check samples early: a
  // `set position` puts the Door there in one frame, which is a jump and not
  // an opening.
  it('refuses a Door that is simply put in the other place', async () => {
    const jumped = editing(lesson.source, 'main.world', contents =>
      contents.replace('"NUM": 64', '"NUM": 256'),
    );
    const {passes} = await check('motion/tween', jumped);
    expect(passes).toBe(false);
  });
});

/**
 * Give an actor an `each frame`, with a body.
 *
 * A ROW of the definition rather than a root beside it: on its own in a world
 * an `each frame` has no subject and generates nothing at all (domainBlocks,
 * `traitStepDefinition`) — which is a project that compiles, runs, and quietly
 * does none of the lesson.
 */
const eachFrame = (
  contents: string,
  body: Row,
  name = 'decide',
  actor = 'Ball',
): string => {
  const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
  under(actorIn(workspace, actor), {
    type: 'world_trait_step',
    fields: {PHASE: 'decide', NAME: name},
    inputs: {DO: {block: body}},
  });
  return JSON.stringify(workspace);
};

/** `set speed of ⟨this actor⟩ to nothing`. */
const HALT: Row = {
  type: 'world_set_Physics_VelocityProperty',
  inputs: {
    ACTOR: {block: {type: 'world_this_actor'}},
    VALUE: {block: {type: 'world_vector', fields: {VECTOR: {x: 0, y: 0}}}},
  },
};

/** `get position ⟨x|y⟩ of ⟨this actor⟩`, as a socket's contents. */
const myAxis = (component: 'x' | 'y') => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: component},
    inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
  },
});

/** `⟨a⟩ > ⟨n⟩`. */
const past = (component: 'x' | 'y', n: number) => ({
  block: {
    type: 'logic_compare',
    fields: {OP: 'GT'},
    inputs: {
      A: myAxis(component),
      B: {shadow: {type: 'math_number', fields: {NUM: n}}},
    },
  },
});

describe('the if lesson’s check', () => {
  const lesson = LESSONS['logic/if'];

  it('refuses a Ball that rolls out of the world', async () => {
    const {passes} = await check('logic/if', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that stops at the middle', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      eachFrame(contents, {
        type: 'controls_if',
        inputs: {IF0: past('x', 160), DO0: {block: HALT}},
      }),
    );
    const {passes, result} = await check('logic/if', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The false pass, written down and then tested: stopping unconditionally
  // stops it where it started, which is not the middle of anything.
  it('refuses one that never starts', async () => {
    const halted = editing(lesson.source, 'main.world', contents =>
      eachFrame(contents, HALT),
    );
    const {passes} = await check('logic/if', halted);
    expect(passes).toBe(false);
  });
});

describe('the collision lesson’s check', () => {
  const lesson = LESSONS['logic/collision'];

  it('refuses a Ball that rolls through the Wall', async () => {
    const {passes} = await check('logic/collision', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one stopped by a Wall that says it is solid', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Solid Bodies#SolidTrait', 'Wall'),
    );
    const {passes, result} = await check('logic/collision', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the and-or lesson’s check', () => {
  const lesson = LESSONS['logic/and-or'];

  it('refuses one condition, which stops both Balls', async () => {
    const {passes} = await check('logic/and-or', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts two conditions joined by and', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      // A row of the Ball's now, not a root: `rowOf` walks the definition's
      // chain rather than the file's roots.
      const handler = rowOf(actorIn(workspace, 'Ball'), 'world_trait_step');
      const branch = handler.inputs!.DO!.block!;
      branch.inputs!.IF0 = {
        block: {
          type: 'logic_operation',
          fields: {OP: 'AND'},
          inputs: {A: past('x', 160), B: past('y', 160)},
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('logic/and-or', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The mistake the lesson is about: `or` is true for both Balls, so both stop
  // and the high one never leaves.
  it('refuses two conditions joined by or', async () => {
    const wrong = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      // A row of the Ball's now, not a root: `rowOf` walks the definition's
      // chain rather than the file's roots.
      const handler = rowOf(actorIn(workspace, 'Ball'), 'world_trait_step');
      handler.inputs!.DO!.block!.inputs!.IF0 = {
        block: {
          type: 'logic_operation',
          fields: {OP: 'OR'},
          inputs: {A: past('x', 160), B: past('y', 160)},
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes} = await check('logic/and-or', wrong);
    expect(passes).toBe(false);
  });
});

describe('the kinds lesson’s check', () => {
  const lesson = LESSONS['logic/kinds'];

  it('refuses a Ball that says the same about everything', async () => {
    const {passes, result} = await check('logic/kinds', lesson.source);
    // Two touches, one sentence: the starter's whole problem.
    expect(result.console).toHaveLength(2);
    expect(result.console[0]).toBe(result.console[1]);
    expect(passes).toBe(false);
  });

  it('accepts one handler that asks what it touched', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const handler = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Collisions_StartsTouchingEvent',
      )!;
      const says = (kind: string, words: string): Row => ({
        type: 'controls_if',
        inputs: {
          IF0: {
            block: {
              type: 'world_is_a',
              fields: {TYPE: local(kind)},
              inputs: {ACTOR: {block: {type: 'world_event_actor'}}},
            },
          },
          DO0: {block: {type: 'world_log', fields: {TEXT: words}}},
        },
      });
      // ONE handler, two questions — which is the shape the lesson is about.
      handler.next = {
        block: {...says('coin', 'money'), next: {block: says('spike', 'ouch')}},
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('logic/kinds', solved);
    expect(result.error).toBeUndefined();
    expect(result.console).toEqual(['money', 'ouch']);
    expect(passes).toBe(true);
  });

  // Asking the wrong question: `is a Coin` twice says "money" for the Spike as
  // well, so both lines match and the check refuses it.
  it('refuses a handler that asks the same question twice', async () => {
    const wrong = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const handler = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Collisions_StartsTouchingEvent',
      )!;
      handler.next = {
        block: {
          type: 'controls_if',
          inputs: {
            IF0: {
              block: {
                type: 'world_is_a',
                fields: {TYPE: local('coin')},
                inputs: {ACTOR: {block: {type: 'world_event_actor'}}},
              },
            },
            DO0: {block: {type: 'world_log', fields: {TEXT: 'money'}}},
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('logic/kinds', wrong);
    // One line, not two: the Spike says nothing at all.
    expect(result.console).toHaveLength(1);
    expect(passes).toBe(false);
  });
});

/** A world's rows, walked from the `define world` block. */
const rowsOf = (workspace: {blocks: {blocks: Row[]}}): Row[] => {
  const rows: Row[] = [];
  let row = workspace.blocks.blocks[0].next?.block;
  while (row) {
    rows.push(row);
    row = row.next?.block;
  }
  return rows;
};

describe('the variable lesson’s check', () => {
  const lesson = LESSONS['memory/variable'];

  it('refuses a world with the numbers written out', async () => {
    const {passes} = await check('memory/variable', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a gap that has been given a name', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const gap = {id: 'gap', name: 'gap', type: 'Number'};
      const read = () => ({
        block: {type: 'variables_get_Number', fields: {VAR: gap}},
      });
      const rows = rowsOf(workspace);
      // Second Post at gap + 60, third at gap + gap + 60.
      const at = (n: number): Row => ({
        type: 'math_arithmetic',
        fields: {OP: 'ADD'},
        inputs:
          n === 1
            ? {A: read(), B: {shadow: {type: 'math_number', fields: {NUM: 60}}}}
            : {
                A: read(),
                B: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'ADD'},
                    inputs: {
                      A: read(),
                      B: {shadow: {type: 'math_number', fields: {NUM: 60}}},
                    },
                  },
                },
              },
      });
      inSocket(rows[1], 'DO')!.inputs!.X = {block: at(1)};
      inSocket(rows[2], 'DO')!.inputs!.X = {block: at(2)};
      // …and the name itself, set before anything reads it.
      workspace.blocks.blocks[0].next = {
        block: {
          type: 'variables_set_Number',
          fields: {VAR: gap},
          inputs: {VALUE: {shadow: {type: 'math_number', fields: {NUM: 100}}}},
          next: {block: rows[0]},
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('memory/variable', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Naming a value and reading it once is a longer way of writing the number,
  // which is exactly the false pass this check was written down against.
  it('refuses a name that is only read once', async () => {
    const once = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const gap = {id: 'gap', name: 'gap', type: 'Number'};
      const rows = rowsOf(workspace);
      inSocket(rows[1], 'DO')!.inputs!.X = {
        block: {type: 'variables_get_Number', fields: {VAR: gap}},
      };
      workspace.blocks.blocks[0].next = {
        block: {
          type: 'variables_set_Number',
          fields: {VAR: gap},
          inputs: {VALUE: {shadow: {type: 'math_number', fields: {NUM: 160}}}},
          next: {block: rows[0]},
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes} = await check('memory/variable', once);
    expect(passes).toBe(false);
  });
});

describe('the loop lesson’s check', () => {
  const lesson = LESSONS['memory/many'];

  it('refuses six Coins drawn as boxes', async () => {
    const {passes} = await check('memory/many', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one loop over all of them', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const coin = {id: 'c', name: 'coin', type: 'Actor'};
      const rows = rowsOf(workspace);
      rows[rows.length - 1].next = {
        block: {
          type: 'world_for_each',
          fields: {VAR: coin},
          inputs: {
            SOURCE: {block: {type: 'world_all_actors'}},
            DO: {
              block: {
                type: 'world_set_sprite',
                fields: {SPRITE: 'coin.png'},
                inputs: {
                  ACTOR: {
                    block: {type: 'variables_get_Actor', fields: {VAR: coin}},
                  },
                },
              },
            },
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('memory/many', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Six blocks change all six Coins too. The shape half is what asks for the
  // loop, and it is the lesson — the outcome is identical either way.
  it('refuses six blocks that do the same thing', async () => {
    const byHand = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      for (const row of rowsOf(workspace)) {
        const place = inSocket(row, 'DO');
        if (place) {
          place.next = {
            block: {
              type: 'world_set_sprite',
              fields: {SPRITE: 'coin.png'},
              inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
            },
          };
        }
      }
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('memory/many', byHand);
    // It worked — and it is still not the lesson.
    expect(result.samples).toBeDefined();
    expect(passes).toBe(false);
  });
});

/** The chain under an `add actor`'s DO — `[set position, set text]`. */
const bodyOf = (row: Row): Row[] => {
  const body: Row[] = [];
  for (let at = inSocket(row, 'DO'); at; at = at.next?.block) {
    body.push(at);
  }
  return body;
};

/** `join ⟨"…"⟩ ⟨value⟩`, which is what both these lessons draw. */
const joined = (first: string, second: object) => ({
  block: {
    type: 'text_join',
    inputs: {
      ADD0: {shadow: {type: 'text', fields: {TEXT: first}}},
      ADD1: second,
    },
  },
});

const THIS_ACTOR = {block: {type: 'world_this_actor'}};

/**
 * The SCRIPT half alone, with the workspace half skipped.
 *
 * For the two false passes below, which are false passes precisely because the
 * world does what was asked: the Labels agree, or they differ, and it is the
 * shape half that refuses. Asserting through `check` would prove only that
 * something said no.
 */
const playedOf = async (id: TileId, source: MultiFileSource) => {
  const {check: spec} = tile(id);
  const {world} = await compileProject(projectFiles(source));
  return playCheck(world, spec.run!);
};

/** The last sample of a count probe. */
const lastNumberOf = (samples: unknown[] | undefined): number =>
  (samples?.[samples.length - 1] ?? -1) as number;

/** The last sample of a probe, for a test that wants to read the number. */
const lastOf = (samples: unknown[] | undefined): {x: number}[] =>
  (samples?.[samples.length - 1] ?? []) as {x: number}[];

const outcomeOf = async (id: TileId, source: MultiFileSource) =>
  tile(id).check.passes!(await playedOf(id, source));

describe('the world-state lesson’s check', () => {
  const lesson = LESSONS['memory/world-state'];

  it('refuses two Labels that disagree', async () => {
    const {passes} = await check('memory/world-state', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one number both of them read', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const lives = () => ({
        block: {type: 'world_get_WorldsMain_LivesProperty'},
      });
      for (const row of rowsOf(workspace)) {
        const text = bodyOf(row).find(
          block => block.type === 'world_set_Writing_TextProperty',
        );
        if (text) {
          text.inputs!.VALUE = joined('Lives: ', lives());
        }
      }
      // …and the declaration itself, above everything that reads it.
      workspace.blocks.blocks[0].next = {
        block: {
          type: 'world_rule_property',
          fields: {
            TYPE: 'number',
            ACCESS: 'writable',
            NAME: 'lives',
            DEFAULT: '3',
          },
          next: workspace.blocks.blocks[0].next,
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('memory/world-state', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Two Labels agree the moment you type the same words into both, and that is
  // not one number — it is two copies that have not drifted apart YET.
  it('refuses the same words typed into both', async () => {
    const byHand = editing(lesson.source, 'main.world', contents =>
      contents.replace('Lives: 2', 'Lives: 3'),
    );
    // The world really does agree with itself…
    expect(await outcomeOf('memory/world-state', byHand)).toBe(true);
    // …and it is still two strings.
    const {passes} = await check('memory/world-state', byHand);
    expect(passes).toBe(false);
  });
});

describe('the actor-state lesson’s check', () => {
  const lesson = LESSONS['memory/actor-state'];

  /** `id of ⟨this actor⟩`, the property the solved lesson declares. */
  const ownId = () => ({
    block: {
      type: 'world_get_ActorsLamp_IdProperty',
      inputs: {ACTOR: THIS_ACTOR},
    },
  });

  /** The world with each Lamp given its own number, as the lesson says. */
  const worldWithOwnIds = (contents: string): string => {
    const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
    // The world's own `id` goes: step 4 of the lesson, and nothing needs it.
    const declaration = workspace.blocks.blocks[0].next!.block!;
    workspace.blocks.blocks[0].next = declaration.next;
    rowsOf(workspace).forEach((row, index) => {
      const [place, text] = bodyOf(row);
      place.next = {
        block: {
          type: 'world_set_ActorsLamp_IdProperty',
          inputs: {
            ACTOR: THIS_ACTOR,
            VALUE: {shadow: {type: 'math_number', fields: {NUM: index + 1}}},
          },
          next: {block: text},
        },
      };
      text.inputs!.VALUE = joined('lamp ', ownId());
    });
    return JSON.stringify(workspace);
  };

  it('refuses two Lamps reading the world’s one number', async () => {
    const {passes} = await check('memory/actor-state', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a number each Lamp holds for itself', async () => {
    const declared = editing(lesson.source, 'lamp.actor', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Lamp'), {
        type: 'world_rule_property',
        fields: {
          TYPE: 'number',
          ACCESS: 'writable',
          NAME: 'id',
          DEFAULT: '1',
        },
      });
      return JSON.stringify(workspace);
    });
    const solved = editing(declared, 'main.world', worldWithOwnIds);
    const {passes, result} = await check('memory/actor-state', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The one that works and is still not the lesson: the text is built as each
  // Lamp is added, so setting the world's number in between makes the two
  // Labels differ. What it leaves behind is nothing — no Lamp holds a number,
  // and nothing can ask one afterwards.
  it('refuses the world’s number set twice', async () => {
    const twice = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      // Between the two `add actor` rows: the first Lamp is built while the
      // number is 1, the second while it is 2. rows[0] is the declaration.
      const rows = rowsOf(workspace);
      rows[1].next = {
        block: {
          type: 'world_set_WorldsMain_IdProperty',
          inputs: {
            VALUE: {shadow: {type: 'math_number', fields: {NUM: 2}}},
          },
          next: {block: rows[2]},
        },
      };
      return JSON.stringify(workspace);
    });
    // It worked: the two Labels really do say different things…
    expect(await outcomeOf('memory/actor-state', twice)).toBe(true);
    // …and no Lamp knows which one it is.
    const {passes} = await check('memory/actor-state', twice);
    expect(passes).toBe(false);
  });
});

describe('the score lesson’s check', () => {
  const lesson = LESSONS['memory/score'];

  it('refuses the tally the lesson starts with', async () => {
    // It counts perfectly — six clicks, six lines, one to six — and that is
    // the lesson: a tally is right and still cannot say when it is enough.
    const played = await playedOf('memory/score', lesson.source);
    expect(played.console).toEqual(['1', '2', '3', '4', '5', '6']);
    const {passes} = await check('memory/score', lesson.source);
    expect(passes).toBe(false);
  });

  /** The world with Scoring doing the counting, as the instructions say. */
  const swapped = (contents: string): string => {
    const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
    // `define number counted` goes, and `set target score` takes its place.
    const declaration = workspace.blocks.blocks[0].next!.block!;
    workspace.blocks.blocks[0].next = {
      block: {
        type: 'world_set_Scoring_TargetScoreProperty',
        inputs: {VALUE: {shadow: {type: 'math_number', fields: {NUM: 5}}}},
        next: declaration.next,
      },
    };
    // The click handler adds to the score and says nothing…
    const clicks = workspace.blocks.blocks.find(
      block => block.type === 'world_on_Mouse_IsPressedEvent',
    )!;
    clicks.next = {
      block: {
        type: 'world_do_Scoring_AddToTheScoreAction',
        inputs: {VALUE: {shadow: {type: 'math_number', fields: {NUM: 1}}}},
      },
    };
    // …and a second handler says the one thing worth saying.
    workspace.blocks.blocks.push({
      type: 'world_on_Scoring_TheTargetIsReachedEvent',
      x: 660,
      y: 20,
      next: {
        block: {
          type: 'world_print',
          inputs: {VALUE: {block: {type: 'world_get_Scoring_ScoreProperty'}}},
        },
      },
    } as unknown as Row);
    return JSON.stringify(workspace);
  };

  it('accepts the swap for the rule that already had it', async () => {
    const scored = importStockRule(lesson.source, stockRule('score')!).source;
    const solved = editing(scored, 'main.world', swapped);
    const {passes, result} = await check('memory/score', solved);
    expect(result.error).toBeUndefined();
    // Once, at five — not six times, and not at six.
    expect(result.console).toEqual(['5']);
    expect(passes).toBe(true);
  });
});

describe('the drawing lesson’s check', () => {
  const lesson = LESSONS['look/drawing'];

  it('refuses two Bars drawn the same', async () => {
    const {passes} = await check('look/drawing', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a width that reads the Bar', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      // The green rectangle is the second `draw rectangle` in the drawing,
      // and its width is the number the lesson replaces.
      const drawing = rowOf(actorIn(workspace, 'Bar'), 'world_define_drawing');
      let row = inSocket(drawing, 'DO');
      const widths: Row[] = [];
      for (; row; row = row.next?.block) {
        if (row.type === 'world_draw_rectangle') {
          widths.push(row);
        }
      }
      widths[1].inputs!.WIDTH = {
        block: {
          type: 'math_arithmetic',
          fields: {OP: 'MULTIPLY'},
          inputs: {
            A: {shadow: {type: 'math_number', fields: {NUM: 96}}},
            B: {
              block: {
                type: 'world_get_WorldsMainBar_FractionProperty',
                inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
              },
            },
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('look/drawing', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the backdrop lesson’s check', () => {
  const lesson = LESSONS['look/background'];

  it('refuses a world with a color and no picture', async () => {
    const {passes} = await check('look/background', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that is set, tiled and slid', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const world = workspace.blocks.blocks[0];
      // Above the actor, which is where a learner drops them: the three blocks
      // the lesson asks for, in the order it asks for them.
      world.next = {
        block: {
          type: 'world_set_background',
          fields: {BACKGROUND: 'meadow.png'},
          next: {
            block: {
              type: 'world_set_background_repeat',
              // 'true' rather than 'tiled': the label is what a learner reads and the
              // value is what the block carries.
              fields: {REPEAT: 'true'},
              next: {
                block: {
                  type: 'world_set_background_offset',
                  inputs: {
                    OFFSET: {
                      block: {
                        type: 'world_vector',
                        fields: {VECTOR: {x: 40, y: 0}},
                      },
                    },
                  },
                  next: world.next,
                },
              },
            },
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('look/background', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Each of the three on its own is not the lesson, and the check says so: a
  // backdrop that is set but not tiled is step two of four.
  it('refuses a backdrop that is only set', async () => {
    const half = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const world = workspace.blocks.blocks[0];
      world.next = {
        block: {
          type: 'world_set_background',
          fields: {BACKGROUND: 'meadow.png'},
          next: world.next,
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes} = await check('look/background', half);
    expect(passes).toBe(false);
  });
});

describe('the animation lesson’s check', () => {
  const lesson = LESSONS['look/animation'];

  it('refuses a Hero wearing one picture', async () => {
    const {passes} = await check('look/animation', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one playing a walk cycle', async () => {
    // What importing does, in its two moves: the animation lands in the
    // project with the image it reads, and the actor names it.
    const imported = importStockAnimation(
      lesson.source,
      stockAnimation('playerWalk')!,
    );
    const solved = editing(imported.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Hero'), {
        type: 'world_play_animation',
        fields: {ANIMATION: imported.value},
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
      });
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('look/animation', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the effect lesson’s check', () => {
  const lesson = LESSONS['look/effect'];

  it('refuses a world painted plainly', async () => {
    const {passes} = await check('look/effect', lesson.source);
    expect(passes).toBe(false);
  });

  /** What importing an effect and playing it comes to. */
  const playing = (where: 'coin' | 'both') => {
    const imported = importStockEffect(lesson.source, stockEffect('tint')!);
    return editing(imported.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Coin'), {
        type: 'world_add_effect',
        fields: {EFFECT: imported.path},
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
      });
      if (where === 'both') {
        const world = workspace.blocks.blocks[0];
        world.next = {
          block: {
            type: 'world_add_world_effect',
            fields: {EFFECT: imported.path},
            next: world.next,
          },
        };
      }
      return JSON.stringify(workspace);
    });
  };

  it('accepts one on an actor and one on the view', async () => {
    const {passes, result} = await check('look/effect', playing('both'));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Half the lesson: the actor is painted through it and the view is not.
  it('refuses an effect that is only on the actor', async () => {
    const {passes} = await check('look/effect', playing('coin'));
    expect(passes).toBe(false);
  });
});

describe('the edges lesson’s check', () => {
  const lesson = LESSONS['place/edges'];

  /** The Ball, with the traits a learner elected. */
  const electing2 = (traits: readonly string[]) =>
    editing(lesson.source, 'main.world', contents =>
      traits.reduce(
        (workspace, trait) => electing(workspace, trait, 'Ball'),
        contents,
      ),
    );

  it('refuses a Ball that leaves and keeps going', async () => {
    const {passes} = await check('place/edges', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one stopped across and wrapped down', async () => {
    const {passes, result} = await check(
      'place/edges',
      electing2(['Boundaries#StaysAcrossTrait', 'Screen Wrap#WrapsDownTrait']),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The false pass, and the reason the check reads two things: all four traits
  // keeps the Ball on screen, and it never wraps — it stops in the corner,
  // because on each axis the first answer to act is the only one seen.
  it('refuses all four traits at once', async () => {
    const {passes} = await check(
      'place/edges',
      electing2([
        'Boundaries#StaysAcrossTrait',
        'Boundaries#StaysDownTrait',
        'Screen Wrap#WrapsAcrossTrait',
        'Screen Wrap#WrapsDownTrait',
      ]),
    );
    expect(passes).toBe(false);
  });
});

describe('the map lesson’s check', () => {
  const lesson = LESSONS['place/map'];

  it('refuses a floor of three tiles', async () => {
    const {passes} = await check('place/map', lesson.source);
    expect(passes).toBe(false);
  });

  /** The room, painted — which is an edit to the block's own grid field. */
  const painted = (rows: number) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const grid = rowsOf(workspace).find(
        row => row.type === 'world_create_in_map',
      )!;
      const tiles = [];
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < 10; column++) {
          tiles.push({
            id: `floor${row}_${column}`,
            properties: {
              positional: {
                position: {x: column * 32 + 16, y: 304 - row * 32},
              },
            },
          });
        }
      }
      grid.fields!.PLACEMENTS = tiles;
      return JSON.stringify(workspace);
    });

  it('accepts a room painted on the grid', async () => {
    const {passes, result} = await check('place/map', painted(2));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // One row is a floor and not a room, and it is also what the starter nearly
  // has: the check asks for a second row so that "paint the walls" is part of
  // the lesson rather than an afterthought.
  it('refuses a single row', async () => {
    const {passes} = await check('place/map', painted(1));
    expect(passes).toBe(false);
  });
});

describe('the camera lesson’s check', () => {
  const lesson = LESSONS['place/camera'];

  /** `define camera ⟨Chase⟩ …` and the block that looks through it. */
  const chasing = (confined: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const rows = rowsOf(workspace);
      const traits: Row[] = [
        {
          type: 'world_use_trait',
          fields: {TRAIT: 'Camera Follow#FollowsTrait'},
        },
        ...(confined
          ? [
              {
                type: 'world_use_trait',
                fields: {TRAIT: 'Camera Confined#ConfinedToTheMapTrait'},
              },
            ]
          : []),
        {
          type: 'world_set_CameraFollow_ActorToFollowProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_camera'}},
            VALUE: {
              block: {type: 'world_actor_kind', fields: {ACTOR: local('hero')}},
            },
          },
        },
      ];
      // The camera goes LAST, after the Hero exists: `any ⟨Hero⟩` is read where
      // it is written, and read too early it is a view that never moves.
      rows[rows.length - 1].next = {
        block: {
          type: 'world_define_camera',
          id: 'chase',
          fields: {NAME: 'Chase'},
          inputs: {
            DO: {
              block: traits.reduceRight((next, block) => ({
                ...block,
                next: {block: next},
              })),
            },
          },
          next: {
            block: {type: 'world_use_camera', fields: {CAMERA: 'camera:chase'}},
          },
        },
      };
      return JSON.stringify(workspace);
    });

  it('refuses a view that never moves', async () => {
    const {passes} = await check('place/camera', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that follows and stops at the wall', async () => {
    const {passes, result} = await check('place/camera', chasing(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Following is the easy half and looks perfect for a second: the view leaves
  // the room behind the Hero and shows three screens of nothing.
  it('refuses following without confining', async () => {
    const {passes} = await check('place/camera', chasing(false));
    expect(passes).toBe(false);
  });
});

describe('the camera-feel lesson’s check', () => {
  const lesson = LESSONS['place/camera-feel'];

  /** The camera, with the traits a learner elected and the numbers they set. */
  const tuned = (options: {ease?: boolean; deadzone?: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const camera = rowsOf(workspace).find(
        row => row.type === 'world_define_camera',
      )!;
      const rows: Row[] = [
        ...(options.ease
          ? [
              {
                type: 'world_use_trait',
                fields: {TRAIT: 'Camera Ease#EasesTrait'},
              },
              {
                type: 'world_set_CameraEase_SmoothnessProperty',
                inputs: {
                  ACTOR: {block: {type: 'world_this_camera'}},
                  VALUE: {shadow: {type: 'math_number', fields: {NUM: 0.25}}},
                },
              },
            ]
          : []),
        ...(options.deadzone
          ? [
              {
                type: 'world_use_trait',
                fields: {TRAIT: 'Camera Deadzone#HasADeadzoneTrait'},
              },
              {
                type: 'world_set_CameraDeadzone_SlackProperty',
                inputs: {
                  ACTOR: {block: {type: 'world_this_camera'}},
                  X: {shadow: {type: 'math_number', fields: {NUM: 64}}},
                  Y: {shadow: {type: 'math_number', fields: {NUM: 32}}},
                },
              },
            ]
          : []),
      ];
      if (rows.length) {
        let last = inSocket(camera, 'DO')!;
        while (last.next?.block) {
          last = last.next.block;
        }
        last.next = {
          block: rows.reduceRight((next, row) => ({
            ...row,
            next: {block: next},
          })),
        };
      }
      return JSON.stringify(workspace);
    });

  it('refuses a view welded to the Hero', async () => {
    const {passes} = await check('place/camera-feel', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one with slack and a moment to catch up', async () => {
    const {passes, result} = await check(
      'place/camera-feel',
      tuned({ease: true, deadzone: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Each on its own answers one of the two complaints. Easing still lurches on
  // the first step; a deadzone alone still arrives with a bang.
  it('refuses easing alone', async () => {
    const {passes} = await check('place/camera-feel', tuned({ease: true}));
    expect(passes).toBe(false);
  });

  it('refuses a deadzone alone', async () => {
    const {passes} = await check('place/camera-feel', tuned({deadzone: true}));
    expect(passes).toBe(false);
  });
});

describe('the layers lesson’s check', () => {
  const lesson = LESSONS['place/layers'];

  it('refuses a score that scrolls away with the scenery', async () => {
    const {passes} = await check('place/layers', lesson.source);
    expect(passes).toBe(false);
  });

  /** The world with the two layers declared and the actors moved into them. */
  const layered = (options: {fixed?: boolean; parallax?: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const rows = rowsOf(workspace);
      const named = (actor: string) =>
        rows.filter(row => row.fields?.ACTOR === local(actor));
      // The rows that move into a layer come OUT of the world's own chain, the
      // way dragging them in would take them out.
      const kept = rows.filter(
        row =>
          row.fields?.ACTOR !== local('score') &&
          row.fields?.ACTOR !== local('hill'),
      );
      const inside = (rowsIn: Row[], settings: Row[], name: string): Row => ({
        type: 'world_define_layer',
        fields: {NAME: name},
        inputs: {
          DO: {
            block: [...settings, ...rowsIn].reduceRight((next, row) => ({
              ...row,
              next: {block: next},
            })),
          },
        },
      });
      const declared: Row[] = [
        ...(options.parallax
          ? [
              inside(
                named('hill'),
                [
                  {
                    type: 'world_layer_parallax',
                    fields: {PARALLAX: {x: 0.4, y: 1}},
                  },
                ],
                'Hills',
              ),
            ]
          : []),
        ...(options.fixed
          ? [
              inside(
                named('score'),
                [{type: 'world_layer_fixed', fields: {FIXED: 'fixed'}}],
                'Interface',
              ),
            ]
          : []),
      ];
      workspace.blocks.blocks[0].next = {
        block: [...declared, ...kept].reduceRight((next, row) => ({
          ...row,
          next: {block: next},
        })),
      };
      return JSON.stringify(workspace);
    });

  it('accepts a fixed interface and hills that lag', async () => {
    const {passes, result} = await check(
      'place/layers',
      layered({fixed: true, parallax: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a fixed score with the hills left behind', async () => {
    const {passes} = await check('place/layers', layered({fixed: true}));
    expect(passes).toBe(false);
  });
});

describe('the surfaces lesson’s check', () => {
  const lesson = LESSONS['platformer/surfaces'];

  /** The lesson done, or any part of it: one `use trait` per named actor. */
  const acting = (traits: Record<string, string>) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      for (const [actor, trait] of Object.entries(traits)) {
        under(actorIn(workspace, actor), {
          type: 'world_use_trait',
          fields: {TRAIT: trait},
        });
      }
      return JSON.stringify(workspace);
    });

  const DONE = {
    Hero: 'Surfaces#StandsOnSurfacesTrait',
    Belt: 'Surfaces#ConveysTrait',
    Sludge: 'Surfaces#SlowsTrait',
    Ice: 'Surfaces#SlipperyTrait',
  };

  it('refuses three floors that are only pictures', async () => {
    const {passes} = await check('platformer/surfaces', lesson.source);
    expect(passes).toBe(false);
  });

  it('refuses a walker with nothing to walk on', async () => {
    // The listener without the floors, which is the lesson's first step and
    // changes nothing at all — which is what its instructions say.
    const {passes} = await check(
      'platformer/surfaces',
      acting({Hero: DONE.Hero}),
    );
    expect(passes).toBe(false);
  });

  it('refuses a belt and sludge without the ice', async () => {
    // The false pass, made concrete: two thirds of the lesson makes the walk
    // longer and slower, and the check must not read that as done. Turning
    // round at the end is the part only ice refuses.
    const {passes} = await check(
      'platformer/surfaces',
      acting({Hero: DONE.Hero, Belt: DONE.Belt, Sludge: DONE.Sludge}),
    );
    expect(passes).toBe(false);
  });

  it('accepts all three floors acting', async () => {
    const {passes, result} = await check('platformer/surfaces', acting(DONE));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the enemy lesson’s check', () => {
  const lesson = LESSONS['platformer/enemies'];

  /** The Ball given a trait, whichever one. */
  const rolling = (trait: string) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Ball'), {
        type: 'world_use_trait',
        fields: {TRAIT: trait},
      });
      return JSON.stringify(workspace);
    });

  it('refuses the ball that sits there', async () => {
    const {passes} = await check('platformer/enemies', lesson.source);
    expect(passes).toBe(false);
  });

  it('refuses a patrol, which also goes back and forth', async () => {
    // The false pass written on the tile, made concrete. A patrol turns after
    // a fixed time, so its turning points slide along the corridor as the two
    // periods drift — and the check measures WHERE it turned.
    const {passes, result} = await check(
      'platformer/enemies',
      rolling('Patrol#PatrolsAcrossTrait'),
    );
    // It really did go back and forth, which is why "it reversed" would not
    // have been enough to ask.
    const xs = (result.samples.ball as {x: number}[][]).map(at => at[0].x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(30);
    expect(passes).toBe(false);
  });

  it('accepts something that turns at the wall', async () => {
    const {passes, result} = await check(
      'platformer/enemies',
      rolling('Turning#TurnsWhenItHitsSomethingTrait'),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the hunter lesson’s check', () => {
  const lesson = LESSONS['platformer/hunter'];

  /** The lesson done: Chases swapped for Prowls, and the quarry re-pointed. */
  const prowling = () =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      // The trait and the setter, which the lesson names as two edits and
      // which live at two depths: the trait is a row beside the others, and
      // the setter is inside the step that runs it — so this descends.
      const swap = (row: Row | undefined) => {
        for (let at = row; at; at = at.next?.block) {
          if (at.fields?.TRAIT === 'Steering#ChasesTrait') {
            at.fields = {TRAIT: 'Prowling#ProwlsTrait'};
          }
          if (at.type === 'world_set_Steering_ActorToChaseProperty') {
            at.type = 'world_set_Prowling_ActorToHuntProperty';
          }
          swap(inSocket(at, 'DO'));
        }
      };
      swap(actorIn(workspace, 'Robot'));
      return JSON.stringify(workspace);
    });

  it('refuses the chaser it starts from', async () => {
    // The false pass written on the tile, and it is the starter: a chaser
    // really does come after you, and really cannot get up a ladder.
    const {passes, result} = await check('platformer/hunter', lesson.source);
    const ys = (result.samples.robot as {y: number}[][]).map(at => at[0].y);
    // It really is chasing rather than stuck: the Hero is straight above it,
    // so it rises — and stops dead against the underside of the floor she is
    // standing on, which is the whole of what a chaser can do here.
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(40);
    expect(passes).toBe(false);
  });

  it('accepts a robot that takes the ladder', async () => {
    const {passes, result} = await check('platformer/hunter', prowling());
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the ladder lesson’s check', () => {
  const lesson = LESSONS['platformer/ladders'];

  /** The two `use trait` rows the lesson asks for. */
  /**
   * `arrows` writes the blocks the sparkles write, which is where the control
   * scheme lives: `Climbs` is the mechanic and the keys are the actor's own
   * `presses`/`releases` handlers (`actors/enhance/climbArrows`). A hero given
   * the trait and nothing else can climb and is never told to, which is step 7
   * of the lesson and is not a pass.
   *
   * ROOTS OF THE WORLD, not rows under the Hero: a hat takes no previous
   * connection, and one written in a world names the kind it is about.
   */
  const climbing = (
    heroTraits: readonly string[],
    ladderTraits: string[],
    arrows = false,
  ) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      for (const trait of heroTraits) {
        under(actorIn(workspace, 'Hero'), {
          type: 'world_use_trait',
          fields: {TRAIT: trait},
        });
      }
      if (arrows) {
        workspace.blocks.blocks.push(
          ...(climbArrowsHandlers({
            kind: 'actor',
            path: 'worlds/main',
            name: 'Hero',
            block: 'hero',
          }) as Row[]),
        );
      }
      for (const trait of ladderTraits) {
        under(actorIn(workspace, 'Ladder'), {
          type: 'world_use_trait',
          fields: {TRAIT: trait},
        });
      }
      return JSON.stringify(workspace);
    });

  it('refuses the picture it starts from', async () => {
    // A ladder that is only a drawing, which is the whole of the starter.
    const {passes} = await check('platformer/ladders', lesson.source);
    expect(passes).toBe(false);
  });

  it('refuses a climber with nothing to climb', async () => {
    // Half the lesson: the Hero can climb and the ladder is still a picture,
    // so `start climbing up` is refused every frame and nothing moves.
    const {passes} = await check(
      'platformer/ladders',
      climbing(['Climbing#ClimbsTrait'], [], true),
    );
    expect(passes).toBe(false);
  });

  it('accepts a ladder and somebody to climb it', async () => {
    const {passes, result} = await check(
      'platformer/ladders',
      climbing(['Climbing#ClimbsTrait'], ['Climbing#CanBeClimbedTrait'], true),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the jetpack lesson’s check', () => {
  const lesson = LESSONS['platformer/jetpack'];

  /** The Hero given the trait, and the switch on the two moments a key gives. */
  const flying = () =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Hero'), {
        type: 'world_use_trait',
        fields: {TRAIT: 'Jetpack#FliesWithAJetpackTrait'},
      });
      // The press starts it, BESIDE the jump the lesson opens with rather
      // than in place of it: with an empty tank `start flying` does nothing,
      // so the same press is still a jump and no question had to be written.
      const hat = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Input_PressesEvent',
      )!;
      const jump = hat.next!.block!;
      jump.next = {
        block: {
          type: 'world_do_Jetpack_StartFlyingAction',
          inputs: {VALUE: {block: {type: 'world_this_actor'}}},
        },
      };
      // …and the release stops it. Two moments, two blocks, and no frames
      // counted anywhere in the project.
      workspace.blocks.blocks.push({
        type: 'world_on_Input_ReleasesEvent',
        fields: {FILTER0: 'space'},
        inputs: {ACTOR: anyKind('hero')},
        next: {
          block: {
            type: 'world_do_Jetpack_StopFlyingAction',
            inputs: {VALUE: {block: {type: 'world_this_actor'}}},
          },
        },
      } as Row);
      return JSON.stringify(workspace);
    });

  /** …and the other way of clearing the ledge, which is not the lesson. */
  const strongerJump = () =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Hero'), {
        type: 'world_set_Jumping_JumpStrengthProperty',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          VALUE: {shadow: {type: 'math_number', fields: {NUM: 12}}},
        },
      });
      return JSON.stringify(workspace);
    });

  it('refuses the jump it starts from, however long the key is held', async () => {
    // A press is a moment. Holding for a second and a fifth is one jump, and
    // one jump does not reach a ledge six tiles up.
    const {passes} = await check('platformer/jetpack', lesson.source);
    expect(passes).toBe(false);
  });

  it('refuses a jump tuned until it clears the ledge', async () => {
    // The false pass written on the tile. It gets up there and spends nothing,
    // which is why the check reads the tank as well as the height.
    const {passes, result} = await check('platformer/jetpack', strongerJump());
    expect(
      Math.min(...(result.samples.hero as {y: number}[][]).map(at => at[0].y)),
    ).toBeLessThan(120);
    expect(passes).toBe(false);
  });

  it('accepts the switch on the press and the release', async () => {
    const {passes, result} = await check('platformer/jetpack', flying());
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the jump lesson’s check', () => {
  const lesson = LESSONS['platformer/jump'];

  /** The Hero given the trait, the action, and however many jumps. */
  const jumping = (allowed?: number) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Hero'), {
        type: 'world_use_trait',
        fields: {TRAIT: 'Jumping#JumpsTrait'},
      });
      // The handler's body becomes the action — `make ⟨…⟩ jump`, whose subject
      // socket is VALUE rather than ACTOR.
      const hat = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Input_PressesEvent',
      )!;
      hat.next = {
        block: {
          type: 'world_do_Jumping_MakeJumpAction',
          inputs: {VALUE: {block: {type: 'world_this_actor'}}},
        },
      };
      if (allowed !== undefined) {
        const placement = rowsOf(workspace).find(
          row => row.fields?.ACTOR === local('hero'),
        )!;
        let last = inSocket(placement, 'DO')!;
        while (last.next?.block) {
          last = last.next.block;
        }
        last.next = {
          block: {
            type: 'world_set_Jumping_JumpsAllowedProperty',
            inputs: {
              ACTOR: {block: {type: 'world_this_actor'}},
              VALUE: {shadow: {type: 'math_number', fields: {NUM: allowed}}},
            },
          },
        };
      }
      return JSON.stringify(workspace);
    });

  it('refuses the hand-written jump it starts from', async () => {
    const {passes, result} = await check('platformer/jump', lesson.source);
    // It goes up, and up, and up: three presses and it is off the top.
    expect(
      Math.min(...(result.samples.hero as {y: number}[][]).map(at => at[0].y)),
    ).toBeLessThan(0);
    expect(passes).toBe(false);
  });

  it('refuses one jump, which is the lesson half done', async () => {
    const {passes} = await check('platformer/jump', jumping());
    expect(passes).toBe(false);
  });

  it('accepts two, spent and no more', async () => {
    const {passes, result} = await check('platformer/jump', jumping(2));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The other end of the same mistake: a jump with no limit answers the third
  // press too, and the Hero climbs out of the world.
  it('refuses a jump with no limit', async () => {
    const {passes} = await check('platformer/jump', jumping(99));
    expect(passes).toBe(false);
  });
});

describe('the pickups lesson’s check', () => {
  const lesson = LESSONS['platformer/pickups'];

  it('refuses a Hero that walks through them', async () => {
    const {passes} = await check('platformer/pickups', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the two abilities, one on each side', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      electing(
        electing(contents, 'Collection#CollectsTrait', 'Hero'),
        'Collection#CanBeCollectedTrait',
        'Coin',
      ),
    );
    const {passes, result} = await check('platformer/pickups', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // One side is not a pair: a Hero that collects and coins that cannot be
  // collected walks through them exactly as before.
  it('refuses only the Hero electing', async () => {
    const half = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Collection#CollectsTrait', 'Hero'),
    );
    const {passes} = await check('platformer/pickups', half);
    expect(passes).toBe(false);
  });
});

describe('the hazards lesson’s check', () => {
  const lesson = LESSONS['platformer/hazards'];

  it('refuses a spike that does not mind', async () => {
    const {passes} = await check('platformer/hazards', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the two abilities, one on each side', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      electing(
        electing(contents, 'Health#HasHealthTrait', 'Hero'),
        'Health#DealsDamageTrait',
        'Spike',
      ),
    );
    const {passes, result} = await check('platformer/hazards', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // A Hero that can be hurt and a Spike that hurts nobody: the pair is what
  // does it, and one half of a pair does nothing at all.
  it('refuses a Hero with health and a harmless spike', async () => {
    const half = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Health#HasHealthTrait', 'Hero'),
    );
    const {passes} = await check('platformer/hazards', half);
    expect(passes).toBe(false);
  });
});

describe('the level lesson’s check', () => {
  const lesson = LESSONS['platformer/level'];

  /** `when ⟨any Hero⟩ starts touching → …`, with or without the question. */
  const winning = (asking: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const win: Row = {
        type: 'world_set_WorldsMain_WonProperty',
        inputs: {
          VALUE: {block: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
        },
      };
      workspace.blocks.blocks.push({
        type: 'world_on_Collisions_StartsTouchingEvent',
        x: 700,
        y: 20,
        fields: {FILTER0: ''},
        inputs: {
          ACTOR: {
            block: {type: 'world_actor_kind', fields: {ACTOR: local('hero')}},
          },
        },
        next: {
          block: asking
            ? {
                type: 'controls_if',
                inputs: {
                  IF0: {
                    block: {
                      type: 'world_is_a',
                      fields: {TYPE: local('flag')},
                      inputs: {ACTOR: {block: {type: 'world_event_actor'}}},
                    },
                  },
                  DO0: {block: win},
                },
              }
            : win,
        },
      } as unknown as Row);
      return JSON.stringify(workspace);
    });

  it('refuses a Flag that means nothing', async () => {
    const {passes} = await check('platformer/level', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a win that asks what it touched', async () => {
    const {passes, result} = await check('platformer/level', winning(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The false pass the tile was written against: a win on any touch is true
  // from the first Coin, which is a level you cannot lose and cannot play.
  it('refuses a win that fires on any touch', async () => {
    const {passes} = await check('platformer/level', winning(false));
    expect(passes).toBe(false);
  });
});

describe('the bounce lesson’s check', () => {
  const lesson = LESSONS['arcade/bounce'];

  /** The Wall given a bounciness, where a kind's properties are set. */
  const bouncy = (amount: number) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Wall'), {
        type: 'world_set_SolidBodies_BouncinessProperty',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          VALUE: {shadow: {type: 'math_number', fields: {NUM: amount}}},
        },
      });
      return JSON.stringify(workspace);
    });

  it('refuses a Ball that stops at the wall', async () => {
    const {passes} = await check('arcade/bounce', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a wall that gives all the speed back', async () => {
    const {passes, result} = await check('arcade/bounce', bouncy(1));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Half is a bounce and is not the lesson: every bounce is smaller than the
  // last, which is what the check measures at the two ends of the run.
  it('refuses a bounce that decays', async () => {
    const {passes} = await check('arcade/bounce', bouncy(0.5));
    expect(passes).toBe(false);
  });
});

describe('the paddle lesson’s check', () => {
  const lesson = LESSONS['arcade/paddle'];

  it('refuses a fence around the position', async () => {
    const {passes, result} = await check('arcade/paddle', lesson.source);
    // It does stop — with its middle at the wall, so half of it is outside.
    expect(lastOf(result.samples.paddle)[0].x).toBeLessThan(4);
    expect(passes).toBe(false);
  });

  it('accepts the rule that knows how wide it is', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const paddle = actorIn(workspace, 'Paddle');
      without(paddle, 'world_trait_step');
      under(paddle, {
        type: 'world_use_trait',
        fields: {TRAIT: 'Boundaries#StaysAcrossTrait'},
      });
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('arcade/paddle', solved);
    expect(result.error).toBeUndefined();
    // Forty-eight, which is half of ninety-six, and nowhere written down.
    expect(lastOf(result.samples.paddle)[0].x).toBeCloseTo(48, 0);
    expect(passes).toBe(true);
  });
});

describe('the zapping lesson’s check', () => {
  const lesson = LESSONS['arcade/zap'];

  /** The recharge in front of the spawn, and optionally a lifetime behind. */
  const armed = (lifetime?: number) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      under(actorIn(workspace, 'Ship'), {
        type: 'world_use_trait',
        fields: {TRAIT: 'Zapping#ZapsTrait'},
      });
      // The press asks to zap; the spawn moves to the `zaps` event, which is
      // the moment the rule answers yes.
      const hat = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Input_PressesEvent',
      )!;
      const spawn = hat.next!.block!;
      hat.next = {
        block: {
          type: 'world_do_Zapping_MakeZapAction',
          inputs: {VALUE: {block: {type: 'world_this_actor'}}},
        },
      };
      workspace.blocks.blocks.push({
        type: 'world_on_Zapping_ZapsEvent',
        x: 900,
        y: 20,
        inputs: {
          ACTOR: {
            block: {type: 'world_actor_kind', fields: {ACTOR: local('ship')}},
          },
        },
        next: {block: spawn},
      } as unknown as Row);
      if (lifetime !== undefined) {
        const ball = actorIn(workspace, 'Energy Ball');
        under(ball, {
          type: 'world_set_Expiry_LifetimeProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {shadow: {type: 'math_number', fields: {NUM: lifetime}}},
          },
        });
        under(ball, {
          type: 'world_use_trait',
          fields: {TRAIT: 'Expiry#ExpiresTrait'},
        });
      }
      return JSON.stringify(workspace);
    });

  it('refuses one per press that never leaves', async () => {
    const {passes, result} = await check('arcade/zap', lesson.source);
    // Ten presses, ten balls, and all ten still there at the end.
    expect(lastNumberOf(result.samples.balls)).toBe(10);
    expect(passes).toBe(false);
  });

  it('refuses a recharge with nothing to clean up', async () => {
    const {passes} = await check('arcade/zap', armed());
    expect(passes).toBe(false);
  });

  it('accepts a recharge in front and a lifetime behind', async () => {
    const {passes, result} = await check('arcade/zap', armed(1));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the bricks lesson’s check', () => {
  const lesson = LESSONS['arcade/bricks'];

  /** The ending, asked where the lesson says to ask it — or on any Brick. */
  const ending = (options: {counting: boolean; where: 'frame' | 'handler'}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const done: Row = {
        type: 'controls_if',
        inputs: {
          IF0: {
            block: options.counting
              ? {
                  type: 'logic_compare',
                  fields: {OP: 'EQ'},
                  inputs: {
                    A: {
                      block: {
                        type: 'world_count_of_kind',
                        fields: {TYPE: local('brick')},
                        inputs: {LIST: {block: {type: 'world_all_actors'}}},
                      },
                    },
                    B: {shadow: {type: 'math_number', fields: {NUM: 0}}},
                  },
                }
              : {type: 'logic_boolean', fields: {BOOL: 'TRUE'}},
          },
          DO0: {
            block: {
              type: 'world_set_WorldsMain_ClearedProperty',
              inputs: {
                VALUE: {block: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
              },
            },
          },
        },
      };
      if (options.where === 'frame') {
        under(actorIn(workspace, 'Ball'), {
          type: 'world_trait_step',
          fields: {PHASE: 'decide', NAME: 'is it over'},
          inputs: {DO: {block: done}},
        });
      } else {
        const hat = workspace.blocks.blocks.find(
          block => block.type === 'world_on_Collisions_StartsTouchingEvent',
        )!;
        hat.next!.block!.next = {block: done};
      }
      return JSON.stringify(workspace);
    });

  it('refuses a game that never ends', async () => {
    const {passes} = await check('arcade/bricks', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the question asked each frame', async () => {
    const {passes, result} = await check(
      'arcade/bricks',
      ending({counting: true, where: 'frame'}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses an ending on any Brick going', async () => {
    const {passes} = await check(
      'arcade/bricks',
      ending({counting: false, where: 'frame'}),
    );
    expect(passes).toBe(false);
  });

  // Step 4 of the lesson, as a test: the same question in the touch handler
  // never fires, because `remove actor` takes effect at the END of the frame
  // and the Brick just removed is still in `all actors` while it is counted.
  it('refuses the count taken in the handler that removes', async () => {
    const {passes} = await check(
      'arcade/bricks',
      ending({counting: true, where: 'handler'}),
    );
    expect(passes).toBe(false);
  });
});

describe('the waves lesson’s check', () => {
  const lesson = LESSONS['arcade/waves'];

  /** The timer handler, told to shrink its own period — or to send two. */
  const harder = (how: 'sooner' | 'more') =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const hat = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Time_TimerFiresEvent',
      )!;
      const spawn = hat.next!.block!;
      spawn.next = {
        block:
          how === 'sooner'
            ? {
                type: 'world_set_Time_TimerPeriodProperty',
                inputs: {
                  ACTOR: {block: {type: 'world_this_actor'}},
                  VALUE: {
                    block: {
                      type: 'math_arithmetic',
                      fields: {OP: 'MULTIPLY'},
                      inputs: {
                        A: {
                          block: {
                            type: 'world_get_Time_TimerPeriodProperty',
                            inputs: {
                              ACTOR: {block: {type: 'world_this_actor'}},
                            },
                          },
                        },
                        B: {shadow: {type: 'math_number', fields: {NUM: 0.8}}},
                      },
                    },
                  },
                },
              }
            : // A second Rock every time, which is harder and is not this.
              (JSON.parse(JSON.stringify(spawn)) as Row),
      };
      return JSON.stringify(workspace);
    });

  it('refuses a Rock a second, forever', async () => {
    const {passes} = await check('arcade/waves', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a period that closes on itself', async () => {
    const {passes, result} = await check('arcade/waves', harder('sooner'));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses more Rocks at the same interval', async () => {
    const {passes} = await check('arcade/waves', harder('more'));
    expect(passes).toBe(false);
  });
});

describe('the words lesson’s check', () => {
  const lesson = LESSONS['story/text'];

  it('refuses a line drawn off both edges', async () => {
    const {passes} = await check('story/text', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the line moved into a Speech Box', async () => {
    // What importing does: the stock actor lands in the project, and the world
    // places it — which is the lesson's two moves.
    const withBox = importStockActor(
      lesson.source,
      stockActorById('speechBox')!,
    ).source;
    const solved = editing(withBox, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const label = rowsOf(workspace).find(
        row => row.fields?.ACTOR === 'actors/label',
      )!;
      const said = inSocket(inSocket(label, 'DO')!.next!.block!, 'VALUE')!;
      workspace.blocks.blocks[0].next = {
        block: {
          type: 'world_add_actor',
          fields: {ACTOR: 'actors/speechBox'},
          inputs: {
            DO: {
              block: {
                type: 'world_set_position',
                inputs: {
                  ACTOR: {block: {type: 'world_this_actor'}},
                  X: {shadow: {type: 'math_number', fields: {NUM: 20}}},
                  Y: {shadow: {type: 'math_number', fields: {NUM: 200}}},
                },
                next: {
                  block: {
                    type: 'world_set_Writing_TextProperty',
                    inputs: {
                      ACTOR: {block: {type: 'world_this_actor'}},
                      VALUE: {shadow: said},
                    },
                  },
                },
              },
            },
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('story/text', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the reveal lesson’s check', () => {
  const lesson = LESSONS['story/reveal'];

  /** The Box told to reveal, and optionally to answer a click. */
  const revealing = (skip: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const add = workspace.blocks.blocks[0].next!.block!;
      const body = inSocket(add, 'DO')!;
      // `set text ⟨…⟩` becomes `say ⟨…⟩ on ⟨this actor⟩`: showing a line and
      // saying one are different things, and only the second types it out.
      for (let at: Row | undefined = body; at; at = at.next?.block) {
        if (at.type === 'world_set_Writing_TextProperty') {
          at.type = 'world_do_ActorsSpeechBox_SayAction';
          break;
        }
      }
      const electing2 = (trait: string, rest: Row): Row => ({
        type: 'world_add_trait',
        fields: {TRAIT: trait},
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
        next: {block: rest},
      });
      let placed: Row = body;
      if (skip) {
        placed = electing2('Mouse#CanBeClickedTrait', placed);
        workspace.blocks.blocks.push({
          type: 'world_on_Mouse_IsClickedWithEvent',
          x: 700,
          y: 20,
          fields: {FILTER0: ''},
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/speechBox'},
              },
            },
          },
          next: {
            block: {
              type: 'world_do_ActorsSpeechBox_ShowAllOfItAction',
              inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
            },
          },
        } as unknown as Row);
      }
      add.inputs!.DO = {block: placed};
      return JSON.stringify(workspace);
    });

  it('refuses a line that is simply there', async () => {
    const {passes} = await check('story/reveal', lesson.source);
    expect(passes).toBe(false);
  });

  it('refuses a reveal a reader cannot get past', async () => {
    const {passes} = await check('story/reveal', revealing(false));
    expect(passes).toBe(false);
  });

  it('accepts one that types and can be skipped', async () => {
    const {passes, result} = await check('story/reveal', revealing(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the script lesson’s check', () => {
  const lesson = LESSONS['story/script'];
  const LINES = [
    'The rain had not stopped for three days.',
    'The road out of town was gone.',
    'Somebody was knocking.',
  ];

  it('refuses one line and a click that prints', async () => {
    const {passes} = await check('story/script', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a cursor with three lines under it', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const add = workspace.blocks.blocks[0].next!.block!;
      const body = inSocket(add, 'DO')!;
      add.inputs!.DO = {
        block: {
          type: 'world_add_trait',
          fields: {TRAIT: 'Conversation#HasAConversationTrait'},
          inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
          next: {
            block: {
              type: 'world_set_Conversation_HowManyLinesProperty',
              inputs: {
                ACTOR: {block: {type: 'world_this_actor'}},
                VALUE: {shadow: {type: 'math_number', fields: {NUM: 3}}},
              },
              next: {block: body},
            },
          },
        },
      };
      // The click moves the cursor; the cursor's event decides what a line is.
      const hat = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Mouse_IsClickedWithEvent',
      )!;
      hat.next = {
        block: {
          type: 'world_do_Conversation_MakeSayTheNextThingAction',
          inputs: {VALUE: {block: {type: 'world_this_actor'}}},
        },
      };
      const line = (n: number): Row => ({
        type: 'controls_if',
        inputs: {
          IF0: {
            block: {
              type: 'logic_compare',
              fields: {OP: 'EQ'},
              inputs: {
                A: {
                  block: {
                    type: 'world_get_Conversation_LineProperty',
                    inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                  },
                },
                B: {shadow: {type: 'math_number', fields: {NUM: n}}},
              },
            },
          },
          DO0: {
            block: {
              type: 'world_set_Writing_TextProperty',
              inputs: {
                ACTOR: {block: {type: 'world_this_actor'}},
                VALUE: {shadow: {type: 'text', fields: {TEXT: LINES[n - 1]}}},
              },
            },
          },
        },
      });
      workspace.blocks.blocks.push({
        type: 'world_on_Conversation_MovesToALineEvent',
        x: 900,
        y: 20,
        inputs: {
          ACTOR: {
            block: {
              type: 'world_actor_kind',
              fields: {ACTOR: 'actors/speechBox'},
            },
          },
        },
        next: {
          block: [line(1), line(2), line(3)].reduceRight((next, row) => ({
            ...row,
            next: {block: next},
          })),
        },
      } as unknown as Row);
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('story/script', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the choice lesson’s check', () => {
  const lesson = LESSONS['story/choice'];

  /** The Buttons wired to the cursor, with or without a memory. */
  const branching = (remembering: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const box = () => ({
        block: {
          type: 'world_actor_kind',
          fields: {ACTOR: 'actors/speechBox'},
        },
      });
      const sendTo = (which: number): Row => ({
        type: 'world_do_Conversation_SendToLineAction',
        inputs: {
          WHO: box(),
          WHICH: {shadow: {type: 'math_number', fields: {NUM: which}}},
        },
      });
      const opened: Row = {
        type: 'world_set_WorldsMain_OpenedTheDoorProperty',
        inputs: {
          VALUE: {block: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
        },
      };
      workspace.blocks.blocks.push({
        type: 'world_on_Mouse_IsClickedWithEvent',
        x: 1200,
        y: 20,
        fields: {FILTER0: ''},
        inputs: {
          ACTOR: {
            block: {type: 'world_actor_kind', fields: {ACTOR: 'actors/button'}},
          },
        },
        next: {
          block: {
            type: 'controls_if',
            extraState: {elseIfCount: 0, hasElse: true},
            inputs: {
              IF0: {
                block: {
                  type: 'logic_compare',
                  fields: {OP: 'EQ'},
                  inputs: {
                    A: {
                      block: {
                        type: 'world_get_Writing_TextProperty',
                        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                      },
                    },
                    B: {shadow: {type: 'text', fields: {TEXT: 'Open it'}}},
                  },
                },
              },
              DO0: {
                block: remembering
                  ? {...sendTo(3), next: {block: opened}}
                  : sendTo(3),
              },
              ELSE: {block: sendTo(4)},
            },
          },
        },
      } as unknown as Row);
      return JSON.stringify(workspace);
    });

  it('refuses buttons that do nothing', async () => {
    const {passes} = await check('story/choice', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts an answer the world remembers', async () => {
    const {passes, result} = await check('story/choice', branching(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Moving the story on and recording nothing reads correctly for one line and
  // has forgotten by the next scene.
  it('refuses a branch the world forgets', async () => {
    const {passes} = await check('story/choice', branching(false));
    expect(passes).toBe(false);
  });
});

describe('the scene lesson’s check', () => {
  const lesson = LESSONS['story/scene'];

  /** Staging hung off each line of the script. */
  const staged = (options: {faces: boolean; places: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const portrait = () => ({
        block: {
          type: 'world_actor_kind',
          fields: {ACTOR: 'actors/portrait'},
        },
      });
      const lines: [string, string | undefined][] = [
        ['player.png', 'meadow.png'],
        [options.faces ? 'coin.png' : 'player.png', undefined],
        ['player.png', options.places ? 'kitchen.png' : undefined],
      ];
      const hat = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Conversation_MovesToALineEvent',
      )!;
      let branch: Row | undefined = hat.next!.block!;
      for (const [sprite, backdrop] of lines) {
        const rows: Row[] = [
          {
            type: 'world_set_sprite',
            fields: {SPRITE: sprite},
            inputs: {ACTOR: portrait()},
          },
          {
            type: 'world_set_Appearance_OpacityProperty',
            inputs: {
              ACTOR: portrait(),
              VALUE: {shadow: {type: 'math_number', fields: {NUM: 1}}},
            },
          },
          ...(backdrop
            ? [
                {
                  type: 'world_set_background',
                  fields: {BACKGROUND: backdrop},
                },
              ]
            : []),
        ];
        let last = inSocket(branch!, 'DO0')!;
        while (last.next?.block) {
          last = last.next.block;
        }
        last.next = {
          block: rows.reduceRight((next, row) => ({
            ...row,
            next: {block: next},
          })),
        };
        branch = branch!.next?.block;
      }
      return JSON.stringify(workspace);
    });

  it('refuses two people talking in a gray room', async () => {
    const {passes} = await check('story/scene', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a face that changes and a place that does', async () => {
    const {passes, result} = await check(
      'story/scene',
      staged({faces: true, places: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // On stage wearing one face for the whole conversation is a character, not a
  // scene: both speakers look the same and the room never changes.
  it('refuses one face for every line', async () => {
    const {passes} = await check(
      'story/scene',
      staged({faces: false, places: true}),
    );
    expect(passes).toBe(false);
  });
});

describe('the crowd lesson’s check', () => {
  const lesson = LESSONS['simulation/many'];

  /** The click, made a hundred times over — moving, or standing still. */
  const hundred = (moving: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const hat = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Mouse_IsPressedEvent',
      )!;
      const add = hat.next!.block!;
      if (!moving) {
        for (
          let at = inSocket(add, 'DO');
          at?.next?.block;
          at = at.next.block
        ) {
          if (at.next.block.type === 'world_set_Physics_VelocityProperty') {
            at.next = at.next.block.next;
            break;
          }
        }
      }
      hat.next = {
        block: {
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {shadow: {type: 'math_number', fields: {NUM: 100}}},
            DO: {block: add},
          },
        },
      };
      return JSON.stringify(workspace);
    });

  it('refuses one wanderer per click', async () => {
    const {passes} = await check('simulation/many', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a hundred that are going somewhere', async () => {
    const {passes, result} = await check('simulation/many', hundred(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a hundred standing still', async () => {
    const {passes} = await check('simulation/many', hundred(false));
    expect(passes).toBe(false);
  });
});

describe('the steering lesson’s check', () => {
  const lesson = LESSONS['simulation/steering'];

  const kindOf = (id: string) => ({
    block: {type: 'world_actor_kind', fields: {ACTOR: local(id)}},
  });

  /** Both traits elected and pointed at the Player — or a hand-aimed walk. */
  const aimed = (how: 'both' | 'chase' | 'byhand') =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const rows: Row[] = [];
      if (how === 'byhand') {
        under(actorIn(workspace, 'Chaser'), {
          type: 'world_set_Physics_VelocityProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {
              block: {type: 'world_vector', fields: {VECTOR: {x: 2, y: 2}}},
            },
          },
        });
      } else {
        under(actorIn(workspace, 'Chaser'), {
          type: 'world_use_trait',
          fields: {TRAIT: 'Steering#ChasesTrait'},
        });
        rows.push({
          type: 'world_set_Steering_ActorToChaseProperty',
          inputs: {ACTOR: kindOf('chaser'), VALUE: kindOf('player')},
        });
        if (how === 'both') {
          under(actorIn(workspace, 'Fleer'), {
            type: 'world_use_trait',
            fields: {TRAIT: 'Steering#FleesTrait'},
          });
          rows.push({
            type: 'world_set_Steering_ActorToAvoidProperty',
            inputs: {ACTOR: kindOf('fleer'), VALUE: kindOf('player')},
          });
        }
      }
      if (rows.length) {
        const placed = rowsOf(workspace);
        placed[placed.length - 1].next = {
          block: rows.reduceRight((next, row) => ({
            ...row,
            next: {block: next},
          })),
        };
      }
      return JSON.stringify(workspace);
    });

  it('refuses two actors with no opinion', async () => {
    const {passes} = await check('simulation/steering', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one that closes in and one that keeps away', async () => {
    const {passes, result} = await check('simulation/steering', aimed('both'));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Chasing without fleeing is half of it, and the Fleer sitting still is
  // "further away" only by accident — here the Player walks toward it.
  it('refuses a chaser alone', async () => {
    const {passes} = await check('simulation/steering', aimed('chase'));
    expect(passes).toBe(false);
  });

  // The false pass the tile names: a direction worked out once, which closes
  // the gap until the Player turns.
  it('refuses a chaser aimed by hand', async () => {
    const {passes} = await check('simulation/steering', aimed('byhand'));
    expect(passes).toBe(false);
  });
});

describe('the rule-property lesson’s check', () => {
  const lesson = LESSONS['making/property'];

  /** Editing the RULE, which is what this lesson is: a file, not a world. */
  const declaring = (options: {reading: boolean; setting: boolean}) => {
    const declared = editing(lesson.source, 'wind.rule', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const trait = workspace.blocks.blocks.find(
        block => block.type === 'world_rule_trait',
      )!;
      // Declared INSIDE the trait, which is what makes it each actor's own.
      trait.next = {
        block: {
          type: 'world_rule_property',
          fields: {
            TYPE: 'number',
            ACCESS: 'writable',
            NAME: 'strength',
            DEFAULT: '1',
          },
          next: trait.next,
        },
      };
      if (options.reading) {
        const find = (node: unknown): Row | undefined => {
          if (Array.isArray(node)) {
            for (const item of node) {
              const found = find(item);
              if (found) {
                return found;
              }
            }
            return undefined;
          }
          if (typeof node !== 'object' || node === null) {
            return undefined;
          }
          if ((node as Row).type === 'world_set_position') {
            return node as Row;
          }
          for (const value of Object.values(node)) {
            const found = find(value);
            if (found) {
              return found;
            }
          }
          return undefined;
        };
        const drift = inSocket(find(workspace)!, 'X')!;
        drift.inputs!.B = {
          block: {
            type: 'math_arithmetic',
            fields: {OP: 'MULTIPLY'},
            inputs: {
              A: {shadow: {type: 'math_number', fields: {NUM: 2}}},
              B: {
                block: {
                  type: 'world_get_Wind_StrengthProperty',
                  inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                },
              },
            },
          },
        };
      }
      return JSON.stringify(workspace);
    });
    if (!options.setting) {
      return declared;
    }
    return editing(declared, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const first = rowsOf(workspace)[0];
      let last = inSocket(first, 'DO')!;
      while (last.next?.block) {
        last = last.next.block;
      }
      last.next = {
        block: {
          type: 'world_set_Wind_StrengthProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {shadow: {type: 'math_number', fields: {NUM: 3}}},
          },
        },
      };
      return JSON.stringify(workspace);
    });
  };

  it('refuses a wind with one speed in it', async () => {
    const {passes} = await check('making/property', lesson.source);
    expect(passes).toBe(false);
  });

  // The false pass written on the tile: two new blocks in the toolbox and a
  // step still using the number that was typed there.
  it('refuses a property declared and never read', async () => {
    const {passes} = await check(
      'making/property',
      declaring({reading: false, setting: true}),
    );
    expect(passes).toBe(false);
  });

  it('accepts one wind at two speeds', async () => {
    const {passes, result} = await check(
      'making/property',
      declaring({reading: true, setting: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the grid lesson’s check', () => {
  const lesson = LESSONS['puzzle/grid'];

  /** Stepping instead of sliding, with or without walls that fill a tile. */
  const stepping = (walls: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const player = actorIn(workspace, 'Player');
      without(player, 'world_use_trait');
      without(player, 'world_use_trait');
      under(player, {
        type: 'world_use_trait',
        fields: {TRAIT: 'Grid#StepsOnTheGridTrait'},
      });
      if (walls) {
        under(actorIn(workspace, 'Wall'), {
          type: 'world_use_trait',
          fields: {TRAIT: 'Grid#FillsATileTrait'},
        });
      }
      // A hat per arrow, each asking the rule for one step.
      const keys: [string, string][] = [
        ['left arrow', 'StepLeft'],
        ['right arrow', 'StepRight'],
        ['up arrow', 'StepUp'],
        ['down arrow', 'StepDown'],
      ];
      for (const [key, action] of keys) {
        workspace.blocks.blocks.push({
          type: 'world_on_Input_PressesEvent',
          x: 900,
          y: 20,
          fields: {FILTER0: key},
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: local('player')},
              },
            },
          },
          next: {
            block: {
              type: `world_do_Grid_${action}Action`,
              inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
            },
          },
        } as unknown as Row);
      }
      return JSON.stringify(workspace);
    });

  it('refuses a player that slides', async () => {
    const {passes} = await check('puzzle/grid', lesson.source);
    expect(passes).toBe(false);
  });

  // Stepping without walls that fill a tile: neat squares, straight through
  // the wall and out of the world.
  it('refuses steps that go through the wall', async () => {
    const {passes} = await check('puzzle/grid', stepping(false));
    expect(passes).toBe(false);
  });

  it('accepts steps that stop at one', async () => {
    const {passes, result} = await check('puzzle/grid', stepping(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the push lesson’s check', () => {
  const lesson = LESSONS['puzzle/push'];

  it('refuses a crate that stops you dead', async () => {
    const {passes} = await check('puzzle/push', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts one word added to the Crate', async () => {
    const solved = editing(lesson.source, 'main.world', contents =>
      electing(contents, 'Grid#CanBePushedTrait', 'Crate'),
    );
    const {passes, result} = await check('puzzle/push', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The other way to make the Player move: take the Crate out of the way
  // entirely, which walks over it and pushes nothing.
  it('refuses a crate that no longer fills its tile', async () => {
    const walkedOver = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      without(actorIn(workspace, 'Crate'), 'world_use_trait');
      return JSON.stringify(workspace);
    });
    const {passes} = await check('puzzle/push', walkedOver);
    expect(passes).toBe(false);
  });
});

describe('the people lesson’s check', () => {
  const lesson = LESSONS['adventure/people'];

  it('refuses a name placed once', async () => {
    const {passes} = await check('adventure/people', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a name that is a relationship', async () => {
    const solved = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const label = rowsOf(workspace).find(
        row => row.fields?.ACTOR === 'actors/label',
      )!;
      const body = inSocket(label, 'DO')!;
      const me = () => ({block: {type: 'world_this_actor'}});
      label.inputs!.DO = {
        block: {
          type: 'world_add_trait',
          fields: {TRAIT: 'Attachment#AttachedTrait'},
          inputs: {ACTOR: me()},
          next: {
            block: {
              type: 'world_set_Attachment_AttachedToProperty',
              inputs: {
                ACTOR: me(),
                VALUE: {
                  block: {
                    type: 'world_actor_kind',
                    fields: {ACTOR: local('villager')},
                  },
                },
              },
              next: {
                block: {
                  type: 'world_set_Attachment_OffsetProperty',
                  inputs: {
                    ACTOR: me(),
                    X: {shadow: {type: 'math_number', fields: {NUM: 0}}},
                    Y: {shadow: {type: 'math_number', fields: {NUM: -24}}},
                  },
                  next: {block: body},
                },
              },
            },
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('adventure/people', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the errand lesson’s check', () => {
  const lesson = LESSONS['adventure/errand'];

  it('refuses a bar nobody tells anything', async () => {
    const {passes} = await check('adventure/errand', lesson.source);
    expect(passes).toBe(false);
  });

  /** The fraction worked out on each pickup — divided, or counted up. */
  const reporting = (dividing: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const me = () => ({block: {type: 'world_this_actor'}});
      const held: Row = {
        type: 'world_count_of_kind',
        fields: {TYPE: local('token')},
        inputs: {
          LIST: {
            block: {
              type: 'world_get_Collection_CollectedProperty',
              inputs: {ACTOR: me()},
            },
          },
        },
      };
      workspace.blocks.blocks.push({
        type: 'world_on_Collection_CollectsEvent',
        x: 900,
        y: 20,
        inputs: {
          ACTOR: {
            block: {
              type: 'world_actor_kind',
              fields: {ACTOR: local('hero')},
            },
          },
        },
        next: {
          block: {
            type: 'world_set_ActorsProgressBar_FractionProperty',
            inputs: {
              ACTOR: {
                block: {
                  type: 'world_actor_kind',
                  fields: {ACTOR: 'actors/progressBar'},
                },
              },
              VALUE: dividing
                ? {
                    block: {
                      type: 'math_arithmetic',
                      fields: {OP: 'DIVIDE'},
                      inputs: {
                        A: {block: held},
                        B: {shadow: {type: 'math_number', fields: {NUM: 4}}},
                      },
                    },
                  }
                : // A quarter added each time, which is the same for four
                  // things and wrong for any other number.
                  {block: held},
            },
          },
        },
      } as unknown as Row);
      return JSON.stringify(workspace);
    });

  it('accepts a fraction worked out from what is held', async () => {
    const {passes, result} = await check('adventure/errand', reporting(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a count where a fraction was wanted', async () => {
    const {passes} = await check('adventure/errand', reporting(false));
    expect(passes).toBe(false);
  });
});

describe('the change lesson’s check', () => {
  const lesson = LESSONS['making/change'];

  it('refuses the beat the rule shipped with', async () => {
    const {passes} = await check('making/change', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the number changed in the file', async () => {
    const solved = editing(lesson.source, 'patrol.rule', contents =>
      contents.replace('"DEFAULT": "1.5"', '"DEFAULT": "0.5"'),
    );
    const {passes, result} = await check('making/change', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The false pass the tile names: the same beat, set from outside. It works,
  // and it leaves the library's rule exactly as it was — which is what the
  // shape half reads.
  it('refuses the same beat set from the world', async () => {
    const fromOutside = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const placed = rowsOf(workspace)[0];
      let last = inSocket(placed, 'DO')!;
      while (last.next?.block) {
        last = last.next.block;
      }
      last.next = {
        block: {
          type: 'world_set_Patrol_AcrossTimeProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {shadow: {type: 'math_number', fields: {NUM: 0.5}}},
          },
        },
      };
      return JSON.stringify(workspace);
    });
    const {passes} = await check('making/change', fromOutside);
    expect(passes).toBe(false);
  });
});

describe('the own-trait lesson’s check', () => {
  const lesson = LESSONS['making/trait'];

  it('refuses one ability on both of them', async () => {
    const {passes} = await check('making/trait', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a second trait in the same rule', async () => {
    const me = () => ({block: {type: 'world_this_actor'}});
    const position = (component: 'x' | 'y') => ({
      block: {
        type: 'world_get_Space_PositionProperty',
        fields: {COMPONENT: component},
        inputs: {ACTOR: me()},
      },
    });
    const declared = editing(lesson.source, 'weather.rule', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      workspace.blocks.blocks.push({
        type: 'world_rule_trait',
        x: 420,
        y: 160,
        fields: {NAME: 'Sinks'},
        next: {
          block: {
            type: 'world_use_trait',
            fields: {TRAIT: 'Space#PositionalTrait'},
            next: {
              block: {
                type: 'world_trait_step',
                fields: {PHASE: 'move', NAME: 'sink'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_position',
                      inputs: {
                        ACTOR: me(),
                        X: position('x'),
                        Y: {
                          block: {
                            type: 'math_arithmetic',
                            fields: {OP: 'ADD'},
                            inputs: {
                              A: position('y'),
                              B: {
                                shadow: {
                                  type: 'math_number',
                                  fields: {NUM: 2},
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      } as unknown as Row);
      return JSON.stringify(workspace);
    });
    const solved = editing(declared, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      // The Stone elects the OTHER one, which is the whole of the change.
      actorIn(workspace, 'Stone').next!.block!.fields!.TRAIT =
        'Weather#SinksTrait';
      return JSON.stringify(workspace);
    });
    const {passes, result} = await check('making/trait', solved);
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });
});

describe('the own-rule lesson’s check', () => {
  const lesson = LESSONS['making/rule'];

  it('refuses the bob written out twice', async () => {
    const {passes} = await check('making/rule', lesson.source);
    expect(passes).toBe(false);
  });

  /** The bob moved into a `.rule`, for one actor or for both. */
  const shared = (both: boolean) => {
    let step: Row | undefined;
    const world = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      for (const name of both ? ['Fish', 'Bird'] : ['Fish']) {
        const actor = actorIn(workspace, name);
        step ??= rowOf(actor, 'world_trait_step');
        without(actor, 'world_trait_step');
        under(actor, {
          type: 'world_use_trait',
          fields: {TRAIT: 'Bob#BobTrait'},
        });
      }
      return JSON.stringify(workspace);
    });
    // The shape `New rule` seeds: the rule, a trait beside it, and the step
    // chained under the trait — here the very step lifted out of the actor,
    // bob and all.
    const rule = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            x: 20,
            y: 20,
            fields: {NAME: 'Bob', ABILITY: 'Bob'},
          },
          {
            type: 'world_rule_trait',
            x: 20,
            y: 120,
            fields: {NAME: 'Bob', SUBJECT: 'actor'},
            next: {block: step!},
          },
        ],
      },
    });
    return {
      ...world,
      files: {
        ...world.files,
        rule: {
          id: 'rule',
          name: 'bob.rule',
          language: 'rule',
          contents: rule,
          // The FOLDER's id, which lives in `source.folders` — a folder is
          // not a file, and a `.rule` filed anywhere else is a file the
          // project holds and the generator never reads as a rule.
          folderId: Object.values(world.folders).find(
            folder => folder.name === 'rules',
          )?.id,
        },
      },
    } as typeof world;
  };

  it('accepts one rule on both of them', async () => {
    const {passes, result} = await check('making/rule', shared(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses one copy left behind', async () => {
    const {passes} = await check('making/rule', shared(false));
    expect(passes).toBe(false);
  });
});

describe('the big-world lesson’s check', () => {
  const lesson = LESSONS['adventure/world'];

  /** The camera, the backdrop, or both — which is the lesson. */
  const assembled = (options: {camera: boolean; sky: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const rows = rowsOf(workspace);
      let last = rows[rows.length - 1];
      if (options.sky) {
        last.next = {
          block: {
            type: 'world_set_background',
            fields: {BACKGROUND: 'meadow.png'},
            next: {
              block: {
                type: 'world_set_background_repeat',
                fields: {REPEAT: 'true'},
              },
            },
          },
        };
        while (last.next?.block) {
          last = last.next.block;
        }
      }
      if (options.camera) {
        last.next = {
          block: {
            type: 'world_define_camera',
            id: 'follow',
            fields: {NAME: 'Follow'},
            inputs: {
              DO: {
                block: {
                  type: 'world_use_trait',
                  fields: {TRAIT: 'Camera Follow#FollowsTrait'},
                  next: {
                    block: {
                      type: 'world_use_trait',
                      fields: {
                        TRAIT: 'Camera Confined#ConfinedToTheMapTrait',
                      },
                      next: {
                        block: {
                          type: 'world_set_CameraFollow_ActorToFollowProperty',
                          inputs: {
                            ACTOR: {block: {type: 'world_this_camera'}},
                            VALUE: {
                              block: {
                                type: 'world_actor_kind',
                                fields: {ACTOR: local('walker')},
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            next: {
              block: {
                type: 'world_use_camera',
                fields: {CAMERA: 'camera:follow'},
              },
            },
          },
        };
      }
      return JSON.stringify(workspace);
    });

  it('refuses a window that never moves', async () => {
    const {passes} = await check('adventure/world', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a camera and something behind it', async () => {
    const {passes, result} = await check(
      'adventure/world',
      assembled({camera: true, sky: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The camera alone is the Place lesson over again: a strip of floor, seen
  // from a window that moves.
  it('refuses a camera with nothing behind it', async () => {
    const {passes} = await check(
      'adventure/world',
      assembled({camera: true, sky: false}),
    );
    expect(passes).toBe(false);
  });
});

describe('the read lesson’s check', () => {
  const lesson = LESSONS['making/read'];

  /** The answer written into the world's own property. */
  const answering = (answer: string) =>
    editing(lesson.source, 'main.world', contents =>
      contents.replace(
        /("NAME": "how hard it pulls",\s*"DEFAULT": ")[^"]*/,
        `$1${answer}`,
      ),
    );

  it('refuses a world that has not looked', async () => {
    const {passes} = await check('making/read', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the number the rule actually holds', async () => {
    const {passes, result} = await check('making/read', answering('9'));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a plausible guess', async () => {
    const {passes} = await check('making/read', answering('10'));
    expect(passes).toBe(false);
  });

  // The answer is read out of the rule, so editing the rule — which is step
  // four of the lesson — moves the right answer with it.
  it('follows the rule when the rule is changed', async () => {
    const changed = editing(answering('4'), 'gravity.rule', contents =>
      contents.replace(
        /("NAME": "amount of gravity",\s*"DEFAULT": ")[^"]*/,
        '$14',
      ),
    );
    const {passes} = await check('making/read', changed);
    expect(passes).toBe(true);
  });
});

describe('the own-block lesson’s check', () => {
  const lesson = LESSONS['making/block'];

  /** The sum given a name, with a parameter or without one. */
  const named = (withParameter: boolean) =>
    editing(lesson.source, 'bobbing.rule', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const wave = (amount: Row): Row => ({
        type: 'math_arithmetic',
        fields: {OP: 'MULTIPLY'},
        inputs: {
          A: {
            block: {
              type: 'math_single',
              fields: {OP: 'SIN'},
              inputs: {
                NUM: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'MULTIPLY'},
                    inputs: {
                      A: {block: {type: 'world_time'}},
                      B: {shadow: {type: 'math_number', fields: {NUM: 6}}},
                    },
                  },
                },
              },
            },
          },
          B: {block: amount},
        },
      });
      const parameter: Row = {
        type: 'variables_get_Number',
        fields: {VAR: {id: 'Bobbing_amount', name: 'amount'}},
      };
      let last = workspace.blocks.blocks[0];
      while (last.next?.block) {
        last = last.next.block;
      }
      last.next = {
        block: {
          type: 'world_rule_block',
          fields: {RETURNS: 'number', DESCRIPTION: 'A wave, by however much.'},
          extraState: {
            parts: [
              {kind: 'label', text: withParameter ? 'bob by' : 'a bob'},
              ...(withParameter
                ? [
                    {
                      kind: 'param',
                      type: 'number',
                      var: 'Bobbing_amount',
                      name: 'amount',
                    },
                  ]
                : []),
            ],
          },
          inputs: {
            DO: {
              block: {
                type: 'world_return',
                inputs: {
                  VALUE: {
                    block: wave(
                      withParameter
                        ? parameter
                        : {type: 'math_number', fields: {NUM: 1}},
                    ),
                  },
                },
              },
            },
          },
        } as unknown as Row,
      };
      // …and both steps say it instead of spelling it out.
      const call = (amount: number): Row => ({
        type: withParameter
          ? 'world_query_Bobbing_BobByQuery'
          : 'world_query_Bobbing_ABobQuery',
        ...(withParameter
          ? {
              inputs: {
                VALUE: {shadow: {type: 'math_number', fields: {NUM: amount}}},
              },
            }
          : {}),
      });
      workspace.blocks.blocks
        .filter(block => block.type === 'world_rule_trait')
        .forEach((trait, index) => {
          const step = trait.next!.block!.next!.block!;
          inSocket(inSocket(step, 'DO')!, 'Y')!.inputs!.B = {
            block: call(index === 0 ? 1 : 4),
          };
        });
      return JSON.stringify(workspace);
    });

  it('refuses the same sum written out twice', async () => {
    const {passes} = await check('making/block', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a name with the part that varies as a parameter', async () => {
    const {passes, result} = await check('making/block', named(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // The tile's false pass: a name with nothing to say, which makes both of
  // them bob identically because the number that differed has nowhere to go.
  it('refuses a block with no parameters', async () => {
    const {passes} = await check('making/block', named(false));
    expect(passes).toBe(false);
  });
});

describe('the moving-ground lesson’s check', () => {
  const lesson = LESSONS['platformer/ground'];

  /** The pair, or half of it — which is the lesson. */
  const carrying = (who: 'both' | 'platform' | 'hero') =>
    editing(lesson.source, 'main.world', contents => {
      let workspace = contents;
      if (who !== 'hero') {
        workspace = electing(workspace, 'Carrying#CarriesTrait', 'Platform');
      }
      if (who !== 'platform') {
        workspace = electing(workspace, 'Carrying#RidesTrait', 'Hero');
      }
      return workspace;
    });

  it('refuses a platform that slides out from under them', async () => {
    const {passes} = await check('platformer/ground', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the pair, one on each side', async () => {
    const {passes, result} = await check('platformer/ground', carrying('both'));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a platform that carries nobody', async () => {
    const {passes} = await check('platformer/ground', carrying('platform'));
    expect(passes).toBe(false);
  });

  it('refuses a rider standing on a floor that never said it moves', async () => {
    const {passes} = await check('platformer/ground', carrying('hero'));
    expect(passes).toBe(false);
  });
});

describe('the goal lesson’s check', () => {
  const lesson = LESSONS['puzzle/goal'];

  /** Counting the crates on marks, with or without the leaving half. */
  const counting = (options: {down: boolean; win: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const scoring = (by: number): Row => ({
        type: 'world_do_Scoring_AddToTheScoreAction',
        inputs: {
          VALUE: {shadow: {type: 'math_number', fields: {NUM: by}}},
        },
      });
      /** The hat, listening for one kind of touch: `⟨any Crate⟩ … ⟨Mark⟩`. */
      const touching = (event: string, by: number): Row =>
        ({
          type: `world_on_Collisions_${event}Event`,
          x: 1400,
          y: by > 0 ? 20 : 220,
          // The KIND, on the hat. It is the same guard the learner would
          // otherwise write with `if ⟨event actor⟩ is a ⟨Mark⟩`, and it is
          // three blocks shorter.
          fields: {FILTER0: local('mark')},
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: local('crate')},
              },
            },
          },
          next: {block: scoring(by)},
        }) as unknown as Row;

      workspace.blocks.blocks.push(touching('StartsTouching', 1));
      if (options.down) {
        workspace.blocks.blocks.push(touching('StopsTouching', -1));
      }
      if (options.win) {
        workspace.blocks.blocks.push({
          type: 'world_on_Scoring_TheTargetIsReachedEvent',
          x: 1400,
          y: 420,
          next: {block: {type: 'world_do_Goals_WinTheGameAction'}},
        } as unknown as Row);
      }
      return JSON.stringify(workspace);
    });

  it('refuses a puzzle that can be solved and never finishes', async () => {
    const {passes} = await check('puzzle/goal', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a count that goes both ways, ending the game', async () => {
    const {passes, result} = await check(
      'puzzle/goal',
      counting({down: true, win: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  // Counting arrivals only reaches two at the same moment in THIS solution, so
  // the run cannot tell it apart — the shape half is what does, and it is the
  // half the lesson is about: leaving is a moment too.
  it('refuses a count that only ever goes up', async () => {
    const {passes} = await check(
      'puzzle/goal',
      counting({down: false, win: true}),
    );
    expect(passes).toBe(false);
  });

  it('refuses a count that ends nothing', async () => {
    const {passes} = await check(
      'puzzle/goal',
      counting({down: true, win: false}),
    );
    expect(passes).toBe(false);
  });
});
describe('the undo lesson’s check', () => {
  const lesson = LESSONS['puzzle/undo'];
  const REMEMBERS = 'History#RemembersWhereItWasTrait';

  /** The lesson done, with a knob for each of the two ways to half-do it. */
  const undoing = (options: {crate: boolean; before: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const remembers = (name: string) =>
        under(actorIn(workspace, name), {
          type: 'world_use_trait',
          fields: {TRAIT: REMEMBERS},
        });
      remembers('Player');
      if (options.crate) {
        remembers('Crate');
      }
      // `remember this move` goes into both key handlers — above the step if
      // the lesson was read, below it if it was not.
      for (const hat of workspace.blocks.blocks) {
        if (hat.type !== 'world_on_Input_PressesEvent') {
          continue;
        }
        const remember: Row = {type: 'world_do_History_RememberThisMoveAction'};
        const step = hat.next!.block;
        hat.next = options.before
          ? {block: {...remember, next: {block: step}}}
          : {block: {...step, next: {block: remember}}};
      }
      workspace.blocks.blocks.push({
        type: 'world_on_Input_PressesEvent',
        x: 1400,
        y: 20,
        fields: {FILTER0: 'z'},
        inputs: {ACTOR: anyKind('player')},
        next: {block: {type: 'world_do_History_TakeBackAMoveAction'}},
      } as unknown as Row);
      return JSON.stringify(workspace);
    });

  it('refuses a puzzle nothing can be taken back in', async () => {
    const {passes} = await check('puzzle/undo', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a history that puts everything back', async () => {
    const {passes, result} = await check(
      'puzzle/undo',
      undoing({crate: true, before: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses an undo that only moves the player', async () => {
    // The Crate is the puzzle. A player who walks home alone has undone
    // nothing, and this is the near-miss the check reads both actors for.
    const {passes} = await check(
      'puzzle/undo',
      undoing({crate: false, before: true}),
    );
    expect(passes).toBe(false);
  });

  it('is not fooled either way by a Grid step, which is booked and not taken', async () => {
    // Remembering BELOW the step ought to be the classic mistake — the tape
    // would hold where things are rather than where they were, and every undo
    // would land a move short. It is not a mistake here, and the reason is
    // worth writing down: `step right` books a step and returns, and the
    // actor's position does not change until the `move` phase later in the
    // frame. So the handler sees the same board either way.
    //
    // The lesson still says above, because a game whose moves happen the
    // instant they are asked for would be broken by below — and because the
    // tape is a record of where things WERE, which is what reading it in that
    // order says.
    const {passes} = await check(
      'puzzle/undo',
      undoing({crate: true, before: false}),
    );
    expect(passes).toBe(true);
  });
});

describe('the turns lesson’s check', () => {
  const lesson = LESSONS['puzzle/turns'];

  /**
   * The lesson done: the Enemy takes turns instead of keeping time, and the
   * project says a turn happened — on the move given, or on the key asked for.
   */
  const takingTurns = (options: {onTheStep: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const enemy = actorIn(workspace, 'Enemy');
      // Both `use trait` rows go — Grid's is put back below, Time's is what
      // the lesson takes away — along with the period nothing reads any more.
      without(enemy, 'world_use_trait');
      without(enemy, 'world_use_trait');
      without(enemy, 'world_set_Time_TimerPeriodProperty');
      under(enemy, {
        type: 'world_use_trait',
        fields: {TRAIT: 'Grid#StepsOnTheGridTrait'},
      });
      under(enemy, {
        type: 'world_use_trait',
        fields: {TRAIT: 'Turns#TakesATurnTrait'},
      });
      // The same handler, on a different hat: the Enemy still steps right, it
      // no longer decides when.
      const timer = workspace.blocks.blocks.find(
        block => block.type === 'world_on_Time_TimerFiresEvent',
      )!;
      timer.type = 'world_on_Turns_TakesItsTurnEvent';
      workspace.blocks.blocks.push({
        type: options.onTheStep
          ? 'world_on_Grid_FinishesAStepEvent'
          : 'world_on_Input_PressesEvent',
        x: 1400,
        y: 20,
        ...(options.onTheStep ? {} : {fields: {FILTER0: 'right arrow'}}),
        inputs: {ACTOR: anyKind('player')},
        next: {block: {type: 'world_do_Turns_EndTheTurnAction'}},
      } as unknown as Row);
      return JSON.stringify(workspace);
    });

  it('refuses an enemy that keeps its own time', async () => {
    const {passes} = await check('puzzle/turns', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts an enemy that moves when the player has moved', async () => {
    const {passes, result} = await check(
      'puzzle/turns',
      takingTurns({onTheStep: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a turn ended by the key rather than by the move', async () => {
    // The last press is into a wall. Grid refuses the step, the Player does
    // not move, and a game that counted the press has let the Enemy have a
    // turn nobody paid for.
    const {passes} = await check(
      'puzzle/turns',
      takingTurns({onTheStep: false}),
    );
    expect(passes).toBe(false);
  });
});

describe('the neighborhood lesson’s check', () => {
  const lesson = LESSONS['simulation/neighbors'];

  /** The lesson done: the second loop asks for the Dots near the Walker. */
  const looking = (reach: number) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const step = rowOf(actorIn(workspace, 'Walker'), 'world_trait_step');
      const second = step.inputs!.DO!.block!.next!.block!;
      second.inputs!.SOURCE = {
        block: {
          type: 'world_actors_within',
          inputs: {
            SOURCE: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: local('dot')},
              },
            },
            DISTANCE: {shadow: {type: 'math_number', fields: {NUM: reach}}},
            OF: {block: {type: 'world_this_actor'}},
          },
        },
      };
      return JSON.stringify(workspace);
    });

  it('refuses a world where every Dot is lit', async () => {
    const {passes} = await check('simulation/neighbors', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts the ones within eighty', async () => {
    const {passes, result} = await check('simulation/neighbors', looking(80));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a neighborhood the size of the world', async () => {
    // The block, used, and still wrong: a radius that reaches the far corner
    // lights all twenty-five. The radius is what the check reads.
    const {passes} = await check('simulation/neighbors', looking(400));
    expect(passes).toBe(false);
  });

  it('refuses a neighborhood too small to hold anything', async () => {
    const {passes} = await check('simulation/neighbors', looking(5));
    expect(passes).toBe(false);
  });
});

describe('the flocking lesson’s check', () => {
  const lesson = LESSONS['simulation/emergent'];
  /** Statements, one under the next. */
  const chained = (rows: Row[]): Row =>
    rows.reduceRight(
      (next: Row | undefined, row) =>
        next ? {...row, next: {block: next}} : row,
      undefined as Row | undefined,
    )!;
  const boid = (name: string) => ({
    type: 'variables_get_Actor',
    fields: {VAR: {id: name, name, type: 'Actor'}},
  });
  const me = () => ({type: 'world_this_actor'});
  const velocity = (who: object) => ({
    type: 'world_get_Physics_VelocityProperty',
    inputs: {ACTOR: {block: who}},
  });
  const times = (pull: object, weight: number) => ({
    type: 'world_vector_math',
    fields: {OP: 'MULTIPLY'},
    inputs: {
      A: {block: pull},
      B: {block: {type: 'math_number', fields: {NUM: weight}}},
    },
  });
  /** `set velocity of ⟨this actor⟩ to ⟨velocity⟩ + ⟨pull⟩ × ⟨weight⟩`. */
  const nudge = (pull: object, weight: number): Row => ({
    type: 'world_set_Physics_VelocityProperty',
    inputs: {
      ACTOR: {block: me()},
      VALUE: {
        block: {
          type: 'world_vector_math',
          fields: {OP: 'ADD'},
          inputs: {A: {block: velocity(me())}, B: {block: times(pull, weight)}},
        },
      },
    },
  });
  /** Go the same way as it: steer toward the difference in velocities. */
  const alignment = () =>
    nudge(
      {
        type: 'world_vector_math',
        fields: {OP: 'SUBTRACT'},
        inputs: {
          A: {block: velocity(boid('other'))},
          B: {block: velocity(me())},
        },
      },
      0.05,
    );
  /** Stay with it: a one-pixel step toward it, a hundredth at a time. */
  const cohesion = () =>
    nudge(
      {
        type: 'world_query_Steering_FromTowardOverQuery',
        inputs: {
          HERE: {block: me()},
          THERE: {block: boid('other')},
          GAPBETWEEN: {
            block: {
              type: 'world_query_Steering_DistanceFromToQuery',
              inputs: {A: {block: me()}, B: {block: boid('other')}},
            },
          },
        },
      },
      0.01,
    );

  /**
   * The lesson done, with knobs for the two ways to be wrong: leaving one of
   * the three rules out, and starting the Boids off already agreeing.
   */
  const flocking = (options: {rules: Row[]; aligned?: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const step = rowOf(actorIn(workspace, 'Boid'), 'world_trait_step');
      const second = step.inputs!.DO!.block!.next!.block!;
      if (options.rules.length) {
        second.inputs!.DO = {block: chained(options.rules)};
      }
      if (options.aligned) {
        // Every launch velocity in the file, wherever it is nested: the twelve
        // `add actor` rows each hold one.
        const sameWay = (node: unknown): void => {
          if (!node || typeof node !== 'object') {
            return;
          }
          const row = node as Row;
          if (row.type === 'world_vector') {
            row.fields = {VECTOR: {x: 0.6, y: 0}};
          }
          for (const held of Object.values(node as Record<string, unknown>)) {
            sameWay(held);
          }
        };
        sameWay(workspace);
      }
      return JSON.stringify(workspace);
    });

  it('refuses twelve Boids that only keep apart', async () => {
    const {passes} = await check('simulation/emergent', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts all three rules', async () => {
    const {passes, result} = await check(
      'simulation/emergent',
      flocking({rules: [alignment(), cohesion()]}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses keeping apart and staying together without going the same way', async () => {
    // The one the lesson ends on: take alignment out and the flock half-forms
    // and comes apart again. It is also the closest thing to a false pass here
    // — cohesion alone pulls headings together for a while.
    const {passes} = await check(
      'simulation/emergent',
      flocking({rules: [cohesion()]}),
    );
    expect(passes).toBe(false);
  });

  it('refuses a flock that was one to begin with', async () => {
    // Twelve Boids all launched the same way agree at every sample and were
    // never made to. The check reads the change, not the value.
    const {passes} = await check(
      'simulation/emergent',
      flocking({rules: [alignment(), cohesion()], aligned: true}),
    );
    expect(passes).toBe(false);
  });
});

describe('the dials lesson’s check', () => {
  const lesson = LESSONS['simulation/dials'];

  /** The lesson done: a dial declared, and — if `read` — the 30 replaced. */
  const dialled = (read: boolean) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const world = workspace.blocks.blocks.find(
        block => block.type === 'world_world',
      )!;
      under(world, {
        type: 'world_rule_property',
        fields: {
          TYPE: 'number',
          ACCESS: 'writable',
          NAME: 'too close',
          DEFAULT: '30',
        },
      });
      if (read) {
        const step = rowOf(actorIn(workspace, 'Boid'), 'world_trait_step');
        const crowding = step.inputs!.DO!.block!;
        crowding.inputs!.SOURCE!.block!.inputs!.DISTANCE = {
          block: {type: 'world_get_WorldsMain_TooCloseProperty'},
        };
      }
      return JSON.stringify(workspace);
    });

  it('refuses a flock with its numbers typed in', async () => {
    const {passes} = await check('simulation/dials', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a dial that is read where the number was', async () => {
    const {passes, result} = await check('simulation/dials', dialled(true));
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a dial nothing reads', async () => {
    // The near-miss the lesson is about: the property is there, the editor
    // shows it, turning it does nothing at all, and the flock flocks on.
    const {passes} = await check('simulation/dials', dialled(false));
    expect(passes).toBe(false);
  });
});

describe('the key lesson’s check', () => {
  const lesson = LESSONS['adventure/keys'];
  const eventActor = () => ({block: {type: 'world_event_actor'}});
  const thisActor = () => ({block: {type: 'world_this_actor'}});
  /** The kind, as its dropdown holds it: a world's own actor by its id. */
  const KEY = local('key');

  /** The lesson done, with a knob for the key that is never spent. */
  const carrying = (options: {spend: boolean}) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const open: Row = {
        type: 'world_remove_actor',
        inputs: {ACTOR: thisActor()},
      };
      workspace.blocks.blocks.push(
        {
          // Collecting is picking it up off the floor; taking is having it.
          type: 'world_on_Collection_CollectsEvent',
          x: 1400,
          y: 20,
          inputs: {ACTOR: anyKind('player')},
          next: {
            block: {
              type: 'world_do_Inventory_TakesAction',
              inputs: {
                ACTOR: thisActor(),
                VALUE: {block: {type: 'world_event_actor'}},
              },
            },
          },
        } as unknown as Row,
        {
          type: 'world_on_Collisions_StartsTouchingEvent',
          x: 1400,
          y: 220,
          // The door listens for a Player, on the hat: a Crate rolling into it
          // is not somebody arriving with a key.
          fields: {FILTER0: local('player')},
          inputs: {ACTOR: anyKind('door')},
          next: {
            block: {
              type: 'controls_if',
              inputs: {
                IF0: {
                  block: {
                    type: 'world_query_Inventory_HasAQuery',
                    // The kind is a FIELD, like `is a`'s: a dropdown of the
                    // project's actors rather than a socket for a word.
                    fields: {WHAT: KEY},
                    inputs: {ACTOR: eventActor()},
                  },
                },
                DO0: {
                  block: options.spend
                    ? {
                        type: 'world_do_Inventory_SpendsAAction',
                        fields: {VALUE: KEY},
                        inputs: {ACTOR: eventActor()},
                        next: {block: open},
                      }
                    : open,
                },
              },
            },
          },
        } as unknown as Row,
      );
      return JSON.stringify(workspace);
    });

  it('refuses two doors that never open', async () => {
    const {passes} = await check('adventure/keys', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts a key that opens one door and is gone', async () => {
    const {passes, result} = await check(
      'adventure/keys',
      carrying({spend: true}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('lets the bag be counted with the blocks everything else counts with', async () => {
    // Why Inventory has no `has how many`: `how many ⟨Key⟩ in ⟨things of
    // ⟨Player⟩⟩` says it already, in the block a learner meets counting bricks.
    // A rule that answered it again would be a private vocabulary beside the
    // public one — and a claim like that is exactly the sort that rots quietly,
    // so it is run rather than asserted.
    const counting = editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      workspace.blocks.blocks.push({
        type: 'world_on_Collection_CollectsEvent',
        x: 1400,
        y: 20,
        inputs: {ACTOR: anyKind('player')},
        next: {
          block: {
            type: 'world_do_Inventory_TakesAction',
            inputs: {ACTOR: thisActor(), VALUE: eventActor()},
            next: {
              block: {
                type: 'world_print',
                inputs: {
                  VALUE: {
                    block: {
                      type: 'world_count_of_kind',
                      fields: {TYPE: KEY},
                      inputs: {
                        LIST: {
                          block: {
                            type: 'world_get_Inventory_ThingsProperty',
                            inputs: {ACTOR: thisActor()},
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      } as unknown as Row);
      return JSON.stringify(workspace);
    });

    const {result} = await check('adventure/keys', counting);

    expect(result.error).toBeUndefined();
    expect(result.console).toEqual(['1']);
  });

  it('refuses a key that is never spent', async () => {
    // It opens both doors, which is the whole reason there are two: a bag that
    // only fills up is Collection's record under another name.
    const {passes} = await check('adventure/keys', carrying({spend: false}));
    expect(passes).toBe(false);
  });
});

describe('the two-rooms lesson’s check', () => {
  const lesson = LESSONS['adventure/rooms'];

  /** The door's handler, with knobs for the two ways to get it wrong. */
  const doorway = (body: Row) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      workspace.blocks.blocks.push({
        type: 'world_on_Collisions_StartsTouchingEvent',
        x: 1400,
        y: 20,
        fields: {FILTER0: ''},
        inputs: {
          ACTOR: {
            block: {
              type: 'world_actor_kind',
              fields: {ACTOR: 'actors/door'},
            },
          },
        },
        next: {block: body},
      } as unknown as Row);
      return JSON.stringify(workspace);
    });
  const loadRoomTwo = (): Row => ({
    type: 'world_load_map',
    fields: {MAP: 'maps/room2'},
  });

  it('refuses a door that does nothing', async () => {
    const {passes} = await check('adventure/rooms', lesson.source);
    expect(passes).toBe(false);
  });

  it('accepts clearing the world and loading the other room', async () => {
    const {passes, result} = await check(
      'adventure/rooms',
      doorway({type: 'world_clear_world', next: {block: loadRoomTwo()}}),
    );
    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('refuses a teleport within one room', async () => {
    // The near-miss the tile has always named: the Player is suddenly at the
    // doorway and the world is the same world. What the check reads is which
    // map is loaded, so a Door still standing is the answer.
    const {passes} = await check(
      'adventure/rooms',
      doorway({
        type: 'world_set_position',
        inputs: {
          ACTOR: {block: {type: 'world_event_actor'}},
          X: {shadow: {type: 'math_number', fields: {NUM: 48}}},
          Y: {shadow: {type: 'math_number', fields: {NUM: 176}}},
        },
      }),
    );
    expect(passes).toBe(false);
  });

  it('refuses loading the second room on top of the first', async () => {
    // Both rooms in the world at once, with two Players in it — which looks
    // right for a moment, because a Chest really has arrived.
    const {passes} = await check('adventure/rooms', doorway(loadRoomTwo()));
    expect(passes).toBe(false);
  });
});

describe('the list lesson’s check', () => {
  const lesson = LESSONS['memory/lists'];
  const ERRAND = ['BREAD', 'MILK', 'JAM'];
  const list = {id: 'things', name: 'things', type: 'List'};
  const item = {id: 'thing', name: 'thing', type: 'String'};

  /** The lesson done: the words in a list, and one loop that makes the notes. */
  const walking = (words: string[]) =>
    editing(lesson.source, 'main.world', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const world = workspace.blocks.blocks.find(
        block => block.type === 'world_world',
      )!;
      // The stack that is kept, with the loop's word where the typed one was.
      const kept = world.next!.block!;
      const said = inSocket(kept, 'DO')!;
      said.inputs!.VALUE = {
        block: {type: 'variables_get_String', fields: {VAR: item}},
      };
      // Two of the three stacks go; the third is wrapped in the loop.
      world.next = {
        block: {
          type: 'variables_set_List',
          fields: {VAR: list},
          inputs: {
            VALUE: {
              block: {
                type: 'lists_create_with',
                extraState: {itemCount: words.length},
                inputs: Object.fromEntries(
                  words.map((text, at) => [
                    `ADD${at}`,
                    {block: {type: 'text', fields: {TEXT: text}}},
                  ]),
                ),
              },
            },
          },
          next: {
            block: {
              type: 'world_for_each_word',
              fields: {VAR: item},
              inputs: {
                LIST: {
                  block: {type: 'variables_get_List', fields: {VAR: list}},
                },
                DO: {block: {...kept, next: undefined}},
              },
            },
          },
        },
      } as never;
      return JSON.stringify(workspace);
    });

  it('refuses three stacks that each remember one thing', async () => {
    const {passes} = await check('memory/lists', lesson.source);
    expect(passes).toBe(false);

    // …while the notes say exactly the right words, which is the whole reason
    // the shape half is there: what the lesson is about is the list, and the
    // starter's picture is already the picture the lesson ends with. Played
    // directly, because the shape half refuses this project before it runs.
    const {world} = await compileProject(projectFiles(lesson.source));
    const result = playCheck(world, tile('memory/lists').check.run!);

    expect((result.samples.said as string[][])[0]).toEqual(ERRAND);
  });

  it('accepts a list and one loop', async () => {
    const {passes, result} = await check('memory/lists', walking(ERRAND));

    expect(result.error).toBeUndefined();
    expect(passes).toBe(true);
  });

  it('accepts a fourth thing nobody touched the loop for', async () => {
    // Step three, and the point of the lesson: the loop does not grow.
    const {passes, result} = await check(
      'memory/lists',
      walking([...ERRAND, 'EGGS']),
    );

    const said = (result.samples.said as string[][])[0];
    expect(said).toEqual([...ERRAND, 'EGGS']);
    expect(passes).toBe(true);
  });

  it('refuses a list said in the wrong order', async () => {
    // "In the order they were put in" is half the claim: a list is a sequence,
    // and three words that come out shuffled are a different idea.
    const {passes} = await check(
      'memory/lists',
      walking(['MILK', 'JAM', 'BREAD']),
    );

    expect(passes).toBe(false);
  });
});
