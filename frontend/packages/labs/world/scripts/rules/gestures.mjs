import {
  absolute,
  allWithTrait,
  atLeast,
  axisOf,
  both,
  choice,
  defineRule,
  doc,
  equals,
  filter,
  forEach,
  forEachButton,
  hasTrait,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  mousePosition,
  no,
  not,
  param,
  pick,
  time,
  vectorLength,
  vectorMinus,
  when,
  yes,
} from './dsl.mjs';
import {under} from './pointing.mjs';

// A parameter's TYPE carries the `enum:` prefix; a reference to the set, which
// is what `choice` names one option of, does not (`dsl.choice`).
const BUTTON_SET = 'Engine#MouseButton';
const DIRECTION = 'enum:Engine#Direction';
const DIRECTION_SET = 'Engine#Direction';

const rule = defineRule({
  name: 'Gestures',
  ability: 'Reads Gestures',
  purpose: `**Gestures** turns a press, a movement and a release into the things
a finger does: a drag, a swipe, a hold.

The Mouse rule says a button went down. This says what happened between the
button going down and coming up, which is what a touch screen is made of.

Give an actor **Takes Gestures** to hear the gestures that BEGIN on it — a
drag stays yours once it has started, even when the finger has moved off.`,
  header: `// "Reads Gestures" — what a press, a movement and a release add up to.
//
// The Mouse rule's next sentence. Mouse says a button went down; this says
// what happened between it going down and coming up, which is the whole of
// what a touch screen offers: drag, swipe, hold.
//
// NO ENGINE CHANGE STANDS BEHIND THIS, and that is worth knowing when reading
// it. Everything here is arithmetic over things the world already answers —
// which buttons changed this frame, where the pointer is, what the clock says,
// how long the frame took — kept between frames in this rule's own properties.
// What WOULD need the engine is a second finger, which needs pointer
// identities, and telling a finger from a mouse, which only hover wants
// (specs/GESTURES_PLAN.md).
//
// A GESTURE BELONGS TO WHAT THE PRESS BEGAN ON, which is where this parts
// company with \`Takes Mouse Input\`. That trait hears every button wherever it
// went down; dragging a thing you are no longer over is the entire point of
// dragging, so the press marks what it landed on and those actors keep hearing
// it until the finger comes up.
//
// WHERE THE POINTER IS IS STILL NOT AN EVENT. \`mouse position\` answers that
// at any moment, as it does for Mouse. What a drag DOES carry is how far the
// pointer moved since the last frame, because nothing else can answer that and
// a list that scrolls is exactly that number added up.
//
// It runs in \`sense\` beside Mouse, and reads the buttons itself rather than
// handling Mouse's events: events are queued and flushed after the tick, so a
// drag built on one would lag the finger by a frame, always.`,
});

// ── What the rule remembers between frames ──────────────────────────────────
// All of it about the ONE press in progress. Read-only to everybody else: the
// rule writes them and a project reads them, which is what read-only means
// here.

const pressPlace = rule.vector('press place', {x: 0, y: 0}, {readonly: true});
const lastPlace = rule.vector('last place', {x: 0, y: 0}, {readonly: true});
const pressStarted = rule.number('press started', 0, {readonly: true});
const pressing = rule.boolean('pressing', false, {readonly: true});
const dragging = rule.boolean('dragging', false, {readonly: true});
const heldTold = rule.boolean('hold announced', false, {readonly: true});

// ── What a project may tune ─────────────────────────────────────────────────

rule.doc(`How far, and how fast, before a press counts as something.

A press that never moves is a click and this rule says nothing about it. These
four numbers decide where the lines are, and they are numbers rather than
something buried in the rule because the right answer differs between a mouse
and a thumb.`);

const dragDistance = rule.number('drag distance', 4);
const swipeDistance = rule.number('swipe distance', 40);
const swipeTime = rule.number('swipe time', 0.4);
const holdTime = rule.number('hold time', 0.5);

// ── What it announces ───────────────────────────────────────────────────────

const screenDragged = rule.event([
  'the screen is dragged by',
  param('movement', 'vector'),
]);
const screenDropped = rule.event(['the screen is dropped']);
const screenSwiped = rule.event([
  'the screen is swiped',
  param('direction', DIRECTION),
]);
const screenHeld = rule.event(['the screen is held']);

const takesGestures = rule
  .trait('Takes Gestures')
  .describe('Hears when it is dragged, dropped, swiped or held.');
const beingPressed = takesGestures.boolean('being pressed', false, {
  readonly: true,
});
// `movement` is in the SCREEN's axes, even for a turned actor. The commonest
// handler adds it to the actor's position, which is in screen axes too, and a
// turned card dragged by its own axes would slide off sideways from the finger.
// A control that wants the drag along itself — a List or Scroll View stood at
// an angle — turns the vector in its own handler. (The Slider needs neither:
// it reads where the pointer IS along it, not how far it moved.)
const dragged = takesGestures.event([
  'is dragged by',
  param('movement', 'vector'),
]);
const dropped = takesGestures.event(['is dropped']);
const swiped = takesGestures.event([
  'is swiped',
  param('direction', DIRECTION),
]);
const held = takesGestures.event(['is held']);

