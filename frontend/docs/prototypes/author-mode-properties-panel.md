# Author Mode: click-to-edit properties panel

Feasibility probe. Can a per-type schema of editable attributes be _derived_,
so one generic properties panel replaces a bespoke form per level type?

Status: analysis only, on branch `ngfp/author-mode-staging` (tip 28b45baa9eb).
No code written. Every field name and count below was read out of this
worktree or out of `dashboard/config/levels/`; counts are stated so they can
be re-measured.

Verdict up front: **a generic panel is feasible, but the field set is not
derivable.** Hand-maintained descriptor tables, colocated with the
`levelProperties.ts` builders, are the right source. Option _lists_ for enum
fields are partly derivable from real constants the lab packages already
export. Section 1 shows why each derivation candidate fails, with numbers.

---

## 1. Where the schema comes from

Three candidates were considered. All three are already in the tree, so this
is measurement, not speculation.

### 1.1 Candidate A — derive from zod. Fails on coverage.

Each lab package registers a zod schema for its extra level properties
(`packages/core/src/api/dashboard/levels/levels.kinds.ts`, applied at
`levels.api.ts:77-85`). Music's is
`packages/labs/music/src/schema.ts`:

```
LevelDataSchema declares 5 keys:
  allowChangeStartingPlayheadPosition, showSoundFilters, library,
  toolbox, startSources
ToolboxSchema declares 1 key:
  includeAi
```

Real music levels carry 29 distinct `level_data` keys. Measured over the
1805 files with XML root `<Music>` under `dashboard/config/levels/`:

| `level_data` key                                                      | files  | in `LevelDataSchema`? |
| --------------------------------------------------------------------- | ------ | --------------------- |
| `toolbox`                                                             | 1712   | yes                   |
| `library`                                                             | 1704   | yes                   |
| `startSources`                                                        | 1600   | yes                   |
| `packId`                                                              | 1376   | **no**                |
| `allowChangeStartingPlayheadPosition`                                 | 1100   | yes                   |
| `sounds`                                                              | 997    | **no**                |
| `showSoundFilters`                                                    | 695    | yes                   |
| `validationTimeout`                                                   | 409    | **no**                |
| `toolboxDefinition`                                                   | 354    | **no**                |
| `showSoundsPanelInSoundsMode`                                         | 308    | **no**                |
| `sortUnrestrictedPacksByType`                                         | 221    | **no**                |
| `aiCodeGenerateAdlib`                                                 | 62     | **no**                |
| `blockMode`                                                           | 49     | **no**                |
| `aiCodeGenerate`                                                      | 43     | **no**                |
| `text`                                                                | 35     | **no**                |
| `guideMode`                                                           | 34     | **no**                |
| `validations` (nested, misplaced)                                     | 28     | **no**                |
| `aiCodeGenerateExtraPrompt`                                           | 18     | **no**                |
| `hideAiTemperature`                                                   | 16     | **no**                |
| `showAiGenerateAgainHelp`                                             | 13     | **no**                |
| `blocks` (legacy)                                                     | 10     | **no**                |
| `Control` / `Play` (stray dupes)                                      | 9 / 9  | **no**                |
| `aiCodeGenerateText`                                                  | 3      | **no**                |
| `showAiTemperatureExplanation`                                        | 2      | **no**                |
| `player`, `aiCodeGenerateAdlibId`, `triggered_at_block`, `level_data` | 1 each | **no**                |

And inside `toolbox`:

| `toolbox.*` sub-key              | files | in `ToolboxSchema`? |
| -------------------------------- | ----- | ------------------- |
| `blocks`                         | 1664  | **no**              |
| `type`                           | 1390  | **no**              |
| `addFunctionCalls`               | 594   | **no**              |
| `addFunctionDefinition`          | 500   | **no**              |
| `includeAi`                      | 32    | yes                 |
| `addFunctionCallsSortByPosition` | 10    | **no**              |

Every attribute the product owner named by hand is in the "no" column:
the selected song (`packId`, 1376 files), the sound allowlist (`sounds`,
997), the toolbox block list (`toolbox.blocks`, 1664), and the guide
"pointer" (`guideMode`, 34). A panel derived from the zod schema would
offer `includeAi` (32 files) and omit `toolbox.blocks` (1664 files).

This is not an oversight to be fixed by extending the schema. The schema is
a _validation gate for a consumption path_, and it is deliberately narrow:
`z.object` strips unknown keys, so the fields it omits are the fields the
new music package has not yet ported. Widening it to serve the panel would
change what the lab receives at runtime — the panel's needs and the parser's
needs are different problems that happen to overlap.

Two further reasons zod cannot drive the panel even at full coverage:

- **No option lists.** `levelKinds.ts:11-14` registers fish as
  `{mode: z.string().optional(), guides: z.string().optional()}`.
  `z.string()` cannot tell a dropdown that `mode` has five values. Maze's
  `skin: z.string()` (`packages/labs/maze/src/schema.ts:50`) cannot tell it
  there are eight skins.
- **No write path.** A parse schema describes the read direction only. It
  says nothing about which op writes the field, or whether writing it back
  is safe.

### 1.2 Candidate B — derive from TS types. Fails on runtime and on metadata.

`packages/labs/music/src/types.ts:18-52` (`MusicLevelData`) is markedly
closer to reality than the zod schema: 25 declared fields, including
`packId`, `sounds`, `guideMode`, `toolboxDefinition`, `blockMode`. Its own
docstring admits it is hand-written and only partly synchronised with the
schema. So the _better_ of the two candidate sources is already a
hand-maintained table — the question is only where it lives and what it
carries.

