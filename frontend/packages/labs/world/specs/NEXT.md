# What to do next, and in what order

An assessment of the lab as of 2026-09-03 (commit `45ae3e70576`), reduced to
the work it argues for. The assessment is in the first section so the order can
be argued with; everything after it is a piece of work with a way to tell when
it is done.

## Where the lab stands

As a design system it works. Rules, traits and steps in eight named phases
expressed forty-seven mechanics across eight kinds of game in one vocabulary,
and the last five of those (bat, teleporter, switch, digging, four enemies —
`JETPACK.md`) needed seven small engine primitives and no new kind of thing.
The rules are real: gravity is a `.rule` the default project imported, written
in the same blocks a learner writes, run through the same generator, openable
and editable. There is one implementation of jumping, not a TypeScript one and
a block-shaped description of it. Nothing else in the block-based space does
this.

As a product it is pre-launch, and the gaps are structural: nothing is
localized, the custom editors are mouse-first, the rule weight problem is
measured and deferred, and no curriculum level points at the lab. The items
below are those gaps, ordered by what leaving each alone would cost.

Two of them are the same fact seen from two sides. The rules being real is what
makes them heavy (§2) and what makes "open it and see how it works" stop
scaling at about thirty blocks (§3). Neither is fixed by making the rules less
real — but §8, added later, answers both at once by not putting the whole of a
rule on one surface, and supersedes §3.

## 1. Record a real `position before`

**The problem.** `position before` (`scripts/rules/motion.mjs`) is an
extrapolation — `position − velocity·dt` — not a recorded value. The two agree
whenever velocity is what moved the actor, and disagree whenever something set
the position by hand: a ladder snapping a climber to its rungs, a pad
teleporting a traveller, Solid ejecting a body from a wall. In each of those the
query says "you have always been here", and a rule that was reading it to find
out which way the actor came from gets the wrong answer.

Three rules keep a private top-of-frame record to get round this — Climbing's
`climbing from`, Turning's `was at`, Prowling's `was at` — and a fourth,
Teleport, avoids writing a velocity it would otherwise write so as not to lie
to the query. Each is correct, each was bought by the same approximation, and
each is another thing a rule author has to know. (`held still` is not one of
these: a body held on a pad genuinely gets nowhere, and Turning and Prowling
need telling that it is on purpose. It stays.)

**What to do.** Motion records where every mover was at the start of the
tick, in `sense`, before anything moves anything, and `position before` is
that record — a read-only point on Can Move rather than a query with a
`seconds` socket, since there is nothing left to compute. The extrapolation
goes. The three private records are then retired one at a time, each with its
test still passing — the tests are the point, since they pin the behaviours
the records were bought for (the ladder-bottom stall, the sideways whip, the
junction that chooses twice).

**Done when.** `position before` on an actor that a rule moved by hand this
tick answers where it was, not where its velocity says it was; a test does
that with a teleport arrival and reads the property on the frame it lands.
Climbing's `climbing from` and the two `was at` points read Motion's record
or are gone, and no rule's prose has to explain that `position before` is an
extrapolation.

_Status, 2026-09-03: done, with one correction._ The record is in and the
query is gone; Solid, Gravity, Climbing and Turning read it, and Gravity's
landing blocks lost the `frame` socket they only took to feed the
extrapolation. Two of the three private records went with it — Climbing's
`climbing from` and Turning's `was at`, both written and read inside one
frame, which is what the record answers.

**Prowling's `was at` stays, and this document was wrong to count it.** It
asks in `decide`, before the frame's moving, where the other two ask in
`react` after it. At `decide` the record and the position are the same place
and the distance between them is zero; what a chooser needs is the frame that
just finished, which only a note taken last time can give. Moving that test to
`react` would change when a robot re-decides, which is a behaviour change
rather than a cleanup.

