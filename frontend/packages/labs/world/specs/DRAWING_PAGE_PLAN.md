# Plan: an actor's drawing and its steps are data, each on a page

STATUS: BUILT, November 2026. Follows ACTOR_BLOCKS_PLAN.md, "Not in
this phase", and RULE_EDITOR_PLAN.md, "What stays for now".

An actor's members are data, each written on a page of its own under a
head that is the member itself (ACTOR_BLOCKS_PLAN.md). Two things an
actor does are still blocks in its code: `define drawing`, what it looks
like, and `each frame`, what it does every frame. Both are roots of the
actor's workspace (`actorData.CODE_ROWS`), and both open their bodies
from a pencil on a surface of their own (`bodySurfaces`). This plan makes
each data, writes each on a page as a rule's step is written, and then
deletes both blocks, the pencil and the surfaces. An actor's code is then
its handlers and nothing else.

## What exists

- **The drawing.** `define drawing ⟨w⟩ by ⟨h⟩` with the pen and shapes in
  its `DO`. The sizes are sockets: fourteen of the fifteen stock drawings
  ask the actor (`width of this actor`); Shot is 8 by 8. It compiles to
  `actor.defineDrawing((actor, world) => w, (actor, world) => h,
(actor, pen, world) => {…})`. Written by the stock actors
  (`stock/workspace.drawingRow`), eleven lesson actors, Jetpack, Sokoban
  and the scoreboard enhancement (`constants.ts`). Read by its type in the
  preview (`preview/drawingReader`), the pen blocks' warning
  (`drawingContext`), the world blocks' (`worldContext`), `ROOT_HOMES`,
  the Code page's add menu (`codeRoots.ACTOR_CODE_CHOICES`) and the file
  editor's surface toolbox.
- **The steps.** `each frame during ⟨phase⟩ do ⟨name⟩` with its work in
  `DO`, compiling to `actor.defineStep(id, phase, (actor, world, delta)
=> {…})`. Written by the Text Input, Tapper, Jetpack and some lessons.
- **The precedent.** A rule's step is `{name, phase?, body?}` in its data
  (`rules/ruleData.RuleStep`), written on `StepPage` under `stepHead`,
  with the body hung below the head (`ruleSteps.stepDocument`). An
  actor's block is compiled from a head the sheet loads with its body
  below (`actorSheet`, `BlocklyGenerator.actorCode`).

## The shape

- **`drawing?: {width: Block; height: Block; body?: Block}`** on the
  actor. A size is what its socket holds, a number block or a question
  about the actor, as it is now; a number is a `math_number`.
- **`steps?: {name: string; phase?: string; body?: Block}[]`**, the
  rule's `RuleStep`.
- **One head per page, and it is what compiles.** `drawingHead` reads
  "⟨Name⟩ is drawn ⟨w⟩ by ⟨h⟩", its sizes sockets on the head, the body
  below it. The sheet loads it from the data and `actorCode` writes
  `defineDrawing` from it, as it writes `defineAction` from a member's
  head. A step's page uses `stepHead`, as a rule's does; the sheet loads
  one per step and `actorCode` writes `defineStep`.
- **Where they are reached.** The Look tab: an interface actor, which is
  always drawn, has Edit drawing; a game actor's Looks like offers "a
  drawing". Either opens a step on the trail, "Label › drawing". The
  steps are listed on the Blocks tab, under the actor's blocks, each
  opening "Label › each frame: blink".
- **Acting like another.** An actor with no drawing of its own draws as
  the one it acts like. Its Look tab says "Drawn as a Label is", and
  Draw its own starts from a copy of that drawing, so the page never
  opens empty.

## Order

1. **The data, and the compiler reads it. BUILT.** `ActorData.drawing`
   and `steps`; `drawingHead`; the sheet loads a head for each, and
   `actorCode` writes `defineDrawing` and `defineStep` from them.
2. **Written as data. BUILT.** The stock actors, the lessons, the new
   actor, Jetpack, Sokoban, Tapper, the scoreboard and Shoots Whenever It
   Can write `drawing` and `steps`. The 469 actor modules the repository
   generates are the same, but for seven whose drawing and steps now fall
   in that order, and for names the generator mints afresh each time. The
   readers moved: the preview reads `drawing`; the pen and world warnings
   know the head; a renamed animation is followed into the drawing, the
   steps and the blocks' bodies, which it had missed; a stand-in is made
   for a gone block in either (`standInBlocks`); and two lesson checks
   read an actor's steps (`catalogue.actorSteps`). A walk for an event's
   hats needs neither, since neither holds a hat (`memberRename`).
3. **The pages. BUILT, and seen in the browser.** `DrawingPage`, and a
   step on the page a rule's step is written on (`StepPageView`, which
   the rule's `StepPage` now wraps), each a step on the trail. The Look
   tab has Edit drawing; an actor drawn as another says so and offers
   Draw its own, and one that draws its own offers to draw as the other
   again. A game actor's Looks like offers "(a drawing)", and a picture
   chosen over a drawing deletes the drawing, asking first if anything
   is drawn. The Blocks tab lists the steps under Every frame. The
   lesson checks' test view still shows a drawing and the steps as the
   rows they were, under `define actor`, and reads them back.
4. **The lesson. BUILT.** The seven lessons that said `define drawing`,
   `each frame` or the pencil say Edit drawing and the Blocks tab.
5. **The blocks go. BUILT.** `define drawing` and `each frame` are
   deleted, with the pencil (`extensions/bodyButton`, `bodyOwner`), the
   split and merge that kept a file's bodies beside its workspace, and the
   file editor's mode that showed one body in place of the file. What was
   left of `bodySurfaces` is the head names, now `pageHeads`. So are
   `CODE_ROWS`, `codeRoots` and the Code page's add-menu entries for a
   drawing and a step, `phaseOptions`, and the two lessons' unlocks of
   `each frame`. An actor's workspace holds handlers. Kept:
   `world_trait_step` as the name a trait's step is walked as when a rule's
   references are renamed (`rules/ruleData`), which no block is loaded
   for. A boxed actor's new drawing still starts as big as its box
   (`actorDrawing.emptyDrawing`), as the add menu's did.

## Decided

- **Sizes stay sockets.** A Label's box is as wide as its words, which is
  a question asked of the world; a setting for "the actor's own box"
  would need the same escape. The sockets are on the head, where the
  learner sees them beside the drawing.
- **The steps are in this plan.** Without them the surfaces stay, for
  `each frame` alone.
- **A copy, not a blank page.** Drawing its own from nothing would draw
  nothing until the first shape, and a Button that means to differ from
  a Label a little starts from the Label.

## Open

- Whether a game actor may have both a picture and a drawing. The engine
  draws the drawing; Looks like makes it one or the other.
- A step's page gives no way to delete it; the Blocks tab does. FIXED,
  November 2026: a step's, a block's, an event's and a tween's page each
  has Delete in the breadcrumb bar ("Delete step"). It asks as the Blocks
  tab does, and on yes goes back to that tab with focus on the Edit that
  took its row, or on New. A rule's step page has the same Delete, and
  goes back to the rule, or to the trait that owns the step.
