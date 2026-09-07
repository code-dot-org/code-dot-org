# Rule demonstrations

## The problem

A rule's row in the import dialog says what it is called, what it gives a world
in a sentence, and which traits it will let an actor take. What it cannot say is
what the rule DOES, and that is the thing a learner is choosing between.

The effect picker solved the same problem by showing each effect's first frame,
rendered once at build time (`scripts/build-effect-stills.mjs`), and animating
only the row being looked at — "an enhancement rather than the feature", as its
header puts it, so that a machine with no WebGL still gets pictures.

That split does not survive the move to rules, and `spikes/rule-demos` is where
we found out.

## What the spike established

Three demo worlds were built against the real compiled rules and recorded.

**A still is not enough for a rule.** A frozen frame of Gravity is a ball above
some ground: falling, risen or sitting there, and nothing in the picture says
which. A frozen frame of Collection is a walker beside two coins, and what makes
it a demonstration — the third coin, gone — is exactly what a single frame
cannot show. Both read immediately in motion.

So where the effect picker treats the still as the feature, a rule picker cannot.
**Motion is the feature.** That is the decision this document exists to serve,
and it makes the work bigger than the effect precedent suggested.

**A demo world is not free to author.** Each has to know the rule's trait
dependencies: the first Collection demo produced nothing at all, because a
collector that does not also elect `Can Move` never reaches a coin. Not hard,
but not a template to fill in either, and there are more than twenty rules.

**Running the real rules is what makes it honest.** The spike found Steering
crashing on its first frame with a target, through two thousand passing tests.
A demonstration built against a reimplementation would have shown a Steering
that works while the shipped one did not.

## Recorded, not live

The demo is an ASSET, produced at build time and served — not the engine running
in the dialog.

Live playback would need the preview sandbox, a compile, and an engine in a
dialog that currently needs none of them, and it would show nothing until all
three were ready. That is the failure the effect stills were introduced to
avoid, one channel over.

Recording costs the honesty of a frozen claim, and that is the risk this design
has to answer rather than accept — see below.

## One asset, not two: a sprite strip

A still beside a GIF would be the obvious shape, and it is one asset too many.
Frame one of the strip IS the still, so the pair already exists — and two files
would be two things to produce, name, cache and keep in step, with the standing
possibility of a still that no longer matches its animation.

Each demo is ONE PNG: the frames laid out in a row, animated with CSS
`steps()`.

- **The first cell is the still.** A row shows frame one until it is selected,
  and then plays. One asset serves both states, so there is no second thing to
  produce, name, cache or keep in step.
- **It can be held.** `prefers-reduced-motion` stops the animation on frame one,
  and so does anything else that wants to. A GIF cannot be paused: it plays
  because it is a GIF, whatever the reader has asked for. That, rather than
  size, is the argument against one.
- **No decoder policy.** No `<video>`, no autoplay rules, no muted-attribute
  folklore, no format support matrix. A PNG and a `background-position`
  animation work wherever CSS does.

Flat game art palettes small: a 96-pixel square over twenty-four frames is a
2304×96 PNG, and the whole shelf should land well under a megabyte.

## Where they live

Served, like the stock backdrops (`BACKGROUNDS.md` §7): `yarn setup:world`
fetches them into `public/demos/`, which is gitignored, and a base URL says
where they are served from.

NOT bundled like the effect stills. Those are 15KB of base64 in a generated
module, which is a reasonable thing to put in a bundle; a megabyte of animation
is not, and it is a megabyte every learner downloads whether or not they ever
open the dialog.

**The cost of that choice, stated plainly:** a dev machine with no network gets
no demos, where `yarn setup:world` exists precisely so the standalone demo works
without a code.org origin. The dialog must therefore be complete without them —
a row with no picture is a row, not a hole.

## Staleness, and the answer to it

A recording is a claim about what a rule does, frozen at record time. Health and
Steering both shipped broken this month; a demo recorded then would have shown
them working, and gone on showing it.

**The answer is not an image diff.** Comparing renders is brittle, fails for
reasons that are not the rule's, and teaches people to regenerate goldens
without looking.

**The answer is that a demo world and a behavior test are the same world.**
`src/rules/__tests__/stockRulesRun.test.tsx` already runs the real compiled
rules and asserts what each one does. A demo is that world with a camera on it:
one definition, exported once, used by the test to assert and by the recorder to
film.

