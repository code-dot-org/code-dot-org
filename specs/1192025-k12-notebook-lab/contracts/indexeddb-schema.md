# Contract: IndexedDB Schema (`NotebookLabDB`)

The lab uses one IndexedDB database for notebook content. Session catalog and UI preferences live in the platform preference store (separate contract — see plan.md and `data-model.md §6`).

## Database

| Field | Value |
|---|---|
| Name | `NotebookLabDB` |
| Current version | `2` |

## Object store

### `notebooks`

| Field | Value |
|---|---|
| `keyPath` | `"key"` |
| `autoIncrement` | `false` |
| Record shape | `NotebookRecord` (see `data-model.md §4`) |

`key` is the composite `<seatId>::<notebookId>` so every lookup, list, or delete is implicitly seat-scoped.

### Indexes

| Index name | `keyPath` | Multi-entry | Unique |
|---|---|---|---|
| `by_seat` | `"seatId"` | no | no |
| `by_seat_modified` | `["seatId", "lastModified"]` | no | no |
| `by_seat_source` | `["seatId", "source"]` | no | no |
| `by_seat_seedId` | `["seatId", "seedId"]` | no | no |

### Lookup patterns

| Use case | Query |
|---|---|
| Open a known notebook | `store.get("<seatId>::<notebookId>")` |
| List all notebooks for this seat | `store.index("by_seat").getAll(seatId)` |
| Recent (Continue) | `store.index("by_seat_modified").openCursor([seatId, +Infinity], "prev")`, take first 3 |
| Imported (Assigned) | `store.index("by_seat_source").getAll([seatId, "import-*"])` (one query per source value, merged in JS) |
| Detect previously-seeded sample | `store.index("by_seat_seedId").get([seatId, seedId])` |

## Migration rules

- Version bumps go through `onupgradeneeded` and are forward-only.
- The lab MUST NOT delete the store on upgrade unless explicitly listed in the migration code path and accompanied by a learner-visible migration notice (no silent data destruction).
- Future versions adding new indexes MUST NOT change `keyPath` of the existing store.

### v1 → v2 migration (Phase 19)

- Renames `sessionId` → `seatId` in every `NotebookRecord`.
- Drops the old `by_session*` indexes and creates the `by_seat*` equivalents.
- Performed via a cursor walk in the `upgrade` callback; no data is deleted.

## Write rules

- All writes happen through `storage/notebookRepo.ts`. No code outside that module may open a transaction.
- `lastModified` is updated on every write.
- `created` is set on first write and never modified.
- The repo MUST validate `notebook` against the notebook-schema contract before writing.
- The repo MUST refuse to write a record whose `seatId` does not equal the active seat id (defensive — should never happen, but cheap insurance).

## Read rules

- All reads happen through `storage/notebookRepo.ts` or `storage/seeder.ts`.
- A read MUST NOT return a record from a different seat than the active one (the composite key makes accidental cross-seat reads structurally impossible from the repo, but the repo asserts this anyway).

## Quota and pressure

- The lab handles `QuotaExceededError` on write by:
  1. Setting save state to `error` with a localized message.
  2. Offering a "Save to file" affordance that downloads the in-memory notebook as `.ipynb`.
  3. Logging a telemetry event `nblab.quota.exceeded` with no PII.
- The lab MUST NOT silently drop writes.

## Deletion semantics

- Deleting a notebook: `store.delete("<seatId>::<notebookId>")`.
- Deleting a seat: `store.index("by_seat").openCursor(seatId)` and delete each record; also remove the seat's prefs blob from the prefs store.
- Site-data-clear (browser-initiated): outside our control; recoverable by re-seeding on next seat activation.

## Versioning

This contract is v2.0 (schema version 2). Schema changes follow IndexedDB version bumps and require a migration code path; the contract version in `package.json` is incremented in lockstep.
