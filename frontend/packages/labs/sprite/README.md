# @code-dot-org/sprite-lab

Sprite Lab, the Lab2 Blockly lab for building scenes and games with sprites.

This package is being ported from `apps/src/p5lab/spritelab/lab2`. It does
not yet run: the entrypoint renders a placeholder. What is ported is the
simulation core, the scene model and the lab's own blocks, none of which
depends on the engine or the views:

- `platformPhysics`: gravity, support and collision for platform scenes.
- `characterAnimations`: pose selection and frame timing for a character.
- `camera`: following and zoom within a scene.
- `audioFeedback/`: the audio cues that describe the player's movement.
- `ai/images/{keyColor,encoding,types}`: pixel helpers for generated images.
- `types`: the project's source format, scenes and level properties.
- `world`, `worldStartPattern`: the grid of placed images a scene starts from.
- `imageReferences`, `imageTrim`, `imageGallery`, `imageRoleDefaults`: the
  project's images and the names that blocks use for them.
- `levelMode`, `guideSteps`, `sceneToolbox`, `addBlocks`: what a level
  configures.
- `scenesApi`, `sceneThumbnails`: scenes shared across a section, and scene
  pictures.
- `redux/spriteLab2Redux`: the lab's UI state.
- `blockly/`: the lab's own blocks, their fields and toolbox, as
  `@code-dot-org/blockly` definitions (`SPRITELAB2_BLOCKS`).
- `migrateSources`: upgrades to sources saved by older versions.
- `sprites/`: the sprite library over upstream p5, clean-room from
  `docs/sprites/`, exported as `@code-dot-org/sprite-lab/sprites`. Collisions,
  the camera and input are still placeholders.
- `views/`: the parts of the lab's UI that need neither the engine nor
  image generation: scene picking and editing, the tab shell, and the play
  bar.

See `docs/port-plan.md` for the layers still to port, their order, and the
decisions they wait on.