So a rule that stops doing the thing its demo shows fails a test — loudly, in
the place the fault is, on the commit that caused it. The recording may then be
out of date for as long as it takes to re-run the recorder, and that is a
tolerable staleness because it is a KNOWN one.

## What a demo world IS, and where it lives

A FUNCTION from the compiled rule modules to a running world
(`src/rules/demos`), and nothing else: no project, no `.world` file, no
compile.

That is a change from this document's first draft, which put a demo in
`scripts/rules/<name>.mjs` beside the rule it demonstrates, on the grounds that
a demo in a directory of its own is the first thing to rot when a rule's traits
are renamed. The reasoning was right and the mechanism was wrong. Those files
generate block JSON, so a demo there would have meant authoring a world in
blocks — a world-authoring DSL to build, and a compile in the path of every
recording — to demonstrate rules that are OUR code and need none of the
machinery that exists to run a learner's safely.

**The anti-rot argument is answered better by sharing than by adjacency.** The
demo world and the behavior test are the same world: `stockRulesRun.test.tsx`
builds each demo and asserts what the rule did with it. A renamed trait breaks
the test, in the test's own words, on the commit that renamed it — which is a
stronger guarantee than living in the same file, and it is the guarantee the
recording actually needs.

## Which rules get one FIRST

Every rule can be filmed. Some need a device we have not designed yet, and this
is a running order rather than a verdict.

**The obvious ones, first.** A rule does something visible on its own, given
only the rules it requires and nobody touching the keyboard: Gravity, Solid
Bodies, Collection, Health, Steering, Expiry, Boundaries, Screen Wrap, Drag,
Zapping, Time, Physics (a thing with a velocity drifts, which is exactly what
having physics means) and the camera rules. That is most of the shelf, it needs
nothing invented, and it is where the shape of this gets tested.

**The ones that need a device, after.** Input, Mouse, Arrow Keys and Arrow Drive
are about a player doing something, and a recording of an actor moving with
nobody pressing anything shows the effect while hiding the cause. Making them
demonstrate rather than merely move needs something in the frame standing for
the input — a key glyph that lights as it is "held", a pointer that travels and
clicks. That is a real design question with real answers, and it is not one to
answer in the same pass as the pipeline.

Writing was the odd one, and it was BLOCKED rather than merely unattractive:
the recorder paints rectangles into a byte array — that is what makes it a
build step rather than a browser — and text is the one thing a rectangle
cannot stand in for. So the strip writer was taught a font (`record/font`) —
five by seven, upper case, digits and a little punctuation, scaled by whole
pixels because half a pixel of a letter is a smudge and there is no
anti-aliasing here to hide it in. A `Look` may now carry `text` INSTEAD of a
rectangle, drawn in the same clip and the same color the box would have had.

A character with no glyph draws as a GAP rather than as a box, since a demo
asking for one is missing a letter and a box would look like a rule drawing a
box. Nothing downstream can tell that gap from a space, so a test walks every
demo's text and checks the font knows each character.

**Two rules will never get one, and that is the right answer.** "Notices
Collisions" and "Has a Camera" are BASES: the first answers a question that
Solid Bodies and Collection then act on, and the second moves the view to
wherever something else aimed it. Neither does anything visible alone, so a
strip of either would be a strip of whichever rule was standing on it.

Until a rule has a demo it shows what it shows today, which the dialog has to be
comfortable with anyway (see above).

## The same idea for ACTORS

A stock actor has the same gap and a worse version of it. A rule's row at least
names an ability; an actor's row shows a picture, and a picture of the
Platformer Player is a blue sprite standing still — while what the import
actually hands over is walking, falling, jumping, three rules, a key binding and
an animation. The picture is not wrong, it is beside the point.

So the actors get strips too (`src/actors/demos`), served beside the rule ones
under `public/demos/actors/` and animated by the same CSS.

**Filmed the long way round, on purpose.** A rule demo builds its world with the
engine directly, because a rule is our code and needs none of the machinery that
exists to run a learner's safely. An actor demo cannot do that and stay honest:
what it demonstrates IS a file, so the scene imports the actor with
`importStockActor` the way the dialog does, compiles the project with the
generator the way the sandbox does, and holds keys down with `setInput` the way
the driver does. Nothing in the middle is a stand-in, and a demo never reaches
past the actor to move it — it presses arrow keys, and the file does the rest.

