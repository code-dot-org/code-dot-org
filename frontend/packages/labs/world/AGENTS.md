# @code-dot-org/world-lab

What this file adds to [README.md](./README.md) (what the lab is) and
[specs/RULES.md](./specs/RULES.md) (what a rule is, as a design) is the two
procedures that are easy to get wrong: adding a stock rule, and adding a
scenario that plays one. Both were learned by doing them wrong first.

## Adding a stock rule

A stock rule is authored as a module under `scripts/rules/` and GENERATED into
`src/rules/stock/`. The generated file is committed so a reader sees what
ships, and nothing works backward — editing the generated `.ts` is always the
wrong move, because the next regeneration reverts it without saying so.

Seven steps, all of them required:

1. Write `scripts/rules/<name>.mjs`. Import the vocabulary from `./dsl.mjs`,
   build with `defineRule({name, ability, header, purpose})`, and
   `export default () => moduleFor(rule, '<name>')`. The DSL is documented in
   its own source — `defineRule` and the object it returns carry the reference
   comments, and the ~45 rules beside yours are the examples.

   **`header` and `purpose` are two different paragraphs for two different
   readers, and every rule has both.** `header` is a comment on the generated
   `.ts`, written for whoever maintains the mechanic; nobody who opens the
   workspace ever sees it. `purpose` is the first thing IN the rule — a
   markdown page at the top of the workspace, telling a learner what the rule
   is for, which traits to elect and what they get. Write it to somebody who
   has just opened the file and has not read anything else.

   Then document the WORK, the way the rules beside yours do: a `doc(...)` at
   the head of each step and each block body, explaining the mechanism and any
   arithmetic. A rule that only declares things (Progress, Writing) has no body
   to put one in, so `rule.doc(...)` and `trait.doc(...)` put prose beside the
   properties instead. `note(...)` is still the one-line aside; `doc(...)` is
   the page.

2. Add `'<name>'` to the `RULES` list in `scripts/build-stock-rules.mjs`.
3. Run `yarn build:rules`. It writes `src/rules/stock/<name>.ts`.
4. Add the import and a shelf entry to `src/rules/stock/index.ts`: `id`,
   `name`, `ability`, `description`, `provides` (the trait names, spelled as
   the rule spells them), `contents`.
5. Add it to `ALL_STOCK_SOURCES` in
   `src/rules/__tests__/support/compileStockRules.tsx`, **in dependency
   order** — a rule is evaluated against the ones before it, so a rule placed
   above something it imports fails with a `ReferenceError` naming a symbol
   that plainly exists.
6. Give it a progression tile, which is not optional:
   `src/progression/__tests__/layout.test.ts` has a "covers every stock rule"
   case that fails until one unlocks it. A tile drags in more than it looks:

   - a tile in `src/progression/catalogue.ts` — `at()` inside the six-ring
     budget and ADJACENT to everything in its `requires`, with a `check` whose
     `passes` refuses the state the lesson starts in;
   - a lesson in `src/progression/lessons/index.ts`, and its entry in the
     `LESSONS` map at the bottom;
   - an `ASKS_FOR` entry in `src/progression/__tests__/toolboxShelf.test.ts`,
     listing the plain blocks the instructions send a learner to find;
   - a `describe` in `src/progression/__tests__/lessonChecks.test.tsx` proving
     the check refuses the start and accepts the finish — there is no generic
     test for that, and a check nobody has run both ways is a check that
     passes everything;
   - the lesson count in `src/progression/__tests__/ProgressionDialog.test.tsx`
     ("N of M lessons done").

7. Run `yarn test`. `src/rules/__tests__/stockRuleSources.test.ts` regenerates
   every rule in memory and fails if the committed file differs, so a forgotten
   step 3 is caught there and not in review.

### What the DSL will not tell you

**Watch the size of what you generate.** The output is a JSON literal of a
Blockly workspace, and it is committed and shipped. Four near-identical actions
(`step up`, `step down`, `step left`, `step right`) generated 663KB. One
parameterized action (`step across N down M`) with four one-block delegates
that call it generated 236KB for the same behaviour. Write the mechanic once
and give it thin named faces.

**Divide a mechanic into the smallest true facts.** Grid has three traits:
`Fills a Tile` is what a wall is, `Steps on the Grid` is what moves, and
`Can Be Pushed` is a trait that `uses` both. Pushing is then not a fourth
mechanic — it falls out of the combination, and a project gets Sokoban without
writing any of it. A trait that exists only to be depended on carries no
properties, and its binding goes unused, so declare it as a bare
`rule.trait('Fills a Tile')` and export only the `traitRef`.

