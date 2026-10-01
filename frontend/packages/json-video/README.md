# @code-dot-org/json-video

The `<json-video>` custom element and the `TutorVideo` React wrapper around it.

A JSON video is a document of scenes, each with markup for the frame, caption
text, a duration, and optionally its own audio clip; the document may also
carry one audio track that runs under every scene. The element plays it with a
video-player control bar. The lesson pipeline emits these for AI Tutor+, and
the same element lives in the standalone
[json-video-player](https://github.com/edcodedotorg/json-video-player), which
is the easier place to try a document by hand.

## Use

```tsx
import {TutorVideo} from '@code-dot-org/json-video';

<TutorVideo href="/json_videos/some-key/content" errorPoster={posterUrl} />;
```

Importing anything from the package registers the element, so plain markup
works too once something has imported it:

```html
<json-video src="/json_videos/some-key/content" controls></json-video>
```

`src` takes a URL or a `data:application/json,` URI. The element mirrors the
parts of `HTMLMediaElement` its callers use: `play()`, `pause()`,
`currentTime`, `duration`, `paused`, `volume`, `poster`, and the `play`,
`pause`, `timeupdate`, `loadedmetadata`, `loadeddata`, `ended` and `error`
events, with `error` carrying a `MediaError`-shaped object.

In `apps/`, `@cdo/apps/jsonVideo/TutorVideo` wraps this `TutorVideo` with the
error poster from `apps/static`; import that there.

## Document shape

```json
{
  "audio": "data:audio/mpeg;base64,...",
  "scenes": [
    {
      "duration": "12.38s",
      "speech": "Caption text, also the basis of an 'auto' duration.",
      "html": "<h1>Frame markup</h1>",
      "audio": "data:audio/mpeg;base64,...",
      "pauseBackground": false
    }
  ]
}
```

Scene `audio` plays through one `<audio>` element and the top-level `audio`
through another. A scene with `pauseBackground` holds the top-level track while
it plays. Every load resets both elements, so a video loaded over another never
inherits its tracks.

## Dev page

```bash
yarn dev      # http://127.0.0.1:5173/
```

`index.html` renders one `TutorVideo` with a Previous/Next switch over two
generated videos (`src/dev/videos.ts`): one narrated per scene with no
top-level track, one with a top-level track over a silent scene. The switch
does what the deep dive's carousel does, give the same element a new `src`.
The clips are generated silence as data URIs, so the page needs no server
beyond Vite.

## Tests

`e2e/` is the package's Playwright suite. `yarn test:ui` starts the dev page
(or reuses a server on port 5197) and asserts on the two audio elements inside
`<json-video>`, not on sound. CI runs `test:ui:ci` in `json-video-ci.yml`.
