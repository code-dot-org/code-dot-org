# WebLab1 -> WebLab2 Viewer Compatibility POC

## Scope and goal

This spec captures the investigation and proof-of-concept (POC) work to answer:

> Can we serve **WebLab1 projects** inside the **WebLab2 viewer/share experience** (iframe jail + preview pipeline), for project viewing use cases first?

Primary constraints for this POC:

- Viewer/share experience first.
- Do not require migrating legacy project storage up front.
- Keep existing WebLab1 editing/remix flows intact.
- Prefer a compatibility shim over invasive platform changes.

---

## Investigation summary

## What WebLab1 does today (relevant to viewer/share)

- Project share runtime is rooted in legacy `/v3/files/:channel/...` storage.
- Public share rendering is historically codeprojects-oriented (`/projects/weblab/:channel/...` on codeprojects host).
- In Studio, WebLab1 uses Bramble host/editor architecture (`apps/src/weblab/*`) and not the Lab2 `main.json` shape.
- File model:
  - Manifest: `/v3/files/:channel` (list with filename/category/version metadata).
  - Per-file content: `/v3/files/:channel/:filename`.
  - No Lab2 `main.json` multi-file source blob.

## What WebLab2 does today (relevant to viewer/share)

- Expects `/v3/sources/:channel/main.json` with `ProjectSources` and `MultiFileSource` shape.
- Uses Codebridge and Lab2 project stack (`apps/src/lab2/*` + `apps/src/weblab2/*`).
- Viewer/share relies on preview subdomain + service worker:
  - Outer iframe from Studio -> `*.preview.*.codeprojects.org`.
  - Inner iframe served through SW virtual filesystem.
  - PostMessage + BroadcastChannel pipeline for file updates, URL bar sync, network panel.

---

## Key architectural differences

1. **Storage shape**
   - WebLab1: manifest + file objects.
   - WebLab2: single `main.json` object containing multi-file graph.

2. **Runtime/viewer stack**
   - WebLab1: Bramble-centered.
   - WebLab2: Codebridge + preview SW stack.

3. **Routing assumptions**
   - WebLab1 and WebLab2 are separate project types and routes.
   - No existing server-side bridge that auto-converts WebLab1 project data into Lab2 source format.

---

## POC design

## Compatibility mode activation

- Introduce a **query-param-gated compatibility mode**:
  - `?weblab1_compat=true` (also accepts `1` and `yes`).

This avoids accidental behavior changes and allows controlled experimentation.

## Data-loading shim

- In Lab2 source loading (`apps/src/lab2/projects/sourcesApi.ts`), when compatibility mode is enabled:
  1. **GET** `/v3/sources/:channel/main.json` as JSON **without** running `SourceResponseValidator` first.
  2. If the body **already looks like Lab2 Codebridge** (`source` is an object with `files` and `folders`), run the normal validator and return it (same as native WebLab2).
  3. Otherwise (missing `source`, App Lab–style string `source`, empty object, etc.) **or** if validation throws after a shape match, synthesize from WebLab1:
     - Load manifest from `/v3/files/:channel`.
     - Load **text-like** files into `contents`; **binary / images** use **`url: /v3/files/:channel/:filename`** and empty `contents` (same *pattern* as native WebLab2 uses **`/v3/assets/...`** for uploads—path string in `ProjectFile.url`, not inlined base64).
     - Build a synthetic `ProjectSources` with a generated `MultiFileSource`.
  4. If the **GET** throws **404**, fall back to the same WebLab1 synthesis path.

When compatibility mode is **off**, behavior is unchanged: single `fetchJson` + `SourceResponseValidator`.

## MultiFile synthesis strategy

- Create folders from path segments.
- Create files with generated IDs, preserving names and hierarchy.
- Choose active/open file priority:
  1. `index.html` at root,
  2. any nested `*/index.html`,
  3. any `.html`,
  4. first file fallback.

## Preview compatibility

- The project **service worker** (`weblab2_project_service_worker.js`) already serves virtual project files and, when `ProjectFile.url` is set, does **`fetch(url)`** with that path.
- **Same-origin preview** routing: path-only URLs such as **`/v3/assets/...`** (native WebLab2 uploads) and **`/v3/files/...`** (WebLab1 file API) are intended to resolve on the **preview** origin the same way production WebLab2 already relies on for assets—**no POC-specific changes** to the service worker.
- **Exception already in the worker:** paths starting with **`/level_starter_assets/`** are still rewritten to the Studio origin (with cache-bust) for CORS/header reasons; that predates this POC.

---

## Implemented POC changes (code)

1. **New compatibility module**
   - `apps/src/weblab2/weblab1Compatibility.ts`
   - Adds:
     - compatibility query-param parsing,
     - **`mainJsonIsLab2CodebridgeShape`** (structural check before validating as Codebridge),
     - **`shouldFallbackToWeblab1Files`** (network **404** only, for failed `main.json` GET),
     - WebLab1 manifest + file loading,
     - conversion to synthetic `MultiFileSource` (text in `contents`, binaries via **`url`** to `/v3/files/...`).

2. **Lab2 source loading**
   - `apps/src/lab2/projects/sourcesApi.ts`
   - When compat flag is on: raw `main.json` inspect → valid Codebridge shape uses normal validator; otherwise WebLab1 synthesis; **404** still triggers synthesis.

3. **Initial unit tests**
   - `apps/test/unit/weblab2/weblab1CompatibilityTest.ts`
   - Covers compat param, shape helper, 404 fallback, multi-file / URL-backed file expectations.

