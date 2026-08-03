# Quality of Life Policies

These are a set of ideas that improve the basic building of projects geared toward a beginner's experience.

1. Non-normative edits (basic properties) can be modified while the student's program is running. These include effect properties and actor properties. Other substantial edits may reset the state of the program to the current World.
   - _Effect properties: done._ Knob settings used to be part of an effect's
     structural identity, so nudging one restarted the game. Identity is now the
     SLOT — `["<owner>","<path>"]`, owner being `world`, `backdrop:<n>` or an
     actor id — and the values travel beside it as patchable state
     (`World.setEffectValues`). Per slot, because the same effect on two actors
     is two sets of knobs. The driver already pushed new values onto a live
     filter each frame; nothing there had to change.
   - _Actor properties: not yet._ There is no `World.setActorProperty`, and
     `sameActors` still gates the patch.
2. The 'Restart' button always resets the entire state and runs the program from the beginning in order to unstick anything.
   - _Done._ It did not: the compiler keys its module URL on the project's
     content, so an unchanged project re-imported the module that was already
     evaluated, and `WorldBuilder.getWorld()` memoizes — Restart re-attached
     Phaser to the world that had been ticking. It now loads the module through
     a URL the registry has not seen (`?restart=n`; the build service worker
     matches on `pathname`, so it serves the same bundle), which re-evaluates
     the program from the top. Measured by sampling the player every 125ms
     after the press: it reappears at 41% of the canvas and falls again, where
     before it stayed at 80–82% throughout.
3. Map editing and placing actors adds them to the currently running program. Moving them moves them in the running program. Editing properties modifies them in the current running program.
   - _Moving and editing: done_ — see §1's actor properties.
   - _Adding and removing: the engine and driver are ready._
     `World.removeActor(actor | id)` is the half `addActor` never had, and there
     is a `remove actor` block for it (a runtime act: "when the player lands,
     remove it"). Removal is DEFERRED while a tick is running and immediate
     otherwise — a removal almost always comes from inside the tick that
     noticed it, and splicing the actor list underneath a walk would skip the
     actor after the one removed; the sweep runs after the steps and their
     events, before the frame is drawn. The driver destroys the Phaser object
     of an actor that has left, and releases its filters, so nothing is left on
     screen belonging to nothing.
     What remains for this policy is the RECONCILER: a placement added or
     removed still changes `actorIds`, which is structural, so it restarts.
     Diffing that list is now possible because both halves exist.
4. Adding or removing or otherwise modifying the background of a World should be possible while the program is running.
5. Changing rules or traits, however, will perform a full reset of the current World.

   So does changing a `when` block — adding one, deleting one, reordering two on
   the same event, or editing what one does. A handler is a closure the running
   actors already hold (`ActorBuilder.instantiate` copies them), and no patch
   reaches inside a closure, so the alternative is a deleted block that still
   fires while the reload reports it applied the change live. `World.snapshot`
   carries `handlerIds` — `<actorId>:<event>@<hash of the handler's source>` —
   and the reconciler treats any difference as structural.

   The gap left: a value a handler CLOSES OVER rather than inlines is invisible
   to `Function.prototype.toString`, so such an edit would still patch. Blockly
   inlines its arguments, which is why this is narrow rather than routine.

   Rule code gets the same treatment, for the same reason one step further out:
   the running world holds the Rule objects it was built with, and the Scheduler
   resolved a total order from them. `ruleCode` hashes every function a rule
   carries — steps (with their placement), its actions and queries, and its
   traits' — so editing a `.rule`, renaming a step, or moving one before
   another restarts. Property DEFAULTS are excluded on purpose: they reach the
   snapshot as values, where changing one patches live, which is the behaviour
   worth keeping.

   Both hashes rest on the bundler emitting an untouched module identically
   across builds; if it did not, every edit anywhere would read as a rule
   change and nothing would ever reload live. It does, even when a new file
   collides with a name inside a rule — `esbuildCompiler.test.ts` holds that
   down.
