// The Speech Box, demonstrated: it says a line, and then the next one.
//
// A still shows a panel with a sentence in it, which is most of the actor and
// none of the point. A Speech Box is where a conversation HAPPENS — the panel
// stays and the words are replaced — and two frames of that is the whole idea.
//
// `say ⟨words⟩ on ⟨the box⟩` is the line a scene writes between one beat and
// the next; whether a project says it under a key press, a timer or a
// collision is the project's business and not this actor's.
//
// TYPED OUT, which is what this used to say it could not show. The typewriter
// was the `Reveals Text` rule and the stock box did not elect it, so a demo of
// one typing would have been a demo of a box this import does not hand over.
// It is the box's own now, so the strip shows the actor as imported.
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
  /**
   * A line per beat, said ONCE each.
   *
   * `drive` runs every frame and `say` starts a line from the beginning, so
   * saying the current line every frame would show one letter for ever. WHAT
   * THE BOX IS ALREADY SAYING is what says whether this is the frame — read
   * off the box rather than remembered here, because a `let` at module scope
   * would be left holding the last recording's answer and the second strip
   * would open on the second line.
   */
  drive({subject, modules, seconds}: DemoStage) {
    const whole = modules['actors/speechBox'].TheWholeLineProperty;
    const line = LINES[Math.min(LINES.length - 1, Math.floor(seconds / BEAT))];
    if (subject.get(whole as never) !== line) {
      subject.act(
        modules['actors/speechBox'].SayAction as never,
        line as never,
      );
    }
  },
};
