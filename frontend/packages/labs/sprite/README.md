# @code-dot-org/sprite-lab

Sprite Lab, the Lab2 Blockly lab for building scenes and games with sprites.

This package is being ported from `apps/src/p5lab/spritelab/lab2`. It does
not yet run: the entrypoint renders a placeholder. What is ported is the
simulation core, which has no dependency on the engine or the views:

- `platformPhysics`: gravity, support and collision for platform scenes.
- `characterAnimations`: pose selection and frame timing for a character.
- `camera`: following and zoom within a scene.
- `audioFeedback/`: the audio cues that describe the player's movement.
- `ai/images/{keyColor,encoding,types}`: pixel helpers for generated images.

See `docs/port-plan.md` for the layers still to port, their order, and the
decisions they wait on.