Both flags stay, and neither was ever about the position: Climbing's `climb
measured` says a climb has actually happened this frame (one can start in
`touch`, after `adjust` has been and gone), and Turning's `measured` says
Physics has seen this body at all (a body added mid-frame reads the record's
default, the origin, and every position is somewhere an actor might really
be).

The engine's own test fixtures (`src/engine/__tests__/fixtures/motionRule.ts`)
keep an extrapolating `previousPosition` for the hand-written rules the engine
tests use; that is scaffolding for the engine, not a stock rule, and is left
alone.

## 2. Decide what a project holds when it imports a rule

**The problem.** A project carries its own copy of every rule it uses
(`AGENTS.md`, "A project carries its own copy"). That is the right ownership —
the rule is the learner's, editable, unconnected to the library — and it is
4.19MB of generated Blockly JSON across the stock shelf: `solid` is 500KB and
409 blocks, and six rules exceed 230KB. The default project ships twelve of
them, which is 1.10MB of its 1.19MB (measured; see below). Every
save, every diff, every tutor context and every tab switch pays for it. The
tab switch is measured: about 340ms to rebuild a heavy rule's workspace, paid
on every visit, and the cost is Blockly's renderer rather than anything in our
code (memory note of 2026-08-07; the four other hypotheses were killed by
measurement — do not re-investigate them).

Nothing has decided this. The number grows with every rule added.

**What to do.** Copy on EDIT rather than on import. An imported rule the
learner has not touched is a reference — `{stock: 'solid', version: n}` — and
becomes a workspace of its own the first time a block moves. The editor opens
the stock workspace read-only until then, which is honest: a rule nobody has
edited is the library's rule. `use rule` and `use trait` dropdowns, the
generator and the compiler all read through the reference exactly as they read
a file now, since the stock shelf is already in the bundle.

The half that is not free is the moment the reference becomes a copy: the
stock rule's blocks land in the workspace at that instant with the version the
project pinned, not the current one, so a project saved last month does not
change behaviour because the shelf did.

The alternative — keep the copies and compress them — solves the save and the
diff and nothing else.

**Done when.** A New Project with the default rules serializes in a size a
test asserts; the assertion holds at a number under a tenth of today's; a rule
the learner has not edited is a reference; editing it makes it a copy, at the
pinned version, and a test does exactly that and checks the blocks match the
version pinned rather than the shelf's current one.

_Status, 2026-09-03: measured, not yet decided._ The first step is done —
`src/__tests__/projectWeight.test.ts` weighs a new project and fails when the
number moves, so the creep this section is about can no longer happen quietly.
What it found, in UTF-8 bytes of what a save actually carries:

|                                                                                                    |                 |
| -------------------------------------------------------------------------------------------------- | --------------- |
| a new project, serialized                                                                          | 1,191,452       |
| …of which twelve rule workspaces                                                                   | 1,103,970 (93%) |
| …of which `solid.rule` alone                                                                       | 500,346 (42%)   |
| everything the starter level IS — a world, six actors, a map, an animation, six sprites, an effect | 40,759          |
| the shelf a project copies from, 47 rules                                                          | 4,186,278       |

The last row of that table is the one to argue with. Forty thousand bytes is
the learner's game; the other 1.15MB is the library, copied in, and the
starter is a project nobody has typed into yet.

`dominated by rules nobody typed` is the assertion this section exists to
break: when a rule the learner has not edited becomes a reference, that test
should fail and be rewritten to say the new truth. The ceilings carry about a
tenth of headroom, so an honest edit to a rule updates a number in the same
commit and a thirteenth rule in the starter does not slip in — adding `climb`
(303KB) trips both the size and the count, which is how the test was checked.

## 3. Show a rule's prose to the person it was written for

**The problem.** DESIGN.md's pedagogy is to use gravity, then open it and see
how it works. That is right for gravity's dozen blocks and wrong for `prowling`
or `solid`: a learner who opens a 409-block workspace has been shown a wall.

Meanwhile every rule's `header` in `scripts/rules/*.mjs` is a paragraph of
exactly the explanation that learner needs — why coyote time is a step, why
the bat commits to a glide — and it goes nowhere near them. `moduleFor` emits
it as a `//` comment ABOVE the workspace string in `src/rules/stock/<id>.ts`,
where only the compiler goes. The `.rule` a learner opens begins at
`world_rule` with two fields, `NAME` and `ABILITY`, and holds no prose at all.
The description on the shelf is one sentence.

So this is two jobs, not one: get the prose into the file, then draw it.

**What to do.**

_The slot cannot be a field._ The 47 headers average 2,158 bytes and the
longest (`climb`) is 4,643. Blockly's `field_input` is one line, nothing in
this lab uses `field_multilinetext`, and a paragraph rendered inside a block
would be unreadable however it is stored. The precedent that fits is
`extraState`, which is where `world_rule_block` already keeps its `parts`: put
`about` in the `world_rule` root's `extraState`, invisible to block rendering,
and edit it through a textarea in the pane rather than through a Blockly
field.

_Then four small pieces._ `moduleFor` writes the header into the workspace it
emits; `RuleMeta` gains `about?: string`, read off the root beside `name` and
`ability` (`ruleMeta.ts`); `BlocklyFileEditor` draws it above the workspace,
collapsible, remembered per file in browser storage; and a learner-authored
rule gets the same slot, empty, which is what makes this a feature rather than
a way to display stock rules.

_The 12 starter rules gain about 26KB_, 2% of a project. That is inside the
headroom `projectWeight.test.ts` allows, and the test will report it, which is
what it is for.

**FIRST, THOUGH: there is already a "How this works".**
`blockly/lessonFlyoutButton` puts one at the top of every rule's toolbox
drawer, and every one of the 47 stock rules has a progression tile behind it,
so the button always leads somewhere. PROGRESSION_UI.md counts it as one of
four deliberate back-links. Building the pane adds a second answer to "what is
this rule for" beside a shipped one, and the two readings are:

- The pane is the rule's own account of itself and the lesson is the taught
  version — different registers, both wanted, and the pane must then be
  written not to restate the lesson.
- Or the header feeds the lesson's opening and there is no pane — cheaper, and
  it does nothing for a learner-authored rule or for anyone who opens
  `solid.rule` cold, which is the wall this section is about.

The recommendation is the pane, because the wall is INSIDE the file and the
drawer button is not there. But that is a decision about the teaching model
rather than about code, and it belongs to whoever owns the progression.

_Correction, 2026-09-05._ "The drawer button is not there" is false, and the
recommendation rested on it. `structuralCategories` filters only the
structural categories by file kind; the per-rule drawers are appended
unfiltered, so `solid.rule` opens with a **Solid Bodies** drawer in its own
toolbox and `How this works` at the top of it. What survives the correction is
narrower and still real: `lessonFlyoutButton` returns nothing for a rule the
learner wrote, and a rule that mints no blocks gets no category and so no
button at all.

_Superseded, 2026-09-05, by §8._ The pane is the right idea at the wrong
granularity. A rule's documentation is not one paragraph about the file; it is
one paragraph per trait, per property, per step — and this lab already carries
that shape for one member kind and no other. §8 is that, and it answers the
weight problem in §2 with the same change.

**Done when.** Opening `solid.rule` shows what Solid is for before it shows a
block; the text is the DSL header, byte for byte, and a test proves the
generated `.rule` carries it; a learner-authored rule has the same slot and it
starts empty; and the pane and the drawer's "How this works" do not say the
same thing twice.

## 4. Make the words localizable while there are forty-seven rules

**The problem.** No file in `src/` uses i18n. The words on a stock rule's
blocks are baked into generated JSON at build time (`say: ['make',
param('who'), 'jump']` becomes the block's `message0`); the seventy-three
lessons' instructions are English strings in `progression/lessons/index.ts`.
For this host every learner-facing word has to be translatable, and the
generation step makes it harder than usual: a `say` label has to become a
message key BEFORE `yarn build:rules`, or every language is a rebuild of the
shelf.

**What to do.** Two seams, in this order:

- The DSL's `say` and `description` values become keys into a message table
  the build script emits beside the rule, and the block reads its label through
  Blockly's own message lookup at definition time (a `%{BKY_…}` reference in
  `message0` is resolved when the block is defined). A generated `.rule` then holds keys,
  and the workspace draws words. English is the first table and the only one
  until the files are handed to translation.
- Lessons' instructions and the catalogue's tile names go through the same
  lookup the rest of the host uses.

Ability names (`Has Gravity`, `Jumps`) are a third case: they are shown to the
learner AND used as identifiers (`ruleSlug`). Slug from the id, never from the
name, before any of this — otherwise the first translation renames every block
type.

**Done when.** A test loads a stock rule under a second message table (a
pseudo-locale is enough) and the block's `message0` changes while its type
does not; the lesson instructions for one tile render in that locale; and no
`say` string literal remains in `src/rules/stock/`.

## 5. Make the map editor testable, then test it

**The problem.** `MapStage.tsx` is 1.4k lines of canvas and has no test at all:
jsdom gives a canvas no context and no size, so nothing in it can be driven.
The other custom editors (pixel, animation, effect graph) are pointer-first and
thinly covered. The distribution is inverted from where bugs are likely — 109
test files on engine and Blockly, where the code is pure, and two on the map
editor, where it is stateful and mouse-driven.

**What to do.** Split `MapStage` so that hit-testing, selection and the
tile-under-a-pointer arithmetic are functions of `(map, viewport, point)` with
no canvas in them, and test those. What is left is drawing, which a canvas
mock (`vitest-canvas-mock`, or a hand-rolled `getContext` returning a
recording stub) can at least prove is called with the right rectangles for a
given map. Keyboard equivalents for pointer actions — arrow keys move a
selection, Delete removes it — follow from the same split and are what the
accessibility floor needs anyway (`mapEditor` has five aria attributes and no
roles today).

**Done when.** A test places an actor, selects it by a click at a computed
point, moves it with arrow keys, and reads the map document back; the
selection outlining for actor-set properties — built, and never once rendered
in a test — is one of those tests.

_Status, 2026-09-04: done._ The arithmetic is `mapEditor/stageGeometry.ts` —
the camera, the fit, the wheel zoom's pin, snapping, the hit test's inversion
of translate → skew → rotate → scale, the pan-into-view margin, the selection
cycle, and the keyboard step — thirty tests, each one a fact the handlers ask
for. `MapStage` dropped from 1,395 lines to 1,348 and does no arithmetic of
its own.

The stage itself turned out to be testable after all, once two things were
stubbed that jsdom lacks: a `ResizeObserver` that reports a pane the moment it
is asked to observe, so the camera fits and a screen point means something;
and a recording `getContext`, so what is DRAWN can be read back. Pointer
events are `MouseEvent`s wearing pointer names — jsdom has no `PointerEvent`
and React routes by the name. Fourteen tests drive it as a person would:
select by a click at a computed point, cycle with the arrows, drag two tiles
and drop on the cell centre, drop to the pixel with Alt, delete, place, and
refuse all of it read-only. The outlining assertion reads the last frame's
`strokeRect` calls by colour: one selection outline, one reference outline
per actor a set names, and a labelled line to each.

Two things came out of it. **Shift+arrow nudges the selection** a tile (a
pixel with Alt), which is the keyboard's half of dragging and was missing — a
canvas click is not reachable from a keyboard, so an actor that could only be
moved by one could only be moved by some people. And the stage was repainting
on every render of its inspector, because the `visible` prop's default was
an object literal in the parameter list — a new object each time, and a
dependency of the draw effect. The test that counts outlines is what found
it; the default is one shared object now.

Falsified both ways: dropping the skew term from the inversion fails the two
skew tests, and a nudge that updates the stage without writing the file fails
both nudge tests.

_And the other editors, 2026-09-04._ "The other custom editors are pointer-
first" was too broad a claim, and counting corrected it: the effect editor has
fifteen test files and the animation editor eight, with the pure halves of
both — connection rules, flow mapping, port types, swizzles, frame ops,
playback, timing — already covered. The gap was the IMAGE editor: one test
file, two tests, both about grid controls, and nothing at all on `tools.ts`
and `pixelArt.ts`, which are 656 lines of pure raster arithmetic that the
first says at the top is "canvas-free and unit-testable".

Forty-two tests now. The two worth naming are the flood fill's, because both
of its claims are invisible when they break: a fill that measured tolerance
from a pixel's NEIGHBOUR would creep along a gradient and flood the picture,
and one that recorded visited pixels by their colour would never terminate
when the fill colour is itself inside the tolerance — that one hangs rather
than fails, which is the honest signal. And `pixelArt`'s round trip is the
module's whole purpose in one assertion: eight-by-eight art, drawn at eleven
pixels a block, detected, downsampled, and identical.

`PixelEditor.tsx` followed, and needed more of a canvas than the stage did:
the stage's canvas is a VIEW of a document, this one IS the document, so the
harness keeps a real pixel buffer and answers `getImageData`/`putImageData`
faithfully while no-opping the rest. Four stubs go with it, each for something
jsdom lacks outright — `ImageData`, an `Image` that loads, a rectangle for the
display canvas (all-zero rects map every pointer to NaN), and pointer capture.

The undo BUDGET came out first, as `undoBudget.ts`: how deep the stack may go
is a question about the picture's size, and the only way to find out what four
lines in the middle of a snapshot did was to draw thirty times. A 32×32 keeps
all thirty steps; a 4K backdrop keeps the floor of four, at 133MB.

Ten component tests, all of them about WHEN a file is written, because that is
what nothing was checking: opening a picture must not write it (the trap that
rewrote files on open in the Blockly editor for months), a burst of strokes
writes once, and an undo is an edit and writes too. Falsified by removing the
baseline guard, the debounce, and undo's version bump in turn — each fails
exactly the tests that name it.

One finding came out of it and was fixed. `isReadOnly` gated the commit and
one toolbar control, and the pointer handlers drew regardless — so a learner
on a locked level could paint, watch the marks appear, and lose every one of
them on the way out without being told. Refusing at the save is the wrong end:
nothing was written either way, and what was missing was saying so at the
moment it mattered. A locked workspace is a viewer now — the pointer declines
to start a gesture, undo and redo refuse in the callbacks (so Ctrl+Z goes with
the buttons), and no tool, brush or colour is offered that cannot do anything.

Writing the tests for that was the useful part. The first two asserted the
undo button was disabled and the file unwritten, and BOTH passed with the
pointer drawing freely — because `isReadOnly` gates the button and the commit
on their own account. Only the pixels can tell, so the harness records every
canvas the editor makes and digests them; and the keyboard case needs a
history to undo, which a locked level cannot build, so it is tested the way it
actually happens — the lock arriving after the drawing, which is what a
project finishing its load does.

`AnimationEditor` followed, and needed no canvas harness at all — its two
hardest behaviours are about the PROJECT rather than the picture, so mocking
`useSources` is the whole setup. Both are the same fact: a `play animation`
block holds an id and nothing else, and no block records which file it came
from, so an id is a reference the editor is responsible for.

Renaming therefore rewrites every play in the project, and does it in ONE
write, because `onChange` saves through a `saveFile` closed over the sources
of the render that made it — a per-file save following a project write would
put the other files back and undo the rename it had just carried. It refuses
a duplicate and an empty name, and it deliberately does NOT rewrite the plays
when the old id was ambiguous, since a block naming it might have meant the
other file's. Deleting cannot carry, because there is nothing to carry to, so
it says what plays the animation and leaves those blocks exactly as written
if the learner goes ahead — a play naming something absent is visible and
fixable, where a field silently emptied is neither.

Thirteen tests, and four falsifications: dropping the carry, ignoring the
ambiguity, never asking before a delete, and accepting a duplicate each fail
the test that names them. Read-only needed no fix here — unlike the pixel
editor, this one already disabled its twelve controls.

`EffectEditor` was audited rather than assumed, and the assumption was wrong
again. Measured with `coverage-v8` over the whole suite, the effect module is
in good shape: the compiler is at 93%, glsl 92%, the module root 87%, the
model 85%. Two areas sit low and should stay there — `effect/preview` (20%)
and `effect/runtime` (12%) are WebGL and Phaser filter attachment, and jsdom
has neither a GL context nor a scene, so testing them means headless-gl or a
deep Phaser mock to cover glue. `EffectEditor.tsx` itself is 67% statements
and 55% functions, which is "some branches unrun" rather than untested: it
already has sixty-four tests across eight files.

The gap the measurement found was somewhere else entirely. THIRTEEN OF THE
TWENTY-FIVE NODE TYPES WERE NAMED BY NO TEST — clamp, dot, maximum, minimum,
mix, modulo, normalize, power, ramp, rotate, smoothstep, split, step — and a
node definition is mostly one line, the GLSL it emits. A wrong emitter is
invisible: it compiles, because the compiler assembles strings and does not
read GLSL, and it type-checks, because a string is a string. What it produces
is a shader that fails in the sandbox when a learner drops that node into a
graph.

So `everyNode.test.ts` walks the registry, builds a graph for each of the
thirty-six nodes, and compiles it — feeding required ports by TYPE rather
than per node, so a new definition needing a `vec2` needs nothing added, and
one needing a type nothing can feed fails loudly. A table of expected GLSL
must match the registry exactly, which is what makes the file cover the
thirty-seventh node nobody remembers to write a test for. `nodes/definitions`
went from 83% statements to 98.78%, at 100% branches.

Falsified three ways: a typo in `minimum`'s GLSL, a node added with no table
row, and a row removed each fail exactly the test that names them.

## 6. One voice on the shelf

**The problem.** Early abilities read as one speaker: _Has Gravity, Jumps,
Collects Things, Keeps Score_. Later ones do not: _Has Ground That Acts,
Chooses Only at a Junction, Has Walls That Come and Go, Steps Through a Pad_.
Some describe the world, some the actor, some the feature. A learner reads all
forty-seven in one list.

**What to do.** An afternoon, with the list in front of you. The rule: the
ability completes "this world…" or "this actor…", in three words where three
will do, and the rule's `name` is the noun. `Surfaces / Has Ground That Acts`
becomes `Surfaces / Has Ice and Springs` or whatever is true; `Prowling /
Chooses Only at a Junction` becomes `Prowling / Turns at Junctions`.

**Done when.** Every ability is under five words and the list reads in one
register; the rename is a `say`/`ability` change and a regeneration, and the
progression tests still pass because they key on ids.

_Status, 2026-09-04: done._ Seventeen of the forty-seven changed; the other
thirty already spoke in one voice. The rule applied: a plain present-tense
verb phrase for what the world or actor now does, no implementation and no
condition in it, four words or fewer, and where the rule's name already IS the
verb, the verb (`Patrol / Patrols`, `Prowling / Prowls`, as `Jumping / Jumps`
always was).

| was                          | is                    |
| ---------------------------- | --------------------- |
| Carries Things (Inventory)   | Holds Things          |
| Walks Back and Forth         | Patrols               |
| Carries What Stands On It    | Carries Riders        |
| Rides Along with an Actor    | Rides on an Actor     |
| Responds to Input            | Reads the Keyboard    |
| Responds to the Mouse        | Reads the Mouse       |
| Can Be Taken Back            | Undoes Moves          |
| Has Ground That Acts         | Has Special Floors    |
| Turns When It Hits Something | Turns at Walls        |
| Chooses Only at a Junction   | Prowls                |
| Flies in Flaps and Glides    | Flaps and Glides      |
| Steps Through a Pad          | Has Teleport Pads     |
| Has Walls That Come and Go   | Has Switches          |
| Digs Through Blocks          | Digs Holes            |
| Eases the Camera             | Catches Up Smoothly   |
| Ignores Small Movements      | Ignores Small Moves   |
| Keeps the View in the Map    | Keeps the View Inside |

Trait names were left alone: a trait is what an ACTOR elects and is stored by
name in every file that elects it, so Turning's trait is still `Turns When It
Hits Something` while its ability is `Turns at Walls` — the same distance
Gravity keeps between `Has Gravity` and `Affected by Gravity`.

## 7. Answer the behaviors question and remove one thing

**The problem.** The `TODO` asks "are behaviors actually that useful?" — the
author's own doubt about a whole file type. `specs/BEHAVIORS.md` argues that a
`.behavior` is the smallest a rule can be, and the argument was right when a
rule was a great deal of ceremony. Since then an actor can carry its own
`each frame` and `define block`, which is most of what a behavior was for.
The lab has also gained an effect editor, a pixel editor and a tutor; each
surface is one more thing to localize (§4), make accessible (§5) and keep
working.

**What to do.** Count them. How many scenarios, lessons and stock actors use a
`.behavior`; how many of those could be an actor's own step or a `.rule` with
one trait. If the answer is "all of them", retire the file type: the file
menu's second `New` row goes, `languageMapping` drops `behavior`, and the
BEHAVIORS.md is kept with a paragraph saying what replaced it. If the answer
is not, write down the one thing a behavior does that nothing else does, at
the top of BEHAVIORS.md, and stop asking.

**Done when.** The `TODO` line is gone and BEHAVIORS.md opens with the answer.

_Status, 2026-09-04: retired._ The count was one `.behavior` in the lab and
one lesson teaching it, against twenty-three actor-own `each frame`s and
forty-seven stock rules — four of them behavior-shaped and every one written
as a `.rule` by the people who knew the construct best. The difference between
a behavior and a one-trait rule was two blocks of ceremony after creation, so
the ceremony is pre-written now: `New rule` seeds the rule, a trait and a step
(`files/newThing`), and the file type, its block, menu row, icon and regexes
are gone. Tapper's `Spin` is `spin.rule`; the Adventure Making tile is
`making/rule`, "Shared, without a copy", and grants `world_rule`. BEHAVIORS.md
opens with the answer and closes with the reasoning.

## 8. Break a rule into surfaces

**The problem, which is three problems.** A heavy rule is slow to open, has
nowhere to put what its author knows, and shows a learner a wall. Those are
filed separately above — the weight in §2, the prose in §3 — and they have one
cause: everything a rule is arrives in one workspace at once.

Measured in a real browser against the shelf as it stands
(`spikes/rule-surfaces`, whose FINDINGS.md records what the first estimate got
wrong):

| rule      | blocks | → interface | load  | → interface | saved |
| --------- | ------ | ----------- | ----- | ----------- | ----- |
| `solid`   | 473    | 14          | 147ms | 8.6ms       | 17.1× |
| `path`    | 394    | 15          | 122ms | 10.4ms      | 11.7× |
| `climb`   | 311    | 26          | 110ms | 15.2ms      | 7.2×  |
| `grid`    | 264    | 20          | 82ms  | 11.6ms      | 7.1×  |
| `gravity` | 209    | 22          | 72ms  | 12.1ms      | 5.9×  |
| `camera`  | 10     | 4           | 3.7ms | 2.1ms       | 1.8×  |

All 47 rules: **5,228 blocks in 1,764ms → 587 blocks in 338ms.** What is left
— `define rule`, its `use rule` rows, each trait and its properties, each
designed block's signature, each step's name and phase — is under thirty
blocks for every rule in the shelf and fourteen for the heaviest. A screen.

Two limits the measurement adds. There is a fixed cost of two to four
milliseconds a load, so under about twenty blocks the split buys nothing; and
the absolute figures are a floor, because the probe registers no-op extensions
where a real editor runs them — which is the gap between 147ms here and the
340ms tab switch measured earlier on `solid`. The ratio is the trustworthy
part.

**What to do.** The outer workspace is the rule's INTERFACE. A body is a
surface of its own, built when somebody asks for it, with that member's
documentation above it.

Gravity, opened:

    define rule ⟨Gravity⟩ which adds ability ⟨Has Gravity⟩
      use rule ⟨Physics⟩   use rule ⟨Solid Bodies⟩
      define vector ⟨direction of gravity⟩ = 0,1
      define number ⟨amount of gravity⟩ = 9

    define trait ⟨Affected by Gravity⟩ for actor            ⓘ
      define number ⟨gravity scale⟩ = 1                     ⓘ
      define boolean ⟨falling⟩ readonly
      define boolean ⟨ignores ground⟩ = false               ⓘ
      ⟨this actor⟩ is on the ground?                [edit]  ⓘ
      when ⟨starts falling⟩ · when ⟨stops falling⟩

    define trait ⟨Acts as Ground⟩ for actor                 ⓘ
    each frame during ⟨push⟩ ⟨applyVelocity⟩        [edit]  ⓘ
    each frame during ⟨react⟩ ⟨handleCollisions⟩    [edit]  ⓘ

Twenty-six blocks against two hundred and nine, and it reads as what the rule
OFFERS rather than as how it works — which is the question somebody has when
they open it.

_Why this is affordable._ The editor's cost is per-block construction with its
SVG machinery, and it was measured directly: collapsing 80% of `solid`'s
blocks changed the tab switch from 342ms to 341ms. Hiding a block does not
help; not building it does. Fourteen blocks instead of four hundred and
seventy-three is the same lever, pulled properly.

_Why it does not disturb the compiler._ Generation already runs on a workspace
of its own — `BlocklyGenerator` keeps a headless `Blockly.Workspace` and loads
the file into it, because building blocks without their SVG is a fifth of the
cost. What the editor renders and what the generator walks are ALREADY two
surfaces. So the editor may show less without changing what compiles, and the
risk this design looked like it carried has been paid for already.

_And it is where the documentation goes._ §3's pane is one paragraph about a
file. What a rule actually holds is one explanation per member, and the lab
already carries exactly that for one member kind: a `define block`'s
`DESCRIPTION` travels in the `.rule` and becomes the minted block's tooltip
(`domainBlocks.ts`). A trait, a property and a step have no such field, so
`Acts as Ground`'s account of itself — that it is a one-way platform on its
own, and an ordinary floor with `Solid` beside it — reaches nobody. Give those
declarations the field a designed block already has, show it on the surface
its body opens on, and documentation stops being a wall to scroll past and
becomes what you get for opening something up.

**What has to be decided.**

- _Where a body lives on disk._ Nested where it is now, with the editor simply
  not building it; or lifted into a side table keyed by member. Nested changes
  no file format and no generator, and is where to start. Whoever does it needs
  what the probe turned up: a body hangs off `next` on a HAT (a rule-level
  step, a behavior) and off the `DO` input on a MEMBER (a trait's step, a
  designed block), while `next` on `define rule` and `define trait` holds their
  members and must stay. Reading `next` as "body" everywhere empties the rule;
  reading only `DO` as "body" hides almost nothing in the rules that need it
  most.
- _Modal, bubble, or a surface swap._ **Decided: an overlay in the workspace
  area, opened by a button on the `define …` block it belongs to.** Not a
  modal and not a mutator bubble — the body takes over the pane the workspace
  was in, with a header that edits the member's own metadata: its name, and
  the description this document argues for below. The button has three
  precedents on other blocks already (`openSourceButton`, `lessonButton`,
  `enhanceButton` — a `FieldButton` drawing a glyph inside the block), so the
  affordance is one a learner has met.
- _What the outer surface still allows._ Renaming a property, moving a step
  between traits and adding a trait are interface edits and must stay. A
  learner dragging a block from the toolbox has nowhere to drop it on that
  surface — which turns out to be a reason for the split rather than a cost,
  because **the two surfaces want two toolboxes**, and the one they share
  today is worse than either.

  The `Rule` category holds fourteen blocks. Twelve declare something —
  `define rule`, `define trait`, `define property`, `define block`, the three
  step roots, `use rule`, `use trait`, the two enum blocks, `define event` —
  and two are meaningless outside a body: `return` and `delta`. Today a
  learner writing the inside of a step is offered `define trait`, and a
  learner declaring a trait is offered `return`. Split the surface and each
  side offers what belongs there: the interface gets the declarations, the
  body gets `return`, `delta`, the block's own parameters, and the whole
  ordinary palette — with twelve declaration blocks taken out of the way.

  `fileKind`'s `ROOT_HOMES` already gates roots by FILE. This is the same idea
  one level down, and the same table can carry it.

- _Whether every rule opens this way._ **Decided: always.** A threshold is a
  fudge and a per-file preference is a setting nobody finds. The probe removes
  the performance argument either way — there is a fixed cost of two to four
  milliseconds a load, so splitting a ten-block rule saves 1.6ms and costs a
  click. What is left is consistency, and that decides it: a rule reads the
  same way whatever its size, and a learner who has met `camera` knows where
  `solid`'s implementation went.

**Done when.** Opening `solid.rule` builds fourteen blocks rather than four
hundred and seventy-three, and `projectWeight.test.ts` grows a sibling that
says so; the
interface is legible in one screen; every trait, property and step can carry
prose and Gravity's is visible where that member is; and generation is
untouched, which a test asserts by compiling a rule whose bodies were never
opened.

_Status, 2026-09-05: the split is built, the surface is not._
`src/blockly/bodySurfaces.ts` is the pure half — `split`, `merge`, `reap`, and
`hasBody` — with sixty tests, of which forty-seven are every stock rule taken
apart and put back. That round trip is the one that matters: a merge which
drops a body does not throw, it writes a rule whose steps are empty and a game
that quietly stops working. Falsified by treating a rule's member list as a
body (empties the file), by counting only `DO` as a body (hides nothing in the
rules that need it), and by a merge that forgets a hat's body (eleven tests,
including real rules).

The file format does not change: `merge` is what a save writes, so the
generator, the compiler and a diff never learn this happened.

_And the seam, the same day._ `createBodySeam` holds one file's split, and
`BlocklyFileEditor` has no other way to serialize: `readFile` is how the file
is read, `showFile` how one is put on screen, and the only remaining
`workspaces.save`/`load` in that file are the two inside those two functions.
Six crossings went through it — the initial parse, the two saves, and the
three reloads (a rename, a member rename, a new document from the host).

Two things this turned up. **`renameMemberReferences` rewrites block TYPES,
and those live inside bodies** — `world_get_Physics_VelocityProperty` is what
a step's body says when it reads a property — so anything reasoning about the
file must be handed the merged document, not the interface. Renaming a member
against the interface alone would rewrite the declaration and leave every use
of it behind.

And **nothing else in the lab can see a body being dropped**: with `read`
handing back the interface instead of the merged file, all 4,198 tests still
passed. That is what the seam's own four tests are for.

The seam landed before anything could open a body, so it landed **off**:
`HIDE_BODIES` in `bodySurfaces` gated it and `BlocklyFileEditor` bypassed the
seam entirely, because a `define block` whose `do` is empty and whose
implementation has no door reads as a broken rule — worse than a long
workspace. The flag is read by the editor and by nothing in the seam,
deliberately: a seam that sometimes declined to split would be a seam whose
`read` puts stale bodies back over live ones. The button is what earned the
flag; what remains after it is the two toolboxes.

_Built, 2026-09-05._ `HIDE_BODIES` is on. `solid.rule` opens with fourteen
blocks instead of four hundred and seventy-three; the pencil on a `define …`
opens what it runs, with a `← Back` header above it; an edit inside a body
writes the whole file, and the other bodies come back whole. Driven in a
browser: `spikes/rule-surfaces/check-overlay.mjs` (open, count, click, return)
and `check-roundtrip.mjs` (edit one body, leave, open another, come back to
the first and find the edit).

Three things the second attempt had to get right, each of which had already
produced a wrong answer once.

`useRef(seam.show(…))` evaluates its argument on every render, reminting the
ids the bodies are keyed by while the workspace keeps the first set. `useState`
with an initialiser is the shape that works.

`handleChange` must have `editing` among its dependencies. Without it the
closure keeps the value it had at mount — null — so a body's edits take the
path that writes the whole file, and what it writes is the body.

The workspace is reloaded in place when the surface changes, so `setBody` must
be able to tell "the learner emptied this" from "the surface is not up yet".
`surfaceRef` answers that: it says which surface the workspace is actually
showing, and the swap loads with events off so nothing arrives before a person
has done something.

What could NOT be checked here: whether the edit survives being written and
read back. `yarn dev:isolated` reseeds its mock sources on every load, so a
plain edit on the interface reverts across a reload exactly as a body's edit
does — the control says the sandbox, not the code. The claim rests instead on
the merged document the editor emits, measured at the write, and on the
round-trip tests over all forty-seven stock rules.

**Not only rules.** An `.actor` file holds the same two shapes — its own
`each frame` and its own `define block` (`ActorBuilder.defineStep`,
`defineAction`) — and a world holds them inside `define actor`. Actor files
are small today, so the weight argument does not apply to them, but the
documentation and toolbox arguments do, and a learner should not meet two
different ways of opening an implementation. So the split is written against
BLOCK TYPES rather than against rules: a type whose body lives elsewhere is a
type whose body lives elsewhere, wherever the file it sits in came from.

**What it does not solve.** The file is still 500KB on disk — §2's
copy-on-edit is a separate decision and this does not make it smaller.

## Not on the list, and why

- **Live reload of actor properties** (`QUALITY_OF_LIFE.md` §1 and §3). Real,
  ready, and a convenience; nothing above depends on it and nothing about it
  gets harder by waiting.
- **Progress in an account** rather than `localStorage`. Needs the host to
  offer somewhere to put it; the lab side is `progressStore.ts` and is small.
- **Curriculum levels.** A curriculum decision. The lab is reachable at
  `/app/projects/world/` and every lesson is already a level's shape
  (`WorldScenario`); the work is authoring, not engineering.
- **The per-project sandbox subdomain.** Production infrastructure, named in
  `SANDBOX.md`, not something this package can do alone.
- **Splitting `domainBlocks.ts`** (9.3k lines) and `World.ts` (2.6k). They are
  large because they are the middle of everything, and a split without a
  reason to split is churn. §1 will cut into `World.ts`; take the seam it
  opens.
