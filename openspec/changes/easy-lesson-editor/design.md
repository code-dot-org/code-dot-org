## Context

The lesson show page (`LessonsController#show` → `dashboard/app/views/lessons/show.html.haml` → React component `apps/src/templates/lessonOverview/LessonOverview.jsx`) is React-mounted: the Rails controller calls `Lesson#summarize_for_lesson_show`, the resulting hash is serialized into the page, and the client renders text fields through `SafeMarkdown` / `EnhancedSafeMarkdown`. Most lesson body text lives on the `Lesson` model itself (overview, purpose, preparation, announcements, etc.) or on child records — `LessonActivity`, `ActivitySection`, `Resource`, `Vocabulary`, `Objective`. These records are already editable through the existing levelbuilder lesson editor (`LessonsController#edit` / `#update`), which serializes the entire lesson tree and re-saves it as one document.

Today a curriculum author who spots a typo on a lesson show page must navigate to the lesson editor, find the right field in a long form, save the whole lesson, and reload the show page to confirm. That round trip is the dominant cost for one-character fixes and discourages improvements. We want an in-page editor that handles typo-class edits without the round trip, leaving structural edits to the existing editor.

Constraints the design must respect:
- **Same storage format as the lesson editor.** No migration; raw markdown + inline HTML stays as-is.
- **Server authoritative on permission and on which fields are editable.** Client affordances are a UX hint.
- **No new heavy frontend deps.** No rich-text editor. Plain textarea (or contenteditable) is enough.
- **Coexist with the existing lesson editor.** The lesson editor still saves whole-lesson documents; in-page edits update single fields. Last writer wins on field overlap.

## Goals / Non-Goals

**Goals:**
- Levelbuilder users on the levelbuilder environment can fix typos on a lesson show page without a full-page navigation to the lesson editor.
- Each editable region on the rendered page maps to a single `(model, record id, field)` triple via a stable identifier emitted by the renderer.
- Saves persist via a small field-scoped endpoint that authorizes every request and re-renders the saved field for the client.
- The save indicator is subtle and the user can keep typing/clicking elsewhere without ceremony.

**Non-Goals:**
- Rich text editing (toolbars, formatting buttons, slash menus).
- Adding, removing, or reordering activities, sections, resources, vocabularies, objectives, or any other lesson sub-records.
- Migrating the storage format away from markdown + inline HTML.
- Multi-user concurrency control beyond last-write-wins. No locks, no conflict detection, no presence.
- Inline editing on student-facing or non-levelbuilder pages, on non-levelbuilder environments, or on any page other than the lesson show page.
- Undo/history beyond whatever audit trail the existing lesson editor already produces.

## Decisions

### 1. Field-level editing, not range-level
Each editable region maps to a single `(model, record id, field)` triple. The renderer wraps every editable field in an element carrying a stable identifier (`data-editable-field`), and the client maps clicks to that identifier rather than to character ranges.

Why: We already store fields as discrete columns (`Lesson#overview`, `ActivitySection#description`, etc.); the lesson editor already updates them as such. Range-level editing would require either a real rich-text model or constant re-derivation of "which field is this range inside," neither of which the existing storage supports cheaply. Field-level matches the data model exactly.

Alternatives considered: a contenteditable surface over the whole rendered page with a diffing layer that maps DOM mutations back to fields. Rejected: too much new machinery for a typo-fix feature, and brittle against client-side markdown rendering.

### 2. Editable identifier shape: `data-editable-field="<model>:<id>:<field>"`
A single attribute on the wrapping element, value of the form `lesson:1234:overview` or `activity_section:5678:description`. The client never invents identifiers; it only reads what the server emitted.

Why: Self-describing and trivially parseable on both ends. Stable across renders of the same record. Easy to allowlist on the server (the allowlist is keyed on `(model, field)` and the id is taken from the URL/body, not from the attribute, to keep parsing simple).

Alternatives considered: opaque tokens (signed payloads). Rejected as needless ceremony for a feature that re-authorizes server-side anyway.

