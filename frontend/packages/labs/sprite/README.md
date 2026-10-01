# @code-dot-org/sprite-lab

Sprite Lab, the Lab2 Blockly lab for building scenes and games with sprites,
ported from `apps/src/p5lab/spritelab/lab2`. It runs on a clean-room sprite
library over upstream p5 (`src/sprites/`, specified in `docs/sprites/`) and
an engine of its own (`docs/engine.md`).

The default export is the lab's entrypoint, which Studio hosts through
`LabHost` at `/app/projects/sprite/:channelId/edit`. Other subpaths:

- `./mocks`: the fixtures below, as `SpriteFixtures`.
- `./sprites`: the sprite library.

## Running it standalone

The package runs without Studio or dashboard. `src/main.tsx` starts the mock
service worker, registers the fixtures and hosts the lab in `LabHost` under
the CodeAI theme, as Studio would:

```bash
yarn dev   # from frontend/packages/labs/sprite/
```

Then open a fixture by its channel id:

| URL                                  | Level                                      |
| ------------------------------------ | ------------------------------------------ |
| `/app/projects/sprite/simple/edit`   | Two sprites; Code and Images (the default) |
| `/app/projects/sprite/freeplay/edit` | Free play: World, Code and Images tabs     |
| `/app/projects/sprite/image/edit`    | An image level with guide steps            |
| `/app/projects/sprite/music/edit`    | A scene that plays a Music Lab song        |

Saved work persists in `sessionStorage` across reloads. Add
`?cdoMockReset=1` to start the fixture over.

Image generation is mocked. The fixtures' `aiImages` rules
(`src/fixtures/aiImages.ts`) pick a prepared image by the wording the lab
adds to each kind of prompt: a meadow for a background (a night sky when the
prompt says night), a grass tile for a block, each in pixel art when that
style is chosen, and a smooth face for a smooth sprite. Anything else gets
core's pixel bear, and an animation's posed frames repeat its first. Add a
rule ahead of the others to answer a prompt of your own.

To call the model with your own key instead, start the server with
`GOOGLE_GENERATIVE_AI_API_KEY` set and `VITE_AI_GATEWAY_URL=/__ai-gateway`;
the key stays on the dev server. See `packages/core/src/api/mocks/README.md`.

These query parameters turn on what levels and experiments otherwise would:

- `world-tab=true`: the World tab on any level.
- `image-adlibs=simple`: the ad-lib prompt set for generation.
- `image-free-text=true`: a free-text prompt.
- `images-advanced=true`: the advanced generation options.

`engine-demo.html` runs the engine alone over the real block pool, without
the lab's interface; `?scene=platform` picks the platform scene.

## In Studio

With `VITE_API_MODE=msw`, Studio serves the same fixtures at the same paths.
Against a running dashboard, the channel id is a real project's.

## Fixtures

`src/fixtures/` holds one `LabFixture` per scenario. A fixture gives the level
properties, the starting sources and, where it needs them, routes of its own
(`music` answers the personal-projects list and a song's sources). See
`packages/core/src/api/mocks/README.md` for the registration model.

## Plans

- `docs/port-plan.md`: the Lab2 port, layer by layer, and what changed from
  apps.
- `docs/legacy-plan.md`: running legacy (non-Lab2) Sprite Lab levels here.
