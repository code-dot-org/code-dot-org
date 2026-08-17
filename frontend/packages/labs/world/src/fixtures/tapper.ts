// Tapper — the mouse, and the two things only the mouse can say.
//
// Every other scenario is played with the keyboard, which can say WHEN but
// never WHERE: `space` is a moment, and the game decides what it happens to. A
// click is a moment AND a place, and that is the whole of what this exists to
// show. Click a coin and it goes; click the floor and nothing does.
//
// AND THE SCORE, which is what all of that was for. `define property ⟨score⟩`
// sits in `define world` (specs/WORLD_STATE.md), so the count outlives the coin
// that raised the event — and a Label draws it, so the game says it to the
// player rather than to the console. This scenario ended with `log ⟨Got one!⟩`
// for as long as neither of those existed.
//
// THREE TELLINGS OF ONE PRESS, which is the shape of the mouse rule and the
// reason it has two traits:
//
//   - `when ⟨left⟩ is pressed` — the WORLD's. A click happened to nobody, so it
//     is raised once with no actor, and a handler that wants to know where has
//     to ask. This one prints `mouse position`, which is what asking looks like.
//   - `presses mouse button` under `Takes Mouse Input` — an actor that asked to
//     hear EVERY press, wherever it landed. The scoreboard elects it and prints
//     which button, which is how a game tells left from right.
//   - `is clicked with` under `Can Be Clicked` — an actor that asked to hear
//     only the presses that landed ON IT. The coin elects it and takes itself
//     out of the world, and nothing in the handler works out who was clicked
//     because the event already knows.
//
// The last one is the one to read twice. `Takes Mouse Input` and `Can Be
// Clicked` are not two spellings of the same subscription — they are two
// questions. A scoreboard counting presses and a gun firing wherever it is
// aimed want the first; a button, a card, and a coin want the second.
//
// AND `mouse position`, which is not an event at all. It is where the pointer
// is IN THE WORLD, worked out from where it is on the screen and where the
// camera is looking (World.mousePosition), and it answers at any moment rather
// than when something happens. The crosshair reads it every frame, which is
// what makes a game feel aimed rather than merely clicked at.

import {labelActor} from '../actors/stock/label';
import {
  buildProject,
  stack,
  starterSprites,
  useTrait,
  type ProjectSpec,
} from '../constants';
import {mouseRule} from '../rules/stock/mouse';
import {writingRule} from '../rules/stock/writing';

import {me, number} from './meteors';

// A world-local actor is named by its DEFINING BLOCK'S id (blockly/localActors).
const COIN = 'tapperCoinDef';
const SCOREBOARD = 'tapperScoreDef';

const local = (blockId: string) => `local:${blockId}`;

/**
 * The Label the score is written on.
 *
 * A FILE, so `any ⟨Label⟩` names it by its module path — where `kind()` above
 * is for a world's OWN actors and stores `local:<block id>`. Handing one the
 * other's value is a dropdown value that matches no option, which Blockly drops
 * silently: the socket empties, `actorTarget` falls back to `actor`, and the
 * score was written onto the coin that had just been clicked.
 */
const LABEL = {
  block: {type: 'world_actor_kind', fields: {ACTOR: 'actors/label'}},
};

/** The variable the spawn binds, so the body can dress the new Label. */
const SCORE_VAR = {id: 'tapperScoreVar', name: 'score label', type: 'Actor'};

const scoreLabel = () => ({
  block: {type: 'variables_get_Actor', fields: {VAR: SCORE_VAR}},
});

/**
 * `get score` — the world's own, with no subject to name.
 *
 * Named for the FILE (`worlds/main`) and not for the world (`Tapper`): a name
 * is a label here, and renaming the world must not turn every block that reads
 * its state into a stand-in (`memberKey`, specs/WORLD_STATE.md).
 */
const score = () => ({block: {type: 'world_get_WorldsMain_ScoreProperty'}});

