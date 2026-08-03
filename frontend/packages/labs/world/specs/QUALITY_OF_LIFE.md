# Quality of Life Policies

These are a set of ideas that improve the basic building of projects geared toward a beginner's experience.

1. Non-normative edits (basic properties) can be modified while the student's program is running. These include effect properties and actor properties. Other substantial edits may reset the state of the program to the current World.
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
4. Adding or removing or otherwise modifying the background of a World should be possible while the program is running.
5. Changing rules or traits, however, will perform a full reset of the current World.
