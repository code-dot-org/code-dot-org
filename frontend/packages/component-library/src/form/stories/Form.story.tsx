import type {Meta, StoryObj} from '@storybook/react-vite';
import {useEffect, useRef} from 'react';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import type {ComponentSizeXSToL} from '@/common/types';
import SimpleDropdown from '@/dropdown/simpleDropdown';
import TextField from '@/textField';
import {ToastProvider, useToast} from '@/toast';

import {
  toFormErrors,
  type ValidationErrors,
  type ValidationErrorParser,
} from '../errors';
import Field from '../Field';
import {
  FormProvider,
  useField,
  useFormDispatch,
  useFormOptions,
  useFormState,
} from '../FormContext';
import FormError from '../FormError';
import {dirtyValues} from '../formReducer';
import SaveBar from '../SaveBar';

export default {
  title: 'DesignSystem/Form/Form',
} as Meta;

const INITIAL = {
  given_name: 'Ada',
  family_name: 'Lovelace',
  email: 'ada@example.com',
  us_state: 'CA',
};

const US_STATES = [
  {value: 'CA', text: 'California'},
  {value: 'NY', text: 'New York'},
  {value: 'WA', text: 'Washington'},
];

// A field bound to form state via useField: value, per-field errors, onChange.
// `ariaInvalid` passes straight through TextField onto the <input>, so a screen
// reader reports the invalid state when the user reaches the field. Its default
// size comes from the form (useFormOptions) so a form sizes consistently in one
// place; TextField has no 'xs', so that lone case falls back to 's'.
function TextInput({field, label}: {field: string; label: string}) {
  const {value, errors, ariaInvalid, onChange} = useField(field);
  const {size} = useFormOptions();
  return (
    <Field>
      <TextField
        name={field}
        label={label}
        size={size === 'xs' ? 's' : size}
        value={value}
        onChange={e => onChange(e.target.value)}
        errorMessage={errors[0]}
        aria-invalid={ariaInvalid}
      />
    </Field>
  );
}

// On a failed save, a focusable form-level summary tells a screen-reader user
// what went wrong and where to look; moving focus to it (rather than relying on
// a live region alone) is what reliably gets the user to the problem. The
// per-field message still renders on each field via errorMessage/aria-invalid.
function ErrorSummary() {
  const {save} = useFormState();
  const ref = useRef<HTMLDivElement>(null);
  const inError = save.status === 'error';

  useEffect(() => {
    if (inError) {
      ref.current?.focus();
    }
  }, [inError]);

  if (!inError) {
    return null;
  }
  const fieldCount = Object.keys(save.fieldErrors).length;
  const message =
    save.formErrors[0] ??
    (fieldCount > 0
      ? 'Your changes could not be saved. Review the fields below and try again.'
      : 'Something went wrong. Please try again.');
  return (
    <div ref={ref} tabIndex={-1}>
      <FormError message={message} />
    </div>
  );
}

function StateDropdown() {
  const {value, onChange} = useField('us_state');
  const {size} = useFormOptions();
  return (
    <Field>
      <SimpleDropdown
        name="us_state"
        labelText="State"
        size={size}
        selectedValue={value}
        items={US_STATES}
        onChange={e => onChange(e.target.value)}
      />
    </Field>
  );
}

// A stand-in for a consumer's wire parser. `save` throws one of these shapes; a
// real app would parse a 422 body (see the errors.ts docs). Anything without a
// recognizable shape falls through to toFormErrors' generic message.
const parse: ValidationErrorParser = error =>
  error && typeof error === 'object' && 'fieldErrors' in error
    ? (error as ValidationErrors)
    : null;