### 3. Raw-source editor, no rendering on the way in
When the user clicks an editable region, the client requests the field's raw stored source from the server (or reads it from data already serialized into the page if it is already present in a form we trust) and shows it verbatim in a `<textarea>`. We explicitly do not render the source through any client-side transform on the way into the editor.

Why: The point of the feature is to fix typos in the source. The author asked for raw-source editing; exposing raw structure is acceptable; and it sidesteps every round-trip-fidelity problem you get from a rich-text editor over markdown.

Open question: whether to embed raw source in the initial page payload or fetch it on click. Default to **fetch on click** (`GET /lessons/:id/inline_field?model=...&id=...&field=...`) so we do not bloat the initial page payload with every field's source for users who never enter edit mode. Fast enough on first click; the editor opens optimistically and fills in when the response arrives.

### 4. Save on blur, no while-typing autosave
On blur, if the value changed from what was loaded into the editor, send a single PATCH. No debounced autosave during typing.

Why: Simpler model, no churn of intermediate-state writes, no need to reason about conflicting in-flight requests for a single field. Save-on-blur matches what we already do in several levelbuilder forms.

Alternatives considered: explicit Save button (rejected — more clicks than the toggle saves), debounced autosave (rejected — added complexity for no win at typo-fix scale).

### 5. New field-scoped endpoint, not reuse of `LessonsController#update`
Add a new endpoint scoped to lesson sub-trees. Concrete shape:

```
PATCH /lessons/:lesson_id/inline_field
  body: { model: "activity_section", id: 5678, field: "description", value: "..." }
  response (200): { value: "...", rendered_source: "..." }
  response (403): { error: "..." }
  response (422): { error: "..." }
```

The existing `LessonsController#update` takes the whole serialized lesson tree and re-saves it; reusing it for a one-field edit would be wasteful and would risk clobbering concurrent edits to unrelated fields. The new endpoint:

