import {
  age,
  defineRule,
  doc,
  moduleFor,
  moreThan,
  note,
  removeActor,
  thisActor,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Expiry',
  ability: 'Expires',
  purpose: `**Expiry** takes an actor out of the world after a while.

The other half of spawning. Something has to put bullets in; this is what takes
them out. A game that fires six shots a second and never removes one gets
slower the longer it is played.

Give anything short-lived **Expires** and say how many seconds it gets.`,
  header: `// "Expires" — a thing that takes itself out of the world after a while.
//
// The other half of spawning. \`add actor\` puts something in, and without this
// nothing ever takes it out: bullets fly off the edge and keep flying, and in a
// world that wraps they come back round and orbit forever. A game that fires
// six shots a second and never removes one is a game that gets slower the
// longer it is played, which is a bug that looks like bad performance rather
// than like a missing block.
//
// A TRAIT rather than something \`add actor\` does, because how long a thing
// should last is a fact about the KIND of thing: a bullet lasts two seconds, a
// spark a quarter of one, a dropped coin until somebody takes it. Electing it
// is also how an actor says it is temporary at all — most are not, and a
// lifetime nobody asked for would quietly delete the player.
//
// It reads \`age\`, which the world stamps at placement, rather than counting
// down a number of its own. Two things follow. Nothing has to be written each
// frame, so this costs one comparison per actor and no state at all; and an
// actor spawned mid-game is measured from when it appeared rather than from
// when the game began, which is the only reading that makes sense for something
// that was not there at the start.
//
// It runs in \`react\`, after \`touch\` has worked out what is against what and
// \`settle\` has pushed bodies apart. That ordering is the point: a bullet whose
// last frame is also the frame it hits something still gets to hit it. Removing
// in \`adjust\` would delete it before the collision was noticed, and the shot
// that killed the asteroid would miss for no visible reason.
//
// Removal is not immediate — \`World.tick\` sweeps what is leaving after the
// handlers have run — so a handler responding to the same frame's collision
// still finds the actor there. That is the engine's behaviour, not this rule's,
// and it is what makes "hit something and expire on the same frame" safe.`,
});
rule.uses('Space');

const expires = rule.trait('Expires');
// Seconds. Two is a bullet that crosses a screen and a bit; short enough that
// misses do not pile up, long enough that a shot across the map still arrives.
const lifetime = expires.number('lifetime', 2);

export const Expires = rule.traitRef('Expires');

expires.step('run out', 'react', [
  doc(
    "**Old enough, and it is gone.**\n\nAn actor's *age* is how long it has been in the world, so this is one comparison and a removal — no timer to keep and nothing to reset.\n\nMORE than, rather than at least: a lifetime of 0 would otherwise delete the actor on the very frame it appeared, before anything had drawn it.\n\nIn `react`, after everything has moved and been noticed — so a bullet that reached something on its last frame still counts as having hit it.",
  ),
  note('Older than it was meant to last? Then it is done.'),
  note(
    'MORE than, not at least: a lifetime of 0 would delete it on the frame it appeared.',
  ),
  when([
    [
      moreThan(age(thisActor()), lifetime.of(thisActor())),
      [removeActor(thisActor())],
    ],
  ]),
]);

export default () => moduleFor(rule, 'expires');