const each = rule.local('each', 'Actor');
const target = rule.local('target', 'Actor');
const button = rule.local('button', 'String');
const moved = rule.local('moved', 'Vector');
const travelled = rule.local('travelled', 'Number');
const lasted = rule.local('lasted', 'Number');
const way = rule.local('way', 'String');

const TAKES = rule.traitRef('Takes Gestures');
const leftButton = () => equals(button.get(), choice(BUTTON_SET, 'left'));

/** How far the pointer is from where the press began. */
const travelSoFar = () =>
  vectorLength(vectorMinus(mousePosition(), pressPlace.of()));

/** Tell each actor the press began on. */
const tellPressed = body => [
  forEach(each, {
    from: allWithTrait(TAKES),
    body: [when([[beingPressed.of(each.get()), body(each)]])],
  }),
];

/**
 * Which way a swipe went: the axis that moved further decides.
 *
 * `+y` is DOWN in this engine — gravity's default direction is `y: 1` — so a
 * swipe up is a negative change in y, which is the one place this reads
 * backwards from what a learner expects and the one place it is written down.
 */
const directionOfTravel = () => {
  const delta = vectorMinus(mousePosition(), pressPlace.of());
  const dx = axisOf('x', delta);
  const dy = axisOf('y', delta);
  return pick(
    atLeast(absolute(dx), absolute(dy)),
    pick(
      lessThan(dx, 0),
      choice(DIRECTION_SET, 'left'),
      choice(DIRECTION_SET, 'right'),
    ),
    pick(
      lessThan(dy, 0),
      choice(DIRECTION_SET, 'up'),
      choice(DIRECTION_SET, 'down'),
    ),
  );
};

rule.step('gestures', 'sense', [
  doc(
    'A press starts one, the frames after it grow one, and the release decides what it was.',
  ),

  // The press: remember where and when, and mark what it landed on.
  forEachButton('PRESSED', button, [
    when([
      [
        leftButton(),
        [
          pressPlace.set(mousePosition()),
          lastPlace.set(mousePosition()),
          pressStarted.set(time()),
          pressing.set(yes()),
          dragging.set(no()),
          heldTold.set(no()),
          forEach(target, {
            from: filter(target, {
              where: both(hasTrait(target.get(), TAKES), under(target.get())),
            }),
            body: [beingPressed.set(target.get(), yes())],
          }),
        ],
      ],
    ]),
  ]),

  // The release, BEFORE the frames in between, and the order is the point. A
  // release arrives with the pointer wherever it was let go, and a step that
  // read that as one more frame of dragging would drag the thing to there
  // after the finger had gone — which is how the Slider jumped back to the
  // middle when a drag ended with the pointer near the middle.
  //
  // A drag ends, and a short fast press is a swipe.
  forEachButton('RELEASED', button, [
    when([
      [
        both(leftButton(), pressing.of()),
        [
          travelled.let(travelSoFar()),
          lasted.let(minus(time(), pressStarted.of())),
          // TWO QUESTIONS, NOT A CHOICE BETWEEN THEM. A swipe travels far by
          // definition, so it has already become a drag by the time the finger
          // comes up — asking "was it a drag, or else a swipe?" would mean a
          // swipe could never happen. A fast far release is a swipe AND the end
          // of a drag, which is also what a phone does: flick a list and it
          // both stops following your finger and keeps going.
          when([
            [
              dragging.of(),
              [
                screenDropped(),
                ...tellPressed(who => [dropped({}, who.get())]),
              ],
            ],
          ]),
          when([
            [
              both(
                moreThan(travelled.get(), swipeDistance.of()),
                lessThan(lasted.get(), swipeTime.of()),
              ),
              [
                way.let(directionOfTravel()),
                screenSwiped({direction: way.get()}),
                ...tellPressed(who => [
                  swiped({direction: way.get()}, who.get()),
                ]),
              ],
            ],
          ]),
          pressing.set(no()),
          dragging.set(no()),
          forEach(each, {
            from: allWithTrait(TAKES),
            body: [beingPressed.set(each.get(), no())],
          }),
        ],
      ],
    ]),
  ]),
  // The frames in between: a drag once it has moved far enough, a hold once it
  // has stayed put long enough.
  when([
    [
      pressing.of(),
      [
        moved.let(vectorMinus(mousePosition(), lastPlace.of())),
        travelled.let(travelSoFar()),
        lasted.let(minus(time(), pressStarted.of())),
        when([
          [
            both(
              not(dragging.of()),
              moreThan(travelled.get(), dragDistance.of()),
            ),
            [dragging.set(yes())],
          ],
        ]),
        when([
          [
            dragging.of(),
            [
              screenDragged({movement: moved.get()}),
              ...tellPressed(who => [
                dragged({movement: moved.get()}, who.get()),
              ]),
            ],
          ],
        ]),
        // A HOLD IS ANNOUNCED WHILE THE FINGER IS STILL DOWN, which is what
        // makes "hold to confirm" work at all, and once per press, which is
        // what the flag is for.
        when([
          [
            both(
              both(not(dragging.of()), not(heldTold.of())),
              moreThan(lasted.get(), holdTime.of()),
            ),
            [
              heldTold.set(yes()),
              screenHeld(),
              ...tellPressed(who => [held({}, who.get())]),
            ],
          ],
        ]),
        lastPlace.set(mousePosition()),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'gestures');
