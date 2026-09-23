import {fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {IntegrationsSettings, UserSettings} from '@code-dot-org/core/api';

import LinkedAccounts from '../LinkedAccounts';

const TEACHER: UserSettings = {
  userType: 'teacher',
  givenName: 'Ada',
  familyName: 'Lovelace',
  displayName: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  hasPassword: true,
  canEditEmail: true,
  canEditPassword: true,
  shouldSeeAddPasswordForm: false,
  shouldSeeEditEmailLink: true,
  authenticationOptions: [
    {id: 1, credentialType: 'email', email: 'ada@example.com'},
    {id: 2, credentialType: 'google_oauth2', email: 'ada@example.com'},
  ],
  canChangeUserType: true,
  canDeleteOwnAccount: true,
  age: '21+',
  usState: 'WA',
  gender: null,
  isUsa: true,
  parentEmail: null,
  dependentStudentsCount: 0,
  ageOptions: [],
  usStateOptions: [],
};

const INTEGRATIONS: IntegrationsSettings = {
  canManageLinkedAccounts: true,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
  personalAccountLinkingEnabled: true,
  lmsName: null,
};

function renderSection(
  settings: Partial<UserSettings> = {},
  integrations: Partial<IntegrationsSettings> = {},
) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <LinkedAccounts
        settings={{...TEACHER, ...settings}}
        integrations={{...INTEGRATIONS, ...integrations}}
      />
    </QueryClientProvider>,
  );
}

const group = (name: string) =>
  screen.getByRole('heading', {level: 3, name}).closest('section')!;
const rowOf = (name: string) =>
  screen.getByRole('heading', {level: 4, name}).closest('li')!;
const button = (name: RegExp) => screen.getByRole('button', {name});

beforeEach(() => {
  const meta = document.createElement('meta');
  meta.name = 'csrf-token';
  meta.content = 'test-csrf-token';
  document.head.append(meta);
});

afterEach(() => {
  document.head.querySelector('meta[name="csrf-token"]')?.remove();
});

describe('LinkedAccounts', () => {
  it('lists linked logins under My integrations with their email', () => {
    renderSection();

    const google = within(group('My integrations')).getByRole('heading', {
      level: 4,
      name: 'Google',
    });
    expect(google).toBeInTheDocument();
    expect(within(rowOf('Google')).getByText('ada@example.com')).toBeVisible();
    expect(within(rowOf('Google')).getByText('Connected')).toBeVisible();
  });

  it('lists every unlinked provider under Available integrations as not connected', () => {
    renderSection();

    const names = within(group('Available integrations'))
      .getAllByRole('heading', {level: 4})
      .map(heading => heading.textContent);
    expect(names).toEqual(['Microsoft', 'Clever', 'ClassLink', 'Facebook']);
    expect(within(rowOf('Clever')).getByText('Not connected')).toBeVisible();
  });

  it('never lists an email login as an integration', () => {
    renderSection({
      authenticationOptions: [
        {id: 1, credentialType: 'email', email: 'ada@example.com'},
      ],
    });

    expect(
      screen.queryByRole('heading', {level: 3, name: 'My integrations'}),
    ).toBeNull();
  });

  it('shows a login with no stored email as encrypted', () => {
    renderSection({
      authenticationOptions: [
        {id: 2, credentialType: 'google_oauth2', email: null},
      ],
    });

    expect(within(rowOf('Google')).getByText('***encrypted***')).toBeVisible();
  });

  it('labels each provider with its fixed badges', () => {
    renderSection();

    expect(within(rowOf('Clever')).getByText('SSO')).toBeVisible();
    expect(within(rowOf('Clever')).getByText('LMS Integration')).toBeVisible();
    expect(
      within(rowOf('Microsoft')).queryByText('LMS Integration'),
    ).toBeNull();
  });

  it('connects a provider by posting its OAuth form with the CSRF token', () => {
    renderSection();

    const form = button(/connect account microsoft/i).closest('form')!;
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute(
      'action',
      '/users/auth/microsoft_v2_auth?action=connect',
    );
    expect(form).toHaveFormValues({authenticity_token: 'test-csrf-token'});
  });

  it('disconnects a login by posting its disconnect form', () => {
    renderSection();

    const form = button(/disconnect account google/i).closest('form')!;
    expect(form).toHaveAttribute('action', '/users/auth/2/disconnect');
    expect(form).toHaveFormValues({authenticity_token: 'test-csrf-token'});
  });

  it('blocks disconnecting the last login of an account without a password', () => {
    renderSection({
      hasPassword: false,
      authenticationOptions: [
        {id: 2, credentialType: 'google_oauth2', email: 'ada@example.com'},
      ],
    });

    const disconnect = button(/disconnect account google/i);
    expect(disconnect).toBeDisabled();
    expect(disconnect).toHaveAccessibleDescription(
      'To make sure you can still sign in to your account, please add a password or another linked account first.',
    );
  });

  it('blocks disconnecting Google for a student in a Google Classroom section', () => {
    renderSection({userType: 'student'}, {isGoogleClassroomStudent: true});

    const disconnect = button(/disconnect account google/i);
    expect(disconnect).toBeDisabled();
    expect(disconnect).toHaveAccessibleDescription(
      'You cannot disconnect from this linked account because it is tied to one of your sections.',
    );
  });

  it('locks personal logins until a parent grants permission', () => {
    renderSection(
      {userType: 'student', age: 10, usState: 'CO'},
      {personalAccountLinkingEnabled: false},
    );

    const notice =
      'Uh oh! You must obtain parental permission before creating a linked account.';
    expect(screen.getByText(notice)).toBeVisible();
    expect(
      screen.getByRole('link', {name: /parent or guardian permission/i}),
    ).toHaveAttribute('href', expect.stringContaining('support.code.org'));
    for (const name of [
      /connect account microsoft/i,
      /connect account facebook/i,
    ]) {
      expect(button(name)).toBeDisabled();
      expect(button(name)).toHaveAccessibleDescription(
        expect.stringContaining(notice),
      );
    }
    expect(button(/connect account clever/i)).toBeEnabled();
    expect(button(/connect account classlink/i)).toBeEnabled();
  });

  it('asks for age and state before a parent can grant permission', () => {
    renderSection(
      {userType: 'student', age: null, usState: null},
      {personalAccountLinkingEnabled: false},
    );

    expect(
      screen.getByText(
        'Uh oh! Please provide your age and state before adding a linked account.',
      ),
    ).toBeVisible();
  });

  it('links to a help article only where one exists', () => {
    renderSection();

    expect(
      screen.getByRole('link', {name: /learn more about clever/i}),
    ).toHaveAttribute('href', expect.stringContaining('Clever'));
    expect(
      screen.queryByRole('link', {name: /learn more about microsoft/i}),
    ).toBeNull();
  });

  it('names an LMS login by its platform and confirms before unlinking it', () => {
    renderSection(
      {
        authenticationOptions: [
          {id: 1, credentialType: 'email', email: 'ada@example.com'},
          {id: 3, credentialType: 'lti_v1', email: 'ada@lms.example.com'},
        ],
      },
      {lmsName: 'canvas_cloud'},
    );

    expect(
      screen.getByRole('link', {name: /learn more about canvas/i}),
    ).toHaveAttribute('href', expect.stringContaining('Canvas'));
    const disconnect = button(/disconnect account canvas/i);
    expect(disconnect.closest('form')).toBeNull();

    fireEvent.click(disconnect);

    expect(
      screen.getByRole('alertdialog', {
        name: 'Are you sure you want to unlink your account?',
      }),
    ).toBeInTheDocument();
  });
});
