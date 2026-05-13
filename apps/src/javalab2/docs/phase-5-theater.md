# Phase 5 — Theater mini-app

CSA theater levels render a canvas + audio surface and prompt the user
for image input mid-execution. No prior lab2 template exists. The work
splits cleanly into (a) the surface itself, (b) the photo prompter
modal, and (c) the Javabuilder signal routing already stubbed in
`javabuilderRunner.ts`.

## Files to create

| Path                                              | Role                                              |
|---------------------------------------------------|---------------------------------------------------|
| `apps/src/javalab2/miniApps/TheaterMiniApp.tsx`   | Canvas + audio playback. Port of `apps/src/javalab/theater/Theater.js`. Owns its own state via React. |
| `apps/src/javalab2/miniApps/PhotoPrompter.tsx`    | Modal triggered by a Javabuilder `THEATER` signal of type `GET_IMAGE`. Mounted via React portal from `Javalab2View`. |
| `apps/src/javalab2/redux/javalab2Redux.ts`        | Slice: `photoPrompterOpen`, prompter request id, last-uploaded asset. Register in `apps/src/redux/reducers.ts` if added there, else add ad-hoc store registration. |
| `apps/src/codebridge/MiniAppPreview/TheaterPreview.tsx` | Thin wrapper that reads sources + `levelProperties` and renders `TheaterMiniApp`. Mirrors `NeighborhoodPreview.tsx`. |

## Files to modify

| Path                                                 | Change                                       |
|------------------------------------------------------|----------------------------------------------|
| `apps/src/codebridge/MiniAppPreview/MiniAppPreview.tsx` | Add `MiniApps.Theater` case alongside the existing `Neighborhood` case. |
| `apps/src/codebridge/constants.ts`                   | Add `Theater` to `MiniApps` enum.            |
| `apps/src/javalab2/javabuilderRunner.ts`             | Route `WebSocketMessageType.THEATER` frames to the theater controller and to `dispatch(showPhotoPrompter(...))` when `value === GET_IMAGE`. |
| `dashboard/app/models/levels/javalab.rb`             | In `summarize_for_lab2_properties`, also set `miniApp = 'theater'` when `csa_view_mode == 'theater'` (mirror of the neighborhood alias). |

## Signal flow

Javabuilder emits frames of shape
`{type: 'THEATER', value: <TheaterSignalType>, detail: ...}`.

| `value`      | Behavior                                                |
|--------------|---------------------------------------------------------|
| `VISUAL_URL` | Pass to `TheaterMiniApp` to draw a frame.               |
| `AUDIO_URL`  | Pass to `TheaterMiniApp` to schedule audio.             |
| `NO_AUDIO`   | `TheaterMiniApp` finalizes playback without audio.      |
| `GET_IMAGE`  | Dispatch `photoPrompterOpen = {requestId}`. The modal in `Javalab2View` renders, the user uploads, we POST the asset to dashboard, and `sendInput(INPUT, JSON.stringify({type: 'UPLOAD_SUCCESS', url}))` back through `JavabuilderClient`. |

## Photo prompter design

Codebridge has no modal-during-execution primitive. The prompter must
suspend run state until either an image is provided or the user cancels.
Mechanics:

- Modal is rendered by `Javalab2View` (React portal), gated on
  `useAppSelector(state => state.javalab2.photoPrompterOpen)`.
- The mini-app preview pane shrinks/blurs while open.
- `UPLOAD_SUCCESS` / `UPLOAD_ERROR` use the legacy
  `InputMessage` enum values (`apps/src/javalab/constants.js`).
- Cancel → `UPLOAD_ERROR`. Javabuilder treats this as the user opting
  out and surfaces the exception via the existing
  `MediaExceptionType.IMAGE_LOAD_ERROR` path.

## Sounds

Reuse `apps/src/Sounds.js` directly. `TheaterMiniApp` constructs a
single `Sounds` instance per run, releases it on `onClose()`.

## Asset upload endpoint

Photo uploads go to `/v3/assets/:channelId` (multipart). Use
`getAuthenticityToken()` from `AuthenticityTokenStore` for the CSRF
header — the meta tag is not on the lab2 page (see [docs/README.md]).

## Risks

- `TheaterMiniApp` needs an SVG/canvas element with a stable id that
  thumbnail capture can read, mirroring
  `captureThumbnailFromSvgPythonlabNeighborhood`. Decide whether thumbnails
  are in v1.
- `GET_IMAGE` blocks Javabuilder; the WebSocket may time out if the
  user takes too long. Match the timeout behavior the old prompter had —
  see `apps/src/javalab/components/PhotoSelectionView.jsx`.

## Verification

Pick a theater level (search
`dashboard/config/levels/custom/javalab` for `csa_view_mode: 'theater'`).
Confirm:

- Run produces images on the preview.
- Audio plays.
- A level that calls `Prompter.getImage(...)` opens the modal, accepts
  an upload, and continues execution.
- Cancel raises a runtime exception in the console.
