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

    1. Where does it come from?  from nothing, from one of mine, from theirs
    2. What does it look like?   a picture, an animation, or neither
    3. What can it do?           the enhancement shelf, read as a list of verbs
    4. Here it is.               the file, opened, with the blocks to change

Nothing in that list is new work in the sense of new mechanism. Every step is a
dialog that exists and is used elsewhere; the wizard is the frame that puts
them in an order and carries one project between them.

**The later steps are questions, not a form to fill in.** A learner who starts
from something arrives at step 2 with a picture already chosen and at step 3
with half the verbs already ticked, and both steps say so rather than asking
again. That is the point of step 1 being first.

## Step 1, and the three doors

    Create my own        the bare seed: define actor named ⟨…⟩
    Copy one of mine     one of the project's own actors, cloned
    Start from a template  one of the library's, imported

**Two of the three fill in the rest of the wizard**, which is what makes the
order matter. A copied Crawler already has a sprite and already patrols, so
step 2 opens on its picture and step 3 shows "Walks a beat" and "Hurts what it
touches" as things it has. The learner's job from there is changing its mind,
not answering from nothing.

**None of that is new machinery, and that is the argument for the shape.**
`Enhancement.applied` already reads an actor's own chain to decide whether a
row is a thing it has (`ENHANCEMENTS.md`), so a copied actor's abilities come
back ticked with nothing added. Step 2's answer is the source's own
`set sprite` or `play animation` row. The wizard shows what is there; it does
not have to remember what it did.

**Copying and templating are separate doors although both start from
something**, because the two differ in every way but the sentence:

- **Copy one of mine** is `clone` (`files/FileMenus`), which resolves
  references so the copy is a COPY — cloning a reference would write a file
  pointing at the original's rule rather than owning one — and which asks for a
  name, because two actors both called "Player" is the state the clone exists
  to avoid.
- **Start from a template** is `importStockActor`, which is an aggregate: an
  actor's rows are references, and every one must name something the project
  supplies, so a Coin asks for one rule and one animation and writes seven
  files. A row naming something the project lacks does not announce itself — a
  missing trait fails at compile time with nothing on screen, and a missing
  animation resolves to whatever else is in the dropdown.

They also differ in what the learner is thinking: "another one like my Crawler"
is a different thought from "one of theirs, to start from".

**The name belongs to this step**, because each door already answers it
differently and none of them can be asked the same way. Making one from nothing
has no name until the learner types it; a clone has one to vary; a template
arrives called what the library calls it, which is a name worth keeping and
worth being able to change on the spot.

**The doors are not new either.** The Actors grid already offers New and Import
as tiles (`actors/ActorPickerDialog`) and the actor's own row already offers
Clone. Step 1 is those three made into one question, asked at the moment the
learner has it.

## Step 2, and its five doors

Built, except the fifth. It offers the project's pictures and its animations in
one grid — a still is what most actors are, so those come first — and it needs
no palette lifted out of another dialog after all: what it shows is whole
pictures and whole animations, and `animationEditor/CellThumb` and
`animationEditor/AnimationThumb` each already draw one. The grid built to offer
the CELLS of a spritesheet answers a question `set sprite` does not ask, since
that row names a file.

**No picture is a real answer**, so the step is a way on rather than a demand.
And an actor that came from something arrives with its own picture already
chosen, which the step shows pressed: pressing straight on says nothing to the
caller, because there is nothing to do.

**Changing it replaces the row rather than adding one** (`create/actorLook`).
Two rows both saying what an actor looks like is a file whose answers disagree
and whose last one silently wins — and the replacement happens where the row
already was, so an actor whose picture was at the top of its chain does not
find it moved to the bottom for having been changed.

All five are built, and the first four answer "which picture" in the same grid
idiom (`animationEditor/SpritePickerDialog`,
`appearance/BackgroundPickerDialog` and the actors' own grid are the same
reading of three folders):

| Door                | What it is                                      | Where it lives                              |
| ------------------- | ----------------------------------------------- | ------------------------------------------- |
| One the project has | the pictures under `sprites/`                   | `SpritePickerDialog`                        |
| One off the shelf   | the stock library, by sight                     | `appearance/ImportAppearanceDialog`         |
| A blank one to draw | a seeded PNG opened in the editor               | `files/newThing`, `imageEditor/PixelEditor` |
| One off the machine | an upload into the folder that gives it meaning | `files/FileMenus.uploadInto`                |
| One drawn to order  | a prompt, and a picture back                    | `appearance/generate/DescribePicture`       |