/** `set text of ⟨who⟩ to ⟨join "Score: " ⟨score⟩⟩`. */
const scoreText = (who: object) => ({
  type: 'world_set_Writing_TextProperty',
  inputs: {
    ACTOR: who,
    VALUE: {
      block: {
        type: 'text_join',
        inputs: {
          ADD0: {shadow: {type: 'text', fields: {TEXT: 'Score: '}}},
          ADD1: score(),
        },
      },
    },
  },
});

/** `any ⟨kind⟩` — a hat's subject, and so the TEMPLATE rather than an instance. */
const kind = (blockId: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: local(blockId)}},
});

/** One axis of `mouse position`, which is what `set position` takes. */
const mouseAxis = (component: 'x' | 'y') => ({
  block: {
    type: 'world_vector_component',
    fields: {COMPONENT: component},
    inputs: {VEC: {block: {type: 'world_mouse_position'}}},
  },
});

const defineActor = (id: string, name: string, x: number, rows: object[]) => ({
  type: 'world_actor',
  id,
  x,
  y: 420,
  fields: {NAME: name},
  next: {block: stack(rows)},
});

/**
 * The furniture: Labels that say the same thing for the whole game.
 *
 * One `add actor` each, dressed in its own `do` body — the same shape the score
 * Label uses two blocks up. NOT `create ⟨Label⟩ in map` with the words written
 * into each placement: that popup places prefabs and nothing else (its own
 * header says "no inspector"), so a placement's properties are not a thing a
 * learner can set there. A fixture that carried them would be showing a file
 * format rather than a program anybody could have written.
 */
const HUD: Array<[string, number, string, number]> = [
  ['TAPPER', 300, '#ffffff', 14],
  ['click a coin', 288, '#8890b0', 9],
  ['the right button too', 276, '#8890b0', 9],
];

/** `set ⟨what⟩ of this actor to ⟨value⟩`, for a property the Writing rule has. */
const dress = (exportName: string, value: object) => ({
  type: `world_set_Writing_${exportName}`,
  inputs: {ACTOR: me(), VALUE: value},
});

/** One line of furniture: place a Label, then say what it is. */
const hudLabel = ([text, y, color, size]: [
  string,
  number,
  string,
  number,
]) => ({
  type: 'world_add_actor',
  fields: {ACTOR: 'actors/label'},
  inputs: {
    DO: {
      block: stack([
        {
          type: 'world_set_position',
          inputs: {ACTOR: me(), X: number(160), Y: number(y)},
        },
        dress('TextProperty', {
          shadow: {type: 'text', fields: {TEXT: text}},
        }),
        dress('TextColorProperty', {
          shadow: {type: 'colour_picker', fields: {COLOUR: color}},
        }),
        dress('TextSizeProperty', number(size)),
      ]),
    },
  },
});

/** The counters the coin grid runs on — numbers, so the body can read them. */
const ROW_VAR = {id: 'tapperRowVar', name: 'row', type: 'Number'};
const COLUMN_VAR = {id: 'tapperColumnVar', name: 'column', type: 'Number'};

const count = (variable: object) => ({
  block: {type: 'variables_get_Number', fields: {VAR: variable}},
});

/** `a ⟨op⟩ b`, for the arithmetic the grid is worked out with. */
const math = (op: string, a: object, b: object) => ({
  block: {
    type: 'math_arithmetic',
    fields: {OP: op},
    inputs: {A: a, B: b},
  },
});

/** `count with ⟨v⟩ from 0 to 2 by 1 do …` — one side of the grid. */
const countTo = (variable: object, body: object) => ({
  type: 'world_count_with',
  fields: {VAR: variable},
  inputs: {
    FROM: number(0),
    TO: number(2),
    BY: number(1),
    DO: {block: body},
  },
});

/**
 * Nine coins, in three rows of three, each spinning a little faster than the
 * last.
 *
 * TWO NESTED COUNTING LOOPS rather than nine placements on a map. The map popup
 * places prefabs — it has no inspector, so a placement's properties are not
 * something a learner can set there — and this scenario used to carry a
 * per-coin `spin speed` written straight into the file, which is a program
 * nobody could have written in the editor it ships with.
 *
 * What the loop buys is the thing the placements were faking: a number the body
 * can read. `row` and `column` say where the coin goes, and the two together
 * say how fast it spins — so the nine copies of the behavior's own state are
 * visibly nine, which is the whole claim (specs/BEHAVIORS.md).
 */
