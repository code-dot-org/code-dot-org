# Phase 7 — Levelbuilder save format

Goal: levelbuilders editing a Java Lab level always write the new
`MultiFileSource` shape to `start_sources` on save. Old levels remain
loadable because `Javalab.convert_legacy_start_sources` (Phase 1) is
idempotent on either shape — once a level is re-saved, its `start_sources`
property is in the new shape on disk.

## What `useSource` already does

Codebridge's `useSource` hook (in `apps/src/codebridge/hooks/useSource.ts`)
watches for start-mode edits and posts on Save:

```ts
{ start_sources: parsedSource, validation_file: validationFile }
```

`parsedSource` is a `MultiFileSource`. `validationFile` is a single
`ProjectFile`. Pythonlab uses this flow today, so the codebridge side is
already correct for Java Lab — no JS changes required.

## Server work

`Javalab#start_sources=` (auto-defined by `serialized_attrs`) currently
accepts any value and writes it to `properties['start_sources']`. There
is no shape validation. After Phase 7 the property holds a
`MultiFileSource` after any new save.

Tasks:

1. **No setter change needed for the happy path.** Hash gets persisted
   as JSON in the `properties` text column; either shape round-trips
   correctly.

2. **Adjust the levelbuilder edit URL** if Phase 6 has not already done
   so. The "Edit Start Code" link in
   `dashboard/app/views/levels/editors/_javalab.html.haml` currently
   points at `/levels/:id/edit_blocks?type=start_sources`, which renders
   the legacy bundle. Repoint to the lab2 query-param form (see Phase 6).

3. **Validation files**. The codebridge save POST sends
   `validation_file` (singular). Old Java Lab stored validation as a
   hash `{filename: code}` under `encrypted_validation`. Decide:

   - **Option A**: keep the encrypted hash. The lab2-side `validation_file`
     payload is a single file; ignore it and continue to use a separate
     dedicated "edit validation" UI. Simpler; no DB write changes.
   - **Option B**: migrate validation to a single inlined file in
     `start_sources` with `type: 'validation'`. The codebridge
     `prepareSourceForLevelbuilderSave` already splits these out at save
     time. This is cleaner long-term.

   Recommend Option A for v1.

4. **YAML round-trip**. Levels also persist via
   `dashboard/lib/cdo/level_loader.rb` (or similar) when exported to
   `dashboard/config/levels/custom/**/*.level`. Confirm the new hash
   shape survives the YAML serializer. Search:

   ```
   grep -rn "start_sources" dashboard/lib/cdo/
   ```

   If the loader does any custom unwrapping for the old `{filename: code}`
   shape, generalize it to pass either shape through unchanged.

## Tests

Add to `dashboard/test/models/javalab_test.rb`:

- Save a `MultiFileSource` hash directly to `level.start_sources`,
  reload, run through `convert_legacy_start_sources` — output is
  identical to input (idempotency on the new shape is already covered).
- Save a level, export its YAML, re-import, confirm `start_sources` is
  byte-identical.

## Verification

1. As a levelbuilder, edit start code on a published javalab level.
   Save. Inspect `properties.start_sources` in `rails runner`: it
   should now have `folders` / `files` / `openFiles`.
2. Load the same level as a student. The starter shows the saved files.
3. Other places that read `start_sources` (test runner, share view,
   exemplar view) still render correctly — they all go through
   `summarize_for_lab2_properties`, which converts on read.
