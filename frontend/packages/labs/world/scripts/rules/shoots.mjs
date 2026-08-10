import {
  atLeast,
  defineRule,
  minus,
  moduleFor,
  note,
  param,
  time,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Shooting',
  ability: 'Shoots',
  header: `// "Shoots" — how often a thing may fire, and nothing about what it fires.
//
// The rule owns the RATE and the project owns the BULLET, and that split is
// forced rather than chosen: a property can hold a number, a vector or a set of
// actors, but there is no kind that holds an actor TEMPLATE. A stock rule
// therefore has no way to name a Bullet that a project invented, and one that
// tried would either hard-code a kind nobody has or need a knob it cannot type.
//
// So this raises an event instead. \`make … fire\` asks, the cooldown answers,
// and if the answer is yes the actor is told it FIRED — at which point the
// project's own handler spawns whatever firing means to it. A ship makes a
// bullet, a dragon makes a fireball, a hose makes a droplet; none of that is
// this rule's business, and all of it is one handler.
//
// TWO BLOCKS in the project, not one, and the pairing is what makes the
// cooldown real:
//
//     when ⟨player⟩ presses ⟨space⟩   →   make ⟨this actor⟩ fire
//     when ⟨this actor⟩ fires         →   add actor ⟨Bullet⟩ …
//
// Asking is separate from firing because the answer is sometimes no. A learner
// who spawned the bullet straight from the key press would have written a gun
// with no rate limit, and adding one later would mean unpicking it.
//
// The clock is \`time\`, which counts ticks rather than reading a wall clock, so
// a paused game does not reload and the cooldown means the same thing on a
// 30Hz screen as on a 120Hz one.`,
});

const shoots = rule.trait('Shoots');
// Seconds between shots. A quarter second is about six a second, which is fast
// enough to feel responsive and slow enough that a held key is not a wall.
const reload = shoots.number('reload time', 0.25);
// When it last fired, kept per actor so two ships do not share one cooldown.
//
// Read-only: the rule's own action is what writes it, and a project setting it
// by hand would be setting a clock reading, which is never a thing to mean.
//
// Long before the game began, so the FIRST shot is always ready. Zero would
// leave an actor unable to fire for one reload at the start — a bug that
// presents as "the key does not work yet", which is the worst kind.
const lastFired = shoots.number('last fired', -1000, {readonly: true});

export const Shoots = rule.traitRef('Shoots');

/**
 * Raised when a shot actually happens — not when one is asked for.
 *
 * The seam the whole rule exists for. Everything about WHAT is fired lives in
 * the handler a project writes for this, so the rule never learns what a bullet
 * is.
 */
export const fires = shoots.event(['fires']);

/**
 * Ask to fire. Fires if the cooldown has elapsed, and does nothing if not.
 *
 * A statement rather than a question so that asking and firing cannot come
 * apart: there is no way to be told "yes" and then forget to write down that
 * you fired, which would be a gun that reloads instantly.
 *
 * On the RULE with the actor as a parameter, not on the trait. A trait's block
 * already carries an implicit subject, so declaring one here as well gave the
 * block two ways to say who was firing — an `on ⟨…⟩` socket AND a `who` — which
 * is the same actor asked for twice and two chances to disagree.
 */
export const makeFire = rule.block({
  returns: 'none',
  description:
    'Fire, if enough time has passed since the last shot. Does nothing if the actor is still reloading — handle "fires" to say what a shot actually is.',
  say: ['make', param('who', 'actor'), 'fire'],
  body: ({who}) => [
    note('Long enough since the last shot? Then this one happens.'),
    when([
      [
        atLeast(minus(time(), lastFired.of(who.get())), reload.of(who.get())),
        [
          note(
            'Write down when, BEFORE telling anyone: the handler may fire again.',
          ),
          lastFired.set(who.get(), time()),
          fires({}, who.get()),
        ],
      ],
    ]),
  ],
});

export default () => moduleFor(rule, 'shoots');