const COIN_GRID = countTo(
  ROW_VAR,
  countTo(COLUMN_VAR, {
    type: 'world_add_actor',
    fields: {ACTOR: local(COIN)},
    inputs: {
      DO: {
        block: stack([
          {
            type: 'world_set_position',
            inputs: {
              ACTOR: me(),
              X: math(
                'ADD',
                number(48),
                math('MULTIPLY', count(COLUMN_VAR), number(96)),
              ),
              Y: math(
                'ADD',
                number(48),
                math('MULTIPLY', count(ROW_VAR), number(96)),
              ),
            },
          },
          {
            type: 'world_set_Spin_SpinSpeedProperty',
            inputs: {
              ACTOR: me(),
              VALUE: math(
                'ADD',
                number(40),
                math(
                  'MULTIPLY',
                  math(
                    'ADD',
                    math('MULTIPLY', count(ROW_VAR), number(3)),
                    count(COLUMN_VAR),
                  ),
                  number(35),
                ),
              ),
            },
          },
        ]),
      },
    },
  }),
);

/**
 * The crosshair, in a file of its own — and it has to be a file.
 *
 * `each frame` compiles to `actor.defineStep(…)`, which needs the `const actor`
 * an ACTOR module opens with. A world-local `define actor` is a differently
 * named const in the world's module, so the block is not offered there
 * (blockly/fileKind) — which is why this one thing lives outside `main.world`
 * while the rest of the game is in it.
 *
 * It is also the whole reason the feature exists. Before `each frame`, "keep
 * doing this" meant writing a `.rule` — a rule with one trait, elected by one
 * actor, shared with nobody — for a crosshair that follows the pointer.
 */
const CROSSHAIR_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Crosshair'},
        next: {
          block: stack([
            {type: 'world_set_sprite', fields: {SPRITE: 'switch.png#1'}},
            // The same behavior the coins carry, which is the whole of what a
            // behavior is FOR: the crosshair's own `each frame` below belongs
            // to the crosshair, and this belongs to anything that asks.
            useTrait('Spin#SpinTrait'),
          ]),
        },
      },
      {
        // In `sense`, the first moment of the frame: the crosshair is reading
        // the world rather than deciding anything, and everything that runs
        // afterwards sees it where the pointer is.
        type: 'world_trait_step',
        x: 20,
        y: 200,
        fields: {PHASE: 'sense', NAME: 'follow the pointer'},
        inputs: {
          DO: {
            block: {
              type: 'world_set_position',
              inputs: {
                ACTOR: me(),
                X: mouseAxis('x'),
                Y: mouseAxis('y'),
              },
            },
          },
        },
      },
    ],
  },
});

/**
 * A BEHAVIOR — the one thing an actor's own `each frame` cannot be: shared.
 *
 * The crosshair's step belongs to the crosshair and to nothing else, which is
 * right for a crosshair. Spinning is not like that: the coins do it and so does
 * the crosshair, and writing it twice would be two copies to keep in step.
 *
 * So it is a `.behavior` — a rule with exactly one trait of the same name,
 * without the two files' worth of ceremony (specs/BEHAVIORS.md) — and an actor
 * takes it the way it takes anything else, with `use trait ⟨Spin⟩`.
 *
 * ITS STATE IS ITS OWN, AND EACH ACTOR'S IS ITS OWN. `spin speed` is declared
 * inside the behavior, so it arrives and leaves with it and no actor carries a
 * dial for a mechanic it does not have — and every actor carrying it gets a
 * copy, which the coins prove by spinning at speeds written into their
 * arrangement.
 */
