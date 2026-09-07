import {CanCollide, contacts, passable} from './collisions.mjs';
import {
  allWithTrait,
  both,
  countOf,
  defineRule,
  doc,
  equals,
  filter,
  forEach,
  hasTrait,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  thisActor,
  when,
  yes,
} from './dsl.mjs';
import {CanMove} from './motion.mjs';

const rule = defineRule({
  name: 'Switches',
  ability: 'Has Switches',
  purpose: `**Switches** is a room whose shape you can change.

Every other wall here is a fact about the level. This one is a fact about what
you have *done* in it: stand on a plate and walls elsewhere appear or vanish.
The room remembers, and what it remembers is written on the floor in a color.

Give plates **Is a Switch** and the walls they control **Is a Switched Wall**,
matched by color.`,
  header: `// "Has Switches" — a room whose shape you can change.
//
// Every other wall in this library is a fact about the level. This one is a
// fact about what you have DONE in it, and that is a different kind of puzzle:
// a door needs a key you carry, and this needs a place you have been. The room
// remembers, and the thing it remembers is written on the floor in a color.
//
// THE COLOR IS THE LINK, and it is the same color a teleport pad uses and for
// the same reason — it is the thing a player reads at a glance from across the
// room. A switch flips every wall painted like it, and no wall and no switch
// knows how many of either there are.
//
// A WALL THAT IS OFF STILL EXISTS, which is the whole of how this is built. A
// trait cannot be taken away at runtime, and taking one away is not what is
// wanted anyway: the wall has not stopped being a wall, it is not in the way
// this moment. \`passes through things\` (\`rules/collisions\`) is exactly that
// sentence, and it is one lever rather than five — a wall that is off stops
// blocking, stops holding things up, stops being a floor with an opinion and
// stops hurting, because every one of those was written as "for each thing I
// am touching".
//
// TOGGLING IS PER WALL, not per color, and it took saying it out loud to see
// that this is the good answer rather than the lazy one. Two red walls, one
// open and one shut, are a corridor that a red switch SWAPS — walk over it and
// the way you came closes as the way on opens. A color with a single state
// could not say that, and a level made of them is a level of doors rather than
// a level of rooms.
//
// IT TOGGLES ON THE MOMENT, not while you stand there. A switch is walked
// OVER, so what it watches for is a body arriving on it: standing still on one
// would otherwise flip it sixty times a second, which is not a switch, it is a
// strobe. One boolean of memory, which is the same shape \`Prowling\` uses to
// tell a change from a state.
//
// AND ANYTHING THAT MOVES CAN PRESS ONE. Not "the player": a room where an
// enemy can shut a wall behind you is a room worth walking through carefully,
// and it costs nothing to allow — the test is that the thing has a way of
// moving, which a wall and a coin do not.`,
});
rule.uses('Collisions');
rule.uses('Physics');

// ── The switch ───────────────────────────────────────────────────────────────

const switches = rule.trait('Is a Switch');
switches.uses(CanCollide);

/** Which walls it flips. Matched exactly, like a teleport pad's. */
const switchColor = switches.color('switch color', '#e0484a');
/**
 * Whether something was standing on it at the top of the last frame.
 *
 * The one bit of memory, and what makes this a switch rather than a strobe:
 * `contacts` is true for every frame an overlap lasts, and a switch is walked
 * OVER. `Prowling` keeps the same bit for the same reason.
 */
const wasPressed = switches.boolean('was pressed', 'false', {readonly: true});

export const IsASwitch = rule.traitRef('Is a Switch');

/** Raised on the frame something steps on to it. */
const flipped = switches.event(['is pressed']);

// ── The wall ─────────────────────────────────────────────────────────────────

const walls = rule.trait('Is a Switched Wall');
walls.uses(CanCollide);

/**
 * Which switch flips it.
 *
 * The wall's STARTING state is not a property here: a wall that begins open is
 * one the level has already set `passes through things` on, which is the same
 * switch this rule throws. A second way of saying it would be a second thing
 * to keep in step with the first.
 */
const wallColor = walls.color('wall color', '#e0484a');

export const IsASwitchedWall = rule.traitRef('Is a Switched Wall');

/** Raised on the wall when it comes back, and when it goes. */
const opened = walls.event(['opens']);
const closed = walls.event(['closes']);

const stander = rule.local('stander', 'Actor');
const wall = rule.local('wall', 'Actor');
const pressed = rule.local('pressed', 'Boolean');

switches.step('flip when walked over', 'react', [
  doc(
    'Anything ON it that has a way of moving. Not "the player": a room where an enemy can shut a wall behind you is worth walking through carefully, and a wall or a coin cannot press one because neither has any way of arriving.',
  ),
  pressed.set(
    moreThan(
      countOf(
        filter(stander, {
          from: contacts.of(thisActor()),
          where: hasTrait(stander.get(), CanMove),
        }),
      ),
      n(0),
    ),
  ),
  doc(
    'THE MOMENT IT ARRIVES, not every frame it stays — see the header on the difference between a switch and a strobe.',
  ),
  when([
    [
      both(pressed.get(), not(wasPressed.of(thisActor()))),
      [
        doc(
          'EVERY WALL OF MY COLOR, each flipped from wherever it was — see the header: two red walls, one open and one shut, are a corridor a red switch swaps rather than a pair it opens.',
        ),
        forEach(wall, {
          from: filter(wall, {
            from: allWithTrait(IsASwitchedWall),
            where: equals(
              wallColor.of(wall.get()),
              switchColor.of(thisActor()),
            ),
          }),
          body: [
            when(
              [
                [
                  passable.of(wall.get()),
                  [passable.set(wall.get(), no()), closed({}, wall.get())],
                ],
              ],
              [passable.set(wall.get(), yes()), opened({}, wall.get())],
            ),
          ],
        }),
        flipped({}, thisActor()),
      ],
    ],
  ]),
  wasPressed.set(thisActor(), pressed.get()),
]);

export default () => moduleFor(rule, 'switches');
