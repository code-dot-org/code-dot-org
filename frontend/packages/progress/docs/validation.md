# Lab2 validation

How a Lab2 level decides whether the student may continue, and what feedback
they see on the way.

## The model

A level carries a list of validations, written by levelbuilders in JSON (the
levelbuilder UI is described in #53142). Each validation is a set of
conditions, a message, and a `next` flag:

```json
{
  "conditions": [{"name": "played_sounds_together", "value": 2}],
  "message": "Nice work, we're getting a groove going!",
  "next": true,
  "key": "played-together"
}
```

When every condition of a validation holds, the student sees its message; if
`next` is true, the level is satisfied and they may continue. A validation
with `next: false` is feedback only. Validations are checked in order and the
first match wins.

What a condition name means is up to the lab. A condition the lab does not
recognise is skipped, so levelbuilders can write conditions before the lab
supports them. Java Lab and Python Lab levels carry no written validations;
the server derives one, `PASSED_ALL_TESTS`, from the level's test file.

Core parses validations as part of the level properties
(`ValidationSchema`, `ConditionSchema` in `@code-dot-org/core/api`).

This is the system Music Lab introduced (#50596), itself close to what Star
Wars (2015) and AI for Oceans (2019) used.

## The pieces

- `ProgressManager` runs the loop and knows nothing of any lab. It holds the
  level's validations and a `Validator`, and after each run asks the
  validator which conditions hold.
- A `Validator` is the lab's side: `MusicValidator` and `DanceValidator` in
  apps are the reference implementations. `clear(isChangingLevels)` tells it
  whether the student is re-running the same level or has moved on.
- `ConditionsChecker` is a helper for validators that accumulate satisfied
  conditions while user code runs. Labs that inspect code directly do not
  need it. `?log-validator-condition-changes=true` logs each condition as it
  is met.
- `TestResultValidator` and a lab's `ValidationTracker` implement
  `PASSED_ALL_TESTS` for labs that validate with levelbuilder-written tests.
  On a re-run the tracker keeps the test names, pending, so the results table
  can show them while the tests run.
- `ProgressContainer` owns the manager for a lab: it resets it when the level
  changes, mirrors its state into the progress slice as `validationState`,
  and reports success on a script level once the level is satisfied.
- `continueOrFinishLesson` is the Continue button. It records success where
  no other path owns it (not validated, submittable, predict or bubble
  choice), then moves to the next level or finishes the lesson.

Exemplar validation, where set on a level, compares the student's work with
the level's exemplar and applies on top of the written validations; it is off
while the exemplar itself is being edited.
