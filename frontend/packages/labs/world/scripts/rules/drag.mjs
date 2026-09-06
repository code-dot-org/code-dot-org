import {CanMove, velocity} from './builtins.mjs';
import {
  defineRule,
  doc,
  frameTime,
  give,
  minus,
  moduleFor,
  moreThan,
  n,
  note,
  param,
  power,
  thisActor,
  vectorTimes,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Drag',
  ability: 'Slows Down',
  purpose: `**Drag** is what slows an actor down when nothing is pushing it.

Its own rule rather than a setting on Arrow Drive, because slowing down is not
something only a driven actor does: a thrown ball, a knocked-back enemy, a puck
sliding on ice all want it.

Give anything **Slows Down** and set how strongly.`,
  header: `// "Slows Down" — the thing that stops an actor when nothing is pushing it.
//
// Its own rule rather than a knob on "Drives with Arrow Keys", because slowing
// down is not something only a driven actor does. A thrown ball, a knocked-back
// enemy, a puck sliding across ice: all of them want this and none of them want
// the arrow keys. Elect it beside whatever does the pushing.
//
// This is also the whole difference between a car and an asteroids ship, which
// is worth stating plainly because it is easy to look for it in the wrong
// place. Both accelerate the same way — "Drives with Arrow Keys" adds
// \`thrust\` per SECOND while up is held, and adds nothing at all when it is
// not, which is exactly a throttle. What separates them is what happens with no
// key down: a ship keeps its speed forever, a car bleeds it off. That is this.
//
// A top speed falls out for free, which is why there is no knob for one. Speed
// grows while thrust beats drag and stops growing when they balance, at
// \`thrust / drag\`. A ship has no top speed for the same reason — no drag to
// balance against.
//
// A FRACTION KEPT PER SECOND, raised to the frame time, and not the more
// obvious \`speed − drag × time\`. Two reasons. Subtracting overshoots through
// zero on a slow frame and leaves the actor travelling backwards, and it is
// only frame-rate independent by accident: halve the frame time and you halve
// each bite but take twice as many, which is the same only because subtraction
// is linear. Multiplying is exactly frame-rate independent instead — the
// factors over one second multiply to \`kept¹\` however many frames it took —
// and can never reach zero from above, let alone cross it.
//
// It shares \`push\` with gravity, and the two do not commute: gravity adds
// where this multiplies, so falling-then-slowing and slowing-then-falling
// differ by \`gravity × drag × time²\`. That is second order in the frame time
// and stays there — about 0.1 units/s at 60Hz under earth gravity at half
// drag, against a fall that gains 13 in the same frame. Below the noise of a
// frame time that varies anyway, so it is left alone rather than given a moment
// of its own.`,
});
rule.uses('Physics');

const slowed = rule.trait('Slows Down');
slowed.uses(CanMove);
// Half of whatever it has got, every second — a car that coasts to a stop over
// a few seconds. Zero is a ship, which is what the rule is for the absence of.
const drag = slowed.number('drag', 0.5);

export const SlowsDown = rule.traitRef('Slows Down');

/**
 * How much of a speed survives a stretch of time, as a fraction.
 *
 * On the rule so the arithmetic is named once and can be read on its own — and
 * because it is the block anything else that decays would want: a fading
 * score, a dwindling fuel tank, a shrinking explosion.
 */
export const kept = rule.block({
  returns: 'number',
  description:
    'The fraction of something that is left after losing that much of it per second for that long. Multiply a speed by it to slow the speed down.',
  say: [
    'what is left after losing',
    param('drag'),
    'per second for',
    param('seconds'),
  ],
  body: ({drag, seconds}) => [
    doc(
      '**What is left after losing a fraction of it every second.**\n\nDrag is the fraction taken away per second, so `1 - drag` is the fraction KEPT. Keeping that much each second for `seconds` seconds means multiplying it by itself that many times: `(1 - drag)^seconds`.\n\nWhy a power and not `1 - drag x seconds`: taking a fixed slice off a shrinking thing takes a smaller amount each time. Multiplying would eventually reach zero and go past it — a puck that stopped and then slid backwards. A power never does; it only ever gets nearer to nothing.\n\nRaising a NEGATIVE number to a fractional power is not a number at all, which is why losing more than all of it per second is answered as a dead stop first.',
    ),
    note(
      'Losing MORE than all of it per second is a dead stop, not a reversal — and a negative raised to part of a power is not a number at all.',
    ),
    when([[moreThan(drag.get(), n(1)), [give(n(0))]]]),
    note(
      'Keep this much each second, so over `seconds` seconds keep that many of them multiplied together.',
    ),
    give(power(minus(n(1), drag.get()), seconds.get())),
  ],
});

slowed.step('slow down', 'push', [
  doc(
    "**Shrink the speed a little, every frame.**\n\nThe fraction left is worked out for one frame's worth of time and both axes are multiplied by it, so the direction is untouched and only the length changes. An actor slowing down keeps going exactly the way it was going.\n\nIn `push`, beside the other forces — so whatever is driving the actor this frame has already had its say, and what is left is what drag acts on.",
  ),
  note(
    'Whatever it is doing, it is doing a little less of it than last frame.',
  ),
  note('Direction is untouched: both axes shrink by the same fraction.'),
  velocity.set(
    thisActor(),
    vectorTimes(
      velocity.of(thisActor()),
      kept({drag: drag.of(thisActor()), seconds: frameTime()}),
    ),
  ),
]);

export default () => moduleFor(rule, 'drag');
