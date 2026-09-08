// The Label, demonstrated: it says whatever it is told to.
//
// A still of a Label is a word. That is not wrong — a Label IS a word — but it
// is indistinguishable from a picture of a word, and what makes this actor
// worth importing is that the word CHANGES: a score, a level, a countdown.
//
// So the demo counts. `set text of ⟨the label⟩` is the line every project that
// owns a Label writes, and the strip is that line running.
//
// IN CAPITALS, because the recorder's font has no lower case (`record/font`)
// and a demo whose text is filmed differently from the text it set would be
// lying about a detail nobody could check. A score in capitals is a score.

import {ACTOR_DEMO_SIZE, type ActorDemo, type DemoStage} from './types';

/** How often the number goes up, in seconds. */
const EVERY = 0.25;
/** What one pickup is worth, which is what the starter's coins are worth. */
const WORTH = 10;

export const labelDemo: ActorDemo = {
  // Life size: what this is about is legible text, and half a letter is not a
  // smaller letter.
  shrink: 1,
  cast: [
    {
      actor: 'label',
      x: ACTOR_DEMO_SIZE.width / 2,
      y: ACTOR_DEMO_SIZE.height / 2,
    },
  ],
  seconds: 2,
  drive({subject, modules, seconds}: DemoStage) {
    const text = modules['actors/label'].TextProperty;
    const score = Math.floor(seconds / EVERY) * WORTH;
    subject.set(text as never, `SCORE ${score}` as never);
  },
};
