# Phase 1 Data Model: K-12 Notebook Lab

Entities exposed to learners, curriculum authors, and the lab's internal stores. Field names use TypeScript convention; storage shape (IndexedDB, prefs store, in-memory) is named where it differs.

## Storage layers

| Layer | What lives here | Lifetime |
|---|---|---|
| **IndexedDB `NotebookLabDB`** | Notebook records (one per learner per session per notebook) | Until session is deleted by the learner, site data is cleared, or the app is uninstalled |
| **Capacitor Preferences / `localStorage`** | Session catalog, UI preferences scoped per session, seed-version stamp per session | Same as the platform's preference store |
| **In-memory stores (React state)** | Active session id, runtime status, lesson-completion derived state, transient dialogs | Cleared on tab close / app exit |

The split is enforced by a single `prefsStore` abstraction (`src/storage/prefsStore.ts`) and a single `NotebookLabDB` wrapper (`src/storage/NotebookLabDB.ts`).

---

## 1. Notebook

The Jupyter v4 document plus our metadata extensions.

```ts
interface Notebook {
  nbformat: 4;
  nbformat_minor: number;          // typically 2 or 5
  metadata: NotebookMetadata;
  cells: Cell[];
}

interface NotebookMetadata {
  /** Friendly name for the index + renderer header. Falls back to filename. */
  title?: string;

  /**
   * Unix-style path identifying the unit, e.g. "/lessons/unit3".
   * Preserved as data only; the chrome never renders it as a path.
   */
  folder?: string;

  /** Lesson goal — locale-aware one-liner under the title (US10). */
  goal?: LocalizedString;

  /** Curriculum author or teacher attribution for the Assigned section (US5). */
  author?: string;

  /** Named substitutions referenced via `{{NAME}}` in cell sources. */
  globals?: Record<string, Global>;

  /** Pass-through: language_info, kernelspec, and any other Jupyter metadata. */
  [k: string]: unknown;
}

type LocalizedString = string | { default: string; [locale: string]: string };

interface Global {
  default: string;
  [locale: string]: string;        // per-locale overrides
}
```

**Validation** (on import + on load):
- `nbformat === 4` else reject.
- `cells` must be an array.
- Every cell must have an `id`; loader backfills missing ones with a fresh UUIDv4.
- `metadata.folder`, if present, is normalized to a leading slash.
- `metadata.globals` keys must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/`; offending keys are dropped with a console warning.

**State transitions**: a notebook moves through *fresh* → *opened* → *edited* → *saved* and back to *opened*; transitions are derived from `updated` timestamps and the autosave status (see Notebook Record).

---

## 2. Cell

```ts
interface Cell {
  id: string;                      // UUIDv4
  cell_type: 'code' | 'markdown' | 'raw';
  metadata: CellMetadata;
  source?: string[];               // canonical: array of lines, each ending '\n'
  outputs?: Output[];              // code cells only
  execution_count?: number | null; // code cells only; we do not track this in v1
}

interface CellMetadata {
  /** Cell-level tags. Recognized: 'video', 'chat', 'hide_code'. */
  tags?: string[];

  /** Per-cell locale overrides for the cell source. */
  i18n?: Record<string, string[]>;

  /** Pass-through for any other metadata. */
  [k: string]: unknown;
}
```

**Dispatch table** (in `CellList.tsx`):

| `cell_type` | tags include | Renderer |
|---|---|---|
| `code` | (any) | `CodeCell.tsx` |
| `markdown` | (any) | `MarkdownCell.tsx` |
| `raw` | `video` | `VideoCell.tsx` |
| `raw` | `chat` | `ChatPlaceholder.tsx` (v1) |
| `raw` | other | `UnsupportedCell.tsx` |

`hide_code` on a code cell hides the editor while leaving controls and outputs visible.

---

## 3. Output

Matches Jupyter's stream / execute_result / error union, narrowed to what we render.

```ts
type Output =
  | { output_type: 'stream'; name: 'stdout' | 'stderr'; text: string[] }
  | { output_type: 'execute_result'; data: Record<string, unknown> }
  | { output_type: 'error'; ename?: string; evalue?: string; traceback: string[] };