It still fails as a derivation source:

- **Erased at runtime.** Driving a panel needs a value at runtime. That
  means a codegen step (ts-morph, or ts-json-schema-generator) over three
  lab packages that `@code-dot-org/authoring` does not depend on and must
  not start depending on — the importer runs in Node, the labs are browser
  bundles.
- **Over-declares.** In `packages/labs/music/src`, excluding tests, types.ts
  and schema.ts themselves, these declared fields have **zero** read sites:
  `validationTimeout`, `aiCodeGenerateAdlibId`, `aiCodeGenerateAdlib`,
  `aiCodeGenerateText`, `aiCodeGenerateExtraPrompt`, `danceMove`. Generating
  a panel from the type would offer six controls that do nothing in the lab
  this prototype mounts. (Several _are_ read by the legacy
  `apps/src/music/` implementation — which is the point: the type is a union
  of two labs' needs, not a statement about either.)
- **Under-declares.** `aiCodeGenerate` (43 files), `text` (35), nested
  `validations` (28), `blocks` (10), `Control`/`Play` (9 each) appear in real
  data and in no type at all.
- **Carries none of the four things the panel needs.** No label, no widget
  kind, no option list, no relevance rule, no write path.

### 1.3 Candidate C — derive from the ops. Fails on breadth.

The writable vocabulary is `packages/authoring/src/model/changes.ts:48-110`,
validated at `apps/authoring-service/src/authoring/changeSchema.ts:186-265`.
Across every level type it exposes exactly three editable level fields:

- `updateLevel` → `LevelPatch = Partial<Pick<ExistingLevelExperience,'title'>>`
  (changes.ts:40). One field: `title`.
- `overrideLevelInstructions` → `InstructionsPatch` (types.ts:67-70). Two
  fields: `shortInstructions`, `longInstructions`.
- `updateContent` → `ContentPatch` (changes.ts:29-32). `title`, `markdown`,
  for content experiences and the markdown-bearing generic variants.

Deriving the panel from the ops yields a three-row panel. The ops are the
_write_ half of a descriptor and cannot supply the read half. They do,
however, tell us honestly how much new write surface the panel implies —
see section 3.

### 1.4 Recommendation — hand-maintained tables beside the builders

Put a `LevelFieldDescriptor[]` table per level kind in
`packages/authoring/src/importer/levelProperties.ts`, next to the builder
that produces that kind's wire shape.

Why that file specifically:

- **It is already the allowlist.** `buildFishLevelProperties` emits 16 keys,
  `buildMusicLevelProperties` 25, `buildMazeLevelProperties` 17 plus a
  `...properties` spread (levelProperties.ts:31-148). A field the builder
  does not emit cannot reach the client, so a descriptor for it is dead on
  arrival. The builder is therefore the _upper bound_ on the panel, and the
  natural place to state the bound once.
- **Drift becomes testable.** One unit test per kind: for each descriptor,
  assert the key is present in the object the builder returns for a real
  `.level` fixture. That is the same guard derivation was supposed to buy,
  at a fraction of the machinery. The file already has a test neighbourhood
  (`packages/authoring/src/importer/__tests__/`) and already carries the
  invariant that both call sites must produce byte-identical properties
  (levelProperties.ts:1-7).
- **It catches drift that exists today.** `buildMazeLevelProperties` spreads
  raw snake_case properties and camelises only `startDirection`, `ideal`,
  `skin`. `packages/labs/maze/src/Bee.ts:40` reads `level.flowerType`.
  Nothing in `packages/authoring/src` or `apps/studio/src/modules/labs/`
  ever produces `flowerType` — grep returns empty. So Bee levels' flower
  type is inert in the prototype today, silently, even though 2670 real maze
  levels set `flower_type`. A descriptor table with an explicit "consumed
  as" column surfaces exactly this class of bug; neither zod nor the TS type
  would have.

Option _lists_ are the one genuinely derivable part, and should be imported
rather than transcribed:

| field                             | option source                     | verified at                                            |
| --------------------------------- | --------------------------------- | ------------------------------------------------------ |
| fish `mode`                       | `AppMode` (5 values)              | `packages/labs/oceans/src/oceans/constants.ts:17-23`   |
| maze `skin`                       | `Object.keys(defaultSkins)` (8)   | `packages/labs/maze/src/skins.ts:5-353`                |
| music `toolbox.blocks` categories | `Categories` (10)                 | `packages/labs/music/src/blockly/toolbox/constants.ts` |
| music block types                 | `BlockTypes` (~46)                | `packages/labs/music/src/blockly/blockTypes.ts`        |
| music `blockMode`                 | `BlockMode` (2)                   | `packages/labs/music/src/constants.ts:37-40`           |
| music `guideMode`                 | `MusicLevelData['guideMode']` (2) | `packages/labs/music/src/types.ts:41`                  |

A caution that must be designed for: **real data contains values the
constants do not model.** `mode` in the wild includes `pondlab` (1 level),
which is absent from `AppMode`. `skin` includes `farmer_night` (8 levels),
absent from `defaultSkins`. So an enum editor must render the current value
even when it is not in the option list, and must never silently normalise
it. See `allowUnknown` in the descriptor below.

---

## 2. Descriptor shape

Sketch, to live in `levelProperties.ts` beside the builders. Deliberately
flat: no plugin registry, no runtime schema composition. It is a table.

```ts
/** Where the value lives on the served LevelProperties entry. */
type FieldPath =
  | {at: 'property'; key: string} // levelProperties[key]
  | {at: 'levelData'; key: string} // levelProperties.levelData[key]
  | {at: 'levelDataToolbox'; key: string}; // levelProperties.levelData.toolbox[key]

type Editor =
  | {kind: 'markdown'}
  | {kind: 'text'}
  | {kind: 'boolean'}
  | {kind: 'number'}
  | {
      kind: 'enum';
      options: readonly {value: string; label: string}[];
      /** Real data carries values the lab's constants omit (mode=pondlab,
       * skin=farmer_night). Render the current value regardless. */
      allowUnknown: true;
    }
  | {kind: 'songPicker'} // packId + sounds together; see section 4
  | {
      kind: 'blockList';
      categories: readonly string[];
      blockTypes: readonly string[];
    }
  | {kind: 'readonly'}; // shown for orientation, not editable

/** Which op carries the write, and how the patch is shaped. */
type WritePath =
  | {op: 'overrideLevelInstructions'} // exists today
  | {op: 'updateLevel'} // exists today (title only)
  | {op: 'updateContent'} // exists today
  | {op: 'updateLevelProperties'; merge: 'shallow'} // NEW, section 3
  | {op: 'updateLevelProperties'; merge: 'levelData'} // NEW, nested merge
  | {op: 'none'; reason: string}; // readonly: say why

interface LevelFieldDescriptor {
  /** Stable id for selection state and change-log readability. */
  id: string;
  label: string;
  /** Author-facing sentence. Says what the learner sees, not what the code does. */
  help?: string;
  path: FieldPath;
  editor: Editor;
  write: WritePath;
  /**
   * True when this field changes what the mounted lab does. Evaluated
   * against the served properties, so it can depend on sibling fields
   * (guideMode gates the aiCodeGenerate* group) as well as appName.
   * A field that is not relevant is HIDDEN, not disabled — the panel must
   * not imply that shortInstructions does something in music lab.
   */
  relevant: (props: Record<string, unknown>) => boolean;
  /**
   * Can we write this field back without corrupting fields we do not model?
   * 'field'  — independent; a shallow merge is correct.
   * 'group'  — correct only if written together with its group siblings.
   * 'unsafe' — do not offer an editor; `write.reason` explains.
   */
  roundTrip: 'field' | 'group' | 'unsafe';
  /** Other descriptor ids that must be written in the same op. */
  group?: readonly string[];
}
```

Two notes on the shape.

**`relevant` is a predicate over served properties, not a static
appName list.** It has to be: `guideMode` gates whether the
`aiCodeGenerate*` fields do anything (`packages/labs/music/src/components/MusicLab/index.tsx:88,240,245,289`),
and `toolboxDefinition` overrides `toolbox` entirely
(`packages/labs/music/src/Driver.ts:768` — `this.toolboxDefinition || getToolbox(...)`),
so offering the block-list editor on a level that sets `toolboxDefinition`
would produce edits with no visible effect.

**`roundTrip` is the honest field.** It is what stops the panel from being a
data-loss machine. `packId` is `'group'`, not `'field'` — section 4 shows
why.

---

## 3. Coverage map

Relevance below means _the mounted lab reads it_. Verified by grep over
`frontend/packages/labs/*/src`, excluding tests and fixtures.

### 3.0 The one result that reframes the whole panel

`shortInstructions` has **zero** read sites in any lab package.
`longInstructions` is read by exactly two: lab-classic
(`classic/src/instructions/components/Instructions.tsx:84`,
`classic/src/components/GuideInstructions/index.tsx:27`,
`classic/src/resourcePanel/components/ResourcePanel.tsx:204`) and maze-lab
(`maze/src/components/MazeLab/index.tsx:248`). Oceans reads neither — it
takes only `appMode`, `guides`, `textToSpeechLocale` as props
(`apps/studio/src/modules/labs/oceans/index.tsx:39-44`).

So the product owner's observation about music lab generalises further than
stated:

| field               | music                | maze                 | fish               | generic            |
| ------------------- | -------------------- | -------------------- | ------------------ | ------------------ |
| `longInstructions`  | lab renders it       | lab renders it       | host renders it    | host renders it    |
| `shortInstructions` | **nothing reads it** | **nothing reads it** | host fallback only | host fallback only |

The host's own fallback is `LevelInstructions.tsx:49-53` — `shortInstructions`
is used only when `longInstructions` is empty, and only where the host draws
the block itself (`selfDisplayedByLab` is `appName === 'maze' || appName === 'music'`,
ExperienceStage.tsx:248). Which means for music and maze, `shortInstructions`
is unreachable in both directions. Real data agrees: 6 of 1805 music levels
set `short_instructions`; 3877 of 4100 maze levels do, and it goes nowhere.

`shortInstructions` should be hidden for music and maze — the exact
behaviour asked for, now with a reason attached rather than a special case.

### 3.1 Music

Top editables, by real-world frequency. "New op" means no existing op can
carry the write.

| #   | attribute           | path                           | editor                   | writable today                        | round-trip             |
| --- | ------------------- | ------------------------------ | ------------------------ | ------------------------------------- | ---------------------- |
| 1   | `longInstructions`  | property                       | markdown                 | **yes** — `overrideLevelInstructions` | field                  |
| 2   | `title`             | experience                     | text                     | **yes** — `updateLevel` (no UI yet)   | field                  |
| 3   | selected song       | `levelData.packId` (+`sounds`) | songPicker               | new op                                | **group**              |
| 4   | allowed blocks      | `levelData.toolbox.blocks`     | blockList                | new op                                | field                  |
| 5   | toolbox layout      | `levelData.toolbox.type`       | enum `category`/`flyout` | new op                                | field                  |
| 6   | guide mode          | `levelData.guideMode`          | enum + none              | new op                                | field                  |
| 7   | sound library       | `levelData.library`            | enum, `allowUnknown`     | new op                                | **group** (with 3)     |
| 8   | `showSoundFilters`  | `levelData`                    | boolean                  | new op                                | field                  |
| —   | `shortInstructions` | property                       | _hidden_                 | n/a                                   | n/a — nothing reads it |
| —   | `startSources`      | `levelData`                    | readonly                 | no                                    | **unsafe**             |
| —   | `validations`       | property                       | readonly                 | no                                    | **unsafe**             |
| —   | `toolboxDefinition` | `levelData`                    | readonly                 | no                                    | **unsafe**             |

Why the three unsafe ones are unsafe:

- **`startSources`** is a Blockly workspace serialization (1600/1805 levels).
  Editing it as text invites a malformed workspace that fails at mount, and
  editing it meaningfully is a Blockly editor, not a form field. Show it
  read-only; leave authoring it to the lab's own start-blocks mode.
- **`validations`** is `Validation[]` with a condition vocabulary of ~29
  named predicates. It gates Check/Continue via `ProgressManager`
  (levelProperties.ts:98-104). A generic form cannot validate a condition
  name, and a wrong one silently un-gates the level. Needs its own editor,
  not a descriptor row.
- **`toolboxDefinition`** is a raw Blockly `ToolboxInfo` (354 levels) and,
  when present, wins over `toolbox` entirely (Driver.ts:768). Offer it as
  read-only _and_ use its presence to hide the block-list editor, so the
  panel never shows an edit that cannot take effect.

### 3.2 Maze / Karel

Ground truth: 4100 `.level` files under `dashboard/config/levels/custom/maze/`
(2677 `<Karel>`, 1423 `<Maze>`). They carry 30+ property keys.
`buildMazeLevelProperties` spreads all of them. The maze adapter
(`apps/studio/src/modules/labs/maze/index.tsx:57-77`) is the exhaustive list
of what is actually consumed — everything else in that spread is inert in
this prototype.

| #   | attribute                                                                                                                                          | path       | editor                   | writable today  | round-trip                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------ | --------------- | ---------------------------------------- |
| 1   | `longInstructions`                                                                                                                                 | property   | markdown                 | **yes**         | field                                    |
| 2   | `skin`                                                                                                                                             | property   | enum (8, `allowUnknown`) | new op          | field                                    |
| 3   | `ideal` (block target)                                                                                                                             | property   | number                   | new op          | field                                    |
| 4   | `startDirection`                                                                                                                                   | property   | enum 0-3                 | new op          | field                                    |
| 5   | `toolboxBlocksXml`                                                                                                                                 | property   | blockList (XML-backed)   | new op          | field                                    |
| 6   | `title`                                                                                                                                            | experience | text                     | **yes** (no UI) | field                                    |
| 7   | `maze` (the grid)                                                                                                                                  | property   | readonly                 | no              | **unsafe**                               |
| 8   | `startBlocksXml` / `solutionBlocksXml`                                                                                                             | property   | readonly                 | no              | **unsafe**                               |
| —   | `authored_hints`                                                                                                                                   | property   | readonly                 | no              | **unsafe**                               |
| —   | `shortInstructions`                                                                                                                                | property   | _hidden_                 | n/a             | nothing reads it                         |
| —   | `step_mode`, `is_k1`, `use_contract_editor`, `examples_*`, `definition_*`, `contract_*`, `disable_*`, `shape_shift`, `sequencing`, `flower_type` … | property   | _hidden_                 | n/a             | inert: no reader in `packages/labs/maze` |

That last row is 20+ properties present on nearly every real maze level
(`step_mode` 4088, `is_k1` 4064, `disable_param_editing` 3976,
`use_contract_editor` 3944, `examples_highlight` 3922 …). They belong to
other legacy labs' Blockly configuration. Hiding them is most of the value
of the relevance predicate on this type.

`flower_type` (2670 levels) deserves a callout: it is _not_ inert by
intent. `Bee.ts:40` wants it, as `flowerType`. The importer never camelises
it. Either the descriptor is `{write: {op:'none', reason:'importer emits
flower_type; Bee.ts reads flowerType'}}`, or the builder is fixed and the
field becomes a two-value enum. Fixing it is a one-line builder change and
should probably ride along, but it is a behaviour change and belongs in its
own commit.

The grid and blocks are unsafe for one shared reason: `maze` (the grid),
`startBlocksXml`, and `solutionBlocksXml` are mutually constrained — the
solution must solve the grid using the toolbox. `updateLevel`'s Maze-only
`MazeLevelDefinitionPatchSchema` already writes them together behind a
solvability gate (noted at changes.ts:93-98), and `checkLevel`
(`levels/importedLevelCheck.ts`, surfaced at ExperienceStage.tsx:254-283)
already exists as the lint. A properties-panel row that writes one of the
three alone would defeat both. Keep them read-only in the panel and point
the author at the existing gated path.

### 3.3 Fish / Oceans

The simplest type, and the best first proof that the panel works.
`buildFishLevelProperties` (levelProperties.ts:31-57) emits 16 keys; the
adapter consumes exactly three, one of which comes from the URL.

Real fish levels carry only 9 distinct property keys, measured over
`dashboard/config/levels/custom/fish/`: `mode` 155, `name_suffix` 140,
`parent_level_id` 125, `background` 74, `encrypted` 68,
`instructions_important` 52, `guides` 31, `ai_tutor_available` 20,
`contained_level_names` 5.

| #   | attribute                      | path       | editor                                  | writable today  | round-trip          |
| --- | ------------------------------ | ---------- | --------------------------------------- | --------------- | ------------------- |
| 1   | `mode`                         | property   | enum (5 from `AppMode`, `allowUnknown`) | new op          | field               |
| 2   | `guides`                       | property   | enum `K5` / default                     | new op          | field               |
| 3   | `title`                        | experience | text                                    | **yes** (no UI) | field               |
| 4   | `longInstructions`             | property   | markdown                                | **yes**         | field               |
| 5   | `shortInstructions`            | property   | markdown                                | **yes**         | field               |
| —   | `offerBrowserTts`              | property   | readonly                                | no              | see note            |
| —   | everything else in the builder | property   | _hidden_                                | n/a             | constant, or unread |

Notes. `mode` must also write `appMode`: the builder sets both from the same
`properties.mode` (levelProperties.ts:41-45) and the comment says other
code expects `appMode`. That makes `mode` a `'group'` in practice — a good
early test of the group mechanism on a trivial field. Zero fish levels in
the repo set `long_instructions` or `short_instructions`, but the host
_does_ render them for fish (`selfDisplayedByLab` excludes fish), so both
are genuinely editable and genuinely visible — offering them is authoring
capability, not dead UI. `offerBrowserTts` round-trips as the _string_
`"true"`/`"false"` through `.level` XML (levelProperties.ts:18-29); a
boolean editor writing a real boolean would diverge from the on-disk
convention, so leave it read-only until a publish adapter needs it.

### 3.4 Generic — multi / match / markdown / video / levelGroup / bubbleChoice

These have no lab. They are rendered by
`apps/studio/src/modules/authoring/components/renderers/*` off
`GenericLevelData` (types.ts:99-129), which is a _closed union the prototype
itself defines_. This is the one place where derivation genuinely works: the
zod schema at changeSchema.ts:86-131 is complete by construction, because
the renderers and the schema are the same team's code.

| variant              | attributes                                                                 | writable today                        |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------- |
| all                  | `title`                                                                    | **yes** — `updateLevel`               |
| multi/match/markdown | `markdown`                                                                 | **yes** — `updateContent`             |
| multi                | `question`, `answers[].text`, `answers[].correct`, `allowMultipleAttempts` | new op                                |
| match                | `pairs[].question`, `pairs[].answer`                                       | new op                                |
| video                | `videoKey`, `youtubeCode`, `displayName`                                   | new op                                |
| levelGroup           | `title`; nested `pages[].levels[]`                                         | **unsafe** (nested, self-referential) |
| bubbleChoice         | `displayName`, `choices[].displayName`                                     | new op                                |

The array-valued ones (`answers`, `pairs`, `choices`) need a list editor,
not a field editor, and their write is a whole-array replace on
`experience.data` — not a `levelProperties` merge, since generic experiences
have no `levelNumericId`. That is a second write path, and it is a real
reason to keep the first slice away from generic types.

### 3.5 Widget

`updateWidgetMetadata` already accepts `Partial<WidgetDescriptor>`
(changes.ts:81-85), gated on `WIDGET_ID_PATTERN` at changeSchema.ts:244-248.
`title` and `description` are safe text fields with an op that exists and no
UI. `inputSchema`, `resourceUri`, `visibility`, `network`, `eventTypes` are
contract fields the widget build gates on
(`apps/authoring-service/src/widgets/contractGates.ts`) — read-only.
Cheapest real win in the whole map: two text fields, zero new server code.

### 3.6 The one new op

Nine of the rows above need a write path that does not exist. One op covers
all of them, and Pass F already established its shape.

`overrideLevelInstructions` is the template. At
`apps/authoring-service/src/state/AuthoringState.ts:105-113` the server
captures `previous` from the served properties _before_ the merge —
never client-supplied — and at :123-131 folds the patch onto the served
`levelProperties` entry in the same version bump. `capturePreviousInstructions`
(:277-298) reads only the keys the patch mentions; `mergeInstructionsOverride`
(:300-315) is a shallow spread onto `levelProperties[numericId]`. That
`previous` is what makes revert exact without log replay
(`apps/studio/src/modules/authoring/revert.ts:51-58`), and it is why
`updateUnit`/`updateLesson`/`updateContent`/`updateLevel` are currently
_not_ revertible (revert.ts:20-27).

So:

```
{op: 'updateLevelProperties';
 experienceId: string;
 patch: {
   properties?: Record<string, unknown>;   // shallow merge onto the entry
   levelData?: Record<string, unknown>;    // shallow merge onto entry.levelData
   toolbox?: Record<string, unknown>;      // shallow merge onto entry.levelData.toolbox
 };
 previous?: /* same shape */;              // server-captured, per touched key
}
```

Three properties to hold onto:

- **Descriptor-gated at the boundary.** The zod branch must reject any key
  with no descriptor for that level's `appName`. This is the same lesson
  changeSchema.ts:6-16 records about `widgetId`: a `Record<string, unknown>`
  reaching a merge is an arbitrary-write primitive. Here the descriptor
  table _is_ the allowlist, which is a second reason to keep it in one
  place.
- **Shallow, not deep.** Three explicit nesting levels, matching the three
  `FieldPath` variants. A general deep merge cannot express "replace this
  array wholesale" and would silently half-merge `sounds` and
  `toolbox.blocks`.
- **`previous` per touched key.** Revert then works for every panel edit
  from day one, and `buildRevertChangeBody` gains one case that mirrors the
  instructions case exactly.

---

## 4. Music specifics

### 4.1 Selected song = `packId`, coupled to `sounds`

There is no `song` field. A song is a **pack**, addressed by
`levelData.packId`, inside a **library** named by `levelData.library`.

Read path: `MusicLab/index.tsx:175-179` resolves the library name
(remapping legacy `'default'` → `'intro2024'` via
`constants.ts:89-90`) and calls `loadAndInitializePlayer`;
`Driver.ts:147-164` loads it and then applies both level fields:

```
const {sounds, packId} = this.levelProperties.levelData ?? {};
if (sounds)  this.library.setAllowedSounds(sounds);
if (packId)  this.library.setCurrentPackId(packId);
```

`library` values in the wild (1704 levels): `launch2024` 1617,
`intro2024` 36, `curriculum2024` 15, `happy` 14, `launch2024-preview` 9,
`will` 7, `dollar` 2, `snap` 2, `tester` 1, `tcip` 1. Only the first two
have an in-repo manifest (`apps/static/music/music-library-*.json`); the
rest are fetched at runtime from `curriculum.code.org/media/musiclab/`
(`api/music/music.api.ts:40-48`). So the library dropdown's option list is
a short curated constant, not an enumeration — the tail is dev junk.

`packId`: 39 distinct values across 1376 levels. `default` 420, then real
song titles — `sabrina_carpenter_espresso` 88,
`carly_rae_jepsen_call_me_maybe` 76, `chainsmokers_riptide` 54,
`chainsmokers_coldplay_something_just_like_this` 48,
`alessia_cara_scars_to_your_beautiful` 44, `lady_gaga_born_this_way` 44,
`i_need_a_dollar_aloe_blacc` 41, …

**The write semantics are the interesting part.** `sounds` is
`{[category: string]: string[]}` (`player/types.ts:58-60`) and in practice
its single key _is the packId_. From
`dashboard/config/levels/custom/music/Change_the_volume_ keyboard_navigation.level`:

```json
{ "library": "launch2024",
  "packId": "i_need_a_dollar_aloe_blacc",
  "sounds": { "i_need_a_dollar_aloe_blacc": [
      "i_need_a_dollar_1", "i_need_a_dollar_2", "help_me",
      "drums_1", "drums_2", "drums_3", "piano_1", "horns_1", "horns_2" ] },
  "startSources": { "blocks": { … "fields": {
      "sound": "i_need_a_dollar_aloe_blacc/i_need_a_dollar_1" } … } } }
```

Three coupled consequences, in increasing severity:

1. **`packId` alone is wrong.** Change it and `sounds` still keys the old
   pack, so the allowlist applies to a pack that is no longer current. The
   Driver comment at :150-154 states the dependency: the allowlist "also
   determines the default sound". So `packId` is `roundTrip: 'group'` with
   `group: ['sounds']`, and the editor is a `songPicker` that writes both —
   this is why the descriptor needs a group concept at all.
2. **The option list needs a fetch.** Valid packs for a library are only
   knowable after loading `music-library-<library>.json`. The panel must
   fetch the manifest to populate the picker. That is a real, if modest,
   piece of work, and it is why "song picker" is not a plain enum row.
   Changing `library` invalidates the `packId` options — hence `library` is
   also `'group'`.
3. **`startSources` references sounds by `packId/soundName`.** Change the
   song and the authored starting program points at sounds that no longer
   exist. The lab degrades rather than crashes:
   `blockly/extensions/fieldSoundsValidatorExtension.ts:24` resets the field
   and logs "A sound field value was reset. X was not found in the current
   library." But the authored starting program loses its sound. **The song
   picker must say so before it writes** — a confirmation naming the blocks
   that will be reset. This is the sharpest limit in the whole feature and
   should not be discovered by an author mid-lesson.

### 4.2 Allowed blocks = `levelData.toolbox.blocks`

Type `CategoryBlocksMap = {[category in keyof Categories]?: string[]}`
(`blockly/toolbox/types.ts`). Categories: `Control, Effects, Events,
Functions, Logic, Math, Play, Simple, Tracks, Variables`
(`blockly/toolbox/constants.ts`). An absent category is hidden entirely; a
present array is an allowlist within it. Consumed via `Driver.ts:115`
(`this.toolbox = levelProperties.levelData?.toolbox || {}`) and
`Driver.ts:768` (`this.toolboxDefinition || getToolbox(this.blockMode, this.toolbox)`).

Real shape, from `music-coding-intro-effects_launch_express.level`:

```json
"toolbox": { "type": "flyout",
             "blocks": { "Functions": [],
                         "Play": ["play_chord_at_current_location_simple2",
                                  "play_pattern_at_current_location_simple2"],
                         "Control": ["triggered_at_simple2"] } }
```

Editor: per-category checkbox groups over `BlockTypes` (~46 values,
`blockly/blockTypes.ts`), rendered in `Categories` order. Write: replace
`toolbox.blocks` wholesale (`merge: 'levelData'` at the `toolbox` level,
whole-value replace beneath). `roundTrip: 'field'` — it does not constrain
`packId` or `startSources`.

Two guards. Hide the editor when `toolboxDefinition` is set (354 levels) —
it wins. And `blockMode` (`Simple2` | `Advanced`, 49 levels) selects the
default category→block map the allowlist filters, so the _offered_ block
set depends on it; the block list's options are a function of `blockMode`,
not a constant.

### 4.3 The instructions "pointer" = `levelData.guideMode`

No field named `pointer` exists. Grep for `pointer` across
`packages/labs/music/src` returns only CSS (`cursor: pointer`,
`pointer-events`). The concept is `levelData.guideMode`, typed
`'instructions' | 'aiCodeGenerate'` at `types.ts:41` and read at
`components/MusicLab/index.tsx:88`, with three distinct effects at :240,
:245, :289:

- `'instructions'` → renders `GuideInstructions`, which draws
  `levelProperties.longInstructions` as a guide overlay
  (`packages/labs/classic/src/components/GuideInstructions/index.tsx:27,41-43`)
  instead of the ResourcePanel tab.
- `'aiCodeGenerate'` → the AI generate-code flow, and forces pack selection
  (`forcePackSelect={guideMode === 'aiCodeGenerate'}`, :240).
- either value → `sidebarOnly={!!guideMode}` on the ResourcePanel (:289),
  suppressing the normal instructions tab.
- unset (1771 of 1805 levels) → normal ResourcePanel instructions tab.

So `guideMode` is a three-option enum (`instructions`, `aiCodeGenerate`,
unset) and it is the field that decides _where the author's markdown
appears_. It belongs directly beside the `longInstructions` editor in the
panel, not in an advanced section — it is the single most explanatory music
control the panel can offer, and today it is invisible to authors.

Note it is only 34 levels, and `aiCodeGenerate` (23) outnumbers
`instructions` (11). A separate `aiCodeGenerate` key appears on 43 levels
and matches no type or reader — probably an older spelling. The descriptor
should ignore it and the panel should not offer it.

---

## 5. Panel interaction

### 5.1 Layout

`LessonPlayer` renders one experience at a time (`active`), inside a grid
whose author-mode template is
`grid-template-columns: 440px 240px minmax(0, 1fr)`
(`authoring.module.scss:25-27`): chat sidebar, outline rail, stage. The
panel is a fourth column, `... minmax(0, 1fr) 340px`, mounted next to the
stage column at LessonPlayer.tsx:320 and gated on `authorMode` like its
siblings at :286 and :310. The existing `.playerFrame` height chain
(scss:10-15) already caps growth, so the panel scrolls independently with
no new layout work.

Because only one experience is on screen, "click any element on the stage"
has a small, closed target set — no hit-testing into a mounted lab's canvas
or Blockly workspace is needed, which is what would have made this hard.

### 5.2 Selection

One piece of state in `LessonPlayer`, beside the `activeExperienceId` /
`insertPosition` / `editingContentId` trio already there (:96-101):

```ts
type Selection =
  | {target: 'lesson'; lessonId: string}
  | {target: 'experience'; experienceId: string}
  | {target: 'widget'; widgetId: string}
  | {target: 'field'; experienceId: string; fieldId: string};
const [selection, setSelection] = useState<Selection | undefined>();
```

Click targets, in author mode only:

- the instructions block (`LevelInstructions`) → `{target:'field', fieldId:'longInstructions'}`,
  so a click lands on the row it corresponds to
- the lab stage chrome (`.labStage`, not inside the mounted lab) → the
  experience
- a generic renderer's card (`.contentCard`) → the experience
- a widget view → the widget
- an outline-rail row (`OutlineRail`, already has `onSelect`) → the
  experience, which also navigates
- the lesson header → the lesson

Everything routes through one `setSelection`; the panel is a pure function
of `selection` plus the served `levelProperties`, which it already has via
`useLevelProperties(levelNumericId)` (ExperienceStage.tsx:178) — no new
fetch, no new cache key. Panel writes invalidate
`['authoring','levelProperties', levelNumericId]`, exactly as
`LevelInstructions.tsx:83-86` does today.

Selection must be visibly distinct from the _active_ experience (which
drives what is mounted). Two different concepts sharing one highlight would
be the first thing to confuse an author.

### 5.3 Subsuming the existing affordances

The panel replaces the pencil-icon edit bars, and should replace them
outright rather than coexisting:

- `LevelInstructions.tsx:93-121` — the `authorMode` edit bar and
  `LevelInstructionsEditor` (:160-236) both go. The component keeps its
  readonly `InstructionsBody` and its `selfDisplayedByLab` logic (which the
  panel's relevance predicate reuses), and gains an `onSelect` so clicking
  it selects the `longInstructions` row. The `overrideLevelInstructions`
  call at :78-87 moves into the panel unchanged.
- `LessonPlayer.tsx:332-347` — the content edit bar and the
  `editingContentId` state go. `ContentComposer` survives as the panel's
  markdown row for content experiences; its `updateContent` call
  (:356-363) moves into the panel. `ContentComposer` stays as-is for the
  _insertion_ path (`InsertPoint`), which is creation, not editing — a
  distinction worth keeping.
- `InsertPoint` and `ChangeHistory` are untouched. Insertion is not
  property editing, and the change log is the panel's audit trail: every
  panel write is one `CurriculumChange`, so `ChangeHistory` and Revert work
  on panel edits for free — provided the new op captures `previous`
  (section 3.6).

Three idioms from the existing composers are worth carrying into the panel
verbatim, because they are already consistent across all four:
`useEscapeKeyHandler(onCancel)` from
`@code-dot-org/component-library/common/hooks`; a `busy` flag with the
literal message `'That change failed to apply.'` in a `role="status"`
element; and `aria-label` on every bare input.

### 5.4 Markdown editing — use what is here, add no dependency

What exists:

- **Renderer, in the right place already.** `@code-dot-org/markdown`
  (`frontend/packages/markdown/`) is a declared dependency of
  `frontend/apps/studio/package.json` and is already imported at
  `LevelInstructions.tsx:8` and `ExperienceStage.tsx:11`. Built on
  unified/remark/rehype with `rehype-sanitize`, rendering onto MUI and
  component-library primitives.
- **The house pattern for editing is textarea + preview.**
  `apps/src/levelbuilder/TextareaWithMarkdownPreview.jsx` — the surface
  curriculum authors use in production today — is a plain `<textarea>`
  (`MarkdownEnabledTextarea.jsx`) beside an `EnhancedSafeMarkdown` render,
  with a toolbar that inserts snippets by string concatenation. No
  CodeMirror, no WYSIWYG. Nothing in `apps/` or `frontend/` uses a markdown
  editor library; the only rich-text editor in the repo is Slate, scoped to
  code-review comments.
- **The design system has no multiline input.**
  `@code-dot-org/component-library/textField` wraps a single-line
  `<input>`; there is no `Textarea` component. So a bare `<textarea>` — what
  `LevelInstructions.tsx:205-216` and `ContentComposer.tsx:71-76` already
  use — is the correct choice, not a shortcut.

Recommendation: **`<textarea>` + live `<Markdown>` preview. No new
dependency.** This is strictly better than today (neither existing editor
renders a preview while editing — `LevelInstructions` imports `Markdown`
but uses it only for the readonly view) and it matches the production
levelbuilder surface authors already know.

If a real editor is wanted later, CodeMirror 6 with `@codemirror/lang-markdown`
is the right target: CM6 is already vetted in `apps/`
(`apps/src/code-studio/initializeCodeMirror6.ts`), so it is an added
language mode rather than a new engine. Estimated ~40-55 KB min+gzip for a
minimal markdown setup — recalled, not measured against this repo's build;
measure before committing. `@uiw/react-md-editor` is the turnkey
alternative (~60-90 KB, same caveat) but bundles its own preview stack,
duplicating `@code-dot-org/markdown`. Neither is needed for the first slice.

---

## 6. Verdict and phasing

**Feasible.** A generic descriptor-driven panel is the right shape, and the
prototype is unusually well positioned for it: one experience on screen at a
time, a served `levelProperties` map the panel already has in cache, an
append-only change log that gives audit and revert for free, and an importer
whose builders already enumerate the reachable field set per type.

**Not derivable.** The field set must be hand-maintained. The strongest
available derivation source (`MusicLevelData`) is itself a hand-maintained
table that both over- and under-declares against real data and real readers;
the zod schemas omit every attribute the product owner asked for; the ops
expose three fields total. Colocating the table with the
`levelProperties.ts` builders is the honest answer, and it buys a real drift
guard — one test asserting every descriptor key is produced by its builder —
that derivation was only going to approximate.

### Slice 1 — the panel, on the fields that already have ops

No new server op. Proves the panel, the relevance predicate, and the
subsumption in one step.

1. `LevelFieldDescriptor` + tables for fish, music, maze, generic, widget,
   in `levelProperties.ts`. Every row `write: {op: 'none'}` except the ones
   listed below.
2. Panel as a fourth grid column; `Selection` state in `LessonPlayer`;
   click targets on the instructions block, stage chrome, content card,
   widget view, outline rail.
3. Wire the four ops that exist: `overrideLevelInstructions`
   (`longInstructions`), `updateLevel` (`title` — first UI it has ever had),
   `updateContent` (content markdown), `updateWidgetMetadata`
   (`title`/`description` — also its first UI).
4. Hide the irrelevant. `shortInstructions` disappears for music and maze
   with a verified reason; maze's 20+ inert legacy properties disappear.
   This is the product owner's ask and it lands in slice 1.
5. Remove the two edit bars (`LevelInstructions.tsx:93-121`,
   `LessonPlayer.tsx:332-347`).
6. Test: for each kind, every descriptor key is present in the builder's
   output for a real `.level` fixture.

### Slice 2 — `updateLevelProperties`, and the cheap enums

7. The new op, with descriptor-gated zod, three-level shallow merge,
   server-side `previous` capture, and the `levelProperties` fold — all
   mirroring `AuthoringState.ts:105-131`. One `buildRevertChangeBody` case.
8. Enum and scalar rows that are `roundTrip: 'field'`: fish `mode` (+ the
   `appMode` group, the trivial group test) and `guides`; maze `skin`,
   `ideal`, `startDirection`; music `guideMode`, `toolbox.type`,
   `showSoundFilters`. All option lists imported from lab constants, all
   `allowUnknown` so `pondlab` and `farmer_night` survive contact.

### Slice 3 — the two composite editors

9. Block list for `music toolbox.blocks`: per-category checkboxes over
   `BlockTypes`, options keyed on `blockMode`, hidden when
   `toolboxDefinition` is set.
10. Song picker for `packId` + `sounds` + `library`: needs the library
    manifest fetch for its options, writes the group atomically, and warns
    before it invalidates `startSources` sound references.

### Deferred, with reasons

- Maze grid / start blocks / solution blocks — mutually constrained; the
  existing gated `update_level` path plus `checkLevel` is the right surface.
- Music `validations` — a condition-vocabulary editor, not a form row.
- `startSources` / `toolboxDefinition` — Blockly documents; read-only.
- Generic array fields (`answers`, `pairs`, `choices`) — need a list editor
  and a second write path onto `experience.data`, not a `levelProperties`
  merge.
- `flower_type` → `flowerType` in `buildMazeLevelProperties` — a real,
  pre-existing bug this probe found (2670 levels set it; `Bee.ts:40` reads
  the camelCase name; nothing produces it). One-line fix, but a behaviour
  change; its own commit.
