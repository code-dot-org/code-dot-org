# Plan: each binding owns its variable

STATUS: PLANNED, not started. Comes before the event hat's value chips
(below, step 5), which need it.

A name in this language is lexical. It exists where a binding gives it: a
`let`, a loop, an event hat, a member's head. Outside those it does not
exist. The scope rule already says so (`blockly/variableScope`,
`idsInScope`). The storage underneath does not, and the two disagree in
ways a learner can see.

## What there is now

- **A variable is Blockly's, and Blockly's are per workspace.** One record
  per name and type, with an id. Every block naming a variable holds the
  id. `VariableMap.createVariable` refuses a second record with the same
  name and type ("already in use").
- **So one name is one variable, file-wide.** Two `let amount`s in two
  handlers hold the same id. Typing a name into a `let`
  (`fields/variableName`, `resolve`) points it at the record of that name
  if the file has one, anywhere.
- **Renaming is file-wide too.** Editing a `let`'s name renames the shared
  record, so every `let` and getter holding it changes with it. Two
  bindings with one name cannot be named apart afterwards.
- **And renaming can merge.** `VariableMap.renameVariable` to a name that
  another record of the same type has moves every use onto that record and
  deletes the first. Renaming one `let` to its neighbour's name joins them
  for good.
- **An event hat finds its values by name.** `eventLocalIds` looks up the
  file's record called `amount` of the value's type. Every hat handing over
  `amount` binds the same id.
- **A member's head avoids the problem by renaming.** `bindParams` makes
  each value's name free of every other record in the workspace, adding a
  digit (`amount2`), so a parameter never collides with a variable
  elsewhere in the file.
- **A name that is set and bound by nothing is visible everywhere.** The
  scope rule's one exception, kept for stock rules' free locals that were
  never put under a `let` (`variableScope`, top of file).
- **What a stray getter is told guesses.** `extensions/scopedVariableDefault`
  names "the block that declares" a getter's id (`binderOf`), which is the
  first of however many share it.

## The model

- **A binding owns its variable.** Each `let`, loop, event hat and member
  head that binds a name has a variable of its own, with an id nothing else
  binds. Names may repeat; ids do not.
- **A getter holds its binding's id**, as now. Which binding a getter means
  is the id it holds; which bindings it may hold is the scope rule.
- **Renaming a binding renames its own variable**, and the getters holding
  its id follow. No other binding changes. Renaming never merges.
- **Inner hides outer**, where a binding other than a `let` repeats a
  name already visible: a loop's `amount` under a hat that gives `amount`.
  The getter menu offers the innermost, once. A getter already holding the
  outer one's id keeps it and still works.
- **A `let` that names a binding already visible joins it, and is
  warned.** `let amount` and, three rows down, `let amount` again: the
  second sets the first, as it does now (`variableScope.isRedeclaration`),
  and carries a warning that it does. The same holds for a `let` under a
  hat or loop that already gives the name. It joins that binding only,
  never one out of scope, so a `let` cannot reach a variable the scope
  rule hides from it. Decided over shadowing, under which a getter between
  the two and one after both would draw `amount` and mean different
  things.
- **Generated code keeps them apart.** Blockly's generator maps each id to
  an identifier and makes a repeated name distinct (`amount`, `amount2`),
  so two bindings with one name never generate one identifier.

## How

- **A variable store that allows repeated names.** Registered in place of
  Blockly's (`registry.Type.VARIABLE_MAP`, which a workspace reads through
  `getVariableMapClass`). Lookups by id are unchanged. `createVariable`
  makes a new record whatever the name; `renameVariable` renames one record
  and never merges; `getVariable(name, type)` is not used by this lab's
  code and answers the first match for Blockly's own callers.
- **Our five lookups by name become lookups by binding.**
  - `variableName.resolve`: a `let` or loop names or renames its OWN
    variable. Typing a name another binding has does not join it.
  - `eventLocalIds`: a hat holds its values' ids in its own saved state,
    made when it is placed. Nothing finds them by name.
  - `bindParams`: names need be free only within the signature, not the
    file. The `amount2` renaming goes.
  - `variableScope`'s remaining uses are by id already.
- **Copying makes new variables.** Paste and Duplicate in the same file
  would otherwise give the copy's binder the original's id, which is the
  shared variable again. A pasted tree's binders get fresh variables, and
  the getters inside the tree that held the old ids are pointed at the new
  ones. A getter in the tree whose binder is not in the tree keeps its id
  (specs/PASTE.md, "What the pasted block means").
- **The stray warning says what is known.** "amount is not known here."
  `binderOf` and the hat-text helper go.

## Order of work

1. This plan.
2. The variable store, registered for every World workspace, the compiler's
   headless one included. Tests: two records of one name; rename does not
   merge; load and save keep both.
3. `let`s and loops own their variables (`variableName`); a `let` naming a
   visible binding joins it, with its warning. Paste and
   Duplicate remap. Tests, and a browser check: two `let amount`s renamed
   apart. The test over the repository's content, above.
4. Event hats own their values (`eventLocalIds`); `bindParams` stops
   renaming across the file. Tests: two handlers of one event, each with
   its own `amount`, each read under its own hat.
5. The event hat's values as chips: each value drawn as its getter in the
   hat, and pressing one drags out a getter for that hat's own variable, as
   a member head's sockets do (`memberHead`, `fields/dragGetterOut`). A
   field, not a plugged-in block, because a hat is saved and a member head
   is not. Browser check.
6. The scope rule's exception: find what still sets a name no binding
   gives. If nothing, remove the exception, and every name is bound.
7. Specs: this record; PASTE.md and EVENT_VALUES_PLAN.md where they
   describe the shared model; ACCESSIBILITY.md for the chips.

## Open questions

- **A filtered value's chip.** `is hit by ⟨who⟩ (any ▾) ⟨amount⟩` (chip,
  then filter), or no chip for a filtered value. The first is
  recommended.
- **The values in the `+`.** Kept as the keyboard's way to the getters
  until a chip can be taken without a pointer, or removed once the chips
  are in.

## Not in this plan

- **Variables a learner makes without a binding.** Blockly's "Create
  variable" button is not in this lab's toolbox, and nothing here adds it.
- **Projects saved under the shared model.** None have shipped, so nothing
  converts them (specs/RETIREMENTS_PLAN.md). What the repository holds —
  stock rules, actors, fixtures, lessons — is checked instead, by a test
  that no id is bound by two bindings in one file; any that are get fresh
  ids where they are authored.
