# Contract: URLs, Routes, and Import Sources

The lab exposes one route in the studio router and three external entry-point conventions (deep link, join code, file). This contract is what teachers, redirector services, and the lab's importer rely on.

## Studio route

```
/app/projects/notebook/$channelId/edit
```

| Segment | Meaning | Examples |
|---|---|---|
| `$channelId` | `"default"` (cold open → welcome notebook), `"new"` (force welcome refresh), or a UUIDv4 (open that specific notebook in the active session) | `default`, `b91f…7a30` |

The route file `frontend/apps/studio/src/routes/projects/notebook/$channelId/edit.tsx` reads `$channelId` and forwards into the lab root. The lab root resolves:

| `$channelId` | Action |
|---|---|
| `default` | If no active session → session picker. Else, if no `nblab.welcome.shown.<sessionId>` flag → show welcome notebook (US1). Else, redirect to in-lab index. |
| `new` | Force welcome notebook regardless of flag (used for re-entry from "Show me the welcome again" in Settings). |
| `<uuid>` | Load that notebook from IndexedDB and open it. If not found in this session, surface a friendly "Not in this session" state with a link to the index. |

The lab MUST NOT introduce additional studio routes.

## Deep-link query parameters

Only one query parameter is recognized in v1:

| Parameter | Meaning | Action |
|---|---|---|
| `?github=<owner>/<repo>/blob/<ref>/<path>.ipynb` | Import from GitHub | See "Import flow" below. |
| `?github=<owner>/<repo>/raw/<ref>/<path>.ipynb` | Same | Same |

Other query parameters are ignored (preserved on the address bar only if they're not stripped by the import flow).

**Notably absent**:
- `?OPENAI_API_KEY=…` — explicitly removed in v1 per the panel review.
- `?notebook=<url>` — out of scope; use the in-app URL dialog or a join code.

## GitHub URL rewrite

Implemented in `storage/githubUrl.ts`. Verbatim port of jupyter-k12.

Input patterns:
- `https://github.com/<owner>/<repo>/blob/<ref>/<path>`
- `https://github.com/<owner>/<repo>/raw/<ref>/<path>`

Rewrite to:
- `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>`

URLs not matching either pattern are passed through unmodified.

## Join codes

Format: `^[A-Z0-9]{4,6}$` (e.g., `NB7K`, `MA72X3`). Case-insensitive on input; uppercased on resolution.

**Resolver**:
- Primary: `@code-dot-org/core` API client method `joinCodes.resolve(code)` returning `{ url, teacherLabel? }`. To be wired by platform.
- Fallback (until the resolver lands): `GET https://code.org/go/<code>` and follow the 302; the lab takes the final URL as the notebook source. This fallback is documented in `quickstart.md`.

The lab passes the resolved URL through `githubUrl` rewrite and into the standard import flow. Join-code resolution is the only network call the lab makes in v1 outside of (a) the initial Pyodide download and (b) video cell media loads.

## Import flow (canonical)

All three import paths (`?github=`, URL dialog, file picker, join code) converge into one pipeline in `storage/importer.ts`:

1. **Acquire bytes**.
   - `?github=` / URL dialog / join code: `fetch(rewrittenUrl)`; reject on non-2xx with a localized error.
   - File picker: `FileReader.readAsText(file)`.
2. **Parse JSON**. Reject on parse error with a localized "This file is not a notebook" message.
3. **Validate as Jupyter v4** per the notebook-schema contract. Reject otherwise.
4. **Backfill cell ids** where missing.
5. **Normalize `metadata.folder`** to leading slash.
6. **Stamp source**: `'import-github' | 'import-url' | 'import-file' | 'import-joincode'`.
7. **Stamp current unit** if the learner is in a unit context at import time (FR-030).
8. **Generate a fresh notebook UUID**; do not preserve any incoming id.
9. **Write to IndexedDB** under the active session.
10. **Strip the `?github=` query parameter** from the address bar.
11. **Navigate** to `/app/projects/notebook/<newUuid>/edit`.

If any step fails, the in-progress write is rolled back (no partial record).

## Artifact route (FR-046/047)

The completion artifact (see `contracts/completion-artifact.md`) is consumed via:

```
/app/projects/notebook/artifact#artifact=<base64url-zlib-encoded-json>
```

The `artifact` channel id is reserved for this purpose. The lab root recognizes it, decodes the fragment, and renders the read-only `CompletionArtifact` view. No IndexedDB access, no Pyodide warm-up, no session picker — artifact view is stateless.

## Address-bar hygiene

After every import the lab MUST strip `?github=` from the URL via `router.history.replaceState`. The artifact `#artifact=` fragment is preserved on view but stripped if the learner navigates away.

## Versioning

URL contract is v1.0. Adding a new recognized query parameter is a MINOR bump; changing the route shape is a MAJOR bump and requires coordination with curriculum-sharing tooling.
