// The Speech Box, demonstrated: it says a line, and then the next one.
//
// A still shows a panel with a sentence in it, which is most of the actor and
// none of the point. A Speech Box is where a conversation HAPPENS — the panel
// stays and the words are replaced — and two frames of that is the whole idea.
//
// `set text of ⟨the box⟩` is the line a scene writes between one beat and the
// next; whether a project writes it under a key press, a timer or a collision
// is the project's business and not this actor's.
//
// NOT TYPED OUT LETTER BY LETTER, though the file's header explains how: that
// is the `Reveals Text` trait, which the stock box does not elect, and a demo
// that showed one typing would be showing a box that this import does not hand
// over.
//
// THE WORDS ARE IN CAPITALS for the reason the Label's are — the recorder's
// font has no lower case, and text filmed differently from the text that was
// set would be a quiet lie.

import {ACTOR_DEMO_SIZE, type ActorDemo, type DemoStage} from './types';

/** What the box says, in order, a beat and a bit apart. */
const LINES = ['IT IS DARK IN HERE.', 'SOMETHING MOVES.'];
const BEAT = 1.4;

export const speechBoxDemo: ActorDemo = {
  // A third the size: the panel is 280 across, which is most of a real screen
  // and nearly three times the width of a strip. What is lost is the smoothing
  // on the letters, which this recorder has none of anyway.
  shrink: 3,
  cast: [
    {
      actor: 'speechBox',
      x: (ACTOR_DEMO_SIZE.width * 3) / 2,
      y: (ACTOR_DEMO_SIZE.height * 3) / 2,
    },
  ],
  seconds: 2.8,
  drive({subject, modules, seconds}: DemoStage) {
    const text = modules['rules/writing'].TextProperty;
    const line = LINES[Math.min(LINES.length - 1, Math.floor(seconds / BEAT))];
    subject.set(text as never, line as never);
  },
};
