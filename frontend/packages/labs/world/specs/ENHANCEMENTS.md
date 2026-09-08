# Enhancements

## The problem

The Health Bar is not a thing. It is a RELATIONSHIP: a bar, an actor with
health, and a line pointing one at the other.

Everything in the lab was built for things. `Import…` writes a file into a
folder and touches nothing else, which is exactly right for a Coin and exactly
useless for a bar — importing one gives a project a file that draws an empty
track and stays that way. The recipe for making it mean something lives in the
actor's own DESCRIPTION, in prose:

> Point it at an actor with "subject" and it shows how much health that actor
> has left. Put it in the corner for a HUD, or add "Attached" to have it ride
> above the actor it is about.

Four edits across three files, three of which are only correct together. **A
description that contains a recipe is a recipe missing from the lab.**

The demo shelf found the same hole from the other side: the Health Bar is the
one stock actor that cannot be filmed, because a demo of it needs an actor with
health and nothing on the shelf has any (specs/RULE_DEMOS.md). That gives a
test:

> **If a stock actor cannot be demonstrated without a second actor the shelf
> does not have, it is an enhancement in disguise.**

## A subject, and sometimes an argument

An enhancement has a SUBJECT: the thing whose files it edits, and so the thing
it is asked for from. "Health and a bar above it" is an ACTOR's — the trait,
the property and both handlers land in that actor, and the bar it places is a
companion the actor makes for itself. "A camera that follows an actor" is a
WORLD's: it defines a camera in the world and looks through it, and the actor
appears in it as a value.

Reading the camera as an actor enhancement was wrong in the way that matters,
and it took building it to see. It was offered from the actor's own wand — "the
camera follows THIS one" — and answering wrote nothing at all into the file the
learner was looking at. The test is not which thing the change is ABOUT; it is
whose fact it is, and so whose file it lands in.

So an enhancement declares its subject, each wand offers what suits it, and one
that has to name something else ASKS: the shelf puts the question under the row
that raised it, with the choices read from the project. The camera asks which
actor to follow, and offers both kinds — the world's own `define actor` blocks
and the project's `.actor` files.

## What an enhancement is

A patch, applied to an actor a project already has: rules imported, traits
elected, a companion actor placed, and the lines that aim them at each other.

**It writes blocks the learner could have written.** Everything an enhancement
does is ordinary rows appended to the chain under a `define actor`, or a hat
placed beside it — the same blocks the toolbox offers, in the order somebody
would have dragged them (`actors/enhance/patch`). Nothing is marked, hidden or
owned by the library afterwards. What it leaves behind is a project, and
deleting the rows undoes it.

**It appends at the end.** A row inserted into the middle of somebody's chain
moves their blocks about, and a world's wiring has to come after its placements
anyway: `set subject of ⟨the bar⟩` acts on a bar that has been added.

**It is idempotent.** Enhancing twice is a thing that will happen, because a
learner who cannot see what changed will do it again. Every edit asks whether
its row is already there, so the second time is a no-op rather than a second
bar.

**It says what it will touch, before it does it.** This is the only act in the
lab that edits files a learner made, so the dialog lists what lands in the
project the way the import shelves list what an import brings.

## What earns the name

More than one edit, or a companion actor, or a line aiming two things at each
other. Anything that is only "elect this trait" belongs on the rule shelf,
which offers exactly that in two clicks and should not be duplicated here.

## Where it is asked from

**On the actor's own row**, beside Rename, Clone and Delete — the menu for
things done TO one file (`files/FileMenus`). Enhancing is done to an actor, so
choosing the actor is not a question the dialog has to ask: it is answered by
whose row the menu belongs to, and the dialog's title says which one it is
about.

**And on the `define actor` block itself**, as a wand beside the actor's name
(`blockly/extensions/enhanceButton`) — the third of the buttons that ride on a
block, after the eye that opens a file and the mortarboard that opens a lesson.
It is the nearer of the two routes: a learner looking at an actor's blocks and
wanting it to have health is already pointing at the actor.

**And on `define world`**, which is the same button on the other kind of
subject. A world enhancement is asked for from the world, for the same reason
an actor's is asked for from the actor.

