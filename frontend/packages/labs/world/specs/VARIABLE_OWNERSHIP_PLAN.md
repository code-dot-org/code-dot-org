# Plan: each binding owns its variable

STATUS: BUILT, October 2026, and seen in the browser. The working record,
as the other plans are.

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
   is not. A filtered value gets one too, before its filter: `is hit by
⟨who⟩ (any ▾) ⟨amount⟩`. The values stay in the `+` as well, which is
   the keyboard's way to them. Browser check.
6. The scope rule's exception: find what still sets a name no binding
   gives. If nothing, remove the exception, and every name is bound.
7. Specs: this record; PASTE.md and EVENT_VALUES_PLAN.md where they
   describe the shared model; ACCESSIBILITY.md for the chips.

## Built

- **Step 2: the store** (`blockly/ownedVariableMap`), registered as every
  workspace's default where the lab registers its variable fields
  (`typedVariables`). It subclasses Blockly's and changes two methods:
  `createVariable` makes a new variable whatever the name, and answers an
  id it already holds with that variable; `renameVariable` renames one and
  never merges. Nothing else changed behaviour: every lookup by name still
  finds the one variable it found before, because nothing yet makes a
  second of a name. The suite passed unchanged, and the Ball's event still
  reaches its handler in the browser.

- **Step 3: a `let` owns its variable.** Typing a name into a `let` or a
  loop (`fields/variableName`) renames that binding's own variable, or
  makes one if it shares its variable with another binding. A `let` typed
  with a name visible above it joins that binding instead, and its readers
  follow (`letBinding.moveReaders`). The same is asked when a `let` is
  MOVED (`letBinding.settleLet`, on the block's own move): carried under a
  binding of its name it joins it, and carried out from under one it is
  given a variable of its own again. A joined `let` carries the warning
  "amount is already known here, so this sets it rather than making a new
  one."
- **Paste and Duplicate** go through a block paster of the lab's own
  (`ownedPaster`): each binding in the copy gets a fresh id, made before
  the copy loads so its fields find it by id and not by name, and the
  readers in the copy follow. A `let`'s field now saves its name and type
  as well as its id when Blockly asks for a full copy, so a pasted `let`
  can be made in a file that never had its variable.
- **The repository's content shared ids, 554 times.** The rule DSL made one
  variable per name per rule (`rule.local`) and every body binding that
  name used it, so `Collisions_other` was bound in several bodies of one
  rule, and every scenario and lesson that copies the rule copied that. The
  DSL now gives each later binding its own id as the rule's workspace is
  written (`ownBindings`), from a copy of the binding table that
  `repositoryBindings.test` holds equal to the editor's. The Notes app's
  two rebuild loops each have their own variable too.
- **Two tests asserted the shared model** (`scopedLocals`: two unconnected
  `let`s of one name are one variable; typing a taken name joins it), and
  were rewritten for this one.
- **Seen in the browser**: in the Ball's code, a `let amount` in each of two
  handlers; renaming the first to `total` leaves the second `amount`. The
  second sits under `when … is hit by … amount`, so it joined the hat's
  value, wears the warning, and generates `amount = 0;`.

- **Step 4: a hat owns its values.** Each value is a field on the hat,
  `LOCAL0`, `LOCAL1`, … (`fields/eventLocal`), holding the hat's own
  variable: made when the hat reaches a workspace, saved with it, and
  renamed when the event renames the value. They sit in an input of their
  own, hidden until step 5 draws them. Added by an extension rather than
  written into the hat's message, so the message, and the menu label read
  from it, stay the event's. The scope rule reads the fields
  (`eventLocalIds`), the `+` gives each getter the hat's id
  (`hatFlyoutBlocks`), and the paster and the content check count them as
  bindings.
- **Only the stock List read a hat's value**, in its scroll and drag
  handlers, so only it carries the fields by hand.
- **A member's values keep their names** (`bindParams`): a name is made
  free of the signature's other values only, not of the whole file.
- **Two tests built a hat's binding by creating a variable of its name**
  (`eventSignature`, `variableScope`), and now set the hat's field instead.
- **Seen in the browser**: in the Ball's code, `amount` from the hit-by
  hat's `+` into `write to console`; the code binds `let amount =
eventValue$2;` and the console prints the 7 the create handler emits.

- **Step 5: the values as chips.** Each value's field is in the hat's
  wording now, where the value is: `when ⟨this actor⟩ is hit by ⟨who⟩
(any ▾) ⟨amount⟩`. It draws as a chip in its getter's colour, and a
  press takes out a getter for that hat's variable through the drag the
  member head uses (`beginGetterDrag`); the chip stays. In the flyout a
  press takes the hat. The menu label reads a chip as its name, so the
  hit-by hat is `when … is hit by who … amount`.
- **A value filtered by a set of choices is not drawn**, by decision while
  building: `presses ⟨pressed key⟩ (space ▾)` says the key twice on the
  hat lessons use most. Its field stays, hidden, at the end of the hat,
  and its getter is in the `+`. Kept open for the author of the plan.
- **The stray warning says only what is known**: "amount is not known
  here." `binderOf` and the code that described the binding are gone.
- **Seen in the browser**: the Ball's hit-by hat draws `who` and `amount`
  as chips; `amount` pressed and dragged into `write to console` lands as a
  getter, the chip stays, and the console prints 7.

- **Step 6: every name is bound.** Nothing in the repository set a name
  no binding gives, once the rule DSL's first writes were `let`s, so the
  scope rule's exception is gone: a name no binding gives is known
  nowhere, `set` or not (`idsInScope`, `visibleNamed`). `writtenIds` went
  with it.
- **Reads outside their binding, found on the way**, which the exception
  had not covered either. Teleport set `here` with `set` in two bodies
  whose `let here` was elsewhere; both are `let`s now. Two remain, each
  wanting a binding the lab does not have, and named in the content check
  (`repositoryBindings.test`, "read every variable inside a binding of
  it"): Collisions fills `found`, `arrived` and `left` with `clear` and
  `push` blocks, and an actor list has no `let`; Path's `queue` and `seen`
  are lists, and there is no `let list`. A getter of any of them draws
  `???` in the editor, as it did before.
- **A named `add actor` is a binding**, found the same way: Meteors named
  `ball` with `add actor … as ⟨ball⟩`, which was not one. It binds over
  its `do`, the only place the generated `const` reaches, and its name is
  typed as a `let`'s is (`VariableNameField`), so two spawns naming `ball`
  have a variable each.

- **Step 7: the specs.** EVENT_VALUES_PLAN.md and PASTE.md carry a note
  on what this changed in them; ACCESSIBILITY.md has the chips.

## Not in this plan

- **Variables a learner makes without a binding.** Blockly's "Create
  variable" button is not in this lab's toolbox, and nothing here adds it.
- **Projects saved under the shared model.** None have shipped, so nothing
  converts them (specs/RETIREMENTS_PLAN.md). What the repository holds —
  stock rules, actors, fixtures, lessons — is checked instead, by a test
  that no id is bound by two bindings in one file; any that are get fresh
  ids where they are authored.
