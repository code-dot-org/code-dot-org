# javalab2

Java Lab on the Lab2 + codebridge stack. The legacy `apps/src/javalab/`
bundle remains the default; individual levels opt into this bundle by
setting the `uses_lab2` serialized property on the `Javalab` model. The
level type, model class, and Rails routing are unchanged.

## Opt-in flow

1. Levelbuilder editor renders the standard `levels/editors/fields/lab2`
   checkbox. Toggling it sets `properties.uses_lab2 = true` on the
   `Javalab` record.
2. `dashboard/app/views/levels/show.html.haml` dispatches `uses_lab2?`
   levels through `levels/_lab2.html.haml`, which boots the lab2 bundle.
3. `apps/lab2EntryPoints.ts` maps the `javalab` `appName` to
   `JavalabEntryPoint` from this directory.
4. Old (non-opted-in) Javalab levels continue rendering via
   `apps/src/javalab/`.

## Source format

Java Lab persists project sources to S3 in a **flat hash** keyed by
filename:

    {
      "MyClass.java": {
        "text": "...",
        "tabOrder": 0,
        "isVisible": true,
        "isValidation": false,
        "isOpen": true,
        "isActive": false
      },
      ...
    }

wrapped as `{source: <flat hash>}` in `main.json`. Javabuilder reads the
same shape server-side via `JavalabFilesHelper.get_project_files`. We
must keep this shape on the wire — javalab2 cannot break legacy
projects, and cannot change what Javabuilder reads.

`isOpen` and `isActive` are lab2-only additions that round-trip
codebridge's open-tab set and active-tab focus. Both are optional and
default to `isOpen=true`, `isActive=false`, so legacy levels without
these fields convert as they always have. Javabuilder ignores
unknown keys.

Asset (image/audio) files are flat entries with a `url` field pointing
at where the bytes live (`/v3/assets/<channelId>/<uuid>.<ext>` for
student uploads, `/level_starter_assets/<levelName>/uuid/<uuid>.<ext>`
for start-mode uploads) and `text: ''`. Javabuilder never sees these
entries: `JavalabFilesHelper` strips them out of `main.json` on every
run and folds them into the `assetUrls` map (friendly name → absolute
URL) it already sends, so the Javabuilder contract is unchanged.

Starter assets authored in legacy Java Lab exist only as the level's
`starter_assets` property (`{friendlyName => uuidName}`); their levels'
start sources carry no url entries. Lab2 treats that mapping as frozen
legacy data: `Javalab#add_starter_asset!` is a no-op for `uses_lab2`
levels (the weblab2 pattern), so lab2 uploads/deletes/renames never
touch it — the url entries in the sources are the single source of
truth. `starterAssets.ts` merges the mapping into the level's
start/template/exemplar sources as `STARTER` files, but only when the
source has no url-backed entries of its own; once a lab2 save persists
url entries, the mapping is never consulted for tree contents again
(so deletes and renames stick — known edge: deleting the last asset
from a legacy level brings the merge back). Projects loaded from S3
are never merged: like any other start-source change, assets reach a
student's project only when it is seeded from the level (fresh load or
start over). Locking starter assets against student edits will arrive
with the broader locked-starter-files support.

The flat shape doesn't persist file types, so the converter re-derives
asset types from where the url points: `/level_starter_assets/...` is a
levelbuilder-owned shared level asset (`STARTER`), while
`/v3/assets/<channelId>/...` is the student's own upload and stays
untyped — lab2 treats typed url files as levelbuilder-owned and would
otherwise skip the S3 delete + abuse unflag when a student removes one.

Codebridge, on the other hand, speaks `MultiFileSource`:

    {
      folders: {...},
      files: {<id>: {id, name, contents, folderId, type}, ...},
      openFiles: [<id>, ...]
    }

Conversion is confined to two boundaries:

- `JavalabSourcesStore` (subclass of `apps/src/lab2/projects/SourcesStore`)
  overrides `load`/`save`. S3 stays flat; Redux/codebridge see
  MultiFileSource. The store is injected through
  `apps/src/lab2/projects/sourcesStoreForApp.ts`, dispatched by
  `lab2Redux.ts` when `appName === 'javalab'`.
- `Javalab2View` calls `flatToMultiFile` on
  `levelProperties.startSources`, `templateSources`, and
  `exemplarSources` once at mount — those arrive flat from Rails and
  are read by `useInitialSources` as MultiFileSource.

