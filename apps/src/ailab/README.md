# AI Lab

AI Lab teaches supervised machine learning on tabular data. A student picks a
dataset or uploads a CSV, chooses a column to predict (the label) and the
columns to predict it from (the features), trains a model, and tests it on
rows held back from training. A model is a k-nearest neighbors model or a
decision tree; the label's column type decides between classification and
regression.

Two versions run in production, chosen per level by its `uses_lab2` property.

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
| `apps/static/skins/ailab/` | Datasets and images, served at `/blockly/media/skins/ailab/`. |
| `apps/src/lab2/levelEditors/ailabMode/`, `ailabDynamicInstructions/` | Levelbuilder editors for `mode` and per-screen instructions. |
| `apps/src/levelbuilder/lesson-generator/ai/ailab/` | AI-drafted AI Lab levels for the lesson generator. |
| `apps/src/MLTrainers.js` | Rebuilds a saved model in App Lab. |
| `dashboard/app/models/levels/ailab.rb` | Level model: validates `mode`, derives the accuracy validation, writes long instructions for lesson plans. |
| `apps/test/unit/ailab/` | Unit tests for `engine/` and `lab2/`. |

## How it fits together

`lab2/views/AilabView.tsx` loads the student's project through `useSources`
and shows the Lab 2 loading screen until the project, the dataset and any
pretrained or restored model are ready. `AilabWorkspace.tsx` parses the level's `mode`,
calls `loadLevel(mode)` before paint, and renders the resource panel beside
`AilabEngine`.

The engine keeps state in three places:

- The Redux store (`engine/store.ts`), a module singleton holding the dataset,
  `mode`, the current panel and UI state. `loadLevel` resets it on every level
  change.
- `ProjectContext`, the student's columns, hyperparameters, test rows and
  results. This is the project source (`AilabProject` in `engine/types.ts`);
  `lab2/sources.ts` drops anything in a saved source that does not fit it.
- `TrainingDataContext`, the trained model. It is not saved: `useRestoreModel`
  retrains it from the saved hyperparameters and test rows when a project
  opens.

### Panels

`selectDataset` comes first unless the level names a dataset. `datasetView`
and `results` follow; the header's Dataset and Testing tabs switch between
them, and `TrainingModal` runs a training pass on the way from one to the
other.

Lab 2 does not yet let students save a trained model for use in App Lab.
`saveModel` and `modelSummary` remain from the legacy flow, but nothing in
Lab 2 opens them.

TODO: Update this section, and `hideSave` below, when Lab 2 supports saving
models.

### Trainers

`engine/trainers/` has one class per family: `knn` (`ml-knn`) and
`decisionTree` (`ml-cart`). `mode.trainer` picks the family and the label's
column type picks classification or regression. A saved model records that
pair as a trainer id (`knnClassify`, `treeRegress`, and so on) for
`apps/src/MLTrainers.js` to read, so a new family needs a loader there too.

A categorical prediction is correct when it matches the label exactly; a
numerical one, when it falls within 5% of the label column's range.

### Progress

When `mode.requireAccuracy` is set, `Ailab#get_validations` adds an
`ACCURACY_AT_LEAST` condition, and `lab2/AccuracyValidator.ts` checks it
against the latest training run.

### Instructions

Each screen has an instructions key (`INSTRUCTIONS_KEYS` in
`engine/types.ts`). Its text is the level's `dynamicInstructions` entry, else
the translated string in `locale.ts`, else `defaultText` in
`engine/lab2-instructions.json`. Dashboard reads the same file to write a
level's long instructions for lesson plans.

### Decision tree

`UIComponents/DecisionTree.tsx` draws nodes as positioned HTML over an
`aria-hidden` SVG of edges, laid out by `helpers/displayTreeLayout.ts`.
`TreeCanvas.tsx` pans and zooms both layers with `d3-zoom`. Graph libraries
that own the node DOM, such as React Flow, were rejected because their
keyboard and ARIA behavior conflicts with the tree's.

## Level configuration

`mode` is a JSON object. `Ailab#validate_lab2_mode` enforces the rules between
keys below, and the levelbuilder editor drops keys Lab 2 does not read.

| Key | Effect |
| --- | --- |
| `datasets` | At most one dataset id. With one, the level loads it and skips the picker. With none, the picker offers every dataset not marked `isToy`, and a CSV upload. |
| `trainer` | `knn` (default) or `decisionTree`. |
| `hyperparameters` | `{"k": n}` for `knn`, `{"maxDepth": n}` for `decisionTree`. |
| `label`, `features` | Columns chosen when the dataset loads. |
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
   `mode.datasets`. The level model rejects ids missing from the manifest.
3. In the metadata, list every column under `fields` with its `id`, `type`
   (`categorical` or `numerical`) and `description`. `card` holds the
   description, source and potential uses shown in the About this data panel.
   `defaultLabelColumn` and `defaultIdColumn` are optional. `Metadata` in
   `engine/types.ts` has the full shape.
4. `yarn start` does not copy `apps/static/` when it starts, so new files 404
   until `yarn grunt newer:copy:static` is run from `apps/`.
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
