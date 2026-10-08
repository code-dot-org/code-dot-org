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

Importing the package defines the element and exports its class,
`JsonVideo`, for typing.

## The media interface

`<json-video>` implements the parts of `HTMLMediaElement` that controls need,
so code written for `<video>` drives it unchanged:

- Attributes, reflected as properties: `src`, `poster`, `controls`,
  `autoplay`, `loop`, `muted` (the initial state, as `defaultMuted`).
- Properties: `currentTime`, `duration` (NaN until loaded), `paused`, `ended`,
  `seeking`, `volume`, `muted`, `playbackRate`, `defaultPlaybackRate`,
  `readyState`, `networkState`, `currentSrc`, `error`, `buffered`, `seekable`,
  `played`, `textTracks`.
- Methods: `play()` (returns a promise), `pause()`, `load()`, `fastSeek()`,
  `canPlayType()`.
- Events: the native loading sequence (`loadstart` through `canplaythrough`),
  `play`, `playing`, `pause`, `waiting`, `seeking`, `seeked`, `timeupdate`
  (every 250 ms while playing), `ended`, `volumechange`, `ratechange`,
  `emptied`, `abort`, `error`.

Captions: each scene's `speech` is a cue on the one captions track in
`textTracks`. Setting its `mode` to `showing` draws them in the built-in
overlay; `hidden` keeps the cues and `cuechange` events without drawing, for
a page that renders captions itself. The track, cue and range objects are
look-alikes of the native classes, not instances of them.

## Custom controls

Leave out `controls` and put your own controls inside the element. Children
are shown over the video, so they stay visible when the element is
fullscreen. Without `controls`, clicking the picture does nothing, as on
`<video>`. `demo/customControls.ts` is a complete example built only on the
interface above.

The built-in pieces carry `part` names (`controls-bar`, `play-button`,
`mute-button`, `volume-slider`, `progress-bar`, `time-display`,
`current-time`, `duration`, `captions-button`, `fullscreen-button`,
`captions`, `caption-text`, `poster`, `scene`), so a page can restyle them
with `::part()`. The buttons also carry their state as a part name, since a
page cannot see classes inside the shadow root: `play-button playing`,
`mute-button muted`, `captions-button captions-on`, and
`fullscreen-button fullscreen`. For example, to draw icon-font glyphs in
place of the built-in icons (the page must load the font):

```css
json-video::part(play-button) {
  background-image: none;
  font-family: 'Font Awesome 6 Pro';
  font-weight: 900;
}
json-video::part(play-button)::before {
  content: '\f04b'; /* play */
}
json-video::part(play-button playing)::before {
  content: '\f04c'; /* pause */
}
```

`::part()` selectors all have the same specificity, so state rules must come
after the base rules.

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
5179). Query parameters pick the video (`?video=` a key of `demo/videos.ts`),
the player width (`?width=` in pixels) and the controls (`?controls=builtin`
or `custom`).

`yarn test` runs the Vitest unit tests; `yarn test:ui` runs the Playwright
suite in `e2e/` against the demo, starting `yarn dev` if needed.

The Playwright suite drives the player through its controls as a user would.
`e2e/controls.spec.ts` holds the behavior every set of controls must share,
and runs once per entry in `e2e/variants.ts`. Each entry supplies a driver
(`e2e/drivers/`) that finds controls by role and accessible name, so a new
set of controls only needs a root locator and the same control names. The
page clock is frozen after load; tests move playback with
`VideoPage.advance()`.