`sourceConverter.ts` holds the pure converters and is the single source
of truth for the flat schema. Tests live in
`apps/test/unit/javalab2/sourceConverterTest.ts`.

Right now it's simplest to keep the old format so we don't have to touch Javabuilder.
However, this format prevents us from enabling folders. A potential extension if we want to enable
folders would be to start persisting code as MultiFileSource and have Javabuilder handle
that format.

## Run flow

`javabuilderRunner.ts` reuses the legacy
`apps/src/javalab/JavabuilderConnection` JS class as-is. A TS port is
still on the TODO list. Differences from legacy use:

- The legacy class reads `project.getCurrentId()` from the legacy
  project singleton, which is not initialized in lab2. The constructor
  now accepts an optional explicit `channelId`, sourced from
  `Lab2Registry.getInstance().getProjectManager()?.getChannelId()`.
- Console output is piped to codebridge's xterm via
  `CodebridgeRegistry.getConsoleManager().writePartialLine` and
  `writeConsoleMessage('')` (the latter for explicit newlines).
  `writeConsoleMessage` adds an implicit newline at the end, so we use
  `writePartialLine` for content to avoid double-spacing.
- User stdin from the codebridge console is forwarded back over the WS
  as a `SYSTEM_IN` message via `sendJavaConsoleInput`.
- `flushSave()` on the lab2 ProjectManager is awaited before connecting,
  so Javabuilder reads fresh source from S3 instead of a stale version.
  A brand-new project is force-saved instead (nothing is persisted before
  the first edit, and Javabuilder can't run a project with no sources).
- The access-token request requires `miniAppType`; we pin it to
  `'console'` (or `levelProperties.csaViewMode`, but only `'console'`
  is supported so far).

## Current Status of Conversion

- Per-level `uses_lab2` opt-in for `Javalab` (`dancelab` pattern).
- Horizontal layout (`layout/HorizontalLayout.tsx`)
- Source format adapter (round-trippable flat ↔ MultiFile).
- `JavalabSourcesStore` injected via per-app factory selection.
- Console-program run + stop against Javabuilder.
- Console stdin (`sendConsoleInput` → WS `SYSTEM_IN`).
- Folder-creation hidden from the codebridge file browser (Java Lab's
  flat S3 shape has nowhere to persist nested folders). The codebridge
  `ConfigType` gained an opt-in `hideNewFolderButton` flag.
- Run button enabled at mount — Java has no client-side runtime to warm
  up, so `setLoadedCodeEnvironment(true)` dispatches in a `useEffect`.
- Utilizes Lab2 resource panel, which gives us instructions, version history,
  and committing a named version for free.
- Can create/edit start sources and exemplars.
- Validation (student run path): a level with validation files shows the
  Lab2 Validate button; clicking it runs the level's tests on Javabuilder
  (`ExecutionType.TEST`), streams per-test results into the Lab2
  validation table, and an all-pass run reports completion. Plumbed via
  `get_validations` on `Javalab`, `TestResultValidator`, `ValidationTracker`,
  and an `onValidationResult` hook on the legacy `JavabuilderConnection`.
- Support for neighborhood
- Image and audio assets (`png jpg jpeg gif wav mp3`): uploadable via the
  codebridge file browser in both student and start mode, displayed
  inline for images, stripped into `assetUrls` server-side for
  Javabuilder. Legacy `starter_assets` levels seed their assets into the
  start sources. 
  The level's `starter_assets` mapping is never updated by lab2
  (`add_starter_asset!` no-ops for `uses_lab2` levels); it survives as
  frozen legacy data consulted only when seeding a source that has no
  url entries yet.
  Known limitation: starter assets aren't locked yet (students can
  rename/delete them; locking comes with locked-starter-files support).

## To Dos
- **Support locked starter files** you can lock starter files in start mode,
but we don't persist that information yet.
- **Theater mini-app** + photo prompter.
- **Backpack**
- **Captcha dialog** on `AuthorizerSignalType.CAPTCHA`.
- **Code review**.
- **Contained levels (predict levels)** — Java Lab uses the old 'contained levels'
  version of predict levels. We will need to support converting these levels
  to the lab2 predict level setup.
- **Decommissioning the legacy bundle**. `apps/src/javalab/` stays
  until parity is reached and all production levels have flipped
  `uses_lab2`.

## Files

