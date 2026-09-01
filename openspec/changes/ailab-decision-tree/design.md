## Context

AI Lab trains a model from a table of data. The student picks a label column and one or more feature columns. The lab trains, reports accuracy, and lets the student predict from new values. The student can then save the model and use it from App Lab.

Today the lab has one algorithm. `frontend/packages/labs/ailab/src/trainers/KNNTrainer.ts` wraps `ml-knn`, a kd-tree KNN classifier that votes over Euclidean distance. Four places name the algorithm directly:

- `src/train.ts:137` constructs `new KNNTrainer(store)`. There is no registry.
- `src/redux.ts:64` types `trainedModel` as `KNN | undefined`.
- `src/types.ts:1` imports the `ml-knn` type for `KNNTrainedModelDetails`.
- `src/redux.ts:563` derives `selectedTrainer` from `isRegression(state)`, not from a chosen algorithm.

`KNNTrainer.getOptimalModelDetails` is the closest thing to a hyperparameter sweep. It trains one model for each candidate `k`, and it keeps the most accurate model. The candidates come from `possibleKValues` and `calculatePotentialKValues`.

The sweep reads its own accuracy through Redux. `batchPredict` dispatches `setAccuracyCheckPredictedLabels`. `getAccuracyPercent` then reads that value back out of the store. The two calls must stay in this order, or the accuracy compares against the predictions of the previous `k`.

### Two copies of the machine learning code

AI Lab runs on two stacks, and each stack runs a different copy of this code.

- Lab1 uses `@code-dot-org/ml-playground` 0.0.52, a published package built from a separate repository. `apps/package.json` sets the version.
- Lab2 uses `@code-dot-org/ailab` 0.0.52 at `frontend/packages/labs/ailab`, linked with `portal:`. It is a TypeScript port of ml-playground, forked at the same version.

A level chooses its stack. `uses_lab2` is a serialized attribute on the `Ailab` level model. Three of 189 level files set it, and all three are internal test levels. Every curriculum level still runs Lab1.

Both stacks share the prediction path. `apps/src/MLTrainers.js` reloads a saved model and predicts from it, and App Lab calls it through `apps/src/lib/util/mlApi.js`. That file is Lab1 code, but a Lab2 level saves models that reach it.

### Decisions taken before this design

The feature is Lab2 only. ml-playground keeps KNN. There is no backport, and no npm publish.

New user interface strings are not a constraint. The localization system that replaces the old string pipeline handles them.

## Goals / Non-Goals

**Goals**

- Give AI Lab a second algorithm that a student can read.
- Add a trainer interface to the TypeScript package. A third algorithm is then a small change.
- Give the lab real regression. A decision tree returns the mean of a leaf, not one of the label values that it saw.
- Keep App Lab prediction working for both algorithms, and for models saved before this change.

**Non-Goals**

- A backport to `@code-dot-org/ml-playground`.
- The migration of curriculum levels to Lab2. This change depends on that work; it does not do it.
- A student-facing control for the algorithm or for the tree depth. Decision 4 makes one possible later.
- Feature scaling for KNN. A tree does not need it, and KNN behavior does not change here.
- A fix for the sweep that selects on the accuracy-check split. See Risk 3.
- A tree visualization panel. See Open Questions.

## Decisions

### 1. Library: `ml-cart` 2.1.1

`ml-cart` is the mljs CART implementation, from the same family as `ml-knn`. It exports `DecisionTreeClassifier` and `DecisionTreeRegression`. Both have `toJSON()` and a static `load(model)`, which is the contract that `getTrainedModelDataToSave` and `MLTrainers.predict` already depend on.

Behavior confirmed against the published 2.1.1 package:

- The JSON round-trip works. `load(JSON.parse(JSON.stringify(model.toJSON())))` predicts identically. A tree for a 12-row set serializes to about 1 KB, far smaller than a kd-tree.
- `DecisionTreeRegression.predict` returns the mean of the matching leaf. It interpolates.
- The classifier takes labels as class indices and returns a class index. AI Lab already converts a categorical label to a contiguous integer through `featureNumberKey`, so the existing `getKeyByValue` reverse mapping works unchanged.
- Constructor options are `gainFunction`, `splitFunction`, `minNumSamples`, `maxDepth` and `gainThreshold`.

Alternatives rejected: a hand-written CART, because a teaching lab does not need bespoke machine learning code; a TensorFlow.js forest, because it is large and it has no matching JSON contract.

