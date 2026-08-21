// "Health Bar" — a bar that fills itself in.
//
// A Progress Bar is filled by somebody: set its fraction and it draws that
// much. This one is filled by an ACTOR — point it at something and it rides
// above that thing and shows how much health it has left.
//
// POINT IT AT SOMEBODY and that is the whole of the wiring:
//
//     set subject of ⟨any ⟨Health Bar⟩⟩ to ⟨this actor⟩
//
// `subject` IS ITS OWN, declared here with `define property` and belonging to
// no rule. An earlier version put it in a rule because a `define property` was
// module-local and nothing else could set one — which is the whole point of a
// property on an interface element. It is exported now, and every actor's is
// in every file's palette, so an actor may keep a name for something the way a
// trait may (blockly/ownProperties). No rule, no trait, no ceremony: this bar
// is one property and one picture.
//
// WHERE IT SITS IS A SEPARATE QUESTION, deliberately. A bar in the corner of
// the screen shows the player and must not follow the player; a bar over an
// enemy's head must. So position is Attachment's, and a floating one is this
// actor with `Attached` elected as well and `attached to` set to the same
// thing. One intention each. An earlier version used `attached to` for both,
// which made the commonest health bar there is — the one in the HUD —
// impossible to write.
//
// IT DOES NOT ELECT `Shows Progress` either. An earlier one did, plus a step
// writing `health ÷ most health` into `fraction` every frame so the Progress
// Bar's drawing could be shared. That bought one drawing across two actors and
// cost a trait, a step and a paragraph explaining why any of it was there. A
// drawing may ASK the world now (specs/DRAWING.md), so this one asks — and
// what is duplicated is ten blocks of rectangle that neither actor will ever
// need to change together. If a third kind of bar arrives, that is when a seam
// is worth building. Two is not.

import {actorFile, fill, me, num, rectangle, showAs} from './workspace';

/** The canvas, and so also the actor's size for clicks and collisions. */
const WIDTH = 64;
const HEIGHT = 8;
/** The colours a health bar is, since nothing here carries them per instance. */
const TRACK = '#301820';
const BAR = '#e04040';

/**
 * `subject of this actor` — the actor this bar is about, wherever it sits.
 *
 * The block type carries the module path, so this is only right because an
 * import always lands at `actors/healthBar` (`importStockActor`).
 */
const subject = () => ({
  block: {
    type: 'world_get_ActorsHealthBar_SubjectProperty',
    inputs: {ACTOR: me()},
  },
});

/** `⟨name⟩ of ⟨the subject⟩`, for a property the Health rule declares. */
const healthOf = (exportName: string) => ({
  block: {
    type: `world_get_Health_${exportName}`,
    inputs: {ACTOR: subject()},
  },
});

export const healthBarActor = actorFile(
  'Health Bar',
  [
    {
      type: 'world_rule_property',
      fields: {
        TYPE: 'actor',
        ACCESS: 'writable',
        NAME: 'subject',
        DEFAULT: '',
      },
    },
    showAs('bar'),
  ],
  {
    width: WIDTH,
    height: HEIGHT,
    commands: [
      // The track first and whole, so what is left of it IS the empty part.
      fill({shadow: {type: 'colour_picker', fields: {COLOUR: TRACK}}}),
      rectangle(0, 0, WIDTH, HEIGHT),
      fill({shadow: {type: 'colour_picker', fields: {COLOUR: BAR}}}),
      {
        type: 'world_draw_rectangle',
        inputs: {
          X: num(0),
          Y: num(0),
          // Attached to nobody, or to something whose full is nothing: an
          // empty bar. Both are states a learner can reach, and `health of
          // ⟨nothing⟩` would throw inside a routine that runs on every paint.
          WIDTH: {
            block: {
              type: 'math_arithmetic',
              fields: {OP: 'MULTIPLY'},
              inputs: {
                A: num(WIDTH),
                B: {
                  block: {
                    type: 'logic_ternary',
                    inputs: {
                      IF: {
                        block: {
                          type: 'world_any_actors',
                          inputs: {LIST: subject()},
                        },
                      },
                      THEN: {
                        block: {
                          type: 'math_arithmetic',
                          fields: {OP: 'DIVIDE'},
                          inputs: {
                            A: healthOf('HealthProperty'),
                            B: healthOf('MostHealthProperty'),
                          },
                        },
                      },
                      ELSE: {block: {type: 'math_number', fields: {NUM: 0}}},
                    },
                  },
                },
              },
            },
          },
          HEIGHT: num(HEIGHT),
        },
      },
    ],
  },
);