const SPIN_BEHAVIOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_behavior',
        x: 20,
        y: 20,
        fields: {NAME: 'Spin'},
        next: {
          block: stack([
            // A declaration and a default, not code — so it sits wherever it
            // reads best, which is the top, and is lifted onto the behavior
            // rather than run (specs/BEHAVIORS.md).
            {
              type: 'world_rule_property',
              fields: {
                TYPE: 'number',
                ACCESS: 'writable',
                NAME: 'spin speed',
                DEFAULT: '120',
              },
            },
            {
              type: 'world_set_Space_RotationProperty',
              inputs: {
                ACTOR: me(),
                // Degrees per SECOND, so the spin is the same however long a
                // frame took — `delta` is what makes it so.
                VALUE: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'ADD'},
                    inputs: {
                      A: {
                        block: {
                          type: 'world_get_Space_RotationProperty',
                          inputs: {ACTOR: me()},
                        },
                      },
                      B: {
                        block: {
                          type: 'math_arithmetic',
                          fields: {OP: 'MULTIPLY'},
                          inputs: {
                            A: {
                              block: {
                                type: 'world_get_Spin_SpinSpeedProperty',
                                inputs: {ACTOR: me()},
                              },
                            },
                            B: {block: {type: 'world_step_delta'}},
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ]),
        },
      },
    ],
  },
});

