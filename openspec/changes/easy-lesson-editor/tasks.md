## 1. Server-side allowlist and field plumbing

- [x] 1.1 Decide and commit the final `(model, field)` allowlist for in-page editing (start from the proposal/design list; sanity-check against `Lesson#summarize_for_lesson_show`).
- [x] 1.2 Add a Ruby module (e.g. `Lesson::InlineEditableFields` under `dashboard/app/models/concerns/` or `dashboard/lib/`) that exposes the allowlist as `pairs` and helpers `allowed?(model_name, field)` / `field_class(model_name)`.
- [x] 1.3 Add a tiny per-record helper that produces the stable identifier string `"<model>:<id>:<field>"` and is reused by both the renderer (read side) and the controller (write side).
- [x] 1.4 Unit-test the allowlist module: every entry resolves to a real ActiveRecord column on the named class, and ordering/structural fields are explicitly rejected.

## 2. Field-scoped update endpoint

- [x] 2.1 Add `PATCH /lessons/:lesson_id/inline_field` to `config/routes.rb`, routed to a new `LessonsController#update_inline_field` action.
- [x] 2.2 In the action: run `require_levelbuilder_mode_or_test_env`; authorize the parent `@lesson` via the existing CanCanCan policy (mirror `update`).
- [x] 2.3 Look the request's `(model, field)` up in the allowlist; respond `422` (with error) if not allowed.
- [x] 2.4 Load the named record (`model_name.constantize.find(params[:id])`), verify it belongs to `@lesson` (walk the association graph; do not trust the request's id alone); respond `404` if not.
- [x] 2.5 Assign `field = value`, run model validations, save; on validation failure return `422` with the model's error messages.
- [x] 2.6 After the DB save succeeds, in levelbuilder mode reload the script and call `@lesson.script.write_script_json` (mirror `LessonsController#update` at [lessons_controller.rb:204-210](dashboard/app/controllers/lessons_controller.rb#L204-L210)); if the rewrite raises, surface the error to the client rather than swallow it.
- [x] 2.7 On success run the same server-side preprocessing the show page uses (e.g. `MarkdownPreprocessor`) on the saved value and return `{ value, rendered_source }`.
- [x] 2.8 Add a `GET /lessons/:lesson_id/inline_field?model=...&id=...&field=...` companion that returns the field's current raw source for the editor to load on click; reuse the same authorization and allowlist.
- [x] 2.9 Controller tests covering: success path, non-allowlisted field, cross-lesson id, non-levelbuilder env returns 404, non-levelbuilder user denied, validation error, 404 when record deleted between page load and click, and a test asserting `write_script_json` is called after a successful save.

## 3. Lesson show page: emit editable identifiers

- [ ] 3.1 In `Lesson#summarize_for_lesson_show` (and the child summarizers it composes), add an `inline_editing_enabled: <bool>` flag at the top of the payload, set by the controller from `levelbuilder_mode? && can?(:update, lesson)`.
- [ ] 3.2 For each record/field on the allowlist, include `editable_id: "<model>:<id>:<field>"` on the serialized record's payload (only when `inline_editing_enabled` is true; omit otherwise to avoid leakage and bundle pressure).
- [ ] 3.3 In `LessonOverview.jsx` and any partial components that render allowlisted fields (activity sections, etc.), wrap each rendered field in an element carrying `data-editable-field={editable_id}` when present.
- [ ] 3.4 Render-test that the attribute appears for a levelbuilder-mode signed-in levelbuilder user and is absent otherwise (jest unit test against the component is enough — controller behavior is covered separately).

## 4. Client-side edit-mode controller and field editor

- [ ] 4.1 Add a top-of-page "Edit mode" toggle to the lesson show page chrome, visible only when `inline_editing_enabled` is true. Wire it to a local React state flag.
- [ ] 4.2 Behind a dynamic import gated on the toggle, mount an `InlineEditingController` that listens for clicks on any element with `data-editable-field`.
- [ ] 4.3 On click: parse the identifier, fetch the raw source from `GET /lessons/:lesson_id/inline_field?...`, replace the clicked element's contents with a `<textarea>` whose value is the raw source. Auto-size or fixed-size — pick one consistent default during apply.
- [ ] 4.4 Track the editor's original value. On blur: if unchanged, restore the original rendered content (use a stashed snapshot of the pre-edit DOM, or re-render the field through `SafeMarkdown` from the cached value).
- [ ] 4.5 On blur with a changed value: `PATCH /lessons/:lesson_id/inline_field` with `{ model, id, field, value }`. On 200, render the returned `rendered_source` through the same `SafeMarkdown` the page uses and swap it in; show a transient "Saved" indicator near the field; dismiss after ~1.5s.
- [ ] 4.6 On error response: keep the editor open with the user's value intact and surface the server error message near the editor.
- [ ] 4.7 Make sure the inline-editing bundle does not load for users where `inline_editing_enabled` is false (verify with `yarn build:analyze` or by checking webpack chunk splits).
- [ ] 4.8 Frontend unit tests for the controller: click → editor opens with fetched source; blur unchanged → no PATCH; blur changed → PATCH and DOM swap; PATCH error → editor stays open with error.

## 5. Manual verification and cleanup

- [ ] 5.1 Run `./tools/hooks/pre-commit` after each batch of changes; clear any lint/format issues.
- [ ] 5.2 Run `yarn run typecheck` in `apps/` if any TS/TSX changed.
- [ ] 5.3 Run targeted unit tests: `bundle exec spring testunit test/controllers/lessons_controller_test.rb` (or whatever covers the new action), and `yarn test:unit` for the new JS test files.
- [ ] 5.4 Manually verify on a local dashboard (start with `bin/dashboard-server` + `yarn start` in `apps/`): sign in as a levelbuilder, open a lesson show page on the levelbuilder env, toggle edit mode on, click an editable field, edit a typo, click out, confirm "Saved" appears and the field renders the new value without reload; reload the page and confirm the change persisted; check `git diff dashboard/config/scripts_json/<script>.script_json` shows the edited value (i.e. `write_script_json` actually ran).
- [ ] 5.5 Manually verify a non-levelbuilder user sees no toggle, no `data-editable-field` attributes, and the endpoint returns 404 / forbidden when poked directly.
- [ ] 5.6 Report to the user any test surfaces that require secrets or full drone runs (e.g. UI feature tests for the new toggle, if added).