It is not built on a read-only workspace, and that is where it parts company
with the eye and the mortarboard beside it: those two READ — a version being
previewed can still be looked into — and this one writes.

## Two kinds of actor, two shapes of patch

Most actors have a file of their own. An actor a WORLD defines for itself does
not: it is a `define actor` block among the world's own roots, named everywhere
else by the world plus that block (`blockly/localActors`), and the starter said
entirely in `main.world` is made of them.

A target is therefore a file path AND, for a world's own actor, a block id. The
patch is the same patch; four things differ, and nothing else does:

|                           | an actor with a file           | one a world defines              |
| ------------------------- | ------------------------------ | -------------------------------- |
| the file                  | `actors/<name>.actor`          | `worlds/<world>.world`           |
| the chain                 | the file's only `define actor` | the one the block id names       |
| the hat's subject         | `this actor`                   | `any ⟨Ground⟩`                   |
| the property's block type | keyed by the file              | keyed by the world AND the block |

**The BODY is unchanged**, which is what makes this cheap: `this actor` inside
a hat is the actor the event fired for either way, so the three rows that place
the bar, point it and remember it read the same in both.

**The bar stays a file in both.** `add actor ⟨Health Bar⟩` reads the same in a
world as in an actor, and a world that defines its own actors has no more claim
to define its own bar than to define its own Coin.

**A known interaction, since the single-world starter is where it shows up:**
that project defines an actor of its OWN called "Health Bar", so enhancing
anything in it leaves two actors of that name — the local one and the imported
file — and the editor's thumbnails say so. That is what importing the stock
Health Bar into that project does by any route, `Import…` included; it is a
collision between a world's own actor and an imported file, and it wants
solving there rather than here.

## The first one: health, and a bar above it

Every line of it lands in the ACTOR:

    actors/<target>.actor    define actor property ⟨health bar⟩ (actor)
                             use trait ⟨Health#Has Health⟩

                             when ⟨this actor⟩ is created:
                               add actor ⟨Health Bar⟩ as ⟨bar⟩ do:
                                 set subject of ⟨bar⟩ to ⟨this actor⟩
                                 set attached to of ⟨bar⟩ to ⟨this actor⟩
                                 set ⟨health bar⟩ of ⟨this actor⟩ to ⟨bar⟩

                             when ⟨this actor⟩ is removed:
                               remove actor ⟨health bar of this actor⟩

    actors/healthBar.actor   use trait ⟨Attachment#Attached⟩

**No world is touched, and the first draft's mistake is why that matters.** It
placed the bar in every `.world` and pointed it with `any ⟨kind⟩`, which was
wrong twice. Giving one actor a bar meant editing files about LEVELS — an
enhancement that says it edits an actor should edit an actor — and two of that
actor shared one bar between them, because "any" is one actor however many
there are. Six crawlers and a player is the ordinary case, not the exotic one.

**So the engine learned to say when an actor appears.** `is created` is an
event on the Space rule, raised by `World.place` for every actor, elected by
nobody: every actor is created, the way every actor has a position. It is
QUEUED like every other event, so a handler runs after the tick rather than
inside whatever placed the actor — which matters here more than anywhere,
because the commonest thing to do when an actor appears is to add another one,
and a world that grew while it was being built or walked is a list mutating
under somebody's feet.

That costs a frame: an actor placed while the world is described hears this on
the first tick, and its bar is over its head on the second. What it buys is
that `add actor` inside the handler is the same ordinary call it is anywhere
else.

**And the other end, because company has to leave too.** An actor removed with
its bar still in the world leaves a bar about nobody, hanging where its subject
used to be — so `is removed` is the second half of the pair, raised the moment
an actor actually leaves a world (both of `removeActor`'s paths pass through
one `detach`). It is NOT raised by `clear world`: emptying a world is not
something that happens to each actor in it, nothing survives to react, and a
hundred handlers running as a level is torn down is a hundred chances to put
something back into a world that is being emptied.

**The actor remembers its bar in a property of its own**, which is what makes
the second handler possible: `add actor … as ⟨bar⟩` opens a block scope, so
that name is visible in that body and nowhere else, and a handler on the other
side of the file cannot see it. A property is what an actor has that outlives a
statement.

