import type {Meta, StoryObj} from '@storybook/react-vite';

import SimpleDropdown from '@/dropdown/simpleDropdown';
import TextField from '@/textField';

import Field from '../Field';
import FormError from '../FormError';

export default {
  title: 'DesignSystem/Form/Field',
  component: Field,
} as Meta<typeof Field>;

type Story = StoryObj<typeof Field>;

const US_STATES = [
  {value: 'CA', text: 'California'},
  {value: 'NY', text: 'New York'},
  {value: 'WA', text: 'Washington'},
];

const noop = () => undefined;

/**
 * A stack of Fields reads as a form: each stretches its wrapped DSCO control
 * (text inputs and a dropdown) to a common, readable column width.
 */
export const Fields: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Field>
        <TextField
          name="given_name"
          label="First name"
          value="Ada"
          onChange={noop}
        />
      </Field>
      <Field>
        <TextField
          name="family_name"
          label="Last name"
          value="Lovelace"
          onChange={noop}
        />
      </Field>
      <Field>
        <TextField
          name="email"
          label="Email"
          value="ada@example.com"
          onChange={noop}
        />
      </Field>
      <Field>
        <SimpleDropdown
          name="us_state"
          labelText="State"
          selectedValue="CA"
          items={US_STATES}
          onChange={noop}
        />
      </Field>
    </div>
  ),
};

/**
 * A per-field error (wired through the control's own `errorMessage`, which sets
 * the invalid state and description on the input) plus a form-level `FormError`.
 * Wire `useField(name).errors` into the control's error prop this way — do not
 * render field errors as loose text.
 */
export const WithErrors: StoryObj = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Field>
        <TextField
          name="username"
          label="Username"
          value="ada"
          onChange={noop}
        />
      </Field>
      <Field>
        <TextField
          name="email"
          label="Email"
          value="ada@example.com"
          onChange={noop}
          errorMessage="That email is already in use."
        />
      </Field>
      <FormError message="Please fix the errors above." />
    </div>
  ),
};
