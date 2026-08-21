import {CanCollide, contacts} from './collisions.mjs';
import {
  add,
  atLeast,
  atMost,
  both,
  defineRule,
  filter,
  forEach,
  give,
  hasTrait,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  note,
  param,
  pick,
  thisActor,
  time,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Health',
  ability: 'Has Health',
  header: `// "Has Health" — things can be hurt, and can run out.
//
// TWO abilities, like Collection's, and for the same reason: being hurt has two
// sides and a game names them separately. A player, a crate and a boss elect
// "Has Health"; a bullet, a spike and a patrolling enemy elect "Deals Damage".
// Neither has to know about the other, which is what makes "these things are
// dangerous" sayable at all.
//
// This rule exists because two others already led nowhere. Shooting could fire
// a bullet and nothing could be shot; Collisions could say what was touching
// what and the only thing in the library that reacted was Collection. "Thing
// hits thing, thing loses, thing dies" is the loop under most action games, and
// it was the one thing every project had to write by hand.
//
// IT DOES NOT REMOVE ANYTHING. Running out of health raises \`dies\` and stops
// there — what that means is the game's business, and games disagree: remove
// the actor, play an animation and then remove it, respawn at a checkpoint,
// end the level, show a score. Gravity makes the same bargain with
// \`starts falling\`, and it is what keeps a rule a mechanic rather than a
// policy.
//
// MERCY TIME is what makes contact damage usable. Damage is dealt from ongoing
// contacts, not from the frame one begins, and the difference matters: touching
// an enemy for half a second is sixty frames, and taking sixty damage is not
// what anybody means. So a hurt actor cannot be hurt AGAIN until its mercy time
// has passed — which gives all three cases the one mechanism handles: a bullet
// hits once and is gone, an enemy you are pressed against hits at a readable
// rate, and standing in lava keeps hurting for as long as you stand in it.
//
// Set mercy time to zero and damage is per frame, which is a thing a learner
// may want and can now say.
//
// It reads \`contacts\` — who is touching NOW, written in \`touch\` — rather than
// \`newly touching\`, which is written in \`react\` where this also runs. Steps in
// one phase are unordered and must commute, so reading another rule's \`react\`
// output would be a race that works until the day the load order changes
// (the same reasoning Collection's header sets out).`,
});
rule.uses('Collisions');

const hurtable = rule.trait('Has Health');
hurtable.uses(CanCollide);
const dangerous = rule.trait('Deals Damage');
dangerous.uses(CanCollide);

export const HasHealth = rule.traitRef('Has Health');
export const DealsDamage = rule.traitRef('Deals Damage');

/** How much more damage this can take. At zero it is dead. */
export const health = hurtable.number('health', 3);

/**
 * The most it can have — what a full one is.
 *
 * Health is a number that goes down, so nothing needed a ceiling until two
 * things did. HEALING needs one, or a potion is a way to become invincible;
 * and a BAR needs one, because "half health" is not a fact about a number, it
 * is a number divided by what full means. There is no way to draw one without
 * this and no way to ask for one either.
 *
 * A separate property rather than health's own default, because they are two
 * different statements: how much a kind of thing can take, and how much this
 * one has left. A boss with 20 and a scratch on it is `most health` 20 and
 * `health` 19, and neither number is derivable from the other.
 *
 * NOT ENFORCED ON `health` ITSELF. Setting health to a hundred is a thing a
 * learner may write and this does not undo it — a rule that silently rewrote
 * a number a block had just set would be worse than the mistake. What it
 * bounds is HEALING, which is the operation that means "up to full".
 */
export const mostHealth = hurtable.number('most health', 3);

/**
 * Seconds of not being hurt again after being hurt.
 *
 * Half a second by default, which is roughly what a platformer gives you: long
 * enough to get out of the way, short enough that standing in the fire is still
 * a mistake.
 */
const mercyTime = hurtable.number('mercy time', 0.5);

/**
 * The world time this can be hurt again at.
 *
 * Read-only, and a TIME rather than a countdown, so nothing has to tick it
 * down. Zero is the default and means "now": the world's clock starts at zero,
 * so an actor is hurtable from the first frame without a sentinel.
 */
const unhurtUntil = hurtable.number('unhurt until', 0, {readonly: true});

/** How much this takes off, when it touches something that can be hurt. */
const damage = dangerous.number('damage', 1);