**Not part of this POC:** edits to `weblab2_project_service_worker.js` (rely on existing `fetch(url)` behavior for `/v3/files/...` like `/v3/assets/...`).

---

## What we decided (and why)

1. **Use fallback adapter, not immediate data migration**
   - Lower risk and faster validation.
   - Lets us verify user-facing value before migration complexity.

2. **Gate behavior behind explicit flag**
   - Prevents surprise regressions.
   - Enables selective validation and rollout.

3. **Target viewer compatibility first**
   - Matches desired scope.
   - Keeps "View code" / "Make my own" existing semantics unchanged for now.

4. **Avoid server route changes in first POC**
   - Keeps blast radius low.
   - Confirms feasibility primarily in frontend data+preview pipeline.

---

## Current limitations and risks

1. **File URL encoding + nested path behavior**
   - `/v3/files/:channel/:filename` endpoint only captures one path segment.
   - Nested paths need careful handling/encoding assumptions.
   - This is a critical area for deeper validation and likely hardening.

2. **Non-text assets**
   - Represented with **`url`** pointing at `/v3/files/...` (not inlined data URLs in `contents`).
   - MIME/extension edge cases may still need validation in the field.

3. **Viewer actions**
   - Share sidebar actions (`View code`, `Make my own`) remain existing behavior.
   - No compatibility-specific override added yet.

4. **Test environment noise**
   - Repo-local environment currently has broad baseline test/typecheck failures unrelated to this POC.
   - Targeted verification is possible, but full green run is not yet available in this environment.

---

## Validation results so far

- Code compiles at edit-time (no immediate syntax issues in changed files).
- Full test and typecheck runs in this environment report many unrelated pre-existing failures.
- New targeted tests were added, but local Jest setup currently requires additional generated locale artifacts before isolated runs can pass in this environment.

---

## Step-by-step implementation plan (next)

## Phase 1: Harden compatibility data adapter

1. Validate nested filename behavior against real WebLab1 projects.
2. Normalize text vs binary handling:
   - prefer inlined text content for HTML/CSS/JS/JSON/MD/TXT/CSV,
   - explicit URL strategy for binary assets.
3. Add robust URL/path normalization tests:
   - root files,
   - nested files,
   - duplicate names in different folders,
   - missing `index.html`.

## Phase 2: Viewer UX behavior alignment

1. Decide/implement desired behavior for share sidebar actions in compatibility mode:
   - `View code`
   - `Make my own`
   - `Report abuse`
2. Ensure branding + left sidebar behavior matches desired WebLab2 experience.

## Phase 3: Route + entry integration options

1. Evaluate best entry strategy:
   - query-param opt-in only (short term), vs
   - dedicated compatibility route, vs
   - server-side lab selection for compatible project types.
2. Add analytics marker for compatibility-mode usage.

## Phase 4: rollout guardrails

1. Feature-flag wiring (server/experiment level as appropriate).
2. Add metrics + failure logging around fallback conversion.
3. Define rollback switch and success criteria.

---

## Investigation details and relevant files

## Core files inspected

- WebLab1:
  - `apps/src/weblab/WebLab.js`
  - `dashboard/legacy/middleware/files_api.rb`
  - `dashboard/legacy/middleware/helpers/file_bucket.rb`
  - `dashboard/config/routes.rb`
  - `dashboard/app/controllers/projects_controller.rb`

- WebLab2/Lab2:
  - `apps/src/weblab2/Weblab2View.tsx`
  - `apps/src/weblab2/htmlPreview/HTMLPreview.tsx`
  - `apps/src/weblab2/htmlPreview/InnerHTMLPreview.tsx`
  - `apps/src/weblab2/htmlPreview/useProjectServiceWorker.ts`
  - `apps/src/weblab2/htmlPreview/weblab2_project_service_worker.js`
  - `apps/src/lab2/projects/sourcesApi.ts`
  - `apps/src/lab2/projects/ProjectManager.ts`
  - `apps/src/lab2/lab2Redux.ts`
  - `apps/src/lab2/types.ts`

## Files changed by this POC

- `apps/src/weblab2/weblab1Compatibility.ts` (new)
- `apps/src/lab2/projects/sourcesApi.ts`
- `apps/test/unit/weblab2/weblab1CompatibilityTest.ts` (new)

This spec document under `docs/specs/2026-03-26-15-48-22/`.

---

## To-do list (requested tracking)

## To start immediately

- [ ] Validate compatibility shim against the provided real project URL in a running local environment.
- [ ] Confirm nested path + asset loading behavior in preview jail.
- [ ] Decide expected behavior for share sidebar actions in compatibility mode.

## After confirmation (implementation continuation)

- [ ] Harden filename/path encoding and nested file support.
- [ ] Add/expand compatibility test coverage for file trees and preview path behavior.
- [ ] Add feature flag / experiment gate beyond query param.
- [ ] Add event logging/metrics for fallback hit-rate and failures.
- [ ] Consider optional server-side route convenience for compatibility viewer links.
- [ ] Document operational rollout and rollback procedure.

---

## Requested unknowns / decisions needed

1. Should compatibility mode remain query-param based in near term, or auto-enable when `main.json` is missing / not Codebridge-shaped (today: explicit param + shape-based branch when param is on)?
2. In compatibility mode, should "View code" open legacy WebLab1 editor view, WebLab2 read-only code view, or be hidden?
3. Should "Make my own" point to legacy remix initially, or be disabled until compatibility editing/remix is defined?
4. Do we require full parity for WebLab1 binary assets in POC, or text-first plus common image support is sufficient?