**A demo is DATA.** Which stock actors the scene needs, where they stand, how
long to run, and what is held when (`demos/types`). The staging that turns that
into a running world is `demos/record/stage`, shared by the recorder and by the
behavior test — which is the same arrangement, and the same guarantee, as the
rule demos' shared demo world.

**The strip writer had to learn pictures.** A rule demo's actor wears none, and
a plain rectangle is what the driver draws for one; an actor demo's subject is a
thing you can see, and a gray box would demonstrate a gray box. The blitter
composites the RGBA that `scripts/generate-sprites` DREW, asked for by a new
`stockPixels()` export — not decoded from the PNGs that script encodes, which
would have been a second copy of the format kept in step by hand to arrive back
where the drawing already was.

**The frame is 256 by 192 world pixels at half size**, and the Player's jump
fixed it: 134 pixels of rise from a standing start means a scene with a floor
and a jump in it is about 200 pixels tall whatever else is in it. Half size, by
a whole number, so a 32-pixel drawing shrinks by sampling every other row rather
than by inventing pixels between them. The shrink is the only thing about an
actor demo that is not full fidelity.

**The demo may also play the GAME.** A Player is demonstrated by pressing keys,
because a keyboard is what a Player answers to. A Progress Bar answers to a
number somebody else sets — that IS the actor — and a bar nothing filled would
be a demo of an empty rectangle. So a demo may declare `drive`, called once a
frame beside the keys, which writes the line a project would write: `set
fraction of ⟨the bar⟩`, `set text of ⟨the label⟩`, `set opacity of ⟨the
portrait⟩`. It reaches properties the way a block does, through the compiled
modules, and nothing deeper. That is the same bargain the Time and Zapping
rule demos struck for the rules that raise an event and own nothing that
follows.

**And the strip writer learned to rasterize commands**, which this document
said would be the price of filming a drawn actor. It was: rectangles, circles,
lines and text, in command order, with the same last-writer-wins overlap the
driver has. What differs from the game is the anti-aliasing, which this
recorder has none of anywhere, and the TYPEFACE — a Label's words are set in
the five-by-seven bitmap font, because the alternative is a browser in the
build path to render one string. The demos write their words in capitals for
that reason: text filmed differently from the text that was set would be a
quiet lie.

**A demo may choose how much world its frame holds.** The Player's jump fixes
the wide shot at two world pixels per strip pixel; nothing in a Coin's scene
jumps, and three coins shrunk by half are three specks. So `shrink` is the
demo's, and every strip is still the same SIZE — what changes is whether it is
a wide shot or a portrait. The Speech Box's panel is 280 across, which is
nearly three strips wide, so that one is filmed at a third.

**Frame one is the still, so a demo composes for it.** The unselected rows —
most of the shelf, most of the time — show the first cell and nothing else, so
a scene that opens on the empty half of its own story puts a black rectangle on
the shelf. The Portrait therefore starts on screen and fades out rather than
in, and the Progress Bar starts a quarter full rather than empty. Neither
changes what is demonstrated; both change what the shelf looks like when
nobody is pointing at it.

**A demo may also drive the POINTER, and wire up a handler.** The Button forced
both. What it does when pressed is raise an event on itself and nothing else —
its face does not change, deliberately, since what a particular button looks
like is a routine a learner opens and edits. So a strip of one needs a cause in
the frame and an answer out of it.

The cause is a cursor: `pointer(seconds)` says where it is in world pixels and
whether it presses, and the stage hands that to `setPointer` and draws a small
square there — the same square that fattens on the press in the mouse RULE's
demo, so the two dialogs agree about what a click looks like. It is an OVERLAY
rather than an actor, because nothing in a project is a cursor and the shelf has
none to import.

`setPointer` speaks VIEWPORT pixels and the world converts by the active camera,
which is the trap this document already records from the mouse demo. Here the
camera happens to sit where the conversion is the identity, and the stage
converts anyway (`pointerFor`): arithmetic that is right by accident is a demo
that breaks on the day something moves a camera.

The answer is `wire(stage)`, called once before the first tick, where a demo
registers the handlers a project would write — `subject.on(IsClickedWithEvent,
…)`, which is `when ⟨this button⟩ is clicked with ⟨any⟩` with the blocks taken
off. `drive` is what the game does each frame; `wire` is what it has arranged to
happen.