**Mark derived properties `{readonly: true}`.** A step's target, its deadline,
and whether one is in flight are the rule's bookkeeping, not settings a student
sets. Read-only properties still get `set` blocks inside the rule that owns
them, which is the only place they should be written.

## Adding a stock actor

`src/actors/stock/` is the actor library the `(import…)` row on an ACTOR
dropdown offers. Unlike the rules, these are hand-written — they are two dozen
blocks each, not hundreds — so there is no generator and no regeneration step.
Write the file, add a shelf entry to `stock/index.ts`, and that is the whole
mechanism.

**Declare everything the workspace names.** A `use trait` row names a trait, a
`play animation` row names an animation, a `set sprite` row names an image, and
every one of them is a field whose value must be among options the PROJECT
supplies. The shelf entry's `requires` / `animations` / `sprites` are how those
arrive: `importStockActor` walks them into `importStockRule`,
`importStockAnimation`, and `importStockSprite`, each of which brings its own
dependencies. A Coin naming one rule and one animation writes seven files.

**A drawing is only for actors that paint themselves.** `actorFile`'s third
argument is optional. An interface actor has no picture and must draw one; an
actor with a sprite or an animation must not, or the drawing covers it.

**"Does it compile" is not a test of any of this.** The generator deliberately
mints a stand-in for any block type nothing defines, so that a project with one
deleted rule still opens instead of dying whole. An actor whose rule never
arrived therefore compiles perfectly and does nothing. Test what the BUILT actor
turns out to be — `actor.has(module.SomeTrait)` — and check the test can fail by
deleting the dependency from the shelf entry and re-running it. Both halves of
`coinGenerates.test.ts` were confirmed load-bearing that way.

**Also: a generator only reaches the modules a world names.** A project that
merely contains `coin.actor` never compiles the file, so a test needs a world
with `add actor` in it.

## Adding a scenario

Demo projects live in `src/fixtures/` as hand-written Blockly JSON, registered
in `scenarios.ts` (tag list + record) and reachable with `?scenario=<tag>`.

### Dump the palette before you write a block

Generated block types and their socket names are not guessable, and a wrong one
fails quietly as often as loudly. Twenty lines answers it for good:

```ts
import {buildDomainPalette} from '../blockly/domainBlocks';
import {projectRuleMetas} from '../blockly/projectModules';
import {gridRule} from '../rules/stock/grid';

const metas = projectRuleMetas({'rules/grid.rule': gridRule});
const {blocks} = buildDomainPalette(metas, {allRuleModules: true});
console.log(blocks.map(b => b.type).join('\n'));
```

Run it as a throwaway vitest file, with `--reporter=verbose` — the default
reporter swallows a passing test's console output, which looks exactly like the
probe having found nothing. It prints, for Grid,
`world_do_Grid_StepAction`, `world_on_Grid_FinishesAStepEvent`,
`world_get_Grid_TileSizeProperty`, and the rest — which is faster and more
reliable than deriving the Pascal-casing rules in your head. Every socket name
the Sokoban fixture got wrong on the first try (`VEC` for `VECTOR`, `SOURCE`
for `ACTOR`, `world_vector` for `world_vector_of`) was a name this would have
printed.

### A statement input is an `inputs` entry

Blockly's JSON format has no `statements` key. This loads with an empty branch
and never runs its body, and nothing anywhere reports it:

```ts
{type: 'controls_if', inputs: {IF0: test}, statements: {DO0: body}}  // WRONG
{type: 'controls_if', inputs: {IF0: test, DO0: body}}                // right
```

Value inputs and statement inputs go in the same place. This one cost an hour
of debugging a condition that had been correct the whole time.

### Debug by printing sub-expressions, not by reading generated JS

`world_log` takes a fixed TEXT field; `world_print` takes a VALUE socket. So
when a compound condition does not fire, lift its pieces out and print them
one at a time. Both reach `console.log`, which a fixture test captures:

```ts
const said: string[] = [];
const spoke = vi
  .spyOn(console, 'log')
  .mockImplementation(l => said.push(String(l)));
```

Printing `how many crates are not on a mark` on each landing produced
`2, 2, 1, 1, 1, 0` — which proved the condition reached zero and moved the
search to the `if` itself. Bisecting this way is much faster than reading the
generated JavaScript, and it leaves behind a play-test worth committing (see
`src/__tests__/sokobanPlays.test.tsx`: press keys, assert grid positions, assert
what the console said).

Write the negative assertion too. `expect(said).not.toContain('Solved!')` after
the first crate is home is what makes the win test mean something.

### A project carries its own copy of every rule it uses

A fixture's files hold `contents: gridRule`, not a reference to it. So does a
saved student project. Changing a stock rule does not change a project that
already imported it — when a rule edit seems to have no effect in the browser,
this is usually why. Start a fresh project, or update the copy.