// Renderable MIME keys we support in `execute_result.data`:
//   'text/plain' | 'text/html' | 'image/png' | 'image/svg+xml'
```

Outputs survive save/restore. The lab caps stdout at a configurable limit per cell (default 100 KB) and inserts a single trailing "[…output truncated]" marker if exceeded.

---

## 4. Notebook Record (IndexedDB shape)

The persisted shape, distinct from the in-memory `Notebook`.

```ts
interface NotebookRecord {
  /** Composite key: `${sessionId}::${notebookId}`. */
  key: string;
  /** UUIDv4. */
  notebookId: string;
  /** UUIDv4 of the owning session. */
  sessionId: string;
  /** The Notebook JSON itself. */
  notebook: Notebook;
  /** Epoch ms. */
  created: number;
  /** Epoch ms. */
  lastModified: number;
  /** Sticky source — where this notebook came from. */
  source: 'seed' | 'import-file' | 'import-url' | 'import-github' | 'import-joincode' | 'welcome';
  /** Sample manifest entry id when source === 'seed'; else undefined. */
  seedId?: string;
}
```

**Indexes** on the store: `sessionId`, `(sessionId, lastModified)`, `(sessionId, source)`.

---

## 5. Session

```ts
interface Session {
  /** UUIDv4 generated on creation. Never the human label. */
  id: string;
  /** Learner-visible label or 4-char seat code; treated as PII for telemetry. */
  label: string;
  /** Epoch ms. */
  created: number;
  /** Epoch ms; updated on every interaction. */
  lastActive: number;
}

interface SessionCatalog {
  sessions: Session[];
  /** id of the active session; null when the picker should show. */
  activeId: string | null;
  /** ms; default 1_200_000 (20 minutes). */
  idleTimeoutMs: number;
}
```

**Storage**: a single JSON blob `nblab.sessionCatalog` in the prefs store.

**State transitions**:
- *no-session* → *active* via `SessionPicker`.
- *active* → *idle* after `idleTimeoutMs` without interaction → *no-session* on next interaction.
- *active* → *no-session* on explicit "Sign out of this session."
- Session deletion is permitted from a destructive affordance in Settings (Phase 2 — Tasks); deletion removes all notebooks scoped to that session id.

---

## 6. Preferences (per-session)

```ts
interface SessionPreferences {
  sessionId: string;
  theme: 'light' | 'dark';
  locale: 'en-US' | 'ja-JP' | 'hi-IN' | 'fa-IR';
  accessibility: {
    readAloud: boolean;
    font: 'default' | 'opendyslexic';
    lineSpacing: 1.0 | 1.5 | 2.0;
    focusMode: boolean;
  };
}
```

**Storage**: a JSON blob keyed `nblab.prefs.<sessionId>` in the prefs store. Restored on session activation.

---

## 7. Parameter Widget

Derived (not stored) — parsed from code cell source on every render.

```ts
type Parameter =
  | { kind: 'value';    name: string; value: string | number;            line: number; prompt?: string }
  | { kind: 'slider';   name: string; value: number;  min: number; max: number; step: number; line: number; prompt?: string }
  | { kind: 'dropdown'; name: string; value: string;  options: string[]; line: number; prompt?: string }
  | { kind: 'boolean';  name: string; value: boolean;                    line: number; prompt?: string };
```

`prompt` is sourced from the `prompt:` key inside the `#@param` JSON. Locale overrides for `prompt` are honored via a side-table on the cell — opt-in, not required.

Identifier-derived fallback when `prompt` is absent: `TEMPERATURE` → "Try a temperature"; `MODEL` → "Pick a model"; rule is `lowerCamel(identifier).split('_').join(' ')` prefixed with an i18n stem like "Try ".

---

## 8. Lesson Completion (derived)

```ts
interface CellRunRecord {
  cellId: string;
  ranAt: number;                   // epoch ms; null/undefined ⇒ never run
  succeeded: boolean;              // last run outcome
}

interface CompletionState {
  notebookId: string;
  runnableCellIds: string[];       // code cells with non-empty source
  ranCellIds: string[];            // subset of runnableCellIds with ranAt !== null
  isComplete: boolean;             // ranCellIds covers runnableCellIds
  completedAt: number | null;      // epoch ms when isComplete first became true in this session
}
```

