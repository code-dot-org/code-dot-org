# Adaptive

Lab2 player for the `Adaptive` level type. The level row holds only a
content id; the content is a JSON file at
`dashboard/config/level_content/adaptive/<id>.json`, served to the client
inside the level properties as `adaptiveContent` (see `types.ts`).

## Content

A lesson is a list of steps played in array order. A step's `next` names
the step to go to instead, or `end` to finish the lesson early. Two kinds
exist so far:

- `panels`: a sequence of captions, each with an optional image.
- `question`: multiple-choice questions, one at a time. A question with
  any option marked `correct` gates progression until the chosen set
  matches exactly. A question with none records the answer and moves on.
  `multiSelect` allows more than one choice.

`sample.json` shows both.

## State

`adaptiveRedux.ts` holds the student's position, visited path, completed
steps, answers, and a finished flag. It is saved on every step completion
to the student's UserLevel row through `/user_levels/adaptive_state`, and
restored when the level loads. Nothing is saved when the level is viewed
outside a unit.

Completing a step posts an attempted result through the Lab2 milestone
path. Completing the last step hands off to the standard Lab2 continue
flow, which posts ALL_PASS and moves to the next level.
