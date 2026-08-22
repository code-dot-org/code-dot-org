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

Five steps, all of them required:

1. Write `scripts/rules/<name>.mjs`. Import the vocabulary from `./dsl.mjs`,
   build with `defineRule({name, ability, header})`, and
   `export default () => moduleFor(rule, '<name>')`. The DSL is documented in
   its own source — `defineRule` and the object it returns carry the reference
   comments, and the ~30 rules beside yours are the examples.
2. Add `'<name>'` to the `RULES` list in `scripts/build-stock-rules.mjs`.
3. Run `yarn build:rules`. It writes `src/rules/stock/<name>.ts`.
4. Add the import and a shelf entry to `src/rules/stock/index.ts`: `id`,
   `name`, `ability`, `description`, `provides` (the trait names, spelled as
   the rule spells them), `contents`.
5. Run `yarn test`. `src/rules/__tests__/stockRuleSources.test.ts` regenerates
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
