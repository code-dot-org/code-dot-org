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
// enemy's head must. So position is the project's, and a floating one is this
// actor with its `parent` set to the same thing (specs/PARENTING.md). One
// intention each. An earlier version used the rider's `attached to` for
// both, which made the commonest health bar there is — the one in the HUD —
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
// IT FILLS ITSELF BY EVENTS, not by a step once a frame: `when ⟨subject⟩ is
// damaged` and `when ⟨subject⟩ is healed`, heard by every Health Bar about
// its own `subject` (specs/OWN_SUBJECTS_PLAN.md). Whoever points the bar sets
// its fraction then, since nothing has happened to the subject yet; a bar
// pointed at nobody stays as it was last drawn, which is full.

import type {ActorProperty} from '../actorData';
import {actorDocument} from '../actorDocument';

import {me, property} from './workspace';

/**
 * The property this bar keeps: the actor it is about.
 *
 * Exported with the drawing below, because a project may declare this actor
 * itself rather than importing the file, and the two must declare the same
 * property or they are two different bars.
 */
export const HEALTH_BAR_SUBJECT: ActorProperty = property('actor', 'subject');

/** `health of ⟨subject actor⟩ ÷ most health of ⟨subject actor⟩`. */
const healthLeft = () => {
  const of = (exportName: string) => ({
    block: {
      type: `world_get_Health_${exportName}`,
      inputs: {ACTOR: {block: {type: 'world_subject_actor'}}},
    },
  });
  return {
    block: {
      type: 'math_arithmetic',
      fields: {OP: 'DIVIDE'},
      inputs: {A: of('HealthProperty'), B: of('MostHealthProperty')},
    },
  };
};

/**
 * `when ⟨subject⟩ ⟨event⟩: set fraction of ⟨this actor⟩ to what is left`,
 * for a Health event, given the getter of the `subject` this bar declares.
 */
export const healthBarHears = (event: string, subjectGetType: string) => ({
  type: `world_on_Health_${event}`,
  fields: {SUBJECT: subjectGetType},
  next: {
    block: {
      type: 'world_set_ActorsProgressBar_FractionProperty',
      inputs: {ACTOR: me(), VALUE: healthLeft()},
    },
  },
});

export const healthBarActor = actorDocument({
  name: 'Health Bar',
  // FIRST, so everything below overrides it rather than the other way about —
  // that is what reading a file downwards means, and what lets a bar that
  // wanted its own picture simply say so underneath.
  actsLike: 'actors/progressBar',
  icon: 'health',
  properties: [HEALTH_BAR_SUBJECT],
  code: [
    healthBarHears(
      'IsDamagedEvent',
      'world_get_ActorsHealthBar_SubjectProperty',
    ),
    healthBarHears(
      'IsHealedEvent',
      'world_get_ActorsHealthBar_SubjectProperty',
    ),
  ],
});
