# AI Lab

AI Lab teaches supervised machine learning on tabular data. A student picks a
dataset or uploads a CSV, chooses a column to predict (the label) and the
columns to predict it from (the features), trains a model, and tests it on
rows held back from training. A model is a k-nearest neighbors model or a
decision tree; the label's column type decides between classification and
regression.

AI Lab levels come in two versions, chosen per level by its `uses_lab2`
property.

- **Lab 2 AI Lab** is `apps/src/ailab/`: `engine/` is the lab and `lab2/`
  mounts it in the Lab 2 framework. The rest of this file describes it.
- **Legacy AI Lab** runs every other `Ailab` level. `Ailab.js` mounts the
  external `@code-dot-org/ml-playground` package, pinned in
  `apps/package.json`, inside StudioApp.

Both versions load datasets from `/blockly/media/skins/ailab/`. The apps
Gruntfile copies ml-playground's datasets there first and
`apps/static/skins/ailab/` over them, so editing a dataset both ship changes
it for legacy levels too.

## Layout

Paths are relative to `apps/src/ailab/` unless they start with `apps/` or
`dashboard/`.

| Path | Contents |
| --- | --- |
| `engine/` | The lab: components (`UIComponents/`), Redux store, trainers, dataset loading. It imports nothing from `lab2/`; the host passes callbacks to `AilabEngine`. |
| `lab2/` | Lab 2 entry point, project sources, accuracy validator, Backpack image export, default instructions. |
| `Ailab.js`, `AilabView.jsx`, `levels.js`, `mlPlayground_locale.js` | Legacy AI Lab. |
| `locale.ts` | Loads the `ailab` strings from `apps/i18n/ailab/`, for both versions. |
| `apps/static/skins/ailab/` | Datasets and images, served at `/blockly/media/skins/ailab/`. |
| `apps/src/lab2/levelEditors/ailabMode/`, `ailabDynamicInstructions/` | Levelbuilder editors for `mode` and per-screen instructions. |
| `apps/src/levelbuilder/lesson-generator/ai/ailab/` | AI-drafted AI Lab levels for the lesson generator. |
| `apps/src/MLTrainers.js` | Rebuilds a saved model in App Lab. |
| `dashboard/app/models/levels/ailab.rb` | Level model: validates `mode`, derives the accuracy validation, writes long instructions for lesson plans. |
| `apps/test/unit/ailab/` | Unit tests for `engine/` and `lab2/`. |

## How it fits together

`lab2/views/AilabView.tsx` loads the student's project through `useSources`
and shows the Lab 2 loading screen until the project, the dataset and any
pretrained or restored model are ready. `AilabWorkspace.tsx` parses the
level's `mode`, calls `loadLevel(mode)` before paint, and renders the resource
panel beside `AilabEngine`.

The engine keeps state in four places:

- The Redux store (`engine/store.ts`), a module singleton holding the dataset,
  `mode`, the current panel, UI state, and each run's encoded training rows,
  test rows and predictions. `loadLevel` resets it on every level change.
- `engine/train.ts`, which keeps the active trainer and the row split in
  module state between runs. `loadLevel` resets it too.
- `ProjectContext`, the student's columns, hyperparameters, test rows and
  results. This is the project source (`AilabProject` in `engine/types.ts`);
  `lab2/sources.ts` drops anything in a saved source that does not fit it.
- `TrainingDataContext`, which holds only the trained model. The model is not
  saved: when a project opens, `useRestoreModel` retrains it from the saved
  hyperparameters, test rows, and the latest result's label and features,
  provided those still fit the dataset.

### Panels

`selectDataset` comes first unless the level names a dataset. `datasetView`
and `results` follow, and the header's Dataset and Testing tabs switch between
them. The Train button on the dataset panel trains the model at once, then
opens `TrainingModal`, which only animates training and testing; cancelling
the modal puts back the previous model.

Lab 2 does not yet let students save a trained model for use in App Lab.
`saveModel` and `modelSummary` remain from the legacy flow, but nothing in
Lab 2 opens them.

TODO: Update this section, and `hideSave` below, when Lab 2 supports saving
models.

### Trainers

`engine/trainers/` has one class per family: `knn` (`ml-knn`) and
`decisionTree` (`ml-cart`). `mode.trainer` picks the family and the label's
column type picks classification or regression. Without
`mode.hyperparameters`, a trainer tries several values and keeps whichever is
most accurate on the test rows.

The model save payload (`selectors/saveSelectors.ts`) records the family and
problem type as a trainer id (`knnClassify`, `treeRegress`, and so on), which
`apps/src/MLTrainers.js` reads to rebuild the model in App Lab. Lab 2 cannot
save models yet, but a new family will need a loader there.

A categorical prediction is correct when it matches the label exactly; a
numerical one, when it falls within 5% of the label column's range.

### Progress

When `mode.requireAccuracy` is above 0, `Ailab#get_validations` adds an
`ACCURACY_AT_LEAST` condition, and `lab2/AccuracyValidator.ts` checks it
against the latest training run.

### Instructions

