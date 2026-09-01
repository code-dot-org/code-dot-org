# Implementation tasks

**One ticket is one PR.** The three sections below are phases, not PRs. Each phase groups the
tickets that share a purpose; the merge order inside a phase is the ticket order.

Fifteen tickets produce a PR. Three produce none: one curriculum decision and two manual QA
passes. Those three are marked in the ticket set and carry a `no-pr` label.

| Phase | Purpose | Tasks | Tickets | PRs |
| ----- | ------- | ----- | ------- | --- |
| 1 | Trainer interface, no behavior change | 1-2 | 9 | 9 |
| 2 | The decision tree | 3-5 | 5 | 5 |
| 3 | Levels and QA | 6 | 4 | 1 |

Phase 1 changes no behavior. Task 1.8 and 2.7 move to the **front** of that phase rather than
the end. A characterization test that you write after a refactor records the behavior of the
changed code. It does not record the behavior of the code before the change. Every later
ticket in the phase must pass that suite.

Three tickets depend on nothing in the change and can start immediately: the App Lab
`hyperparameters` reader (2.5), the `ml-cart` dependency (3.1-3.2a), and the `parseInt` fix
(5.4). Note the ordering constraint on the first of those — the reader (2.5) must deploy
**before** the writer (2.4), so a rollback of either side stays safe.

The Jira set for these tasks is `ailab-decision-tree-jira.csv`, in this directory.

## Phase 1 — Trainer interface, no behavior change

Every existing level must behave identically after every ticket in this phase. The trainer registry has one entry, and `mode.trainer` is not read yet.

### 1. The `Trainer` interface and the registry

- [ ] 1.1 Add `src/trainers/types.ts` with the `Trainer` interface (`startTraining`, `predict`, `batchPredict`) and a `TrainerId` union covering `knnClassify`, `knnRegress`, `treeClassify` and `treeRegress`
- [ ] 1.2 Add the registry: a map from trainer family to constructor. Give it one entry, `knn`
- [ ] 1.3 Change `train.ts:137` to build the trainer from the registry instead of `new KNNTrainer(store)`. Read no `mode` field yet; default to `knn`
- [ ] 1.4 Make `KNNTrainer` implement the interface. Keep every existing method and every existing `k` candidate rule unchanged
- [ ] 1.5 Remove the `ml-knn` type from `redux.ts:64` and from `types.ts:1`. Type `trainedModel` through the interface. Keep the `serializableCheck` exception in `store.ts`, and update its comment: the model is no longer specifically a KNN instance
- [ ] 1.6 Change `redux.ts:563` to take `selectedTrainer` from the trainer id rather than from `isRegression`. For a KNN level the resulting string must be byte-identical to today's, since `MLTrainers.js` and every stored model depend on it
- [ ] 1.7 Fix the stale `this.knn` in `getOptimalModelDetails` (design Decision 9): the trainer must hold the winning model, not the model for the last candidate `k`
- [ ] 1.8 Write a test that a KNN level's saved data is unchanged by this PR: same `selectedTrainer`, same `kValue`, same predictions for the same seeded dataset

### 2. Pure grading and the `hyperparameters` field

- [ ] 2.1 Add `gradeAccuracy(predictedLabels, expectedLabels, options)` to `src/helpers/accuracy.ts`. Return the grades and the percentage. Carry the regression tolerance and the label range in the options
- [ ] 2.2 Reimplement `getAccuracyClassification` and `getAccuracyRegression` over `gradeAccuracy`. Keep their signatures, so no user interface component changes
- [ ] 2.3 Change the `k` sweep to call `gradeAccuracy` directly. Remove the dispatch-then-read-back pair (`batchPredict` dispatching `setAccuracyCheckPredictedLabels`, then `getAccuracyPercent` reading it). Dispatch the winning predictions once, after the sweep
- [ ] 2.4 Add `hyperparameters: Record<string, number>` to `ModelDataToSave` in `types.ts`. Populate it with `{k}` for a KNN model, and keep writing the legacy `kValue` (design Decision 5)
- [ ] 2.5 Teach `apps/src/MLTrainers.js` to read `hyperparameters` first and fall back to `kValue`. This ships before any writer needs it, so a rollback of either side is safe
- [ ] 2.6 Write a unit test for `gradeAccuracy`: exact match for a categorical label, the 5%-of-range tolerance for a numerical label, and an empty prediction list
- [ ] 2.7 Add a round-trip test for KNN that does not exist today: train, `toJSON`, `load`, predict, and compare. It is the regression guard for section 5

