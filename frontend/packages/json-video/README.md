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
