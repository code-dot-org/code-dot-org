# Plan: binary-asset uploads (porting the legacy Codebridge uploader)

`ANIMATIONS.md` §7 gated one leaf — learner-supplied images — on a framework
capability the frontend does not have: uploading binary project files. The
legacy Codebridge in `apps/` already implements upload; this plan ports it into
the frontend `@code-dot-org/codebridge` + `@code-dot-org/core`, and wires World
Lab to consume uploaded images under the sandbox CSP. It supersedes that gate:
stock and uploaded sprites end up on the same render path.

## 1. How the legacy uploader works (what we port)

End-to-end, in `apps/`:

- **Capture** — a hidden `<input type="file" multiple>` in the generic Lab2 hook
  `apps/src/lab2/hooks/useFileUploader.tsx`; the Codebridge FileBrowser triggers
  it from the header "+" menu (`FileBrowserHeaderPopUpButton.tsx`, "Upload File")
  and a per-folder context menu. No drag-and-drop for upload.
- **Text vs binary branch** (`useFileUploader.tsx`): a `text/*` file is
  `FileReader.readAsText` → stored in `contents`; **anything else (images) is
  uploaded to a remote store and only its URL is kept** — never inlined, never
  base64.
- **Store** — an uploaded image is a normal `ProjectFile` in the single
  `MultiFileSource` tree with `contents: ''` and a `url` field
  (`apps/src/lab2/types.ts` `ProjectFile { … url?: string; flagged?: boolean }`;
  `multiFileSourceEditUtils.ts` sets `contents: url ? '' : …`). There is no
  separate asset/animation manifest, and no tie to the Sprite Lab animation
  library. Binary-ness is inferred from the extension plus the presence of `url`.
- **Backend** — the generic code.org **Assets API** (same one Applab/Gamelab
  use): `PUT /v3/assets/:channelId/:uuid.:ext` via `HttpClient`, with delete
  cleanup and `moderateImage()` moderation before non-start uploads.
- **Consume** — the editor renders `<img src={parentOrigin + file.url}>`
  (`Editor.tsx`); `getUrlForFile` returns the served asset URL for binaries and a
  `blob:` URL for text.

Portability (from the survey): the **capture hook is cleanly liftable**; the
upload transport is entangled with Lab2 Redux (`state.lab2Project`), the channel
model, `HttpClient`, levelbuilder start-mode, analytics, and moderation — those
get re-pointed at the frontend's own redux + a new assets client, not copied.

## 2. The frontend gap

- `@code-dot-org/core` `ProjectFileSchema.contents` is `z.string()` with **no
  `url`/`mimeType`/`isBinary`** field (`core/.../sources.schemata.ts`).
- Core has clients for channels/sources/projects/levels but **no assets client**
  (`grep v3/assets` in `core/src` is empty) — it must be built, on the existing
  transport + channel model.
- Frontend `@code-dot-org/codebridge` has **no upload UI or hook** — its only
  add-file path writes a text placeholder (`utils/multiFileSource.createNewFile`).
- Web Lab already anticipates the shape: a mime table, image extensions in
  `supportedFileTypes`, an optional `PreviewFile.url`, and a service-worker
  `if (url) fetch(url)` branch — all currently unpopulated. This port is what
  populates them; the core `url` field is shared, so Web Lab benefits too.
- Persistence is unaffected: the source round-trips as JSON (`main.json`), and a
  `url` string serializes like any other field.

## 3. The cross-origin wrinkle (World Lab only) and the decision

The legacy editor loads `<img src={url}>` on the **lab origin** — same-origin as
the `/v3/assets` host, so it just works. World Lab's **preview runs on the
sandbox origin** under `img-src 'self'` (`SANDBOX.md`); a lab-origin `/v3/assets`
URL will not load there. Two ways out:

