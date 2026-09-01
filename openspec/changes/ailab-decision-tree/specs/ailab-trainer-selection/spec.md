## ADDED Requirements

### Requirement: A level selects the machine learning algorithm
A level SHALL select the trainer family through the `trainer` field of its `mode` JSON. Valid values are `knn` and `decisionTree`. When the field is absent, the lab SHALL use `knn`.

#### Scenario: Level selects the decision tree
- **WHEN** a level's `mode` JSON contains `"trainer": "decisionTree"`
- **THEN** the lab builds a decision tree trainer, and the train step produces a decision tree

#### Scenario: Level does not name a trainer
- **WHEN** a level's `mode` JSON has no `trainer` field, as all existing AI Lab levels do
- **THEN** the lab builds a KNN trainer, and the level behaves exactly as before this change

#### Scenario: Level names an unknown trainer
- **WHEN** a level's `mode` JSON contains a `trainer` value that no registry entry matches
- **THEN** the lab logs a warning, falls back to `knn`, and the student sees a working lab rather than a blank panel

#### Scenario: Level builder sets the trainer without a new editor field
- **WHEN** a level builder edits an AI Lab level in the level editor
- **THEN** the existing free-form Mode JSON text area accepts the `trainer` field, and no new editor control is required

### Requirement: The label column type selects classification or regression
The trainer family SHALL come from the level. The choice between classification and regression SHALL continue to come from the label column type, as it does today.

#### Scenario: Decision tree with a categorical label
- **WHEN** a level selects `decisionTree` and the student picks a categorical label column
- **THEN** the lab trains a classification tree, and records the trainer id `treeClassify` in the saved model

#### Scenario: Decision tree with a numerical label
- **WHEN** a level selects `decisionTree` and the student picks a numerical label column
- **THEN** the lab trains a regression tree, and records the trainer id `treeRegress` in the saved model

#### Scenario: Existing trainer ids are unchanged
- **WHEN** a KNN model is saved after this change
- **THEN** its `selectedTrainer` value is `knnClassify` or `knnRegress`, the same strings that models saved before this change carry

### Requirement: The saved model records its hyperparameters
A saved model SHALL carry a `hyperparameters` object that names the values the trainer chose. It replaces the top-level `kValue` field, which has no meaning for a trainer other than KNN.

#### Scenario: KNN model records k
- **WHEN** the lab saves a KNN model
- **THEN** the saved data contains `hyperparameters` with the chosen `k`, and also the legacy top-level `kValue` for one release

#### Scenario: Decision tree model records depth
- **WHEN** the lab saves a decision tree model
- **THEN** the saved data contains `hyperparameters` with the chosen `maxDepth` and the `minNumSamples` used, and no `kValue` field

#### Scenario: A model saved before this change is still readable
- **WHEN** a reader loads a model that carries `kValue` and no `hyperparameters`
- **THEN** the reader takes the value from `kValue`, and prediction succeeds

#### Scenario: Reader prefers the new field
- **WHEN** a reader loads a model that carries both `hyperparameters` and `kValue`
- **THEN** the reader takes the value from `hyperparameters`

### Requirement: App Lab predicts from a model of either algorithm
`MLTrainers.predict` SHALL reload and predict from a KNN model and from a decision tree model. A model that names an algorithm it does not know SHALL return the existing error string rather than throw.

#### Scenario: App Lab predicts from a saved decision tree
- **WHEN** an App Lab program calls `getPrediction` with the id of a model whose `selectedTrainer` is `treeClassify` or `treeRegress`
- **THEN** the system reloads the tree from its JSON, predicts from the supplied feature values, and returns the label in human-readable form

#### Scenario: Prediction input is passed as a matrix
- **WHEN** the system predicts from a decision tree for one set of feature values
- **THEN** it passes the row inside a two-dimensional array and returns the single result, because `ml-cart` rejects a flat array

#### Scenario: A corrupt or mismatched model blob
- **WHEN** the stored JSON does not match the algorithm that `selectedTrainer` names, and the library raises on load
- **THEN** the system returns the existing prediction error string, and the student's App Lab program continues to run

#### Scenario: An unknown trainer id
- **WHEN** a saved model names a trainer that no branch handles
- **THEN** the system returns `'Error: unknown trainer'`, unchanged from today

### Requirement: Continuous feature values are not truncated at prediction time
The App Lab prediction path SHALL convert a numerical feature value with `parseFloat`. `parseInt` truncates the value, while the lab trains on the result of `parseFloat`.

#### Scenario: A fractional feature value reaches the model intact
- **WHEN** an App Lab program predicts with a numerical feature value of 72.8
- **THEN** the model receives 72.8, not 72

#### Scenario: A categorical feature value is unaffected
- **WHEN** an App Lab program predicts with a categorical feature value
- **THEN** the value resolves through `featureNumberKey` to its integer, exactly as before

### Requirement: Accuracy grading is independent of the store
Grading SHALL be a pure function of the predicted labels, the expected labels, and the grading options. A trainer SHALL NOT write predictions to Redux and then read its own accuracy back.

#### Scenario: A hyperparameter sweep grades each candidate
- **WHEN** a trainer trains one model per candidate hyperparameter value and compares their accuracy
- **THEN** the trainer grades each candidate from the predictions of that candidate. The order of the calls therefore cannot grade one candidate against the predictions of another

#### Scenario: The user interface reports the same number
- **WHEN** a results panel reads the accuracy of the trained model
- **THEN** it reads a selector over store state that calls the same grading function, and the value matches what the sweep computed
