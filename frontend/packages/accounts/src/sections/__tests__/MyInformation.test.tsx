import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import type {AccountSettings} from '../../api/accounts.types';
import {FormProvider} from '../../state/FormContext';
import MyInformation from '../MyInformation';

// MyInformation only reads settings.userType (teacher vs student variant); the
// field values come from FormContext, so a minimal cast is enough.
const STUDENT = {userType: 'student'} as AccountSettings;
const TEACHER = {userType: 'teacher'} as AccountSettings;

function renderSection(
  settings: AccountSettings,
  values: Record<string, string> = {},
) {
  render(
    <FormProvider
      initialValues={{
        given_name: 'Sam',
        family_name: '',
        name: 'Sam',
        age: '',
        us_state: '',
        ...values,
      }}
    >
      <MyInformation settings={settings} />
    </FormProvider>,
  );
}

describe('MyInformation age/state dropdowns', () => {
  it('defaults to a placeholder, not the first real option, when age/state are unset', () => {
    renderSection(STUDENT, {age: '', us_state: ''});

    const state = screen.getByRole('combobox', {name: 'State'});
    // The selected option must be the empty placeholder, not "Alabama".
    expect(within(state).getAllByRole('option')[0]).toHaveValue('');
    expect(state).toHaveValue('');

    const age = screen.getByRole('combobox', {name: 'Age'});
    expect(within(age).getAllByRole('option')[0]).toHaveValue('');
    expect(age).toHaveValue('');
  });

  it('selects the stored value when present', () => {
    renderSection(STUDENT, {age: '14', us_state: 'WA'});
    expect(screen.getByRole('combobox', {name: 'State'})).toHaveValue('WA');
    expect(screen.getByRole('combobox', {name: 'Age'})).toHaveValue('14');
  });

  it('omits age and state for a teacher', () => {
    renderSection(TEACHER, {family_name: 'Lovelace'});
    expect(screen.queryByRole('combobox', {name: 'State'})).toBeNull();
    expect(screen.queryByRole('combobox', {name: 'Age'})).toBeNull();
    expect(
      screen.getByRole('textbox', {name: 'Last name'}),
    ).toBeInTheDocument();
  });
});
