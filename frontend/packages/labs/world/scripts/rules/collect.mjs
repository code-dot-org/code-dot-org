import {CanCollide, contacts} from './collisions.mjs';
import {
  both,
  clearActors,
  defineRule,
  forEach,
  hasTrait,
  moduleFor,
  not,
  note,
  param,
  pushActor,
  removeActor,
  thisActor,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Collection',
  ability: 'Collects Things',
  header: `// "Collects Things" — walk into a coin and have it.
//
// TWO abilities, because collecting has two sides and a game names them
// separately: the actor that PICKS THINGS UP elects "Collects", and the thing
// that CAN BE PICKED UP elects "Can Be Collected". Which is what makes "certain
// kinds of actor are collectible" sayable at all — a coin is, a brick is not,
// and neither has to know about the player.
//
// Both sides also need "Can Collide", because collecting happens on contact and
// contact is Collisions' answer. Declared as a trait dependency rather than
// left to the learner: an actor that elects "Can Be Collected" and is never
// touched by anything would be a rule that silently does nothing.
//
// It reads \`contacts\` — who is touching NOW, written in \`touch\` — rather than
// \`newly touching\`, which is written in \`react\` where this also runs. Steps in
// one phase are unordered and must commute, so reading another rule's \`react\`
// output would be a race that works until the day the load order changes.
//
// Which leaves the job \`newly touching\` would have done: not taking the same
// coin sixty times while standing on it. \`taken\` does it instead, and does it
// better — it is claimed the instant the coin is taken, so two players touching
// one coin in the same frame cannot both have it. Removal is deferred to the
// end of the tick (\`remove actor\`), so without a claim the coin is still there
// and still collectible for the rest of the frame.
//
// WHAT WAS COLLECTED, not how many. \`collected\` is the list of things taken,
// which answers "how many" for every kind at once — \`how many actors in ⟨every
// actor … where ⟨it is a ⟨Coin⟩⟩⟩\` — where a counter would answer it for one
// kind and need a second counter for the second kind. The list holds actors
// that have left the world, which is what an inventory IS: a record of what was
// picked up, not of what is still standing there.
//
// The cost of that shape is here in the open: the list is copied out and
// written back each frame, because a property list is set whole and there is no
// "add to it in place". That is the size of an inventory per collector per
// frame — small, and the same order as the contact walk above it.`,
});
rule.uses('Collisions');

const collects = rule.trait('Collects');
collects.uses(CanCollide);
const collectible = rule.trait('Can Be Collected');
collectible.uses(CanCollide);

export const Collects = rule.traitRef('Collects');
export const CanBeCollected = rule.traitRef('Can Be Collected');

/**
 * What this actor has picked up, oldest first.
 *
 * Read-only: a step owns it. What a learner does with it is ask questions —
 * how many, of which kind, was this one of them.
 */
const collected = collects.actors('collected', {readonly: true});

/**
 * Whether this thing has already been taken.
 *
 * Not "is it gone" — it is still in the world for the rest of the tick, since
 * `remove actor` lands at the end of one. This is the claim on it, and it is
 * what stops a second collector taking the same coin in the same frame.
 */
const taken = collectible.boolean('taken', false, {readonly: true});

/** `when ⟨Player⟩ collects ⟨Coin⟩` — the collector's side. */
export const collectsItem = collects.event([
  'collects',
  param('item', 'actor'),
]);

/** `when ⟨Coin⟩ is collected by ⟨Player⟩` — the item's side. */
export const isCollected = collectible.event([
  'is collected by',
  param('collector', 'actor'),
]);

const item = rule.local('item', 'Actor');
const had = rule.local('had', 'Actor');
const bag = rule.local('bag', 'Actor');

collects.step('pick things up', 'react', [
  note('What this actor is already carrying, copied so it can be added to.'),
  clearActors(bag),
  forEach(had, {
    from: collected.of(thisActor()),
    where: yes(),
    body: [pushActor(bag, had.get())],
  }),
  note('Anything it is touching that can be taken and has not been.'),
  forEach(item, {
    from: contacts.of(thisActor()),
    where: both(
      hasTrait(item.get(), CanBeCollected),
      not(taken.of(item.get())),
    ),
    body: [
      note('Claim it first: nobody else may take this one now.'),
      taken.set(item.get(), yes()),
      pushActor(bag, item.get()),
      note('The thing taken is told first, while it is still in the world.'),
      isCollected({collector: thisActor()}, item.get()),
      collectsItem({item: item.get()}, thisActor()),
      note('Gone at the end of the tick, so both handlers still find it.'),
      removeActor(item.get()),
    ],
  }),
  collected.set(thisActor(), bag.get()),
]);

export default () => moduleFor(rule, 'collect');
