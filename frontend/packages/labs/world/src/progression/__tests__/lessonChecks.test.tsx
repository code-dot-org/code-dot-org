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
import {importStockRule} from '../../rules/importStockRule';
import {stockRule} from '../../rules/stock';
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
  // Not the `define actor` root, which also has a `next` — its rows.
  const handler = workspace.blocks.blocks.find(
    block => block.type !== 'world_actor' && block.next?.block,
  );
  if (!handler) {
    throw new Error('no handler to give a body to');
  }
  handler.next = {block: body};
  return JSON.stringify(workspace);
};

/** A handler root to drop beside a `define actor`, with a `print` inside it. */
const saying = (contents: string, hat: Row): string => {
  const workspace = JSON.parse(contents) as {
    blocks: {blocks: Row[]};
  };
  workspace.blocks.blocks.push({
    ...hat,
    x: 20,
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
    const solved = editing(lesson.source, 'hero.actor', contents =>
      saying(electing(contents, 'Input#TakesKeyboardInputTrait'), {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'space'},
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
      }),
    );
    const {passes, result} = await check('input/press', solved);
    expect(result.error).toBeUndefined();
    expect(result.console).toHaveLength(2);
    expect(passes).toBe(true);
  });

  // The lesson's whole point: a handler that ran while the key was HELD would
  // say ninety things during the first stretch rather than one.
  it('refuses something that speaks every frame', async () => {
    const chatty = editing(lesson.source, 'hero.actor', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      workspace.blocks.blocks.push({
        type: 'world_trait_step',
        x: 20,
        y: 300,
        fields: {PHASE: 'decide', NAME: 'shout'},
        inputs: {
          DO: {block: {type: 'world_log', fields: {TEXT: 'yes'}}},
        },
      } as Row);
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
    const solved = editing(lesson.source, 'target.actor', contents =>
      saying(electing(contents, 'Mouse#CanBeClickedTrait'), {
        // `IsClickedWith`, and the empty filter means "any button" — the block
        // is "when ⟨Target⟩ is clicked with ⟨any⟩".
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
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
    const solved = editing(lesson.source, 'ship.actor', contents =>
      electing(
        // Take the walking off first: two rules over four keys is the mistake
        // the lesson warns about, and the check has to notice it.
        contents.replace(
          'Arrow Keys#MovesAcrossTrait',
          'Arrow Drive#DrivenByArrowKeysTrait',
        ),
        'Physics#CanMoveTrait',
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
    const solved = editing(lesson.source, 'ball.actor', contents =>
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
    const byPlace = editing(lesson.source, 'ball.actor', contents =>
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
    const solved = editing(lesson.source, 'ball.actor', contents =>
      electing(contents, 'Drag#SlowsDownTrait'),
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
              block: {type: 'world_actor_kind', fields: {ACTOR: 'actors/door'}},
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

/** Put an `each frame` handler on an actor, with a body. */
const eachFrame = (contents: string, body: Row, name = 'decide'): string => {
  const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
  workspace.blocks.blocks.push({
    type: 'world_trait_step',
    x: 20,
    y: 320,
    fields: {PHASE: 'decide', NAME: name},
    inputs: {DO: {block: body}},
  } as Row);
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
    const solved = editing(lesson.source, 'ball.actor', contents =>
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
    const halted = editing(lesson.source, 'ball.actor', contents =>
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
    const solved = editing(lesson.source, 'wall.actor', contents =>
      electing(contents, 'Solid Bodies#SolidTrait'),
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
    const solved = editing(lesson.source, 'ball.actor', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const handler = workspace.blocks.blocks.find(
        block => block.type === 'world_trait_step',
      )!;
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
    const wrong = editing(lesson.source, 'ball.actor', contents => {
      const workspace = JSON.parse(contents) as {blocks: {blocks: Row[]}};
      const handler = workspace.blocks.blocks.find(
        block => block.type === 'world_trait_step',
      )!;
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
    const solved = editing(lesson.source, 'ball.actor', contents => {
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
              fields: {TYPE: `actors/${kind}`},
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
    const wrong = editing(lesson.source, 'ball.actor', contents => {
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
                fields: {TYPE: 'actors/coin'},
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
      const actor = workspace.blocks.blocks.find(
        block => block.type === 'world_actor',
      )!;
      actor.next = {
        block: {
          type: 'world_rule_property',
          fields: {
            TYPE: 'number',
            ACCESS: 'writable',
            NAME: 'id',
            DEFAULT: '1',
          },
          next: actor.next,
        },
      };
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
