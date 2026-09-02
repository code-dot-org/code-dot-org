// "Platformer Player" — something to steer, in a game with a floor.
//
// NAMED FOR THE GAME IT ASSUMES. It was "Player", which is what every game has
// and what none of them has the same of: this one walks LEFT AND RIGHT, jumps
// with the space bar, and falls — a side view with gravity in it, and the
// wrong player for a top-down game, a point-and-click or a puzzle. The name
// says so before the import does, since a learner who takes "Player" and finds
// it falling off the bottom of a top-down map has been told nothing they could
// have acted on.
//
// The first stock actor that is an assembly rather than a thing: three traits,
// an animation and a key binding, none of which is interesting alone and all of
// which together are what a platformer's protagonist is. It is the case the
// library exists for — a learner who knows they want a player should not have
// to know that jumping is a separate rule from walking, and that both are
// separate from hearing the keyboard.
//
// WHAT IT DOES NOT ELECT is as deliberate as what it does. "Jumps" requires
// "Affected by Gravity" and a trait brings its own dependencies, so saying both
// would say the same thing twice — the same reason a Coin does not elect "Can
// Collide". No Health and no "Collects": those are a game deciding what its
// player is for, and a stock actor that decided them would be wrong for every
// game that wanted otherwise.
//
// IT DOES BIND THE SPACE BAR, which looks like the same kind of decision and is
// not. Walking already arrives bound — "Moves Across" reads the arrow keys
// itself — so a Player that walked but could not jump would be inconsistent
// rather than neutral. A control scheme is what a player IS; what jumping is
// FOR is still the game's.

import {actorFile, onKey, playAnimation, useTrait} from './workspace';

/** The animation this plays, and so the one the import must bring. */
export const PLAYER_ANIMATION = 'playerWalk';

/** `make ⟨this actor⟩ jump` — the Jumping rule's action, applied to itself. */
const jump = {
  type: 'world_do_Jumping_MakeJumpAction',
  inputs: {VALUE: {block: {type: 'world_this_actor'}}},
};

export const playerActor = actorFile(
  'Platformer Player',
  [
    // Jumping, which brings being pulled down with it.
    useTrait('Jumping#JumpsTrait'),
    // Walking. Across only: down is for a top-down game, and a platformer that
    // elected it would let the player fly.
    useTrait('Arrow Keys#MovesAcrossTrait'),
    // Hearing the keyboard is something an actor ELECTS. The world's own key
    // events are raised once a frame whatever is in it; this trait is what
    // makes `rules/input` also tell THIS actor, and it is why that broadcast
    // walks one player rather than every coin.
    useTrait('Input#TakesKeyboardInputTrait'),
    playAnimation(PLAYER_ANIMATION),
  ],
  {handlers: [onKey('space', [jump])]},
);
