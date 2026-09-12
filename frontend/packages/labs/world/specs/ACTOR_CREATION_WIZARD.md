# The Actor Creator

A wizard that makes an actor, rather than a file with an actor's name on it.
Not built; this is what it would be, what it composes, and what it needs that
does not exist yet.

## The problem

`New actor` asks for a name and writes this:

    actors/chaser.actor      define actor named ⟨Chaser⟩

That is the whole file (`files/newThing.seedFor`). Everything that makes it an
actor is left to a learner who now has to know four separate things: that
pictures live under `sprites/` and are chosen with one dialog, that animations
live under `animations/` and are chosen with another, that abilities are
`use trait` rows whose dropdown holds ninety entries, and that some of those
traits name rules the project has not imported and will not compile without.

Every one of those four has a good answer already. None of them is offered at
the moment the learner is thinking about it, which is the moment they said
"new actor". The enhancement shelf answers "give this actor something it does
not have"; nothing answers "make me an actor".

## The shape

A sequence of steps, each a question with a visible answer, ending in a file
that is worth opening. The questions are the ones a learner asks themselves:

    1. What is it called?       a name, which is what every dropdown will say
    2. What does it look like?  a picture, an animation, or neither
    3. What can it do?          the enhancement shelf, read as a list of verbs
    4. Here it is.              the file, opened, with the blocks to change

Nothing in that list is new work in the sense of new mechanism. Steps 2 and 3
are dialogs that exist and are used elsewhere; the wizard is the frame that
puts them in an order and carries one project between them.

## Step 2, and its five doors

Four of the five are built, and all four already answer "which picture" in the
same grid idiom (`animationEditor/SpritePickerDialog`,
`appearance/BackgroundPickerDialog` and the actors' own grid are the same
reading of three folders):

| Door                   | What it is                                      | Where it lives                              |
| ---------------------- | ----------------------------------------------- | ------------------------------------------- |
| One the project has    | the pictures under `sprites/`                   | `SpritePickerDialog`                        |
| One off the shelf      | the stock library, by sight                     | `appearance/ImportAppearanceDialog`         |
| A blank one to draw    | a seeded PNG opened in the editor               | `files/newThing`, `imageEditor/PixelEditor` |
| One off the machine    | an upload into the folder that gives it meaning | `files/FileMenus.uploadInto`                |
| **One drawn to order** | **a prompt, and a picture back**                | **not built — see below**                   |

An animation instead of a still is the same question one level up
(`AnimationPickerDialog`), and "neither" is a legitimate answer: an interface
actor paints itself and must not carry a sprite over the top
(`specs/UI_ACTORS.md`).

Whatever is chosen, the step writes one row — `set sprite ⟨file⟩` or
`play animation ⟨id⟩` — which is a row the learner can see and change
afterwards, like everything else an assistant writes here.

## Step 3 is the enhancement shelf

Read as a step it wants to be BROAD. From an actor's own menu a list of ninety
verbs is a wall; at the point of "what can this thing do" it is a menu of what
the library can offer, and the learner is there to browse it. That is the
reason the shelf's charter admits a row that writes one `use trait` and imports
its rule (`ENHANCEMENTS.md` §What earns the name), and it is why rows added
from here on are being added to this step as much as to that dialog.

Two things follow that are not true of the shelf as it stands today:

- **The list needs grouping**, the way the rule shelf's did when it outgrew a
  flat run (`rules/stockRuleGroups`). Movement, contact, appearance, interface:
  a heading a learner can skip rather than a list they must read.
- **A trait with no row is still a trait.** The shelf answers the common wants;
  the wizard should end with a way through to the rest rather than implying
  that what it lists is all there is.

## The AI picture, and what porting it costs

The prompt-to-picture door is the only genuinely new one, and it is not new
engine work: it is a route that exists, reached from a client that does not
exist here yet.

**The gateway already draws.** `~/ai-gateway` serves `POST /generateImage`,
taking `{model, prompt, images, mask, n, size, seed}` and refusing any model id
that is not on its list of image models — an image model id is not
interchangeable with a chat one, and silently drawing with the wrong model
would be worse than an error (`generateImageHandler`). Its contract submodule
pins to code-dot-org `staging`, so a contract change lands there first.

**The legacy client already carries pictures back.** `apps/src/aichat` handles
generated image files with two safety checks before a student sees one —
moderation and an image-safety pass — and logs `ai-chat.image_generated`
(`api/client/generateChatResponse.ts`). Uploads are flagged on the same path
(`redux/thunks/uploadFiles.ts`).

**The world lab's tutor speaks text only.** `aiTutor/transport.ts` picks a
transport and posts to the dashboard's `/aichat_request`; nothing in this
package handles an attachment in either direction.

So the port is the middle layer, not the ends: the part of the aichat client
that sends a prompt, receives a file, runs it past the safety checks, and hands
back bytes. The lab's side of it is already solved for the shape of the answer
— an image the project holds is bytes on a URL in a folder, which is exactly
what `importStockBackground` and an upload both write.

**The safety checks are not optional and not ours to re-implement.** Whatever
lands here must run the same moderation the legacy path runs. A picture drawn
to order is the one thing in this lab that arrives from outside without a
person having looked at it first.

## What does not exist yet

- **A wizard shell.** Every dialog in the lab is one-shot: it opens, asks one
  question, and closes. There is no step container, no back, and no place to
  keep an answer between steps.
- **A way to defer the file.** An enhancement takes a project and a target
  naming a file that is already there (`enhancements.EnhanceTarget`), so step 3
  cannot run against an actor that has not been written yet. Either the wizard
  writes the file at step 1 and edits it as it goes — which means an abandoned
  wizard leaves a file behind — or enhancements learn to apply to a workspace
  in hand. The first is smaller and is probably right; the second is cleaner
  and is a change to seven files.
- **Trait selection outside the shelf.** There is no picker for "any trait in
  the project" but the Blockly dropdown.

## What has to be decided

- **Does it replace `New actor`, or sit beside it?** Replacing it makes the
  wizard the way, and costs the learner who wants an empty file. Beside it is
  two doors to one place, which this lab has been trimming rather than adding.
- **Where is it entered from?** The Actors grid's `New` tile is the obvious
  place, since that is where "I want another actor" is already expressed
  (`actors/ActorPickerDialog`).
- **Is it skippable?** A learner who knows what they want should be able to
  land on the file in one press. A wizard that cannot be walked out of is worse
  than the prompt it replaced.
- **Does it edit an actor that exists?** The same three questions asked of a
  finished actor are a reasonable thing to want, and are also exactly what the
  actor's own row already offers one at a time.

## What it is not

It is not a code generator, and it does not own anything afterwards. Every step
writes ordinary blocks in a file the learner owns, the same bargain the
enhancement shelf strikes (`ENHANCEMENTS.md`): what the wizard leaves behind is
a project, and deleting its rows undoes it. Nothing marks an actor as having
been made this way, because there is nothing to mark.
