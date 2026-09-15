# `componentLibrary/form`

A composed form kit for a page-level, single-PATCH settings form: form state
(context + reducer + dirty tracking), a save-state machine, an unsaved-changes
`SaveBar`, presentational `Field`/`FormError`, and an API-shape-generic
save-error mapping. Every piece is standalone; assemble the ones you need.

Import everything from `@code-dot-org/component-library/form`.

## State

- `FormProvider` holds field values in a reducer; `useFormState()` /
  `useFormDispatch()` read and drive it; `useField(name)` returns
  `{value, errors, onChange}` for a single control.
- `FormProvider` takes an optional `size` (`xs`/`s`/`m`/`l`, default `m`),
  exposed via `useFormOptions()`. A control reads it for its default size so a
  form-heavy layout sizes consistently in one place; a per-control `size` prop
  still overrides it. The `SaveBar` button reads it too.
- `isDirty(state)` / `dirtyValues(state)` support "save only what changed".
- The save lifecycle (`idle → dirty → saving → idle | error`) is a separate pure
  reducer (`saveStateReducer`) you can test or reuse in isolation.

## SaveBar

Sticky bar that appears once the form is dirty, disables its button while
saving, and renders form-level errors — all from the form state. It is a single
polite live region (no nested live regions). Labels are overridable via the
`labels` prop. Render it inside a `FormProvider`.

## Save-error mapping

`toFormErrors(error, parse)` turns a caught save error into
`{fieldErrors, formErrors}` for `dispatch({type: 'saveFailed', ...})`. The form
kit owns the "never silent" policy (an unrecognized or empty error becomes a
single `GENERIC_ERROR`); the consumer supplies `parse`, a
`ValidationErrorParser` that knows its own wire format (a Rails 422/400 body, a
GraphQL error array, ...) and returns `null` when the error isn't a validation
failure.

## Surfacing errors accessibly

A save error should reach a screen-reader user three ways, and none of them is a
toast — a validation error must persist next to the field until fixed, so it is
not shown as transient status:

- Per-field: render `useField(name).errors[0]` through the control's own error
  prop (DSCO `TextField`'s `errorMessage`). When `errorMessage` is set, that
  control now sets `aria-invalid` on the input and ties the message to it via
  `aria-describedby`, so a screen reader reads the error on reaching the field.
  (`useField(name).ariaInvalid` is also exposed for controls that don't wire
  this themselves.)
- Form-level summary: render a `FormError` when the form is in `error`, and move
  focus to it — a live region alone is easily missed; focus is what reliably
  gets a keyboard/SR user to the problem. `FormError` is the DSCO `Alert`
  (`type="danger"`), whose default `isImmediateImportance` gives it
  `role="alert"`; wrap it in a `tabIndex={-1}` element to focus it on failure.
- The `SaveBar` also renders `save.formErrors` in its own polite region.

## Sketch

```jsx
import {
  FormProvider,
  SaveBar,
  toFormErrors,
  useFormDispatch,
  useFormState,
  dirtyValues,
} from '@code-dot-org/component-library/form';
import {useToast} from '@code-dot-org/component-library/toast';

function Details({initialValues, save, parse}) {
  return (
    <FormProvider initialValues={initialValues}>
      <Fields />
      <Actions save={save} parse={parse} />
    </FormProvider>
  );
}

function Actions({save, parse}) {
  const state = useFormState();
  const dispatch = useFormDispatch();
  const toast = useToast();

  const onSave = async () => {
    dispatch({type: 'saveStarted'});
    try {
      await save(dirtyValues(state));
      dispatch({type: 'saveSucceeded'});
      toast('Changes saved.');
    } catch (error) {
      dispatch({type: 'saveFailed', ...toFormErrors(error, parse)});
    }
  };

  return <SaveBar onSave={onSave} />;
}
```

The modal form path (a dialog that keeps itself open on error) intentionally
lives in the consuming feature, not here.

For live examples, run Storybook locally and see `DesignSystem / Form`.
