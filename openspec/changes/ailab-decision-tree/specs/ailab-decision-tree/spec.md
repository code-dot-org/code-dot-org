## ADDED Requirements

### Requirement: A decision tree trains on the prepared data
The decision tree trainer SHALL train a CART model from the same prepared training examples and labels that the KNN trainer uses. It SHALL need no change to the data preparation in `train.ts`.

#### Scenario: Categorical features train without further conversion
- **WHEN** a level selects the decision tree and the student picks categorical features
- **THEN** the trainer trains on the integers that `featureNumberKey` already produces, and no additional conversion step is added

#### Scenario: Feature scale does not affect the model
- **WHEN** the selected features have very different ranges, for example a value in thousands beside a value from 0 to 5
- **THEN** the tree is unaffected, because it splits one feature at a time rather than measuring distance across features

#### Scenario: The reserved rows grade the model
- **WHEN** the trainer finishes training
- **THEN** it predicts the reserved accuracy-check examples and reports the percentage correct, through the same grading rules that KNN uses

### Requirement: The trainer sweeps tree depth and prefers a shallow tree
The trainer SHALL train one tree for each candidate `maxDepth`, and SHALL keep the most accurate tree. When two depths score equally, it SHALL keep the shallower tree.

#### Scenario: The trainer keeps the most accurate depth
- **WHEN** the trainer sweeps the candidate depths and one depth scores highest
- **THEN** the trainer keeps that tree, and records its depth in the saved model

#### Scenario: A tie keeps the shallower tree
- **WHEN** two candidate depths produce the same accuracy
- **THEN** the trainer keeps the tree of lower depth, because a shallow tree is the reason to offer a tree at all

#### Scenario: Leaf size suits a small dataset
- **WHEN** the trainer trains on a classroom-sized dataset of roughly ten rows
- **THEN** it uses a minimum leaf size of 1, not the library default of 3. The result is a tree that splits, and not a single leaf that predicts the most frequent label

#### Scenario: The sweep and the reported accuracy share one split
- **WHEN** the trainer selects a depth and the lab reports the accuracy to the student
- **THEN** both use the reserved accuracy-check rows, matching the existing KNN behavior; this known limitation is recorded in the design rather than fixed here

### Requirement: A numerical label produces real regression
With a numerical label column, the decision tree SHALL predict the mean value of the matching leaf. It SHALL NOT be limited to the label values present in the training data.

#### Scenario: A prediction falls between observed label values
- **WHEN** a student predicts from a regression tree whose matching leaf holds several different label values
- **THEN** the returned value is the mean of those values, and it may be a value that appears nowhere in the dataset

#### Scenario: Regression accuracy uses the existing tolerance
- **WHEN** the lab grades a regression tree
- **THEN** a prediction counts as correct when it falls within 5% of the label range, the same rule the lab already applies

### Requirement: A trained tree survives a save and reload
A decision tree SHALL serialize to JSON on save, and SHALL reload from that JSON to a model that predicts identically.

#### Scenario: The model round-trips
- **WHEN** a tree is serialized, stored, and reloaded
- **THEN** the reloaded model returns the same predictions as the model before serialization, for the same inputs

#### Scenario: The stored model card describes the tree
- **WHEN** a student saves a decision tree model
- **THEN** the saved data records the trainer id, the chosen depth, the feature number key, and the dataset details. The model card and App Lab then have all the data they need

### Requirement: The student-facing flow is unchanged
The panels, the navigation, and the accuracy gate SHALL behave the same for a decision tree level as for a KNN level.

#### Scenario: Navigation validation still applies
- **WHEN** a level sets `requireAccuracy` and the student trains a decision tree below that accuracy
- **THEN** the lab blocks the continue action, through the existing validation in `navigationValidation.ts`

#### Scenario: Level progress is reported as before
- **WHEN** a student finishes a decision tree level and continues
- **THEN** progress is reported through the same Lab2 path that a KNN level uses, with no algorithm-specific behavior
