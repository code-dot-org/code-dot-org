# javalab2

Port of Java Lab onto Lab2 + codebridge. Replaces `apps/src/javalab/`
once parity is reached. The Rails model name stays `Javalab`; existing
levels load without DB changes.

## Status

| Phase | Subject                              | State        |
|-------|--------------------------------------|--------------|
| 1     | Backend plumbing                     | done         |
| 2     | Minimal frontend bundle              | done         |
| 3     | Javabuilder execution adapter        | done         |
| 4     | Neighborhood mini-app                | done         |
| 5     | Theater mini-app + photo prompter    | pending      |
| 6     | Secondary features (validation, …)   | pending      |
| 7     | Levelbuilder save format             | pending      |
| 8     | Decommission `apps/src/javalab/`     | pending      |

## Layout

| File                        | Role                                                |
|-----------------------------|-----------------------------------------------------|
| `entrypoint.ts`             | Lab2 lazy entry, registered in `lab2EntryPoints.ts` |
| `index.js`                  | TS-config shim for dynamic import                   |
| `Javalab2View.tsx`          | Root view; wires codebridge to Javabuilder          |
| `constants.ts`              | Default project, file-type allowlists               |
| `layout/`                   | Horizontal / vertical / share layouts               |
| `javabuilderConstants.ts`   | TS port of the wire-protocol enums                  |
| `sourceBundleAdapter.ts`    | `MultiFileSource` → Javabuilder `UserFileData`      |
| `JavabuilderClient.ts`      | WebSocket lifecycle; emits events                   |
| `javabuilderRunner.ts`      | `handleRunClick` / `stopJavaCode` / `sendStdin`     |
| `migrateLegacySources.ts`   | Client-side shim for pre-codebridge channel data    |

Backend lives at `dashboard/app/models/levels/javalab.rb` and
`dashboard/test/models/javalab_test.rb`.

## Migration design

1. Level rows keep their on-disk shape. `summarize_for_lab2_properties`
   converts `start_sources` (flat hash) to a `MultiFileSource` at read
   time via `Javalab.convert_legacy_start_sources`.
2. The new view uses `useSource` / `useInitialSources` — the same
   pythonlab/weblab2 pipe.
3. `migrateLegacySources.ts` converts already-saved channel data
   (legacy `{filename: {text, isVisible, tabOrder}}` hashes) to
   `MultiFileSource` before `useInitialSources` sees it.
4. `sourceBundleAdapter.ts` flattens back to the
   `{text, isVisible, tabOrder}` shape Javabuilder expects on the wire.
   That shape is forced through `/javabuilder/access_token_with_override_sources`
   on every run; we never use the channel-pull path, because lab2's
   ProjectManager does not share S3 paths with the legacy Javabuilder
   reader.

## Phase docs

- [phase-5-theater.md](./phase-5-theater.md)
- [phase-6-secondary-features.md](./phase-6-secondary-features.md)
- [phase-7-levelbuilder-save.md](./phase-7-levelbuilder-save.md)
- [phase-8-decommission.md](./phase-8-decommission.md)
