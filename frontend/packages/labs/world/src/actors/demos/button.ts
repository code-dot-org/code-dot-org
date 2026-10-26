// The Button, demonstrated: a pointer arrives, presses, and it answers.
//
// The one actor on the shelf whose whole worth is an EVENT. Its face is a
// drawing that does not change when it is pressed — deliberately, since what a
// particular button looks like is a routine a learner opens and edits — so a
// still of one is a still of a rectangle with a word in it, and so is a strip
// of one being pressed by nobody.
//
// THE CAUSE HAS TO BE IN THE FRAME. So the demo drives the pointer the way a
// mouse would: `setPointer` each frame, and a cursor drawn where it is, which
// fattens while the button is held. That is the same device the mouse RULE's
// demo draws, for the same reason and to the same recipe — a click is a place
// as well as a press, and a strip with no cursor in it shows a button
// answering nobody.
//
// AND THE ANSWER IS THE DEMO'S, which is the honest half of what a Button is.
// It raises "is clicked with" on itself and owns nothing that follows; a
// project decides what a press means. So this writes the handler a project
// would write — one line, changing the button's own words — and what the strip
// proves is that the press reached the actor at all.

import type {ActorDemo, DemoStage, PointerAt} from './types';

/**
 * What it says before anybody has pressed it, and after.
 *
 * Both short, and that is the recorder's constraint rather than the actor's:
 * the bitmap font is wider than the one the game sets a Button in, so a longer
 * word overhangs the panel here and fits there. Eight characters is what a
 * 96-pixel button holds.
 */
const ASKS = 'PRESS ME';
const ANSWERS = 'THANKS!';

/** Where the button sits, and so where the pointer has to arrive. */
const BUTTON = {x: 64, y: 40};

/** The press: long enough to see the cursor fatten, short enough to be a tap. */
const PRESS: readonly [number, number] = [1.2, 1.35];

export const buttonDemo: ActorDemo = {
  // Life size: the button is 96 across and the words in it are the point.
  shrink: 1,
  cast: [{actor: 'button', x: BUTTON.x, y: BUTTON.y}],
  seconds: 2.5,
  pointer(seconds: number): PointerAt {
    // A walk to the button, the press, and a step away afterwards — leaving
    // rather than resting on it, so the last frames show the button as it is
    // now rather than as something with a cursor parked on it.
    const legs: ReadonlyArray<
      readonly [number, number, {x: number; y: number}, {x: number; y: number}]
    > = [
      [0, PRESS[0], {x: 16, y: 84}, BUTTON],
      [PRESS[1], 2.2, BUTTON, {x: 108, y: 80}],
    ];
    const down = seconds >= PRESS[0] && seconds < PRESS[1];
    for (const [from, to, start, end] of legs) {
      if (seconds < to) {
        const along = Math.max(0, Math.min(1, (seconds - from) / (to - from)));
        return {
          x: start.x + (end.x - start.x) * along,
          y: start.y + (end.y - start.y) * along,
          down,
        };
      }
    }
    return {x: 108, y: 80, down};
  },
  wire({subject, modules}: DemoStage) {
    const text = modules['actors/label'].TextProperty;
    subject.set(text as never, ASKS as never);
    // `when ⟨this button⟩ is clicked with ⟨any⟩`, which is the block a project
    // writes and the only reason the actor elects the mouse trait at all.
    subject.on(modules['rules/mouse'].IsClickedWithEvent as never, () => {
      subject.set(text as never, ANSWERS as never);
    });
  },
};
