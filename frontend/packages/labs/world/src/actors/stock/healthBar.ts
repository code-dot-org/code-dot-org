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
// IT ACTS LIKE A PROGRESS BAR, which is the whole of what it has in common
// with one: the `Shows Progress` trait, the `fraction` it draws, the two
// colors it draws in, and the picture. That used to be a `use trait` row and a
// call to `progressBarDrawing()` — a share written in TypeScript, so a learner
// opening `healthBar.actor` saw a bar that happened to look like the other one
// and nothing saying it WAS one.
//
// It says so now, in a row they can read and delete (`ActorBuilder.actsLike`).
// The bar's own header already claimed "the whole claim of a Health Bar is
// that it IS a Progress Bar"; this is that claim in the file.
//
// AND IT IS STILL NOT ONE. `any ⟨Progress Bar⟩` asks what an instance was
// placed from, so a Health Bar is never among them — a world's `set fraction
// of ⟨any ⟨Progress Bar⟩⟩` does not reach into the health bars. What carries
// is the trait, which is the relationship that asks what a thing can do.
//
// So the fraction is worked out where a fraction belongs — in a step, once a
// frame. What is left here is the only thing that is this bar's own: which
// actor it is about.

import {actorFile, actsLike, me, showAs} from './workspace';

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
 * The step that fills the bar, given the block type that reads `subject`.
 *
 * PARAMETERISED, because an own property's block type carries the path of the
 * file that declared it (`blockly/ownProperties`) — `ActorsHealthBar_…` for the
 * imported file, and `WorldsMain…_…` for a world that defines the bar itself
 * (fixtures/platformerSingle). The two tellings cannot share the literal block
 * and do share the shape.
 *
 * IN `react`, after everything has moved and been hurt, so the bar shows what
 * just happened rather than what was true at the top of the frame. The same
 * moment the Fuel Bar reads its tank in.
 *
 * ATTACHED TO NOBODY IS AN EMPTY BAR, not a crash. `subject` starts unset and a
 * learner can leave it that way; `health of ⟨nothing⟩` would throw once a
 * frame, forever, from a step nobody would think to look at. The guard was in
 * the drawing before and is the same guard.
 */
export const healthBarStep = (subjectGetType: string) => {
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
    type: 'world_trait_step',
    fields: {PHASE: 'react', NAME: 'show the subject’s health'},
    inputs: {
      DO: {
        block: {
          type: 'world_set_Progress_FractionProperty',
          inputs: {
            ACTOR: me(),
            VALUE: {
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
    },
  };
};

export const healthBarActor = actorFile('Health Bar', [
  // FIRST, so everything below overrides it rather than the other way about —
  // that is what reading a file downwards means, and what lets a bar that
  // wanted its own picture simply say so underneath.
  actsLike('actors/progressBar'),
  HEALTH_BAR_SUBJECT,
  showAs('health'),
  healthBarStep('world_get_ActorsHealthBar_SubjectProperty'),
]);