**Which actors get one, and which one does not.** Eight of the nine: the Label
counts, the Progress Bar fills, the Button answers a press, the Speech Box says
its second line, the Portrait leaves and comes back, the Coin spins, the Player
walks and jumps and falls, and the Ground catches it.

The Health Bar cannot have one, and the reason is worth recording: it shows the
health of whoever it is pointed at, and NOTHING ON THE SHELF HAS ANY — the
stock Player deliberately leaves Health to the game that imports it. A demo
would have to invent the actor whose health it showed, which is a demonstration
of the demo. Its row keeps the still, which is what every row had before any of
this.

## What is deliberately not solved

- **Sound.** A demo is silent. Nothing in the library makes a noise except the
  Sound blocks, and those are not rules.
- **Interactivity.** No scrubbing, no replay control, no speed. The row plays
  while it is selected and holds otherwise.
- **Per-learner rendering.** Every learner sees the same recording of the same
  demo world. A rule looks the way the library shows it, not the way it would
  look with their sprites.

## Plan

1. ✅ **A demo world per rule**, as a function of the compiled modules
   (`src/rules/demos`) — gravity, steering and collection, the three the spike
   wrote. `stockRulesRun.test.tsx` builds its worlds from them, so there is one
   definition and the test is what keeps it honest.
2. ✅ **The recorder** — and NO BROWSER, against this document's first draft. A
   demo actor wears no picture, and an actor with no picture is what the driver
   already draws as a plain rectangle: painting boxes into a byte array is what
   Phaser would have painted, and `generate-sprites` already had a pure-Node PNG
   writer. It still needs a DOM to COMPILE the rules, so it runs through vitest
   with a config of its own — a build step wearing a test's name.

   The world ticks at sixty a second and only the KEEPING is at twelve: a rule
   stepped at twelve would fall differently, and a demo has to be the same
   simulation the game runs. A strip is 4–5.5KB, which is more than an order of
   magnitude under the estimate above — the shelf will be about 110KB, not a
   megabyte. That reopened the bundle question and it was settled the same way:
   assets, so a learner who never opens the dialog never downloads one.

3. ✅ **Serving them.** `setDemoBaseUrl` beside the background and sound ones,
   and `yarn setup:world` GENERATES rather than fetches — the only assets here
   that need no network, since they come from demo worlds the repo already
   holds. Skipped when they are already there, and a warning rather than a
   failure when the recorder cannot run.
4. ✅ **The dialog.** A row plays its strip while it is being LOOKED at —
   hovered, focused or selected — and holds frame one otherwise; a rule with no
   demo shows what it shows today. Playing on hover as well as on selection is
   what makes the shelf browsable: reading it should not cost a click per row,
   and a keyboard user arriving by Tab is looking at a row as much as a pointer
   hovering over it is.
   `prefers-reduced-motion` holds every row. The frame count reaches the CSS as
   a custom property computed from the demo (`seconds × DEMO_FPS`) rather than
   from a manifest, which would have been a second thing to fetch and a second
   thing to be stale.
5. ✅ **The rest of the obvious ones**, once the shape has survived contact
   with three: Physics, Solid Bodies, Collection, Health, Steering, Gravity,
   Drag, Expiry, Screen Wrap, Boundaries, Time, Zapping, Writing, Jumping,
   Scoring, Patrol, Attachment, and the four camera rules.

   **Two of them needed a handler, which is the point.** Time raises "timer
   fires" and Zapping raises "zaps", and neither owns what happens next — so
   their demos write the handler a project would write, in TypeScript instead
   of blocks. The Time demo leaves a mark per beat and the strip fills with
   evenly spaced marks; the Zapping demo asks to zap every single frame and
   the strip shows energy balls coming out four a second, which is the recharge
   made visible as a distance.

   Asking every frame is done with a timer whose period is under one frame.
   The obvious way to ask constantly is a key held down, and nobody is
   pressing anything in a recording — that is step 6's problem, and Zapping
   did not have to wait for it.

   **Writing needed the font**, and getting it also widened the blanket test
   that keeps every demo honest. It compared POSITIONS, and Writing's two
   actors never move one pixel — what changes about them is their text. It now
   fingerprints everything the recorder draws, so a demo that changes anything
   visible passes and one that changes nothing cannot. Position alone had
   always been too narrow; Writing is just the first demo it could not see at
   all.

   **The camera rules needed the recorder to learn to see.** It drew where
   actors ARE, so a rule whose entire effect is on the view moved nothing
   anybody could see; it now films through `viewOrigin`, which is the top-left
   of what the active camera shows. That is an identity for every other demo,
   because `demoWorld` puts the camera at the frame's middle — which is why
   adding it re-recorded all nine existing strips byte for byte.

   The four of them share one stage (`src/rules/demos/cameras.ts`): the same
   walker crossing the same posts on a map twice the frame wide, so each strip
   differs only in how the picture moves. Scenery is not optional here — a
   followed actor is motionless on screen by definition, so with an empty world
   the recording is one box sitting still.

   **The frame and the engine's viewport are different rectangles**, and Camera
   Confined is where that stops being an implementation detail: it keeps the
   VIEWPORT inside the map, and the viewport is a fixed ten tiles square
   (`engine/core/viewport`) while a demo frame is six by four. So a confined
   demo's map must be at least ten tiles TALL or the rule has no legal vertical
   position and pins the camera somewhere the demo never meant — which is a
   whole strip drawn a hundred pixels off, for a reason nothing in the demo
   mentions. The shared stage is twelve by ten for that one rule's sake.

