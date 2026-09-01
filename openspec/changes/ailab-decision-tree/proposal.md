## Why

AI Lab has one machine learning algorithm: k-nearest neighbors (KNN). Students cannot compare two algorithms, and they cannot read the model that they train. A kd-tree is not legible. A shallow decision tree is legible, and a student can draw one by hand.

The code also has no interface that lets you add a second algorithm. `train.ts` constructs `KNNTrainer` directly. Redux types the trained model as `KNN`. This change adds the interface, then adds the first algorithm that uses it.

The change is Lab2 only. Lab1 AI Lab runs a different copy of the machine learning code: the published package `@code-dot-org/ml-playground`, which comes from a separate repository. That copy keeps KNN only.

## What Changes

- New `Trainer` interface and trainer registry in `@code-dot-org/ailab`. `train.ts`, `redux.ts` and `types.ts` stop naming KNN.
- New dependency `ml-cart` 2.1.1, in `@code-dot-org/ailab` and in `apps`. The package ships no types, so the change adds a declaration block to `src/declarations.d.ts`.
- New `DecisionTreeTrainer`. It sweeps `maxDepth`, and it keeps the most accurate tree. On a tie it keeps the shallowest tree.
- New `trainer` field in the level `mode` JSON. The value is `knn` or `decisionTree`. The default is `knn`, so all 189 existing levels behave as before.
- New `hyperparameters` object in the saved model. It replaces the top-level `kValue` field. AI Lab continues to write `kValue` for KNN models for one release.
- New decision tree branch in `apps/src/MLTrainers.js`, so App Lab can predict from a saved tree.
- `convertTestValue` in `apps/src/MLTrainers.js` changes from `parseInt` to `parseFloat`. `parseInt` truncates every continuous feature value at prediction time. The lab trains on floats.
- Accuracy grading becomes a pure function. A trainer no longer writes predictions to Redux and then reads the accuracy back.

## Capabilities

### New Capabilities

- `ailab-trainer-selection`: A level selects the machine learning algorithm through its `mode` JSON. The lab records the algorithm and its hyperparameters in the saved model, and App Lab predicts from either algorithm.
- `ailab-decision-tree`: A CART decision tree trains, predicts and reports accuracy in AI Lab, for a categorical label and for a numerical label.

### Modified Capabilities

<!-- No existing specs require modification. -->

## Impact

- `frontend/packages/labs/ailab/src/train.ts` — trainer registry replaces the direct `KNNTrainer` construction
- `frontend/packages/labs/ailab/src/trainers/KNNTrainer.ts` — implements the new interface; the accuracy loop no longer passes through Redux
- `frontend/packages/labs/ailab/src/trainers/DecisionTreeTrainer.ts` — new
- `frontend/packages/labs/ailab/src/trainers/types.ts` — new; the `Trainer` interface and the trainer id union
- `frontend/packages/labs/ailab/src/helpers/accuracy.ts` — new pure grading function under the existing selectors
- `frontend/packages/labs/ailab/src/redux.ts` — `trainedModel` no longer has the `KNN` type; `hyperparameters` replaces `kValue`
- `frontend/packages/labs/ailab/src/types.ts` — `Mode.trainer`; `ModelDataToSave.hyperparameters`
- `frontend/packages/labs/ailab/src/constants.ts` — trainer ids for the tree
- `frontend/packages/labs/ailab/src/declarations.d.ts` — `ml-cart` types
- `frontend/packages/labs/ailab/package.json` — `ml-cart` dependency
- `apps/src/MLTrainers.js` — tree branch; `parseFloat`; two-dimensional input for `predict`
- `apps/package.json` — `ml-cart` dependency
- New Lab2 AI Lab levels under `dashboard/config/levels/custom/ailab/` (curriculum work, outside this change)

No data migration. Saved models are opaque JSON in S3, and the readers tolerate both shapes.
