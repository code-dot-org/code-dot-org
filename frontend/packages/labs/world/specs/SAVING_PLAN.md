# Plan: data that survives (APPS.md, missing thing 4)

STATUS: PROPOSED. The fourth of the six things specs/APPS.md says an app
wants, and the one it puts most bluntly: "a note-taking app that forgets
is a drawing of a note-taking app". The working record, as the other plans
are.

## The condition that was set, and meeting it

specs/WORLD_STATE.md ends by refusing this, and says exactly what would
lift the refusal:

> Saving. A world's state is a starting value and whatever the game has
> done to it since; nothing here persists across a reload, and nothing
> should until there is a reason to say what a saved game IS.

So this plan has to say what a saved thing is before it builds one.

**A saved thing is the world's own memory, under a name the project
chooses.** Every property a world declared for itself — a number, a word,
a list — written together under one name, and read back under the same
name. Not actors, not their positions, not which maps are loaded.

That definition is narrow on purpose:

- **Own properties are already the world's memory.** A world declares them
  with `define property`, the engine keeps them in one store, and they are
  exactly what specs/WORLD_STATE.md was written to give a project.
- **Actors are a different question with a different answer.** What a
  saved GAME is — which enemies are alive and where — wants a vocabulary
  for identity across runs that nothing here has. An app's data is not
  that: the notes survive, the screen showing them is rebuilt.
- **The name is in the program, not in the plumbing.** A learner writes
  `save the world's memory as ⟨notes⟩`, so what is saved and what it is
  called are both readable in the blocks. The alternative was keying by
  project, which needs an identity that reaches the running game and which
  would make the same sentence mean something different in two projects
  for reasons nothing on screen explains.

## Where it lives

**In the preview's own storage**, which is the sandbox origin's
(specs/SANDBOX.md). That origin is deliberately isolated from the lab's
session, which is the point: this is the learner's own game data and can
reach nothing of theirs.

**Lent to the world, not reached for.** The engine takes a storage the way
it takes a measuring tape for text — a seam the driver fills in and a
headless world simply does not have. So the check runner and every test
save nothing and lose nothing, which is what a world with no browser
behind it should do.

## What is being built

- **A seam**: `World.useStorage(…)`, and a world with none remembers
  nothing and says so by answering false.
- **`save the world's memory as ⟨name⟩`** — every own property, written
  together.
- **`load the world's memory from ⟨name⟩`** — read them back, and answer
  whether there was anything. A project asks that to tell a first run from
  a later one, which is the whole of what an app's start screen needs.
- **`forget the world's memory of ⟨name⟩`**, because an app that can save
  has to be able to reset.
- **The driver lends the preview's storage**, which is the one half that
  cannot be checked headless.

## Decisions taken before building

- **Whole memory, not selected properties.** "Save these three" wants a
  vocabulary for naming a set of properties that the language does not
  have, and the world's own memory is already the narrow thing.
- **A property the saved data does not mention keeps its value**, rather
  than being reset to its default. A project that adds a property after
  saving should not find its other values wiped, and a default is what an
  unmentioned property already holds.
- **A property the WORLD no longer declares is ignored on load.** Saved
  data outlives edits, and a value nothing can hold is not an error worth
  taking a project down for.
- **Explicit, not automatic.** A block says when. Saving on every write is
  a decision about when a thing is "done" that only the project can make,
  and an app that saves halfway through an edit is a bug nobody asked for.
- **No migration, no versioning.** Never shipped, and a saved shape that
  changes is a saved shape a learner can clear.

## Order of work

1. This plan.
2. The engine: the seam, and the three operations. Tests with a fake
   storage.
3. The blocks. Tests.
4. The driver lending the real storage.
5. Specs: WORLD_STATE.md's refusal answered, APPS.md's fourth thing, and
   this record.

## Commits

## Learned while building

## Not built, and known

## What to look at in the browser