## Phase 2 — The decision tree

### 3. The library and its types

- [ ] 3.1 Add `ml-cart` at the exact version 2.1.1 to `frontend/packages/labs/ailab/package.json` and to `apps/package.json`. Use the exact version, not a caret range (design Decision 1). This departs from the neighboring `ml-knn` entries, which both use `^3.0.0`; the reason is that the types are hand-written in this repository and a minor bump can silently invalidate them
- [ ] 3.2 Add a `ml-cart` declaration block to `src/declarations.d.ts`, patterned on the existing `ml-knn` block. Declare `DecisionTreeClassifier` and `DecisionTreeRegression`, each with a constructor taking `{gainFunction?, splitFunction?, minNumSamples?, maxDepth?, gainThreshold?}`, plus `train`, `predict`, `toJSON` and a static `load`
- [ ] 3.2a Type `predict` as taking `number[][]` and returning `number[]`. A flat array throws at runtime (`TypeError: Data must be a 2D array with at least one element`), so the type must not allow one

### 4. `DecisionTreeTrainer`

- [ ] 4.1 Add `src/trainers/DecisionTreeTrainer.ts` implementing `Trainer`. Pick `DecisionTreeClassifier` or `DecisionTreeRegression` from `isRegression(state)`
- [ ] 4.2 Sweep `maxDepth` over `[1, 2, 3, 5, 8]`. Train one tree per depth, grade each with `gradeAccuracy`, and keep the most accurate
- [ ] 4.2a On equal accuracy keep the **lower** depth (design Decision 4). This differs from the `k` sweep, which keeps the first highest scorer. Write the test for this rule: two depths with equal accuracy, and the trainer stores the shallower model
- [ ] 4.3 Pass `minNumSamples: 1`, not the library default of 3. Measured on a 9-row training set, the default misclassifies training rows that 1 classifies correctly, because AI Lab datasets are small
- [ ] 4.4 Record `{maxDepth, minNumSamples}` in `hyperparameters`. Write no `kValue`
- [ ] 4.5 Register the trainer under the `decisionTree` family, mapping to `treeClassify` and `treeRegress` by label column type
- [ ] 4.6 Write a trainer test on the `test/unit/train.test.js` pattern: build a store, dispatch data, `train.init`, `onClickTrain`, `onClickPredict`, and assert the prediction
- [ ] 4.7 Write a regression test that a prediction can fall between observed label values. This behavior is the difference between the regression tree and the KNN "regression" that it replaces
- [ ] 4.8 Write the JSON round-trip test for both tree kinds

### 5. Level selection and App Lab prediction

- [ ] 5.1 Add `trainer?: 'knn' | 'decisionTree'` to the `Mode` interface in `types.ts`
- [ ] 5.2 Read `mode.trainer` in `train.ts` when building the trainer. An absent value gives `knn`
- [ ] 5.2a An unrecognized value logs a warning and falls back to `knn` (design Decision 3). A typo in hand-edited level JSON must not give a student a blank lab. Test it
- [ ] 5.3 Add the `treeClassify` and `treeRegress` branch to `apps/src/MLTrainers.js`. Reload with the matching static `load`
- [ ] 5.3a Wrap the feature row in an array for `predict`, and unwrap the single result. The existing KNN call passes a flat array, which `ml-cart` rejects
- [ ] 5.3b Catch the `RangeError` that `load` raises when `model.name` does not match the algorithm, and return the existing prediction error string. A corrupt blob must not break the student's running App Lab program
- [ ] 5.4 Change `convertTestValue` from `parseInt` to `parseFloat` (design Decision 7). Add a test that a feature value of 72.8 reaches the model as 72.8. Add a second test that a categorical value still resolves to its integer through `featureNumberKey`
- [ ] 5.4a Note for review, not a code task: this fix also improves KNN prediction from App Lab. It is the only behavior change in this PR that affects existing levels. State it in the PR description, so that a reviewer does not have to find it
- [ ] 5.5 Write a `MLTrainers.predict` test per algorithm: a saved KNN blob and a saved tree blob both predict correctly, and an unknown trainer id returns `'Error: unknown trainer'`
- [ ] 5.6 Run `yarn run typecheck`, `pnpm lint` in the package, and the package's `vitest` suite