- Runs `require_levelbuilder_mode_or_test_env`.
- Authorizes the parent lesson via CanCanCan (same as `#update`).
- Looks the `(model, field)` pair up in a server-side allowlist; rejects anything not on it.
- Loads the named record, verifies it belongs to the named lesson (no cross-lesson updates through a guessed id), assigns the value, and saves.
- After the DB save succeeds, in levelbuilder mode, reloads the parent script and calls `@lesson.script.write_script_json` — the same call `LessonsController#update` makes at [lessons_controller.rb:204-210](dashboard/app/controllers/lessons_controller.rb#L204-L210). Without this the DB row and the checked-in `dashboard/config/scripts_json/<script>.script_json` file diverge, and the change is lost on the next deploy or env seed from script_json. If the rewrite raises, the endpoint surfaces the error to the client rather than silently swallowing it — the author needs to know the change is not durable.
- Re-runs whatever server-side preprocessing the show page applies (e.g. `MarkdownPreprocessor`) and returns the saved value plus the preprocessed source the client should hand to `SafeMarkdown`.

Why we return preprocessed source instead of fully-rendered HTML: the lesson show page renders markdown client-side via `SafeMarkdown`. Returning HTML would require either rendering server-side (a second markdown pipeline to keep in sync) or instructing the client to skip its renderer for just this fragment. Returning the saved raw value (and any server-side preprocessed substitutions) lets the client re-run its existing `SafeMarkdown` on the new value, which is the same code path a fresh page load would take. The proposal language about "freshly rendered HTML" should be read as "the source the client renders, with any server-side preprocessing applied" — same observable outcome.

### 6. Server-side allowlist of editable `(model, field)` pairs
A small Ruby constant (or per-model declaration) names every `(model, field)` pair the in-page editor is allowed to write. The endpoint refuses anything else. The frontend renderer reads the same allowlist (or a derived view of it) to decide which fields get `data-editable-field` attributes.

Why: Defense in depth and clarity. Even if a bug or curious user POSTs an arbitrary field name, the server refuses. The allowlist also documents — in one place — which fields are in scope for this phase.

Initial allowlist (subject to refinement during apply):
- `Lesson`: `overview`, `purpose`, `preparation`, `assessment_opportunities`, announcement bodies if cheap.
- `LessonActivity`: `name`.
- `ActivitySection`: `name`, `description`, `remarks`.
- Out: any `position` / ordering field, any parent-association id, anything that controls visibility or membership.

### 7. Renderer emits identifiers, gated on permission
The Rails view (or the React component, on read of a flag in `@lesson_data`) emits `data-editable-field` only when both checks pass: levelbuilder environment AND current user has the levelbuilder permission. Non-levelbuilder readers see no attributes and no toggle.

Why: We do not want to leak the existence/shape of the inline editor to other users, and we do not want the React bundle for the toggle and editor to run for non-authors. Gating at the serialized-data level (e.g. add a single `lesson_data.inline_editing_enabled` boolean and a per-field `editable_id` field on each editable record's payload) keeps the gate in one place.

### 8. UI affordance: a single page-level toggle plus per-field hover
A toggle in the lesson show page chrome flips a client-side `editMode` flag. When on, editable regions get a subtle outline on hover and a click target; clicking opens the field editor in place. When off, no visual change versus today.

Why: Mirrors what the proposal asked for. One toggle, no per-region "edit" buttons in the chrome.

## Risks / Trade-offs

- **Two write paths for the same fields.** The existing lesson editor and the new inline endpoint can both write `Lesson#overview` etc. → *Mitigation*: last-write-wins is acceptable in this phase (the lesson editor already has no concurrency protection between two simultaneous editors); document this. Long-term we may want optimistic concurrency tokens on field saves.
- **`write_script_json` dominates save latency.** Re-serializing the whole unit's script_json on every per-field save will be the dominant cost, especially for large units (CSP/CSD scale), and may make the "Saved" indicator feel slow → *Mitigation*: match the existing lesson-editor behavior (synchronous rewrite) for this phase. If latency turns out to be a real friction we can revisit (debounced background rewrite, dirty-flag the unit, or a write-on-toggle-off model) — but only with explicit follow-up since dropping the rewrite from the save path is exactly the durability bug we are calling out.
- **Markdown surprises in raw mode.** Authors editing raw markdown can accidentally break formatting (mismatched fences, broken HTML) → *Mitigation*: render the saved value through the existing pipeline on save and return it to the client; if the client notices the rendered output is empty or malformed it can warn (out of scope for the first cut beyond "Saved" / error messaging).
- **Permission drift between renderer and endpoint.** If the renderer emits `data-editable-field` for a field the endpoint does not allow, users would see a clickable region that always 422s → *Mitigation*: share one allowlist between the renderer's "is this field editable" check and the endpoint's gate. Add a unit test that the two views agree.
- **Cache headers on the show page.** Lesson show responses set caching (`disable_session_for_cached_pages`); we must not cache the version with editing affordances → *Mitigation*: render the editing-affordance variant only when the user is signed in as a levelbuilder, which already prevents caching for that path; verify in apply.
- **React bundle weight.** Edit-mode code should not load for the 99.9% of viewers who are not levelbuilders → *Mitigation*: code-split the inline editor behind the toggle's `editMode` flag, or behind the `inline_editing_enabled` server flag.
- **The "stable" identifier is only stable across renders of the same record.** Adding/removing/reordering records (which this change does not do in-page) can change which record a position-based identifier maps to → *Mitigation*: identifiers carry record id, not position, so they remain valid as long as the record exists. If the lesson editor deletes a record between the page load and a click, the save will 404, which the client surfaces.

## Migration Plan

No data migration. Roll out behind the existing levelbuilder + environment gates, which already restrict the audience to internal authors. If something is wrong, revert the renderer flag (`inline_editing_enabled`) to `false`; the endpoint can be left mounted or removed in a follow-up.

## Open Questions

- Initial allowlist scope: the list above is a starting set. Walk the lesson show page's actual rendered fields during apply and pick the final list with a curriculum reviewer.
- Embed raw source in `@lesson_data` vs fetch-on-click: leaning fetch-on-click for payload size, but if the source is already serialized for some fields, prefer using it.
- Save indicator placement and timing: subtle inline near the saved field, dismiss after ~1.5s. Confirm during apply by clicking through the rendered page.
