// What the `world_actor_animations` row carries: an actor's animations, as
// timelines (specs/ANIMATION_PLAN.md, step 3).
//
// The timelines are DATA the Actor Editor makes; the row is how they reach
// the compiler, which reads an actor as the `define actor` its data stands
// for (`actors/actorData`). They ride in the block's extra state, which is
// what extra state is for: the part of a block its type cannot know. A
// mutator with no dialog, as `sliderRange` is.

import {defineMutator} from '@code-dot-org/blockly';

import type {Timeline} from '../../engine/core/keyframes';

export const ACTOR_ANIMATIONS_MUTATOR = 'actor_animations_mutator';

/** What the row saves: the actor's animations, by name. */
export interface ActorAnimationsState {
  animations: Record<string, Timeline>;
}

export const actorAnimationsMutator = defineMutator(ACTOR_ANIMATIONS_MUTATOR, {
  animations_: {} as Record<string, Timeline>,

  saveExtraState(): ActorAnimationsState {
    return {animations: this.animations_};
  },

  loadExtraState(state: ActorAnimationsState): void {
    this.animations_ = state?.animations ?? {};
  },
});
