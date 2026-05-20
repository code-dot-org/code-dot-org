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
        "isValidation": false
      },
      ...
    }

wrapped as `{source: <flat hash>}` in `main.json`. Javabuilder reads the
same shape server-side via `JavalabFilesHelper.get_project_files`. We
must keep this shape on the wire — javalab2 cannot break legacy
projects, and cannot change what Javabuilder reads.

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

## Run flow

`javabuilderRunner.ts` reuses the legacy
`apps/src/javalab/JavabuilderConnection` JS class as-is. A TS port can
come in a later phase. Differences from legacy use:

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
- The access-token request requires `miniAppType`; we pin it to
  `'console'` (or `levelProperties.csaViewMode`, but only `'console'`
  is supported in Phase 1).

## Phase 1 (current status of conversion)

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

## Deferred to later phases

- **Validation** (`get_validations` override on `Javalab`,
  `JavaValidator`, `JavaValidationTracker`, test-result handling).
- **Neighborhood mini-app**
- **Theater mini-app** + photo prompter.
- **Backpack**
- **Captcha dialog** on `AuthorizerSignalType.CAPTCHA`.
- **Code review**.
- **start_sources and exemplar edit modes** — currently trying
  to edit start sources will break things, as it will save the MultiFileSource
  version of the code.
- **Starter assets** and image asset support in general.
- **TS port of `JavabuilderConnection`** — currently imported from
  `@cdo/apps/javalab/JavabuilderConnection`. A port should drop the
  redux-thunk side effects and emit events instead.
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
- `constants.ts` — `DEFAULT_PROJECT`, editable/supported file types
  (`java`, `txt`, `csv`, `json`).
- `types.ts` — `JavalabLevelProperties` extends
  `CodebridgeLevelProperties` with `csaViewMode`.
- `layout/HorizontalLayout.tsx` — three-panel layout (InfoPanel |
  Editor over Console). Vertical/share/widget slots all point at the
  same horizontal layout for now.
- `sourceConverter.ts` — `flatToMultiFile`, `multiFileToFlat`.
- `JavalabSourcesStore.ts` — `SourcesStore` subclass that applies the
  converter at the S3 load/save boundary.
- `javabuilderRunner.ts` — `handleRunClick`, `stopJavaCode`,
  `sendJavaConsoleInput`. Wraps the legacy
  `JavabuilderConnection`.
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
  re-fetching from the legacy singleton.
- `dashboard/test/models/javalab_test.rb` — assertion that `uses_lab2?`
  defaults to false and honors the serialized property.