Use the exact version. mljs packages change rarely, and we maintain the types.

### 2. Trainer interface and registry

Add `src/trainers/types.ts` with a `Trainer` interface: `startTraining(store)`, `predict(testValues)`, and `batchPredict(examples)`. Add a registry that maps a trainer id to a constructor. `train.ts` reads `mode.trainer`, looks up the constructor, and builds the trainer.

The trainer id becomes the single source of truth for `selectedTrainer` in the saved model. Today that field is derived from `isRegression`.

Keep the existing id strings. `apps/src/MLTrainers.js` dispatches on them, and every model saved so far carries one:

| Trainer family | Categorical label | Numerical label |
| -------------- | ----------------- | --------------- |
| `knn`          | `knnClassify`     | `knnRegress`    |
| `decisionTree` | `treeClassify`    | `treeRegress`   |

The level picks the family. The label column type still picks classification or regression, exactly as today.

### 3. Level selects the trainer through `mode` JSON

`mode.trainer` takes `knn` or `decisionTree`. An absent value means `knn`.

The level editor needs no change. `dashboard/app/views/levels/editors/_ailab.html.haml` already renders `fields/ailab_mode`, a free-form Mode JSON text area, and `fields/lab2`, the Lab2 checkbox. A level builder pastes the field.

An unknown value falls back to `knn` and logs a warning. A typo in hand-edited level JSON must not give a student a blank lab.

### 4. Hyperparameters: sweep `maxDepth`, prefer the shallowest tree

Start with a sweep, for two reasons. It mirrors the KNN sweep that the curriculum already assumes, and it needs no product decision to ship.

Candidate depths are `[1, 2, 3, 5, 8]`. Train one tree per depth, then keep the most accurate. **On a tie, keep the shallowest tree.** This differs from the KNN sweep, which keeps the first candidate that scores highest. A shallow tree is the pedagogical point, so the tie-break is deliberate.

Set `minNumSamples` to 1, not to the library default of 3. Measured on a 9-row training set, the default misclassifies training rows that `minNumSamples: 1` classifies correctly. AI Lab datasets are small. A large minimum leaf size makes a tree that has only one leaf. Such a tree always predicts the most frequent label.

Two later options need no schema change:

- A level builder sets the depth. `mode` is already an open object, so `mode.maxDepth` is additive.
- A student sets the depth. This needs a control and a curriculum decision, not a data change.

The saved model records what the sweep chose, so a level that later fixes the depth stays readable in the model card.

### 5. Saved model: `hyperparameters` replaces `kValue`

`ModelDataToSave.kValue` is a top-level nullable number. It has no meaning for a tree. Replace it with `hyperparameters: Record<string, number>`.

- A KNN model writes `hyperparameters: {k}` **and** the legacy `kValue`. One release of both keeps a rollback of the reader safe.
- A tree model writes `hyperparameters: {maxDepth, minNumSamples}` only.
- Every reader takes `hyperparameters` first, then falls back to `kValue`.

Retire the `kValue` write in a follow-up change, after the reader ships everywhere.

There is no data migration. `api/v1/ml_models#save` uploads the blob to S3 and validates no shape.

### 6. `MLTrainers.predict` gets a tree branch

`apps/src/MLTrainers.js` keys on `selectedTrainer` and returns `'Error: unknown trainer'` for anything it does not know. Add `treeClassify` and `treeRegress`.

This file is Lab1 code. The change only adds a branch, so no Lab1 behavior changes. The change is still necessary for a Lab2-only feature. A student trains a tree in a Lab2 AI Lab level, then predicts from it in App Lab. App Lab sends every prediction through this file.

Two shape differences matter, both confirmed against 2.1.1:

- `ml-cart` `predict` needs a two-dimensional array. `predict([0, 0])` throws `TypeError: Data must be a 2D array with at least one element`. The current code calls `model.predict(testValues)` with a flat array, which `ml-knn` accepts. The tree branch must wrap the row and unwrap the result.
- `load` throws `RangeError` when `model.name` does not match. Catch it and return the existing error string, so a corrupt blob does not break the student's app.

### 7. `convertTestValue` uses `parseFloat`

`convertTestValue` in `apps/src/MLTrainers.js` ends with `parseInt(convertedValue)`. Every continuous feature value is truncated at prediction time, while `convertValueForTraining` in the lab uses `parseFloat`. A temperature of 72.8 trains as 72.8 and predicts as 72.