**`as ⟨bar⟩` rather than `this actor`**, because inside `add actor` the unnamed
reading rebinds `this actor` to the thing being placed — and both halves of
this wiring are about the actor that was CREATED, which is the handler's own
subject.

**No offset**, though a bar over a head plainly needs one: 24 above is already
the Attachment rule's default, chosen there for this. A line saying what would
have happened anyway is a line to keep in step with a default that may change
for a reason.

## The second one: the camera follows it

A level bigger than the screen is the commonest thing a learner builds and the
commonest one they cannot finish — the player walks off the right-hand side and
the game goes on without them. The answer is five blocks, and not one of them
is anywhere near the actor:

    worlds/*.world    define camera ⟨Follow Camera⟩ do:
                        use trait ⟨Camera Follow#Follows⟩
                        set actor to follow of ⟨this camera⟩ to ⟨any ⟨target⟩⟩
                      look through camera ⟨Follow Camera⟩

**It is the WORLD's**, and it is the counter-example to the Health Bar rather
than a repeat of its bug. Which camera a world looks through, and what that
camera is aimed at, are facts about the world's view; a camera is not an actor
and an actor cannot hold one. So the subject is the world, the actor is the
ANSWER to the question it asks, and one world is patched — the one whose wand
was clicked, which is also right for a project with two levels, since each
world wants its own camera.

**Appended at the end, and the ordering is load-bearing.** `any ⟨Player⟩` is
read at the moment `define camera` runs, so a camera declared above `load map`
is handed an empty list and sits still for the whole game, with nothing in the
console to say why. The starter fixtures carry the same comment over the same
line (`fixtures/flappy`).

**One camera per world**, with an id of its own, so asking again REPOINTS it
rather than adding a rival: a world has one view, and a second answer is a
learner changing their mind. A camera the learner made themselves is left
alone — this owns the one it made and nothing else.

## The pair: collecting, and the number it adds up to

The starter's own wiring, which every project that keeps a score writes again.
Two enhancements, one of each subject, and neither is worth much alone.

**Collects things, and scores for them** (an actor's):

    actors/<target>.actor    use trait ⟨Collection#Collects⟩
                             when ⟨this actor⟩ collects ⟨any⟩:
                               add ⟨10⟩ to the score

`Collects` is what lets an actor take a Coin — the coin already declares `Can
Be Collected`, and nothing happens until something can do the collecting. And
taking one is worth nothing until a handler says what it is worth: collection
knows nothing about scoring and scoring knows nothing about coins, which is why
the line between them belongs to the project.

**Ten, without asking.** The number is the starter's own, and it lands in a
block in the learner's file that they can read and change. A shelf that stopped
to ask would be asking about the one thing already in front of them.

**A scoreboard** (a world's):

    actors/scoreboard.actor  (new) the stock Label, renamed, plus
                                   use trait ⟨Scoring#Watches the Score⟩
                                   when ⟨this actor⟩ sees the score change:
                                     set text to join ⟨"SCORE "⟩ ⟨the score⟩

    worlds/<world>.world           define layer ⟨Interface⟩ do:
                                     this layer ⟨fixed⟩
                                     add actor ⟨Scoreboard⟩ do:
                                       set position ⟨48, 16⟩

**A kind of its own, rather than the stock Label placed and pointed at.** A hat
names a KIND, so one on `any ⟨Label⟩` would rewrite every label in the project
— including the ones the learner put there to say something else. So the
scoreboard is a Label whose name is Scoreboard, which is exactly what the
starter's own `scoreboard.actor` is.

**The trait is what makes the hat fire.** "Sees the score change" is an actor's
event and an actor hears it because it elected to watch. Without that row the
board draws its seeded text for the rest of the game, which is what this looked
like before the row was there.

**And it goes on a fixed layer**, which is the piece a learner finds last and
by accident: a world-space score sits where it was placed and slides off the
screen the moment anything moves the camera. Written even in a project with no
camera, because the camera is one wand away and nothing about the scoreboard
should need revisiting when it arrives.

## The one that was a rule: typing out what it says

    actors/<target>.actor    use trait ⟨Writing#Shows Text⟩
                             use trait ⟨Time#Has a Timer⟩

                             define read-only string ⟨the whole line⟩
                             define number ⟨letters a second⟩ = 20
                             define event ⟨finishes revealing⟩
                             define block ⟨say ⟨words⟩⟩
                             define block ⟨show all of it⟩
                             set ⟨timer runs⟩ of ⟨this actor⟩ to ⟨no⟩

                             when ⟨this actor⟩'s timer fires:
                               …one more letter, and the cue on the last

**It used to be `Reveals Text`, a rule**, and the only thing that ever elected
it was the Speech Box. What a rule buys is a mechanic several kinds share, that
a world can ask about, that other rules depend on; this was one kind's, and the
price of pretending otherwise was 40KB of generated workspace and a paragraph
of wiring in every scene that wanted one.

**So the same blocks are written twice from one place** — `actors/typewriter`.
The Speech Box is BUILT with them, so a box a learner drags in types its lines
without being told to; this hands them to anything else with words. Two
tellings of six declarations would be two things to keep in step, which is the
argument the Health Bar's shared drawing already makes.

**It is built for a module path, not written out.** Every own member's block
type and exported name carry the file that declared it
(`ruleRegistry.memberLocalName`), so a Label's `say` is a different block from
a Speech Box's — and a patch that hard-coded either would write a file naming
blocks nothing defines. That file still compiles and still generates nothing,
which is exactly the failure the running half of its test is for.

**It elects only what is missing.** A Label already shows text — that is what a
Label IS — so the patch adds the clock and leaves the words alone.

**It does not draw the words**, which is the division `Shows Text` already
makes: this decides how much of the line is showing and the actor decides what
showing looks like. A Label, a Button and a Speech Box all draw `text` already,
so any of them types itself out with nothing else done.

**And it refuses an actor a world defines for itself.** That body generates
into a block scope, where the `export const` a `define block` and a
`define event` each emit is not legal — so the palette offers neither inside a
world's own `define actor` (`blockly/fileKind`). Writing the rows anyway would
leave a file that silently generates nothing, which is the one outcome an
enhancement must never produce. Lifting that limit means hoisting an own
action's declaration out of the block scope the way a property's already is
(`ownProperties.ownPropertyDeclarationFor`), and it is not done.

## Testing one

Two halves, and the second is the one that matters. The patch's arithmetic —
what it imports, that it is idempotent, that it refuses what it should — is
ordinary unit work. Whether the blocks it wrote are the RIGHT blocks is a
question only compiling and running the project answers, so
`actors/enhance/__tests__/health` does that: it enhances a Platformer Player,
compiles the project with the real generator, and asserts that the bar draws
the player's health, halves when the player is damaged, and rides above it as it
falls. Cutting any one of the wiring lines fails it.

And it places THREE players, because one is the case that hid the first
draft's bug: three of them get three bars, each over its own head — and
removing one of them takes that one's bar and leaves the other two standing.

## The catalogue this opens

Named here because the shape is worth seeing before the second one is built,
and because each is an argument for the concept rather than a plan:

- **A meter for something it already has** — the health bar; a cooldown bar
  wired to Zapping's recharge; a stamina meter. The interesting question each
  one asks is _attached or HUD_, which is the thing a learner cannot guess.
- **A second pool that bends a rule's arithmetic** — shields (absorb before
  health, a step ahead of Health's), armour, lives and respawn (`runs out of
health` is
  already an event), and the flicker that makes Health's existing mercy time
  visible.
- **A voice** — a Speech Box that rides above an actor, a name plate, a
  floating "+10". Composition of Writing and Attachment, no new rules. Typing
  what it says is built (above), and is the first one whose blocks used to be a
  rule.
- **A verb it did not have** — zaps, chases, is pushable, damages on touch.
  Collecting is built (above), which also unblocks the Coin's demo: nothing on
  the shelf could collect one until now.
- **A relationship with the world** — stays in bounds; is a checkpoint. No
  picture at all, pure wiring. The camera is the one of these that is built
  (below).
- **A look that reports state** — flicker while hurt, tint while powered up, a
  trail of fading copies.
