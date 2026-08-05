import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {FormProvider} from '@code-dot-org/component-library/form';
import type {UserSettings} from '@code-dot-org/core/api';

import EducatorRole from '../EducatorRole';

const ROLE_OPTIONS = [
  {value: 'classroom_teacher', text: 'Classroom Teacher', category: 'educator'},
  {value: 'school_admin', text: 'School Administrator', category: 'admin'},
  {value: 'parent', text: 'Parent', category: 'other'},
];

function renderSection(settings: Partial<UserSettings>, value = '') {
  render(
    <FormProvider initialValues={{educator_role: value}}>
      <EducatorRole
        settings={
          {
            userType: 'teacher',
            educatorRoleOptions: ROLE_OPTIONS,
            ...settings,
          } as UserSettings
        }
      />
    </FormProvider>,
  );
  return screen.getByRole('combobox', {name: 'Educator role'});
}

function groupLabels(select: HTMLElement) {
  return [...select.querySelectorAll('optgroup')].map(group => group.label);
}

describe('EducatorRole', () => {
  it('groups the server options by category, educators first', () => {
    const select = renderSection(
      {educatorRole: 'classroom_teacher'},
      'classroom_teacher',
    );

    expect(groupLabels(select)).toEqual(['Educator', 'Administrator', 'Other']);
    expect(
      within(select)
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['Classroom Teacher', 'School Administrator', 'Parent']);
  });

  it('selects the stored role', () => {
    const select = renderSection({educatorRole: 'parent'}, 'parent');
    expect(select).toHaveValue('parent');
  });

  it('shows a disabled placeholder while the role is unset', () => {
    const select = renderSection({educatorRole: null});

    expect(select).toHaveValue('');
    const placeholder = within(select).getByRole('option', {
      name: 'Select a role',
    });
    expect(placeholder).toBeDisabled();
    expect(within(select).getAllByRole('option')[0]).toBe(placeholder);
  });

  it('offers no blank choice once a role is set', () => {
    const select = renderSection({educatorRole: 'parent'}, 'parent');
    expect(
      within(select).queryByRole('option', {name: 'Select a role'}),
    ).toBeNull();
    expect(
      within(select)
        .getAllByRole('option')
        .some(option => (option as HTMLOptionElement).value === ''),
    ).toBe(false);
  });

  it('lumps an unknown category into the last group', () => {
    const select = renderSection(
      {
        educatorRole: 'coach',
        educatorRoleOptions: [
          ...ROLE_OPTIONS,
          {value: 'coach', text: 'Instructional Coach', category: 'coaching'},
        ],
      },
      'coach',
    );

    expect(groupLabels(select)).toEqual(['Educator', 'Administrator', 'Other']);
    const other = [...select.querySelectorAll('optgroup')].at(-1)!;
    expect(
      [...other.querySelectorAll('option')].map(option => option.textContent),
    ).toEqual(['Parent', 'Instructional Coach']);
  });

  it('omits a group no server option belongs to', () => {
    const select = renderSection(
      {
        educatorRole: 'classroom_teacher',
        educatorRoleOptions: [ROLE_OPTIONS[0]],
      },
      'classroom_teacher',
    );
    expect(groupLabels(select)).toEqual(['Educator']);
  });
});
