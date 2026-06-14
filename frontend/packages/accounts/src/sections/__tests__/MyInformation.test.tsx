import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import type {AccountSettings} from '@code-dot-org/core/api';

import {FormProvider} from '../../state/FormContext';
import MyInformation from '../MyInformation';

// MyInformation reads only settings.userType, so a minimal cast suffices.
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

describe('MyInformation name fields by user type', () => {
  it('shows first and last name for a teacher', () => {
    renderSection(TEACHER, {family_name: 'Lovelace'});
    expect(
      screen.getByRole('textbox', {name: 'First name'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {name: 'Last name'}),
    ).toBeInTheDocument();
  });

  it('shows only display name for a student (no first/last)', () => {
    renderSection(STUDENT);
    expect(screen.queryByRole('textbox', {name: 'First name'})).toBeNull();
    expect(screen.queryByRole('textbox', {name: 'Last name'})).toBeNull();
    expect(
      screen.getByRole('textbox', {name: 'Display name'}),
    ).toBeInTheDocument();
  });

  it('orders display name ahead of age and state for a student', () => {
    renderSection(STUDENT);
    const displayName = screen.getByRole('textbox', {name: 'Display name'});
    const age = screen.getByRole('combobox', {name: 'Age'});
    expect(
      displayName.compareDocumentPosition(age) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe('MyInformation display-name helper', () => {
  const HELPER = 'This is what your students will see.';

  it('shows the students-will-see helper for a teacher', () => {
    renderSection(TEACHER, {family_name: 'Lovelace'});
    expect(screen.getByText(HELPER)).toBeInTheDocument();
  });

  it('hides the students-will-see helper for a student', () => {
    renderSection(STUDENT);
    expect(screen.queryByText(HELPER)).toBeNull();
  });
});