- **(a) Widen the preview `img-src`** to include the assets origin. Simplest, but
  relaxes the isolation the sandbox exists to enforce (the lab origin is
  deliberately not in the preview's `img-src`).
- **(b) Forward the bytes to the sandbox.** The lab `fetch`es each uploaded
  asset's bytes (`fetch(url) → ArrayBuffer`) and posts them to the preview
  alongside the compiled module; the transport service worker caches and serves
  them at a **self-origin** path (`/assets/<name>`), so `img-src 'self'` is
  satisfied. Reuses the SW-serves-from-memory pattern already in play for the
  compiled module, and preserves isolation. **Recommended.**

Either way the binary travels lab→sandbox by `postMessage` (an `ArrayBuffer` is
structured-clone-able) — **not** through the esbuild compiler, which stays
text-only per `ANIMATIONS.md`. Stock vendor sprites and uploaded sprites then
both resolve to self-origin URLs; the driver's sprite-ref resolver is the single
place that knows which is which.

## 4. Port design, in layers

- **L1 — core source model.** Add `url?: string` (and `mimeType?: string` for
  robustness the legacy model lacks) to `ProjectFileSchema`. A file is binary iff
  it carries a `url`. Backward-compatible (optional), persistence unchanged,
  shared with Web Lab.
- **L2 — core assets client.** New `api/dashboard/assets/` (`assets.api.ts`,
  `.keys.ts`, `.schemata.ts`): `uploadAsset(channelId, file) → url` (`PUT
/v3/assets/:channelId/:uuid.:ext`) and `deleteAsset(url)`, on the existing
  transport + channel id. Add an MSW mock so the standalone demo works with no
  live backend (in-memory asset store keyed by channel).
- **L3 — codebridge upload.** Port the capture hook (hidden `<input
type="file">`, MIME gating from a new config `validMimeTypes` /
  `supportedFileTypes`, text→`contents` / binary→`uploadAsset`→`url`). Add
  "Upload File" to the FileBrowser header "+" menu and the folder context menu.
  Add a `createExternalFile` file-op + reducer path (stores `contents: ''` +
  `url`), mirroring legacy `createNewExternalFile`. Editor renders uploaded
  images via `<img src>`; keep the text path unchanged. Optionally port
  `moderateImage` + the flagged-image modal (§5).
- **L4 — World Lab consumption.** In `runtime/`: gather the project's uploaded
  binaries (files with a `url`), fetch their bytes, and forward them to the
  preview; the transport SW serves them at self-origin paths. Add a **sprite-ref
  resolver** the render path uses: a `sprite` name resolves to a stock vendor URL
  (`${assetBase}sprites/<name>.png`) or, if it matches an uploaded asset, to the
  SW-served self-origin URL. `.anim` frames reference sprites by name/path;
  resolution folds into the `ANIMATIONS.md` render descriptor (`frame.sprite` →
  resolved self-origin URL). The esbuild file-map stays text.

## 5. Moderation

Legacy runs `moderateImage()` before non-start uploads and shows a
`FlaggedImageModal` on a hit. For a learner-facing image upload this matters;
port it in L3, or stage it explicitly as required-before-production. It is a
lab-origin call (has network), so it stays on the lab side, not the sandbox.

## 6. What NOT to port

Lab2 Redux coupling (`state.lab2Project`), levelbuilder start-mode
(`/level_starter_assets`), `sendLab2AnalyticsEvent`, and the unrelated aichat
`onAssetUploaded` hook. These re-point to `@code-dot-org/core/redux` + the L2
assets client.

## 7. Phasing (and relation to ANIMATIONS)

- **U1** — core `url`/`mimeType` field (L1). DONE. `ProjectFileSchema` gained
  optional `url` + `mimeType` (backward-compatible; full core suite still green).
- **U2** — assets client + MSW mock (L2). DONE. `api/dashboard/assets`
  (`createAssetsApi`: `upload` → `PUT /v3/assets/:channel/:filename` as FormData
  so the transport carries the bytes, returns the URL; `remove`), wired into
  `createApiClient` as `client.assets`. An MSW mock (`assets.handlers.ts`) stores
  uploads in the scenario store (base64) and serves them back on GET, so the
  standalone demo needs no real backend. Unit-tested. NOTE: the demo/mock
  contract is a FormData PUT; matching the real backend's raw-PUT `/v3/assets`
  (or re-pointing at whatever the studio host exposes) is production-integration
  work for U3/U4 wiring.
- **U3** — codebridge upload UI + hook + `createExternalFile` (L3). DONE.
  `createExternalFile` writes `{contents:'', url, mimeType}`; `useFileOperations`
  exposes `newExternalFile`. The FileBrowser header gained an "Upload File" option
  (shown when `config.validMimeTypes` is set) driving a hidden `<input
type="file">`: a text file reads into contents, a binary file uploads via the
  `DashboardApiClient.assets` singleton (no `ApiClientProvider` dependency — the
  bare shell tests render fine) scoped to `state.lab.channel?.id`, and is added by
  URL. `CodeEditor` previews an uploaded image as `<img>`; `CodebridgeConfig`
  gained `validMimeTypes`; World Lab's config sets `['image/png']`. Unit-tested
  (`createExternalFile`) and browser-verified: a PNG uploads (MSW PUT 200), lands
  in the tree, and previews in the editor (MSW GET 200) as
  `/v3/assets/:channel/:uuid.png`. NOTE deferred to U4-adjacent polish: per-folder
  upload, `moderateImage`, and matching the real backend's raw-PUT contract.
- **U4** — World Lab asset forwarding + SW serve + sprite resolver (L4). NEXT.
  Verify: an uploaded PNG renders on an actor in the preview game under
  `img-src 'self'`.

U1–U3 are framework work (Web Lab shares them); U4 is World-Lab-specific. This
slots **before** `ANIMATIONS.md` Phase D's custom-asset half — Phases A–C (stock
animations) need none of it, and stock + uploaded share the L4 resolver, so the
two plans converge there rather than duplicating.

## 8. Risks and decisions

- **CSP.** Decision (b) keeps `img-src 'self'`; decision (a) widens the preview
  policy to the assets origin — pick one and record it in `SANDBOX.md`.
  Recommendation: (b).
- **Demo without a backend.** The standalone demo has no real Assets API; the MSW
  mock (L2) holds bytes in memory, and the L4 forward path reads them back and
  serves them from the SW — so the demo renders uploaded sprites without a live
  backend.
- **Cross-cutting schema.** The L1 `url` field touches shared core; coordinate
  with Web Lab (it already expects `PreviewFile.url`).
- **Binary in `postMessage`.** `ArrayBuffer` is clone-able; forwarding is cheap
  and needs no encoding.
