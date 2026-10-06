import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {IntegrationsSettings, UserSettings} from '@code-dot-org/core/api';

import canvasLogo from '../../assets/providers/canvas.webp';
import cleverLogo from '../../assets/providers/clever.svg';
import LinkedAccounts from '../LinkedAccounts';

const INTEGRATIONS: IntegrationsSettings = {
  canManageLinkedAccounts: true,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
  personalAccountLinkingEnabled: true,
  lmsName: null,
};

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
  integrations: INTEGRATIONS,
};

function renderSection(
  settings: Partial<UserSettings> = {},
  integrations: Partial<IntegrationsSettings> = {},
) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <LinkedAccounts
        settings={{
          ...TEACHER,
          ...settings,
          integrations: {...INTEGRATIONS, ...integrations},
        }}
      />
    </QueryClientProvider>,
  );
}

const group = (name: string) =>
  screen.getByRole('heading', {level: 3, name}).closest('section')!;
const rowOf = (name: string) =>
  screen.getByRole('heading', {level: 4, name}).closest('li')!;

describe('LinkedAccounts', () => {
  it('lists linked logins under My integrations with their email', () => {
    renderSection();

    const google = within(group('My integrations')).getByRole('heading', {
      level: 4,
      name: 'Google',
    });
    expect(google).toBeInTheDocument();
    expect(within(rowOf('Google')).getByText('ada@example.com')).toBeVisible();
  });

  it('lists every unlinked provider under Available integrations without an email', () => {
    renderSection();

    const names = within(group('Available integrations'))
      .getAllByRole('heading', {level: 4})
      .map(heading => heading.textContent);
    expect(names).toEqual([
      'Microsoft',
      'Clever',
      'ClassLink',
      'Facebook',
      'Canvas',
      'PowerSchool (Schoology)',
    ]);
    expect(within(rowOf('Clever')).queryByText(/@/)).toBeNull();
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

  it('shows no email for a login without one', () => {
    renderSection({
      authenticationOptions: [
        {id: 2, credentialType: 'google_oauth2', email: null},
      ],
    });

    expect(within(rowOf('Google')).queryByText(/•|encrypted/)).toBeNull();
  });

  it('shows a provider logo as a decorative image', () => {
    renderSection();

    const logo = rowOf('Clever').querySelector('img');
    expect(logo).toHaveAttribute('src', cleverLogo);
    expect(logo).toHaveAttribute('alt', '');
  });

  it('names an LMS login by its platform', () => {
    renderSection(
      {
        authenticationOptions: [
          {id: 3, credentialType: 'lti_v1', email: 'ada@lms.example.com'},
        ],
      },
      {lmsName: 'canvas_cloud'},
    );

    expect(
      within(group('My integrations')).getByRole('heading', {
        level: 4,
        name: 'Canvas',
      }),
    ).toBeInTheDocument();
  });

  it('shows an LMS login with its platform logo', () => {
    renderSection(
      {
        authenticationOptions: [
          {id: 3, credentialType: 'lti_v1', email: 'ada@lms.example.com'},
        ],
      },
      {lmsName: 'canvas_cloud'},
    );

    expect(rowOf('Canvas').querySelector('img')).toHaveAttribute(
      'src',
      canvasLogo,
    );
  });

  it('stops offering an LMS once it is linked', () => {
    renderSection(
      {
        authenticationOptions: [
          {id: 3, credentialType: 'lti_v1', email: 'ada@lms.example.com'},
        ],
      },
      {lmsName: 'canvas_cloud'},
    );

    const names = within(group('Available integrations'))
      .getAllByRole('heading', {level: 4})
      .map(heading => heading.textContent);
    expect(names).not.toContain('Canvas');
    expect(names).toContain('PowerSchool (Schoology)');
  });
});