### Four more things a fixture gets wrong

**Errors surface in the lab's own console panel, not the browser's.** A missing
socket on a _value_ block is the exception: it fails at LOAD with "An error
occurred while loading the lab", and the reason is only in the page console.

**A world that arranges its own actors has no size unless it says so.**
`load map` learns the bounds from the document; a `create in map` world has no
document, so it stays one screen, and `Camera Confined` then clamps the view to
the single place it fits — a camera that looks correctly wired and never moves,
with nothing in any console. Add `set size of map to x N y M tiles`
(`world_set_map_size`, see `src/blockly/fields/mapGridSize.ts`).

**Motion is in units per second, and one unit is 100px**
(`PIXELS_PER_UNIT`, `src/engine/core/units.ts`). Nothing is per-frame and none
of it moves with the frame rate. `amount of gravity` is units/s², default 9. A
jump's height is `v² / 2a`, so gravity and the jump impulse are not independent
dials: halving gravity doubles the height unless the impulse comes down by root
two with it. Reasoning about these in pixels-per-frame produced a value six
times wrong and a bird that flew off the top of the level.

**Layout is free.** A world's own `define actor` blocks and their handlers are
hoisted above the world block whatever order they sit in, so put `define world`
at the top left and stop thinking about it.

## Editing a sibling package while the dev server runs

**The dev server serves a stale transform of an aliased sibling, and only a
restart clears it.** `vite.config.ts` resolves `@code-dot-org/lab`,
`@code-dot-org/codebridge` and `@code-dot-org/aitutor` to their SOURCE for
`serve` and the demo build. Editing this package hot-reloads. Editing one of
those does not: Vite logs `hmr update` for the file, the browser dutifully
re-fetches it, and the server hands back the transform from whenever it
started. Measured — after an edit, both the bare `/@fs/…` URL and one with a
fresh `?t=` return the old code, while a newly started server returns the new.

`server.watcher.add` does not help; the watcher already sees the change. If you
find the real cause, this note should become a fix.

**So: restart the dev server after editing `base`, `codebridge` or `aitutor`.**
A browser reload cannot help, and neither can a hard one. This cost three
rounds of re-diagnosing a bug that was already fixed on disk — the symptom is a
`TypeError: <something> is not a function` for a function you just added.

**Check for a string that did not exist before.** The way to confirm what the
server has:

```
curl -s "http://localhost:5139/@fs$PWD/../base/src/contexts/SourcesContext.tsx" \
  | grep -c createCommit
```

`createCommit` is new, so a zero is proof. Grepping for a name that existed
either way proves nothing, and doing exactly that is how the stale server went
unnoticed for two more rounds — `replaceSources` was already a private helper
in the file, so it matched before and after.

## The test harness is kinder than the lab

Four bugs in one sitting shipped green because the harness did something the
running lab does not. Each time the test was right about the code and wrong
about the world it ran in.

- **`compileProject` builds its block palette from the files it is HANDED.**
  The lab builds it from a memoised prop holding the project's rules as they
  WERE. So a rule that has just arrived has its blocks defined in the harness
  and not in the lab, and a proposal importing one passed every test while the
  editor refused it.
- **`compileProject` calls `refreshProjectDropdowns`; the gate did not.** A
  trait is a dropdown VALUE, so the harness resolved `Boundaries#StaysAcross`
  and production had never heard of it.
- **The generator mints a stand-in for any unknown block type.** So "does it
  compile" answers yes for a project whose rule never arrived. Assert what the
  BUILT actor turns out to be — `actor.has(module.SomeTrait)` — never that it
  compiled.
- **`setInput` takes the LAB's key names, not the browser's.** The driver calls
  `keyName(event.key)` first, so a test pressing `ArrowUp` presses something no
  player can. Sokoban shipped with four dead controls and nine passing tests.

**The move each time is the same: check the test can fail.** Delete the thing
under test — the import, the registration, the key name — and watch it go red.
Every one of these was found that way, and none was found by reading.

**And when a fix does not reach the browser, suspect the harness gap before the
logic.** The question to ask is not "is my code right" but "what does the lab do
here that my test does not".

## Verifying a change

In this order, from this directory:

```bash
yarn build:rules     # if any scripts/rules/*.mjs changed
yarn test            # ~26s, 2350+ tests; includes the staleness check
npx tsc --noEmit -p tsconfig.app.json
npx eslint <the files you touched>
```

Lint the files you touched by name. `yarn lint` at package scope currently
fails on `dist-demo/` and `public/vendor/`, which are build output and vendored
assets that are not eslint-ignored yet. The repo's `./tools/hooks/pre-commit`
(run from the repo root, not here) lints changed TRACKED files only — a new
file is invisible to it until it is staged.