const MAIN_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Tapper'},
        next: {
          block: stack([
            // THE SCORE. A world's own state, declared where it is used and
            // belonging to no rule (specs/WORLD_STATE.md) — which is what was
            // missing when this scenario could only log `Got one!`.
            {
              type: 'world_rule_property',
              fields: {
                TYPE: 'number',
                ACCESS: 'writable',
                NAME: 'score',
                DEFAULT: '0',
              },
            },
            // THE GAME, in a layer of its own. Declared first, so it is drawn
            // first and everything below is in front of it.
            {
              type: 'world_define_layer',
              fields: {NAME: 'Game'},
              inputs: {
                DO: {
                  block: stack([
                    COIN_GRID,
                    {
                      type: 'world_add_actor',
                      fields: {ACTOR: local(SCOREBOARD)},
                    },
                    {
                      type: 'world_add_actor',
                      fields: {ACTOR: 'actors/crosshair'},
                    },
                  ]),
                },
              },
            },
            // THE INTERFACE, which is a layer and nothing else — `fixed to the
            // screen` ignores the camera altogether, so what is in here is in
            // screen space (specs/VIEWPORT.md, specs/UI_ACTORS.md). Declared
            // last, so it is drawn last and sits over the game.
            {
              type: 'world_define_layer',
              fields: {NAME: 'Interface'},
              inputs: {
                DO: {
                  block: stack([
                    {type: 'world_layer_fixed', fields: {FIXED: 'fixed'}},
                    // The one that CHANGES, so it is placed by hand and bound
                    // to a variable the handlers can reach. A `create in map`
                    // placement has no name a block can say
                    // (specs/UI_ACTORS.md).
                    {
                      type: 'world_add_actor',
                      fields: {
                        ACTOR: 'actors/label',
                        NAMED: 'named',
                        VAR: SCORE_VAR,
                      },
                      extraState: {named: true},
                      inputs: {
                        DO: {
                          block: stack([
                            {
                              type: 'world_set_position',
                              inputs: {
                                ACTOR: scoreLabel(),
                                X: number(48),
                                Y: number(32),
                              },
                            },
                            {
                              type: 'world_set_Writing_TextColorProperty',
                              inputs: {
                                ACTOR: scoreLabel(),
                                VALUE: {
                                  shadow: {
                                    type: 'colour_picker',
                                    fields: {COLOUR: '#ffcc00'},
                                  },
                                },
                              },
                            },
                            scoreText(scoreLabel()),
                          ]),
                        },
                      },
                    },
                    // …and the ones that do NOT change. Three of one kind,
                    // each saying something different, which is why a picker
                    // cannot identify a Label by its picture
                    // (specs/UI_ACTORS.md).
                    ...HUD.map(hudLabel),
                  ]),
                },
              },
            },
          ]),
        },
      },
      // A coin: something to click, and the whole of what that takes. `Can Be
      // Clicked` is the ONLY row here that is about the mouse — no collision
      // shape, nothing to collect it, nothing to clean up afterwards, because
      // the rule works out what the pointer was over from where the coin is
      // and how big it is drawn.
      defineActor(COIN, 'Coin', 20, [
        useTrait('Mouse#CanBeClickedTrait'),
        useTrait('Spin#SpinTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'coin.png'}},
      ]),
      // Somebody to hear the clicks. It elects `Takes Mouse Input`, which is
      // what makes the rule tell it — the world hears every click either way,
      // and an actor hears the ones it asked for (rules/mouse).
      defineActor(SCOREBOARD, 'Scoreboard', 660, [
        useTrait('Mouse#TakesMouseInputTrait'),
        // ONE CELL of the switch sheet: `switch.png` is a strip of three, and
        // an actor drawing the whole strip is three switches side by side
        // rather than a thing (blockly/spriteCells).
        {type: 'world_set_sprite', fields: {SPRITE: 'switch.png#0'}},
      ]),
      // THE WORLD'S TELLING. Raised once, about nobody — so a handler that
      // wants to know where it landed has to ask, and `mouse position` is the
      // asking. Every press prints a point, including the ones that hit
      // nothing, which is exactly what "about nobody" means.
      {
        type: 'world_on_Mouse_IsPressedEvent',
        fields: {FILTER0: 'left'},
        x: 20,
        y: 700,
        next: {
          block: {
            type: 'world_print',
            inputs: {VALUE: {block: {type: 'world_mouse_position'}}},
          },
        },
      },
      // THE COIN'S. The same press, told to the one actor it landed on, and
      // the handler does no hit-testing of its own: `this actor` IS the coin
      // that was clicked, so taking it out of the world is one block.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        x: 520,
        y: 700,
        inputs: {ACTOR: kind(COIN)},
        next: {
          block: stack([
            // The world remembers. Before this there was nowhere to put a
            // count that outlives the coin raising the event, so the game
            // could only say `Got one!` and forget.
            {
              type: 'world_set_WorldsMain_ScoreProperty',
              inputs: {
                VALUE: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'ADD'},
                    inputs: {A: score(), B: number(1)},
                  },
                },
              },
            },
            scoreText(LABEL),
            {type: 'world_remove_actor', inputs: {ACTOR: me()}},
          ]),
        },
      },
      // AND THE SCOREBOARD'S. It elected `Takes Mouse Input`, so it hears
      // every press wherever it landed — the coins it missed included.
      // `(any)` hears both buttons, and the value says which.
      {
        type: 'world_on_Mouse_PressesMouseButtonEvent',
        fields: {FILTER0: ''},
        x: 520,
        y: 880,
        inputs: {ACTOR: kind(SCOREBOARD)},
        next: {
          block: {
            type: 'world_print',
            inputs: {VALUE: {block: {type: 'world_event_value'}}},
          },
        },
      },
    ],
  },
});

export const TAPPER_SPEC: ProjectSpec = {
  folders: ['actors', 'rules', 'worlds', 'sprites'],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: MAIN_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    spinBehavior: {
      name: 'spin.behavior',
      language: 'behavior',
      contents: SPIN_BEHAVIOR,
      folderId: 'rules',
    },
    crosshair: {
      name: 'crosshair.actor',
      language: 'actor',
      contents: CROSSHAIR_ACTOR,
      folderId: 'actors',
    },
    // The mouse rule is the point of the scenario, so it is a file to open and
    // read rather than something that merely happens.
    writingRuleFile: {
      name: 'writing.rule',
      language: 'rule',
      contents: writingRule,
      folderId: 'rules',
    },
    labelActorFile: {
      name: 'label.actor',
      language: 'actor',
      contents: labelActor,
      folderId: 'actors',
    },
    mouseRuleFile: {
      name: 'mouse.rule',
      language: 'rule',
      contents: mouseRule,
      folderId: 'rules',
    },
    ...starterSprites(['coin', 'switch']),
  },
  open: ['main'],
};

export const TAPPER_PROJECT = buildProject(TAPPER_SPEC);
