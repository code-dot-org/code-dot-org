// The Portrait, demonstrated: it arrives, and then it goes.
//
// The one stock actor whose picture is a lie by omission. A Portrait starts
// INVISIBLE — that is the whole of what its file does besides wear a face — so
// the honest still is nothing at all, and the dialog shows the face it would
// wear because a blank row is worse. What the strip can show is the thing the
// stillness hides: somebody fading in when it is their turn to speak, and out
// again when it is not.
//
// `set opacity of ⟨the portrait⟩` is the line a scene writes, and opacity
// belongs to no rule — every actor has one — which is why this reaches it
// through the engine rather than through a module.
//
// IT BEGINS ON SCREEN, and that is a decision about the STILL rather than
// about portraits. Frame one of a strip is what every unselected row shows, and
// a demo that started at the beginning of the fade would put a black rectangle
// on the shelf beside the sentence "the face of whoever is speaking". So the
// scene starts mid-conversation: somebody is here, their turn passes, and they
// come back for the next line.

import {ACTOR_DEMO_SIZE, type ActorDemo, type DemoStage} from './types';

/** The beats of a two-line scene: here, gone, back again. */
const LEAVES = 0.6;
const AWAY = 1.2;
const RETURNS = 1.8;
/** How long a fade takes. Half a second reads as deliberate rather than as a cut. */
const FADE = 0.5;

export const portraitDemo: ActorDemo = {
  // Life size: a face is a thing to look at.
  shrink: 1,
  cast: [
    {
      actor: 'portrait',
      x: ACTOR_DEMO_SIZE.width / 2,
      y: ACTOR_DEMO_SIZE.height / 2,
    },
  ],
  seconds: 2.5,
  drive({subject, engine, seconds}: DemoStage) {
    const fade =
      seconds < LEAVES
        ? 1
        : seconds < AWAY
          ? Math.max(0, 1 - (seconds - LEAVES) / FADE)
          : Math.min(1, (seconds - RETURNS) / FADE);
    subject.set(engine.OpacityProperty, Math.max(0, Math.min(1, fade)));
  },
};