## Phase 3 — Level authoring and QA

Mostly not code in this repository. Only task 6.3 produces a PR. This section is here to give the release an owner. No student sees phase 2 without it.

### 6. Lab2 levels and a QA pass

- [ ] 6.1 Confirm with curriculum which depths belong in the sweep. `[1, 2, 3, 5, 8]` is a starting point (design Open Questions)
- [ ] 6.2 Choose or build a dataset where a shallow tree splits meaningfully. A depth-limited tree on small noisy data can score below KNN (design Risk 4)
- [ ] 6.3 Author the Lab2 decision tree levels: set `uses_lab2`, and put `"trainer": "decisionTree"` in the Mode JSON. Both controls already exist in the level editor
- [ ] 6.4 QA the Lab2 AI Lab path itself, end to end, on a real level. Only three internal test levels have ever run it (design Risk 1). Cover the panel flow, the accuracy gate, saving a model, and progress on continue
- [ ] 6.5 QA the full loop across stacks: train a tree in a Lab2 level, save it, then predict from it in App Lab
- [ ] 6.6 Confirm a KNN level saved before the first ticket still predicts correctly in App Lab after every ticket deploys

## Follow-ups, deliberately not in this change

Three of these now have tickets, in phases 4 to 6 of the Jira set. They stay out of this
openspec change because each one follows the first release.

- Retire the legacy `kValue` **write**, once the `hyperparameters` reader has shipped everywhere
  (design Decision 5). The reader keeps its fallback permanently: stored models live in S3
  forever, and every model saved before the field carries only `kValue`. Ticketed.
- A student-set tree depth. The trainer first accepts a depth from outside the sweep.
  This also gives a level builder a `mode.maxDepth` value. Ticketed as two PRs.
- A tree visualization panel. Ticketed as a design decision plus two PRs: a pure translation of
  the serialized tree into named features and readable conditions, then the panel itself.

One follow-up stays unticketed, and not for want of scoping:

- [ ] The sweep selects on the accuracy-check split (design Risk 3). The reserved 10% both
  chooses the hyperparameter and produces the accuracy the student sees, so the number is the
  best of several tries on one split. Both sweeps have this behavior. A change here moves every
  reported accuracy in the curriculum. It is therefore a curriculum change as much as an
  engineering change. It needs its own openspec change and curriculum review.

## Notes for the visualization work

Three facts about `ml-cart` 2.1.1, measured rather than read from its documentation,
constrain any tree drawing:

- **A leaf carries no sample count.** Only an internal node has `numberSamples`. A leaf has a
  proportional `distribution`, so "18 of 25 examples" is not recoverable from the model. Showing
  counts means pushing the training rows down the tree in the lab.
- **`distribution` is a ragged proportional row.** `[[0,0,1]]` means class 2 at 100%, and the
  array length is NOT the class count — the library sizes it by the classes present in that leaf.
  A tie reads as `[[0,0.5,0.5]]`, and the library resolves it to the first class. A
  `DTRegression` leaf is a plain number instead, the leaf mean.
- **A categorical split has no natural reading.** CART splits an ordinal-encoded categorical
  feature on a numeric threshold, so a split renders as `shape < 1.5`. The panel needs a rule for
  this, or the levels avoid categorical features.
