// The Pause Menu's buttons: each a Button that tells its parent one thing.
//
// A Resume Button is a Button whose caption says RESUME and whose one handler
// raises `resumed` on the actor carrying it; a Quit Button is the same with
// `quit`. Kinds of their own rather than Buttons with a caption, because the
// handler that makes them mean something lives in an actor FILE, and a file
// is a kind (specs/UI_ACTORS.md, "The second axis").
//
// THEY TELL THEIR PARENT, whatever it is. `emit ⟨resumed⟩ for ⟨parent of this
// actor⟩` names the Pause Menu's event and hands it to whoever the button is
// a child of; a button placed under something that is not a Pause Menu tells
// it something it has no handler for, which is nothing. That is what lets a
// menu map be rearranged in the editor without rewiring anything.

import {actorFile, actsLike, me, setText, showAs, words} from './workspace';

/** `parent of ⟨this actor⟩`, the Space rule's own (specs/PARENTING.md). */
const parent = () => ({
  block: {type: 'world_get_Space_ParentProperty', inputs: {ACTOR: me()}},
});

/** A Button whose click raises one of the Pause Menu's events on its parent. */
const menuButton = (
  name: string,
  caption: string,
  event: 'Resumed' | 'Quit',
  icon: string,
) =>
  actorFile(
    name,
    [
      actsLike('actors/button'),
      showAs(icon),
      setText('TextProperty', words(caption)),
    ],
    {
      handlers: [
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          fields: {FILTER0: ''},
          inputs: {ACTOR: me()},
          next: {
            block: {
              type: `world_emit_ActorsPauseMenu_${event}Event`,
              inputs: {ACTOR: parent()},
            },
          },
        },
      ],
    },
  );

export const resumeButtonActor = menuButton(
  'Resume Button',
  'RESUME',
  'Resumed',
  'play',
);
export const quitButtonActor = menuButton(
  'Quit Button',
  'QUIT',
  'Quit',
  'stop',
);
