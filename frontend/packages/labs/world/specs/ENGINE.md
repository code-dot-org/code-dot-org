# Engine

Underneath, World Lab is a Phaser 4 game engine.

Each of our support classes will, underneath it all, create the necessary Phaser
architecture to run the game.

## In-place editing

Whenever possible, we want to be able to update the state and nature of Actors
and environments without resetting the entire game. When a learner updates a bit
of data in their editor, it should just reload the necessary changes and keep
the Actor and World state as it is.

For example, if we alter the gravity stength property, I should be able to jump
in the already running game and see it use the new value without having to
recompile and restart.

For some edits, this might not be practical, and so the learner may need to
stop and restart their game preview. Though, for many edits, this will be
possible since many are descriptive metadata edits of properties.

## Sandboxing

Look at `SANDBOX.md` for a description of the level of sandboxing we wish to
maintain. Learner-supplied code is untrusted and should not be able to access
the network or session data.

## Simulation

The simulation should run in real-time. The update routines will receive a
`delta` parameter representing the time that has passed since that last
update which will allow for some accurate simulations.
