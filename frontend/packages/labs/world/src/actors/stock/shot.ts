// The Shot: what an enemy sends when it shoots at somebody.
//
// The Zapping rule owns how often a thing may fire and nothing about what it
// fires (`rules/stock/zaps`): a property cannot hold an actor template, so a
// rule cannot name the thing sent, and the project has to. The player's row
// asks which actor to send. An enemy's cannot ask two questions on a shelf
// that asks one, and what it sends is the less interesting answer — so this
// is that answer, in the library, and the row brings it the way the health
// row brings its bar.
//
// A SQUARE, because it is the one shape the pen draws, and a small bright one
// reads as a shot at any speed. A learner who wants a fireball repaints it or
// gives it a sprite; the file is theirs once it is imported.
//
// IT WEARS WHAT A SHOT NEEDS, which is the list the player's row elects on
// whatever it is told to send, plus one thing: a way of moving, something to
// hit with, a few seconds to live so the room does not fill with shots nobody
// can see — and it hurts, because an enemy's shot that does nothing is a
// decoy. Damage is dealt by one actor and felt by another (`enhance/
// dealsDamage`): a player with no health walks through one unharmed.

import {
  actorFile,
  fill,
  me,
  num,
  rectangle,
  swatch,
  useTrait,
} from './workspace';

/** How long a shot lives, in seconds. Long enough to cross a screen. */
const LIFETIME = 3;

export const shotActor = actorFile(
  'Shot',
  [
    useTrait('Physics#CanMoveTrait'),
    useTrait('Collisions#CanCollideTrait'),
    useTrait('Expiry#ExpiresTrait'),
    useTrait('Health#DealsDamageTrait'),
    {
      type: 'world_set_Expiry_LifetimeProperty',
      inputs: {ACTOR: me(), VALUE: num(LIFETIME)},
    },
  ],
  {
    drawing: {
      width: 8,
      height: 8,
      commands: [fill(swatch('#ffd23f')), rectangle(0, 0, 8, 8)],
    },
  },
);
