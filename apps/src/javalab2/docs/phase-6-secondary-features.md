# Phase 6 — Secondary features

The hooks that make a javalab level feel finished. Each subsection is
roughly one PR-sized chunk. Order is independent unless noted.

## Validation gating

Phase 1 already defines `get_validations` so the Finish button gates on
`PASSED_ALL_TESTS`. The remaining work is frontend — plug the codebridge
progress system into Javabuilder's `TEST_RESULT` frames.

Mirror `apps/src/pythonlab/progress/`:

| Path                                                 | Role                                         |
|------------------------------------------------------|----------------------------------------------|
| `apps/src/javalab2/progress/JavaValidator.ts`        | Implements `Validator`. Asks `JavaValidationTracker` for the latest test results, returns the progress state. |
| `apps/src/javalab2/progress/JavaValidationTracker.ts`| Singleton. Receives `{name, result}[]` from `TEST_RESULT` handling in the runner. |

Wire in `Javalab2View`:

```ts
useEffect(() => {
  if (progressManager && levelProperties.appName === 'javalab') {
    progressManager.setValidator(
      new JavaValidator(JavaValidationTracker.getInstance())
    );
  }
}, [progressManager, levelProperties.appName]);
```

Modify `javabuilderRunner.ts#handleJavabuilderMessage` so when
`runTests` is true and `data.type === TEST_RESULT`, the tracker
accumulates results; on `EXITED` call `progressManager.updateProgress()`.

## Exemplar / start_sources edit modes

`useSource` (in codebridge) already does most of the work: it watches
`getAppOptionsEditBlocks() === START_SOURCES` and
`getAppOptionsEditingExemplar()`, calls `prepareSourceForLevelbuilderSave`,
and wires `header.showLevelBuilderSaveButton`. The only gap is that the
controller-rendered edit URLs still target the legacy
`/levels/:id/edit_blocks?type=start_sources` path, which renders
`apps/src/javalab/Javalab.js`.

To do:

1. Add `is_a?(Javalab)` to the lab2 whitelist where the `?edit_blocks`
   query param flow is enabled (search `levels_controller.rb` for the
   `Pythonlab` example).
2. `dashboard/app/views/levels/editors/_javalab.html.haml`: change the
   "Edit Start Code" / "Edit Exemplar" buttons to point to the lab2
   query-param URLs (`?edit_blocks=start_sources`,
   `?is_editing_exemplar=true`).
3. Confirm `summarize_for_lab2_properties` already returns
   `exemplarSources` as a `MultiFileSource` (Phase 1 added that branch).

## Starter assets

`summarize_for_lab2_properties` already returns
`starterAssets: { friendly_name: signed_url }`.

Two surfacing options:

- **Side panel** (matches old javalab UX). Add an
  `apps/src/javalab2/components/StarterAssets.tsx` mounted via
  codebridge's `RightButtons` extension slot.
- **Read-only files in the tree**. Inject each asset as a
  `ProjectFileType.SYSTEM_SUPPORT` file with `url` set.

Default to side panel for parity. The file-tree option is more lab2-ish
but changes the asset-reference model.

## Backpack

`apps/src/javalab/Backpack.jsx` — student-scoped code snippets fetched
from the `/backpack/*` API.

To do:

- Port to `apps/src/javalab2/Backpack.tsx`. Functional component;
  redux state can live in a small `backpackSlice` or stay component-local
  (it already does).
- Mount via codebridge's `RightButtons` slot (same place starter assets
  may go).
- Gate behind `experiments.isEnabled('javalab2-backpack')` until the
  end-to-end save/load is verified against a real channel.

## Code review / commit dialog

This is the biggest sub-feature. Old slice's `hasOpenCodeReview` plus
`CommitDialog*.jsx` need to move to javalab2.

To do:

- Create `apps/src/javalab2/redux/javalab2Redux.ts`. Slices:
  `hasOpenCodeReview`, `commitDialogOpen`, `commitNotes`.
- Port `apps/src/javalab/CommitDialog.jsx` → `apps/src/javalab2/CommitDialog.tsx`.
- Port `apps/src/javalab/CommitListItem.jsx`, `CommitButton.jsx`,
  `CommitMenu.jsx` similarly.
- Wire `onCommitCode` to lab2's `ProjectManager.flushSave()` + a POST to
  `/project_commits` (existing endpoint).
- Verify `apps/src/code-studio/initApp/project.js:855` (`case 'javalab':`
  in the version-history switch). Lab2 has its own `lab2Project` slice
  for versioned saves; either reuse it or branch the case.

## Captcha

`JavalabCaptchaDialog.jsx` exists. The plumbing is already in place:

- `JavabuilderClient.onCaptchaRequired` fires when
  `/javabuilder/access_token_with_override_sources` returns
  403 + `{captcha_required: true}`.
- `Javabuilder` may also send `WebSocketMessageType.AUTHORIZER` mid-run
  for rate-limit warnings.

To do:

- Port `apps/src/javalab/JavalabCaptchaDialog.jsx` →
  `apps/src/javalab2/CaptchaDialog.tsx`.
- Mount via portal in `Javalab2View`, gated on a new
  `javalab2Redux.captchaDialogOpen` slice key.
- `recaptchaSiteKey` is already on `levelProperties` from Phase 1.

## Verification

For each subfeature pick one level that exercises it and run end-to-end
behind a feature flag. The captcha path can be tested by setting
`current_user.last_verified_captcha_at = nil` in `bin/rails runner` and
hitting Run.