The bug also affects KNN today, but the symptom is not visible. It moves a point before the distance calculation. A tree makes the result worse. If a threshold is between two integers, the truncated value goes down the other branch.

Change it to `parseFloat`. A categorical value still resolves through `featureNumberKey` first, so its integer is unaffected.

### 8. Accuracy grading becomes a pure function

Add `gradeAccuracy(predictedLabels, expectedLabels, options)` to `src/helpers/accuracy.ts`. It returns the grades and the percentage. Options carry the regression tolerance and the label range.

The sweep calls it directly. The existing selectors keep their signatures and call the same function over store state, so no user interface component changes.

This removes the ordering trap in the current sweep, and it stops each new trainer from inheriting it.

### 9. `this.knn` no longer holds the losing model

`KNNTrainer.getOptimalModelDetails` leaves `this.knn` set to the model for the last candidate `k`, not the best one. Nothing depends on it today, because `predict()` reads `state.trainedModel`. The new interface makes the trainer hold its own model, so fix it here rather than copy it into the tree trainer.

## Risks / Trade-offs

1. **Reach depends on level authoring.** The feature is invisible until Lab2 AI Lab levels exist. That is curriculum work, and the Lab2 path has only ever been exercised by three internal test levels. A QA pass on Lab2 AI Lab is a release gate, not a nicety.
2. **The fork becomes permanent.** ml-playground and the TypeScript package diverge for good. A bug fixed in one has no counterpart in the other. This is the accepted cost of not backporting, and it is also what lets this change refactor freely.
3. **The sweep still selects on the accuracy-check split.** The reserved 10% selects the hyperparameter. It also gives the accuracy that the student sees. The number is therefore the best of several attempts on one split. The tree sweep has the same behavior. A change here changes every reported accuracy in the curriculum. It therefore needs its own openspec change and curriculum review.
4. **A tree can look worse than KNN on the same data.** A depth-limited tree on a small noisy dataset can score below KNN. Levels should choose data where the tree has something to split on.
5. **`ml-cart` is low-activity.** Use an exact version, write the types in this repository, and keep the round-trip test. The test is the first indication of a problem.

## Migration Plan

No deployment phases and no data migration. **One ticket is one PR**; the phases below group
tickets by purpose, and the merge order is the ticket order within a phase. See `tasks.md`.

- **Phase 1** — Trainer interface, registry, pure grading, and the `hyperparameters` field. Nine
  PRs, none of which changes behavior. The first records current behavior in characterization
  tests, so the other eight are reviewed against it.
- **Phase 2** — `ml-cart`, `DecisionTreeTrainer`, `mode.trainer`, the `MLTrainers.js` tree
  branch, and the `parseFloat` fix. Five PRs. The tree is unreachable from any level until the
  `mode.trainer` PR lands.
- **Phase 3** — Level authoring and QA. One PR, plus a curriculum decision and two manual passes
  that produce none.

One ordering constraint spans PRs: the App Lab `hyperparameters` reader must deploy before the
writer that produces the field.

Rollback for a phase 1 or phase 2 PR is a revert. A tree model saved before a revert becomes
unreadable in App Lab, and returns the existing `'Error: unknown trainer'` string. Only levels
that opted in can produce one.

## Open Questions

- Which depths does the curriculum want in the sweep? `[1, 2, 3, 5, 8]` is a starting point, not a considered pedagogy.
- Does a student control the depth, and at which point in the lesson? The design allows it without a schema change. The product decision is open.
- Who authors the Lab2 decision tree levels?
- Does a tree need a visualization panel? A model that a student can draw is the reason to add a tree. The lab currently shows no model structure for any algorithm.

## Settled — and why these are absent from the design

- **A student-facing algorithm picker.** Not in this change. `mode.trainer` covers every level the curriculum can author now, and a picker needs design work that would gate the algorithm on it.
- **New localization strings.** Not a constraint. The new localization system handles them.
- **The RFC-2119 verb `SHALL` in the specification files.** These documents follow ASD-STE100,
  which prescribes "must" for an obligation. The specification files keep `SHALL` anyway, because
  the openspec schema uses it and so does the other openspec change in this repository.
  Consistency inside the repository is more important than strict compliance on one word.
- **A `kValue` data migration.** Not needed. Readers take `hyperparameters` first and fall back, and no stored model is rewritten.
