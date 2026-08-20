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

**The answer is that a demo world and a behaviour test are the same world.**
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
demo world and the behaviour test are the same world: `stockRulesRun.test.tsx`
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
Shooting, Time, Physics (a thing with a velocity drifts, which is exactly what
having physics means) and the camera rules. That is most of the shelf, it needs
nothing invented, and it is where the shape of this gets tested.

**The ones that need a device, after.** Input, Mouse, Arrow Keys and Arrow Drive
are about a player doing something, and a recording of an actor moving with
nobody pressing anything shows the effect while hiding the cause. Making them
demonstrate rather than merely move needs something in the frame standing for
the input — a key glyph that lights as it is "held", a pointer that travels and
clicks. That is a real design question with real answers, and it is not one to
answer in the same pass as the pipeline.

Writing is the odd one: a still already says what it does, and the interesting
version — text arriving, a score counting up — is animatable and worth doing
once there is something to say with it.

Until a rule has a demo it shows what it shows today, which the dialog has to be
comfortable with anyway (see above).

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
2. **The recorder.** A script driving the real preview through Playwright (the
   path `build-effect-stills.mjs` already takes), capturing N frames of a demo
   world and writing one strip PNG per rule.
3. **Serving them.** `yarn setup:world` fetches or generates into
   `public/demos/`; a `setDemoBaseUrl` beside the background and sound ones.
4. **The dialog.** The selected row plays its strip; every other row shows frame
   one; a rule with no demo shows what it shows today. `prefers-reduced-motion`
   holds every row on frame one.
5. **The rest of the obvious ones**, once the shape has survived contact with
   three.
6. **The ones that need a device**, as their own piece of work: what stands for
   a key being held, or a pointer clicking, inside a frame nobody is touching.