Each screen has an instructions key (`INSTRUCTIONS_KEYS` in
`engine/types.ts`). A key's text is the level's `dynamicInstructions` entry,
else its `ailab` locale string (`apps/i18n/ailab/en_us.json`), else its
`defaultText` in `engine/lab2-instructions.json`. The levelbuilder editor
offers only the keys in that file, `datasetView` and `results`, and drops the
rest on save, so the other screens show their locale string. Dashboard reads
the same file to write a level's long instructions for lesson plans.

### Decision tree

`UIComponents/DecisionTree.tsx` draws nodes as positioned HTML over an
`aria-hidden` SVG of edges, laid out by `helpers/displayTreeLayout.ts`.
`TreeCanvas.tsx` pans and zooms both layers with `d3-zoom`. Graph libraries
that own the node DOM, such as React Flow, were rejected because their
keyboard and ARIA behavior conflicts with the tree's.

## Level configuration

`mode` is a JSON object. `Ailab#validate_lab2_mode` enforces the rules below,
except for `hyperparameters`, which only the levelbuilder editor checks. The
editor also drops keys and values Lab 2 does not read.

| Key | Effect |
| --- | --- |
| `datasets` | At most one dataset id. With one, the level loads it and skips the picker. Without the key, the picker offers every dataset not marked `isToy`, and a CSV upload; the editor marks this setup as for development only. |
| `trainer` | `knn` (default) or `decisionTree`. |
| `hyperparameters` | `{"k": n}` for `knn`, `{"maxDepth": n}` for `decisionTree`, with n a whole number ≥ 1. The engine ignores a value that does not match `trainer`; without a usable value, the trainer picks one (see Trainers). |
| `label`, `features` | Starting columns for a new project. A returning student's saved choice wins unless `hideSelectLabel` or `lockFeatures` locks it. |
| `hideSelectLabel` | Locks the label: `label` if set, else the dataset's `defaultLabelColumn`. |
| `lockFeatures` | Locks the features. |
| `idColumn` | Column that names each row. Defaults to the dataset's `defaultIdColumn`; `null` for none. Cannot be the label or a feature. |
| `pretrained` | Trains when the level loads. Requires `label`, `features`, `hideSelectLabel`, `lockFeatures` and `reserveLastRows`; excludes `requireAccuracy`. |
| `hideDatasetView` | Opens on the results with no way back. Requires `pretrained`. |
| `hideTestingView` | Shows only the dataset. Excludes `pretrained` and `requireAccuracy`. |
| `requireAccuracy` | 0 to 100. The student must train a model at least this accurate to continue. |
| `testRows` | `{"count": n}` with n ≥ 1, or `{"percent": p}` with 0 < p < 100. Defaults to 10 percent; capped to leave one row for training. |
| `reserveLastRows` | Tests on the last rows rather than a random sample. |
| `hideColumnClicking` | Columns cannot be clicked to inspect them. |
| `defaultCardView` | Opens the dataset as cards rather than a table. |
| `hideSave` | Hides the save panel. No effect until Lab 2 supports saving models. |

`label`, `features`, `hideSelectLabel`, `lockFeatures`, `idColumn` and
`pretrained` require a dataset in `datasets`. Lab 2 never shows the
instructions overlay, so `hideInstructionsOverlay` matters only to legacy
levels.

## Adding a dataset

1. Add `<id>.csv` and `<id>.json` to `apps/static/skins/ailab/datasets/`,
   and optionally a tile image, `<id>.jpg`.
2. Add an entry to `engine/datasets-manifest.json`:

   ```json
   {
     "id": "zoo",
     "name": "Zoo",
     "path": "datasets/zoo.csv",
     "metadataPath": "datasets/zoo.json",
     "imagePath": "datasets/zoo.jpg",
     "rowCount": 101
   }
   ```

   `rowCount` must equal the number of rows the CSV parses to;
   `datasetManifestTest.js` checks every entry. `"isToy": true` keeps a
   dataset out of the picker, though a level can still name it in
   `mode.datasets`. The level model rejects ids missing from the manifest and
   caches it, so restart a running dashboard server before saving a level
   that names a new id.
3. In the metadata, set a top-level `name`, usually the dataset id; without
   it the About this data panel shows no description or potential uses. List
   every column under `fields` with its `id`, `type` (`categorical` or
   `numerical`) and `description`. `card` holds the `description` and
   `source`, and `card.context` holds `potentialUses` and `potentialMisuses`.
   `defaultLabelColumn` and `defaultIdColumn` are optional. `Metadata` in
   `engine/types.ts` has the full shape.
4. `yarn start` copies files added to `apps/static/` while it runs, but not
   files that were there before it started, such as ones from a branch
   switch. Those 404 until `yarn grunt newer:copy:static` is run from
   `apps/`.
5. Open the dataset in the lab and select each column to check that its
   description and type are right.

## Running and testing

There is no standalone server. Run dashboard and apps as `apps/README.md`
describes, and open an AI Lab level that has `uses_lab2` set.

From `apps/`:

```bash
yarn test:unit test/unit/ailab/ test/unit/lab2/levelEditors/ailab
```

```bash
yarn typecheck
```

From `dashboard/`:

```bash
bundle exec spring testunit ./test/models/levels/ailab_test.rb
```