6. ✅ **The ones that need a device**: Input, Mouse, Arrow Keys and Arrow
   Drive.

   **The device is drawn in the frame.** A key cap is a small box that lights
   while its key is held, and the arrow cluster is the inverted T every
   keyboard has — a shape legible without a letter on it, which matters
   because this recorder cannot draw a letter. The mouse gets a pointer
   instead, since a mouse is a place as well as a button, and the click is the
   moment the pointer fattens. Nothing remembers anything: a cap asks the
   world whether its key is down, which is why `look` is handed one.

   **The input is scripted where a driver would put it.** A demo may declare
   `input(world, seconds)`, called once a frame before the tick — exactly
   where the driver calls `setInput` and `setPointer`. So an input demo is
   DRIVEN rather than faked: what the strip shows is the rule reacting to a
   keyboard, not a demo reaching past the rule to move an actor. The recorder
   and the behavior tests both step through one `stepDemo`, which fixes the
   order as hands, then shutter, then tick — a frame drawn before the input
   was applied lights the cap one frame after the actor it moved, which reads
   as the rule acting on its own.

   Two things this caught that nothing else had. `setPointer` speaks VIEWPORT
   pixels and the world converts by the active camera, so the first cut put
   the pointer ninety pixels adrift and every click missed silently — a strip
   of a pointer sitting on a target that never answered. And Arrow Keys was
   sideways only, so its demo recorded a box standing still with the down
   arrow lit; the rule now has a trait per direction, like Screen Wrap and
   Boundaries (specs/RULES.md).

7. ✅ **The last nine**: Carrying, Goals, History, Turns, Inventory, Grid,
   Reveals, Conversation and Progress — which is every rule on the shelf but
   the two bases. Five of them were written the same week as the rules they
   show, which is the arrangement this document argued for and had not yet had:
   a rule and its demonstration authored together, so the claim and the code
   are the same person's.

   **Three of the nine needed nothing new**, and two needed a second actor to
   be legible at all. Carrying is a rider and a BYSTANDER: one box going along
   with a platform looks exactly like a box with a velocity, and the identical
   box left behind is what says the platform is doing it. Turns is a player and
   two takers, one of them at `turns per move` of two — because two boxes
   moving together read as two boxes with one speed, which is the rate this
   rule is not, and a box that moves on every OTHER turn cannot be explained by
   a speed at all.

   **Goals is the one whose demonstration is invisible.** The walker reaches
   the flag and wins; it then walks into a spike and nothing happens, and those
   frames — a banner not changing — are the rule's whole claim that the first
   ending is the one that counts. No still could carry it and no single frame
   of the strip does either.

   **Conversation found something about the first cell.** A demo whose first
   frame is empty is a rule with no picture in the dialog, because frame one is
   what an unselected row shows. Its opening line is therefore written by the
   demo as well as by the handler that writes it a tick later — an event is
   delivered by a tick, and the first cell is drawn before any tick has run.

   **Two demos are scripted through `input` with no keyboard in them**
   (Reveals' skip, Conversation's next line). Both stand for a player who has
   read enough and wants the rest, which is a hand rather than a rule, so they
   go where the hands go.
