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
 * The `define property` this bar keeps: the actor it is about.
 *
 * Exported with the drawing below, because a world may define this actor for
 * ITSELF rather than importing the file (fixtures/platformerSingle) and the
 * two must declare the same property or they are two different bars.
 */
export const HEALTH_BAR_SUBJECT = {
  type: 'world_rule_property',
  fields: {
    TYPE: 'actor',
    ACCESS: 'writable',
    NAME: 'subject',
    DEFAULT: '',
  },
};

/**
 * The picture, given the block type that reads `subject` off this actor.
 *
 * PARAMETERISED, because an own property's block type carries the path of the
 * file that declared it (`blockly/ownProperties`) — `ActorsHealthBar_…` for the
 * imported file, and `WorldsMain…_…` for a world that defines the bar itself.
 * Everything else about the picture is the same, and a second copy of the
 * track, the fill and the expression between them would be somewhere for the
 * two to disagree.
 */
/** The two rectangles, given the two readers the drawing was built with. */
const HEALTH_BAR_COMMANDS = (
  subject: () => object,
  healthOf: (exportName: string) => object,
): object[] => [
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
];

export const healthBarDrawing = (subjectGetType: string) => {
  const subject = () => ({
    block: {type: subjectGetType, inputs: {ACTOR: me()}},
  });
  /** `⟨name⟩ of ⟨the subject⟩`, for a property the Health rule declares. */
  const healthOf = (exportName: string) => ({
    block: {
      type: `world_get_Health_${exportName}`,
      inputs: {ACTOR: subject()},
    },
  });
  return {
    width: WIDTH,
    height: HEIGHT,
    commands: HEALTH_BAR_COMMANDS(subject, healthOf),
  };
};

export const healthBarActor = actorFile(
  'Health Bar',
  [HEALTH_BAR_SUBJECT, showAs('bar')],
  healthBarDrawing('world_get_ActorsHealthBar_SubjectProperty'),
);