function Actions({
  save,
}: {
  save: (values: Record<string, string>) => Promise<void>;
}) {
  const state = useFormState();
  const dispatch = useFormDispatch();
  const toast = useToast();

  const onSave = async () => {
    if (state.save.status === 'saving') return;
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

function DetailsForm({
  save,
  size,
}: {
  save: (values: Record<string, string>) => Promise<void>;
  size?: ComponentSizeXSToL;
}) {
  return (
    <ToastProvider>
      <FormProvider initialValues={INITIAL} size={size}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <p style={{margin: 0, color: 'var(--text-neutral-secondary)'}}>
            Edit any field to reveal the save bar at the bottom.
          </p>
          <ErrorSummary />
          <TextInput field="given_name" label="First name" />
          <TextInput field="family_name" label="Last name" />
          <TextInput field="email" label="Email" />
          <StateDropdown />
          <Actions save={save} />
        </div>
      </FormProvider>
    </ToastProvider>
  );
}

// Clears an input and types a new value into it.
async function editInput(input: HTMLElement, value: string) {
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

// Types the given text into a labelled field (clearing it first).
async function editField(
  canvas: ReturnType<typeof within>,
  label: string,
  value: string,
) {
  await editInput(canvas.getByLabelText(label), value);
}

// Locates a field's <input> by its stable `name`, which (unlike getByLabelText)
// survives the DSCO TextField rendering its error message inside the wrapping
// <label> — that appends the error text to the label's accessible name.
function inputByName(
  canvasElement: HTMLElement,
  name: string,
): HTMLInputElement {
  const input = canvasElement.querySelector<HTMLInputElement>(
    `input[name="${name}"]`,
  );
  if (!input) {
    throw new Error(`no input with name "${name}"`);
  }
  return input;
}

/**
 * Everything assembled: FormProvider holds the values, each control is bound via
 * useField, the SaveBar appears once dirty and clears on success (a toast
 * confirms). The play function edits a field, saves, and asserts the toast.
 */
export const FullForm: StoryObj = {
  render: () => <DetailsForm save={async () => Promise.resolve()} />,
  parameters: {eyes: {include: false}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // No save bar until the form is dirty.
    expect(canvas.queryByRole('button', {name: 'Save changes'})).toBeNull();

    await editField(canvas, 'First name', 'Augusta');

    // Editing reveals the save bar.
    const save = await canvas.findByRole('button', {name: 'Save changes'});
    await userEvent.click(save);

    // Success clears the bar and announces via the toast.
    await waitFor(() =>
      expect(canvas.getByRole('alert')).toHaveTextContent('Changes saved.'),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('button', {name: 'Save changes'})).toBeNull(),
    );
  },
};

/**
 * Same form, but the save rejects with a field-level validation error. On
 * failure the flow: (1) surfaces the message on the Email field and marks it
 * `aria-invalid`, (2) shows a focusable form-level summary (role="alert") and
 * moves focus to it, and (3) clears both as soon as the field is edited again.
 * A validation error is not shown as a transient toast — it must persist next
 * to the field until fixed.
 */
export const SaveWithFieldError: StoryObj = {
  render: () => (
    <DetailsForm
      save={async () => {
        throw {
          fieldErrors: {email: ['That email is already in use.']},
          formErrors: [],
        };
      }}
    />
  ),
  parameters: {eyes: {include: false}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await editField(canvas, 'Email', 'taken@example.com');
    await userEvent.click(
      await canvas.findByRole('button', {name: 'Save changes'}),
    );

    // The per-field 422 error surfaces on the Email field and marks it invalid.
    await waitFor(() =>
      expect(
        canvas.getByText('That email is already in use.'),
      ).toBeInTheDocument(),
    );
    expect(inputByName(canvasElement, 'email')).toHaveAttribute(
      'aria-invalid',
      'true',
    );

    // The form-level summary is announced and takes focus. FormError renders the
    // DSCO Alert, whose root carries role="alert" (an ancestor of the message
    // text); the ErrorSummary wraps that in the tabIndex={-1} element it focuses.
    // (The Toast announcer is also role="alert" but stays empty — no error toast.)
    const summaryText = canvas.getByText(
      'Your changes could not be saved. Review the fields below and try again.',
    );
    const alert = summaryText.closest('[role="alert"]');
    expect(alert).not.toBeNull();
    await waitFor(() => expect(alert?.parentElement).toHaveFocus());

    // Editing the errored field clears its error and the field's invalid state.
    // Locate by name, not label: the error is still in the wrapping <label>.
    await editInput(inputByName(canvasElement, 'email'), 'fresh@example.com');
    await waitFor(() =>
      expect(canvas.queryByText('That email is already in use.')).toBeNull(),
    );
    expect(inputByName(canvasElement, 'email')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
  },
};

/**
 * Same form with a form-level `size="l"` set once on the FormProvider: every
 * control (text inputs, the dropdown) and the SaveBar button read it via
 * useFormOptions and size up consistently, without threading `size` per field.
 */
export const FormLevelSize: StoryObj = {
  render: () => <DetailsForm size="l" save={async () => Promise.resolve()} />,
  parameters: {eyes: {include: false}},
};
