## Why

Curriculum authors today fix typos and small wording errors on lesson pages by leaving the rendered page, navigating to the lesson editor, finding the right field among many, editing it, saving, and reloading the rendered page to confirm. For one-character fixes that round trip is the dominant cost, and it discourages authors from making small improvements at all. An in-page edit mode — restricted to typo-style edits of existing fields — would let authors fix what they see where they see it, while leaving structural edits to the existing lesson editor.

## What Changes

- Add an "edit mode" toggle on the lesson show page, visible only to users with the levelbuilder permission on the levelbuilder environment.
- When edit mode is on, editable regions on the rendered page become clickable; clicking one swaps the rendered HTML for a plain raw-source editor (textarea / contenteditable) bound to that field. Markdown and inline HTML are shown as-is.
- On blur, if the content changed, PATCH the field to a new server endpoint, which authorizes, validates, persists, and returns the saved value (with any server-side preprocessing the show page applies) for that one field. The client re-renders that field in place using the same client-side renderer the page used on initial load, leaving the rest of the page untouched, and shows a subtle "Saved" indicator.
- The lesson page renderer emits a stable identifier (e.g. `data-editable-field="<id>"`) on each editable region so the client can map clicks to fields without inventing positional rules.
- Permission and field-allowlist enforcement live on the server; client affordances are a UX hint, not a security boundary.
- No structural edits (add/remove/reorder of activities, sections, blocks), no rich-text toolbar, no storage-format migration. Those remain in the existing lesson editor.

## Capabilities

### New Capabilities
- `lesson-inline-editing`: In-page edit mode on the lesson show page that lets authorized users edit individual lesson text fields in place, persisting via a field-scoped PATCH endpoint and re-rendering on save.

### Modified Capabilities
<!-- None. The existing lesson editor is unchanged; rendering changes are additive (data attributes only). -->

## Impact

- **Backend (Rails)**: New field-scoped update endpoint scoped to lessons (and the per-lesson child records whose fields are exposed, e.g. activities, activity sections). Server-side allowlist of editable `(model, field)` pairs. Reuse of the existing server-side preprocessing (e.g. `MarkdownPreprocessor`) so the save response carries the same shape of per-field data the show page already passes to the client renderer — not server-rendered HTML.
- **Frontend**: New client-side edit-mode controller on the lesson show page. New raw-source field editor component (textarea-based). Wiring to the new PATCH endpoint and re-render of the single saved field via the existing client-side renderer (`SafeMarkdown` / `EnhancedSafeMarkdown`). No new heavy dependencies (no rich-text editor).
- **Rendering**: The lesson show view (and the partials it composes for activities / sections / etc.) emit `data-editable-field` attributes on the elements wrapping editable fields. Non-edit-mode users see no visible change.
- **Authorization**: Existing levelbuilder permission check is reused; the endpoint also requires levelbuilder environment, matching the rest of the lesson editor surface.
- **Out of scope**: storage format changes, structural edits, multi-user concurrency (last write wins for this phase), undo/history beyond what the existing audit trail already captures.
