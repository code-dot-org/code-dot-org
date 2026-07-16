import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {FormProvider} from '@code-dot-org/component-library/form';
import type {UserSettings} from '@code-dot-org/core/api';

import MyInformation from '../MyInformation';

// MyInformation reads userType plus the server-supplied age/us_state option
// lists; the student fixture carries the values the dropdown tests select.
const STUDENT = {
  userType: 'student',
  isUsa: true,
  ageOptions: [
    {value: '14', text: '14'},
    {value: '21+', text: '21+'},
  ],
  usStateOptions: [{value: 'WA', text: 'Washington'}],
} as UserSettings;
const TEACHER = {...STUDENT, userType: 'teacher'} as UserSettings;

function renderSection(
  settings: UserSettings,
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
        gender: '',
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

  it('hides the State field for a non-US student but keeps age', () => {
    renderSection({...STUDENT, isUsa: false} as UserSettings);
    expect(screen.queryByRole('combobox', {name: 'State'})).toBeNull();
    expect(screen.getByRole('combobox', {name: 'Age'})).toBeInTheDocument();
  });
});

describe('MyInformation gender', () => {
  it('renders an optional gender field for a student', () => {
    renderSection(STUDENT, {gender: 'Nonbinary'});
    expect(
      screen.getByRole('textbox', {name: 'Gender (optional)'}),
    ).toHaveValue('Nonbinary');
  });

  it('omits gender for a teacher', () => {
    renderSection(TEACHER, {family_name: 'Lovelace'});
    expect(
      screen.queryByRole('textbox', {name: 'Gender (optional)'}),
    ).toBeNull();
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
