// The Progress Bar, demonstrated: it fills.
//
// The still shows a bar. Every bar is a bar; what this actor IS is the
// arithmetic between a number and a width, and a frozen one at some fraction
// could as easily be a rectangle somebody drew at that size.
//
// SO THE DEMO PLAYS THE GAME. Nobody presses anything here: a Progress Bar
// answers to a number that something else sets — a coin taken, a hit landed, a
// level loaded — and the line this writes is the line a project writes
// (`set fraction of ⟨the bar⟩ to …`). That is the same bargain the Time and
// Shooting rule demos struck, for the same reason: the actor owns the picture
// and not the occasion.
//
// It fills and then holds, rather than looping straight back to empty. A bar
// that snapped to zero would read as a bar that lost everything, which is a
// different rule's story.
//
// IT STARTS PART WAY ALONG, and that is a decision about the STILL. Frame one
// is what every unselected row shows (specs/RULE_DEMOS.md), and an empty track
// is a dark line — the one picture of this actor that does not look like a
// bar. A quarter full looks like a bar and is what a bar spends its life
// being.

import {ACTOR_DEMO_SIZE, type ActorDemo, type DemoStage} from './types';

/** Where it starts, and how long the rest of the filling takes. */
const FROM = 0.25;
const FILL_SECONDS = 1.5;

export const progressBarDemo: ActorDemo = {
  // Life size: a 64 by 8 bar shrunk by half is a line, and what this is about
  // happens inside those eight pixels.
  shrink: 1,
  cast: [
    {
      actor: 'progressBar',
      x: ACTOR_DEMO_SIZE.width / 2,
      y: ACTOR_DEMO_SIZE.height / 2,
    },
  ],
  seconds: 2,
  drive({subject, modules, seconds}: DemoStage) {
    const fraction = modules['actors/progressBar'].FractionProperty;
    subject.set(
      fraction as never,
      Math.min(1, FROM + (1 - FROM) * (seconds / FILL_SECONDS)) as never,
    );
  },
};