- `Javalab2View.tsx` — root view. Converts `startSources` /
  `templateSources` / `exemplarSources` from flat to MultiFile, then
  hands off to `<Codebridge>`. Also flips `loadedCodeEnvironment` true
  at mount.
- `entrypoint.ts`, `index.js` — `Lab2EntryPoint` registration plumbing.
- `constants.ts` — `DEFAULT_PROJECT`, editable file types (`java`,
  `txt`, `csv`, `json`) plus uploadable media types (`png`, `jpg`,
  `jpeg`, `gif`, `wav`, `mp3`).
- `types.ts` — `JavalabLevelProperties` extends
  `CodebridgeLevelProperties` with `csaViewMode`.
- `starterAssets.ts` — merges the level's legacy `starter_assets`
  mapping into url-free level sources as `STARTER` files; also home of
  the starter-asset url helpers the converter uses for typing.
- `layout/HorizontalLayout.tsx` — three-panel layout (InfoPanel |
  Editor over Console). Vertical/share/widget slots all point at the
  same horizontal layout for now.
- `sourceConverter.ts` — `flatToMultiFile`, `multiFileToFlat`.
- `JavalabSourcesStore.ts` — `SourcesStore` subclass that applies the
  converter at the S3 load/save boundary.
- `javabuilderRunner.ts` — `handleRunClick`, `stopJavaCode`,
  `sendJavaConsoleInput`. Wraps the legacy
  `JavabuilderConnection`.
- `progress/JavaValidationTracker.ts` — singleton holding the per-test
  `ValidationResult[]` from the latest validation run.
- `codemirrorLangJava.d.ts` — minimal module declaration for
  `@codemirror/lang-java`, whose package.json doesn't expose its types
  via node16 `exports`.

## Related changes outside this directory

- `dashboard/app/models/levels/javalab.rb` — `uses_lab2` added to
  `serialized_attrs`.
- `dashboard/app/views/levels/editors/_javalab.html.haml` — lab2
  checkbox partial.
- `dashboard/app/views/levels/_lab2.html.haml` — added
  `javalab_locale.js` to the script chunk list.
- `apps/lab2EntryPoints.ts` — registered `javalab: JavalabEntryPoint`.
- `apps/src/lab2/projects/ProjectManagerFactory.ts` — both factory
  methods accept an optional `sourcesStore`.
- `apps/src/lab2/projects/sourcesStoreForApp.ts` — selects
  `JavalabSourcesStore` for `appName === 'javalab'`.
- `apps/src/lab2/lab2Redux.ts` — passes the selected store into the
  factory.
- `apps/src/codebridge/types.ts` — added `hideNewFolderButton` to
  `ConfigType`.
- `apps/src/codebridge/FileBrowser/FileBrowserHeaderPopUpButton.tsx` —
  honors `hideNewFolderButton`.
- `apps/src/codebridge/Console/Console.tsx` — `convertEol: true` on
  the xterm Terminal so program output containing bare `\n` (common in
  Java's `println`) wraps the cursor to column 0; without it, follow-on
  user-typed input was indented.
- `apps/src/javalab/JavabuilderConnection.js` — constructor accepts an
  optional `channelId` (falls back to `project.getCurrentId()`); the
  "project not edited yet" guard now reads `this.channelId` instead of
  re-fetching from the legacy singleton. Also accepts an optional
  `onValidationResult` callback, invoked per validation `TEST_RESULT` so
  Lab2 can populate its validation table.
- `apps/src/javalab/testResultHandler.js` — `onTestResult` additionally
  returns a `validationResult` (`{message, result}` with a Lab2
  `TestStatus`) for `TEST_STATUS` messages; legacy callers ignore it.
- `dashboard/app/models/levels/javalab.rb` — `get_validations` returns a
  single `PASSED_ALL_TESTS` condition when the level has validation.
- `dashboard/test/models/javalab_test.rb` — assertion that `uses_lab2?`
  defaults to false and honors the serialized property.
- `dashboard/app/helpers/javalab_files_helper.rb` — strips url-backed
  asset entries out of `main.json` (saved and override sources) and
  folds them into `assetUrls` as absolute URLs.
- `dashboard/app/models/levels/javalab.rb` —
  `summarize_for_lab2_properties` resolves `starterAssets` through the
  project template, matching run-time precedence.
- `apps/src/util/moderateImage.ts` — `javalab` added to
  `LABS_WITH_IMAGE_MODERATION` so student image uploads are moderated.