**The fifth is not a tile, because it is not a grid answer.** It takes the
whole step: a prompt, a size, and a picture big enough to judge do not fit
under the pictures the project already has, and the picture is the point — one
chosen at thumbnail size is one nobody looked at. So the grid carries a door to
it and the panel carries the way back, the grid still being the likelier
answer. The same panel is behind the backdrop shelf and the sprites shelf,
which is where its other two kinds are asked for
(`appearance/generate/imagePrompts`).

**Pressing on keeps what is drawn.** Choosing a picture from the grid costs one
press, so a drawn one that wanted a second — under a button beside the one a
learner was going to press anyway — was a picture that got left behind: made,
looked at, and not on the actor. It was reported that way. `Next` is what says
"that one", and a write that refuses keeps the panel up rather than walking on
without it.

An animation instead of a still is the same question one level up
(`AnimationPickerDialog`), and "neither" is a legitimate answer: an interface
actor paints itself and must not carry a sprite over the top
(`specs/UI_ACTORS.md`).

**Arriving with an answer already given is the common case**, not the
exception: two of step 1's three doors hand this step a picture. So its default
state is a chosen tile and a way past, rather than an empty grid and a
requirement — and a learner who wanted the Crawler's look and only its look is
finished here without touching anything.

Whatever is chosen, the step writes one row — `set sprite ⟨file⟩` or
`play animation ⟨id⟩` — which is a row the learner can see and change
afterwards, like everything else an assistant writes here.

**And the drawing door writes a second one, because it has to ask a second
question.** A picture that is drawn to order has no size of its own to inherit;
after the fit every actor is at most one tile, so a totem pole and a coin come
out the same height unless somebody says otherwise (`specs/ACTOR_SIZE.md`). The
panel asks with a four-by-four grid filled from the bottom-left corner —
columns across, rows up, so the rectangle drawn is the rectangle got — and the
answer goes two ways at once: into the prompt, so the picture arrives that
shape rather than square and stretched, and into a `set scale` row on the
actor. One tile writes nothing, being what every actor already is.

The size is a fact about the ACTOR and not about the picture, so it survives
leaving the panel and is written whatever the picture ends up being. It is
asked of a repeating surface too: three tiles wide and two high, joining side
to side, is one actor whose picture is the whole platform, and `set scale`
stretches a sprite rather than repeating it.

**And the door asks what sort of picture it is**, which it used to assume. An
actor is as often terrain as it is a character — the platformer's ground is an
actor — so "a thing" or "a surface" is the learner's to choose, and nothing
about being the Actor Creator's door says which was meant. A surface is then
asked two more: which edges it joins, since a ground with grass on top joins
side to side and cannot join top to bottom, and whether part of it is
see-through, since a platform with vines hanging under it is material across
the top and nothing below (`specs/IMAGE_GENERATION.md`).

## Step 3 is the enhancement shelf, read as a checklist

Built. What it shares with the dialog is the QUESTION — a name, a sentence,
what it brings, whether this actor can take it, and the question the one that
asks one raises — and each frame draws it its own way, because what a press
means differs: `enhance/EnhancementRows` for the dialog's choose-one,
`enhance/EnhancementChecklist` for this step's tick-many.

Read as a step it wants to be BROAD. From an actor's own menu a list of ninety
verbs is a wall; at the point of "what can this thing do" it is a menu of what
the library can offer, and the learner is there to browse it. That is the
reason the shelf's charter admits a row that writes one `use trait` and imports
its rule (`ENHANCEMENTS.md` §What earns the name), and it is why rows added
from here on are being added to this step as much as to that dialog.

**It also arrives partly answered**, for the same reason step 2 does, and with
no work: `applied` is how a row already decides whether to say "already has
this", and a copied or imported actor's traits are in the chain it reads.

**It takes as many as the learner wants**, which is the one way this step is
not the dialog. `EnhanceActorDialog` applies ONE and closes, which is right for
what it is — "give this actor one more thing", asked from the actor's own row
or from the wand on its `define actor`. Building an actor up is a different
act: walking in and out of the shelf once per ability would make a Crawler
three round trips.

**So it is a CHECKLIST, and it was not.** The first cut drew the dialog's rows
with an `Add this` button under them, applying one per press, and that was two
mistakes wearing one coat. The first is the one the drawing panel had: a press
that is not the press a learner was going to make anyway is a press that gets
forgotten — and this one had to be made once PER ability, which nothing on
screen said. The second is that twelve rows of name, sentence and "also adds"
is a wall rather than a list; it was reported as hard to find anything in.

Ticking is the whole act now. Nothing is applied until `Create`, which is the
press the learner was making regardless, and `Enhancement.apply` being a pure
transform over a source means the queue costs nothing to hold and nothing to
undo — a row can be un-ticked, which the applying version could not offer at
all.

