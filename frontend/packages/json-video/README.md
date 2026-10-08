# @code-dot-org/json-video

`<json-video>` plays a JSON list of scenes (HTML, narration text, audio) as if
it were a video. LLMs can generate the JSON and people can edit it by hand, so
it stands in for recorded video in the AI Tutor.

```ts
import '@code-dot-org/json-video';
```

```html
<json-video
  controls
  src="/path/to/video.json"
  poster="/poster.png"
></json-video>
```

Importing the package defines the element; it exports nothing else. The
element mirrors part of the `<video>` interface: `src`, `poster`, `controls`,
`play()`, `pause()`, `currentTime`, `duration`, `paused`, `volume`, `error`,
and the `play`, `pause`, `timeupdate`, `ended`, `loadedmetadata`,
`loadeddata` and `error` events. `src` also accepts a
`data:application/json,` URI.

## Video JSON

```json
{
  "audio": "optional background track URL",
  "scenes": [
    {
      "html": "<h1>Shown in a sandboxed iframe</h1>",
      "speech": "Narration; also the caption text.",
      "duration": "4s",
      "audio": "optional per-scene narration URL",
      "pauseBackground": false
    }
  ]
}
```

`duration` may be `"auto"` or absent, in which case the scene lasts 350 ms
per word of `speech`, at least 2 s.

## Demo and tests

`yarn dev` serves `demo/` at http://localhost:5173 (the Playwright run uses
5179). Query parameters pick the video (`?video=` a key of `demo/videos.ts`)
and the player width (`?width=` in pixels).

`yarn test` runs the Vitest unit tests; `yarn test:ui` runs the Playwright
suite in `e2e/` against the demo, starting `yarn dev` if needed.

The Playwright suite drives the player through its controls as a user would.
`e2e/controls.spec.ts` holds the behavior every set of controls must share,
and runs once per entry in `e2e/variants.ts`. Each entry supplies a driver
(`e2e/drivers/`) that finds controls by role and accessible name, so a new
set of controls only needs a root locator and the same control names. The
page clock is frozen after load; tests move playback with
`VideoPage.advance()`.