/** `when ⟨Player⟩ is hurt` — raised however the damage arrived. */
const isHurt = hurtable.event(['is hurt']);

/** `when ⟨Player⟩ dies` — raised once, on the hit that empties the health. */
const dies = hurtable.event(['dies']);

/** `when ⟨Spike⟩ hurts ⟨Player⟩` — the dangerous thing's side. */
const hurts = dangerous.event(['hurts', param('victim', 'actor')]);

/**
 * `⟨Player⟩ is alive?` — whether there is any health left.
 *
 * The question a game asks constantly, and one a learner would otherwise write
 * as `health of ⟨…⟩ > 0` every time. `health of` is still there for the ones
 * that want the number.
 */
hurtable.block({
  returns: 'boolean',
  description: 'Whether this actor still has health left.',
  say: ['is alive?'],
  body: () => [give(moreThan(health.of(thisActor()), n(0)))],
});

/**
 * `⟨Player⟩ take ⟨1⟩ damage` — the one place damage is applied.
 *
 * One place, so that health cannot go negative, `dies` cannot be raised twice,
 * and a fall or a trap hurts by exactly the same route a spike does. The step
 * below calls this too.
 *
 * IT IGNORES MERCY TIME, and that is deliberate: mercy is about repeated
 * CONTACT, and this block is an instruction. A learner who writes
 * `take ⟨1⟩ damage` in a handler means it, and a rule that quietly declined
 * would be a rule arguing with the blocks on the screen.
 */
const left = rule.local('left', 'Number');

const takeDamage = hurtable.block({
  returns: 'none',
  description: 'Take damage. Raises “is hurt”, and “dies” if it runs out.',
  say: ['take', param('amount', 'number'), 'damage'],
  body: ({amount}) => [
    note('Already dead? Nothing to take, and “dies” has been said once.'),
    when([
      [
        moreThan(health.of(thisActor()), n(0)),
        [
          note('Never below zero: health left is not a debt, and a game that'),
          note('showed “-4 health” would be showing a number nobody meant.'),
          left.set(minus(health.of(thisActor()), amount.get())),
          health.set(
            thisActor(),
            pick(moreThan(left.get(), n(0)), left.get(), n(0)),
          ),
          isHurt({}, thisActor()),
          when([
            [atMost(health.of(thisActor()), n(0)), [dies({}, thisActor())]],
          ]),
        ],
      ],
    ]),
  ],
});

/** Somewhere to work the sum out, as `left` is for taking it away. */
const gained = rule.local('gained', 'Number');

export const heal = hurtable.block({
  returns: 'none',
  description:
    'Get some health back, up to full. Does nothing for something already dead — coming back is a bigger decision than a potion.',
  say: ['heal', param('amount', 'number')],
  body: ({amount}) => [
    note('Already dead? A heal is not a resurrection: `dies` has been said,'),
    note('and a game that wants somebody back says so itself.'),
    when([
      [
        moreThan(health.of(thisActor()), n(0)),
        [
          note('Up to full and no further, which is what the ceiling is for.'),
          gained.set(add(health.of(thisActor()), amount.get())),
          health.set(
            thisActor(),
            pick(
              lessThan(gained.get(), mostHealth.of(thisActor())),
              gained.get(),
              mostHealth.of(thisActor()),
            ),
          ),
        ],
      ],
    ]),
  ],
});

const attacker = rule.local('attacker', 'Actor');

hurtable.step('take contact damage', 'react', [
  note('Anything touching this that deals damage, if mercy time has passed.'),
  forEach(attacker, {
    from: filter(attacker, {
      from: contacts.of(thisActor()),
      where: hasTrait(attacker.get(), DealsDamage),
    }),
    body: [
      when([
        [
          both(
            moreThan(health.of(thisActor()), n(0)),
            atLeast(time(), unhurtUntil.of(thisActor())),
          ),
          [
            note('Start the mercy window before the hit, so a second attacker'),
            note('in the same frame cannot land one as well.'),
            unhurtUntil.set(
              thisActor(),
              add(time(), mercyTime.of(thisActor())),
            ),
            takeDamage({amount: damage.of(attacker.get())}, thisActor()),
            note('And the attacker is told what it hit.'),
            hurts({victim: thisActor()}, attacker.get()),
          ],
        ],
      ]),
    ],
  }),
]);

export default () => moduleFor(rule, 'health');