`CellRunRecord[]` lives **inside the Notebook Record** under a non-Jupyter `cdo` metadata key (`notebook.metadata.cdo.runHistory`) so it survives autosave alongside the cell outputs. The `cdo` namespace keeps our extensions out of any export the learner sends to a teacher.

---

## 9. Sample Manifest entry

```ts
interface SampleManifestEntry {
  /** Filename relative to samples/ */
  file: string;
  /** Target unit (metadata.folder) when seeded. */
  folder?: string;
  /** Display author for the Assigned section. */
  author?: string;
  /** Curriculum-authored goal — same shape as Notebook.metadata.goal. */
  goal?: LocalizedString;
  /** Stable id; used by the seeder to detect re-seed without duplication. */
  seedId: string;
  /** Per-sample version stamp; increment to force a non-destructive re-seed. */
  seedVersion: number;
}

interface SampleManifest {
  manifestVersion: 1;
  samples: SampleManifestEntry[];
}
```

**Storage**: `samples/index.json` in the lab package (static asset).

---

## 10. Join Code

```ts
interface JoinCode {
  /** Short alphanumeric, project-defined format (e.g. /^[A-Z0-9]{4,6}$/). */
  code: string;
  /** Resolved notebook source URL after the resolver round-trips. */
  resolvedUrl: string;
  /** Optional metadata returned by the resolver. */
  teacherLabel?: string;
}
```

`JoinCode` is transient — not persisted; the resolved URL is fed into the importer and the resulting NotebookRecord carries `source: 'import-joincode'`.

---

## 11. Completion Artifact

```ts
interface CompletionArtifact {
  sessionLabel: string;
  notebookId: string;
  notebookTitle: string;
  unit?: string;                   // friendly unit name, not the raw folder
  generatedAt: number;
  cells: Array<{
    cellId: string;
    kind: 'code' | 'markdown' | 'raw';
    runState: 'untried' | 'ran-ok' | 'ran-error' | 'n/a';
    lastOutput?: {
      kind: 'text' | 'html' | 'png' | 'svg' | 'error';
      /** Truncated to a hard cap (default 400 chars / 100 KB image). */
      preview: string;
    };
  }>;
}
```

**Encoding for the QR**: `base64url(zlib(JSON.stringify(artifact)))` placed in the URL fragment `#artifact=<encoded>`. The artifact-view route in the lab decodes it and renders.

**Validation**:
- Artifact MUST NOT include cell source the learner typed.
- Artifact MUST NOT include API keys (none accepted in v1 anyway).
- Output previews are truncated; one cell's preview cannot exceed the hard cap.

---

## Relationships

```
SessionCatalog
   └─ Session (1..N)
        ├─ SessionPreferences (1)
        └─ NotebookRecord (0..N)
              └─ Notebook
                   ├─ NotebookMetadata
                   │     └─ Global (0..N, locale-keyed)
                   └─ Cell (0..N)
                         ├─ CellMetadata (incl. cdo.runHistory)
                         ├─ Output (0..N, code only)
                         └─ Parameter (derived from source, code only)

SampleManifest (static)
   └─ SampleManifestEntry (18 in v1)
        ─seeds→ NotebookRecord (one per session, idempotent by seedId/seedVersion)

CompletionArtifact (transient, derived from Notebook + CellRunRecord)
   ─encoded into→ URL fragment ─QR→ teacher device
```

---

## Validation summary

| Concern | Where enforced |
|---|---|
| Jupyter v4 format | `storage/importer.ts` on every import path |
| UUIDs on all cells | `storage/importer.ts` + `storage/notebookRepo.ts` on load |
| Folder leading-slash normalization | `storage/importer.ts` + `Notebook.metadata.folder` setters |
| Globals identifier regex | `dialogs/GlobalsDialog.tsx` + `storage/importer.ts` |
| Param `prompt:` locale fallback chain | `cells/code/parameterParser.ts` + `i18n/StringsProvider.tsx` |
| Output stdout cap | `runtime/PyodideProvider.tsx` (truncates before writing to the cell record) |
| Artifact PII scrub | `artifact/artifactPayload.ts` (whitelist of fields, asserted by a unit test) |
| Telemetry whitelist | `telemetry/wrapper.ts` (single emit boundary) |