**What the actor already has is ticked and locked**, with the reason beside it.
Two of step one's three doors hand this step an actor that can already do
things, and the honest way to show that is the same tick in the same column
rather than a row greyed out for reasons of its own. The tick is not a claim
that this step did it; `applied` is what answers, reading the actor's own
chain, so nothing keeps count.

**And the sentence is behind a press.** A name is enough to scan a list by; the
description and what it brings are there for the row you are wondering about
(`enhance/EnhancementChecklist`).

**The one-shot dialog stays exactly where it is.** It is reached from the
`define actor` block and from the actor's row, and both are about an actor that
already exists. What is shared is the ROW — its name, its sentence, what it
brings, its question, and whether the actor has it — not the dialog around it.

Two things follow that are not true of the shelf as it stands today:

- **The list needs grouping**, the way the rule shelf's did when it outgrew a
  flat run (`rules/stockRuleGroups`). Movement, contact, appearance, interface:
  a heading a learner can skip rather than a list they must read.
- **A trait with no row is still a trait.** The shelf answers the common wants;
  the wizard should end with a way through to the rest rather than implying
  that what it lists is all there is.

## The AI picture, and what porting it costs

_Built, against a seam rather than against the gateway._ The door, the panel
and the prompts are in (`specs/IMAGE_GENERATION.md`); what is behind them is
whichever transport the lab can reach — a fixture with no key, the dev server's
own key proxy, or the gateway once it is ported. The port below is therefore
the last of the three and blocks nothing.

Its own spec, because the answer turned out to be bigger and different than
this section said: `AI_IMAGE_GENERATION.md`. In short —

**The service and the token already exist**, and the work is that the client
lives in the webpack bundle (`apps/src/aiGateway`) where a standalone package
cannot reach it. So the port is an extraction rather than a copy, and the
design question in it is the CONTEXT: Rails authorises a token on a client
type, a level and a channel that a webpack-global singleton supplies today.

**Sprite Lab is the precedent**, not the aichat client this section used to
name. It draws by calling the gateway's text route with an image model —
`/generateImage` exists and nothing in this repo calls it.

**And this section was wrong about safety.** It said the port must bring
aichat's moderation with it. The lab paths do not run it: "Prompt safety is
whatever the gateway enforces; the aichat moderation pipeline is not on this
path" (`p5lab/.../ai/askSpriteLabAi.ts`). Whether what the gateway enforces is
enough for a picture drawn into a learner's project is a question for whoever
owns that path, and it is asked in the other spec rather than answered here.

## What does not exist yet

- ~~**A wizard shell.**~~ Built: `actors/create/ActorCreator` owns the step, the
  answers, and the actor as it would be.
- ~~**A way to leave, having written nothing.**~~ **Settled, and the reasoning
  that made it a problem was wrong.** It said cloning writes a file and
  importing writes seven, so the actor must exist after step 1 and an abandoned
  wizard must leave one behind. Neither writes anything: `clone`'s edit and
  `importStockActor` are pure transforms over a project source, and so is
  `Enhancement.apply` — which takes a SOURCE and a path, and a draft source is
  a source.

  So the wizard collects answers and the caller performs them in one commit.
  Back works between every step, nothing is left behind by a wizard somebody
  walks out of, and step 3 needs no change to seven files to apply an
  enhancement to an actor that is not in the project yet.

- **Trait selection outside the shelf.** There is no picker for "any trait in
  the project" but the Blockly dropdown. The abilities step is the shelf, so
  what has no row is still only reachable by opening the file — which is fine
  as an answer and is not the same as saying the shelf is everything.
- **Grouping.** Ten rows is a list; thirty will be a wall, and the rule shelf
  already had to learn this (`rules/stockRuleGroups`).

## What has to be decided

- ~~**Does it replace the Actors grid's two tiles?**~~ **Done.** `Import` is
  gone and `New` opens the wizard: the two were a choice made before the
  question was put — "from nothing" or "from the library", asked of a learner
  who had not yet said they wanted an actor. The actor row's `Clone` stays
  where it is as well as being the second door, since cloning a finished actor
  is a thing done TO one file rather than a way of starting.
- **Is `Create my own` still one press?** It was: `New` asked for a name and
  opened a file. Through the wizard it is a door, a name, a picture and a shelf
  — three Nexts, each of which may be answered with nothing. Either that is a
  visible way out of every step, or the learner who wanted an empty file has
  been made to walk past three questions to get it.
- **Nothing says what has been chosen so far.** Three steps in, the wizard
  shows the step you are on and not the actor you are making. A line of what it
  is called, what it looks like and what it can do would answer that; whether
  it is worth the room is not obvious at three steps and will be at five.
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
