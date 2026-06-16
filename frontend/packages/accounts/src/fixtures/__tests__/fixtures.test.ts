import {afterEach, describe, expect, it} from 'vitest';

import {DashboardApiClient} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';

import {asAccountsValidationError} from '../../api/AccountsApiValidationError';
import {
  ACCOUNTS_LAB_KEY,
  registerAccountsFixtures,
  resetAccountsFixtures,
} from '../index';

const account = DashboardApiClient.account;

function activate(tag: string) {
  registerAccountsFixtures();
  setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag});
}

afterEach(() => resetAccountsFixtures());

describe('account fixtures', () => {
  it('serves the teacher scenario settings', async () => {
    activate('teacher');
    const settings = await account.getSettings();
    expect(settings.userType).toBe('teacher');
    expect(settings.email).toBe('ada@example.com');
    expect(settings.dependentStudentsCount).toBe(2);
  });

  it('masks the student email and includes age/state', async () => {
    activate('student');
    const settings = await account.getSettings();
    expect(settings.userType).toBe('student');
    expect(settings.email).toBeNull();
    expect(settings.shouldSeeEditEmailLink).toBe(true);
    expect(settings.age).toBe(14);
    expect(settings.usState).toBe('WA');
  });

  it('exposes an SSO-only teacher with no password and a Google provider', async () => {
    activate('sso-teacher');
    const settings = await account.getSettings();
    expect(settings.hasPassword).toBe(false);
    expect(settings.shouldSeeAddPasswordForm).toBe(true);
    expect(settings.authenticationOptions[0].credentialType).toBe(
      'google_oauth2',
    );
  });

  it('exposes an oauth-only student with no add-password entitlement', async () => {
    activate('sso-student');
    const settings = await account.getSettings();
    expect(settings.userType).toBe('student');
    expect(settings.hasPassword).toBe(false);
    expect(settings.shouldSeeAddPasswordForm).toBe(false);
  });

  it('exposes a minimal account with optional fields null and edits locked', async () => {
    activate('minimal');
    const settings = await account.getSettings();
    expect(settings.givenName).toBeNull();
    expect(settings.age).toBeNull();
    expect(settings.usState).toBeNull();
    expect(settings.canEditEmail).toBe(false);
    expect(settings.canDeleteOwnAccount).toBe(false);
  });

  it('reflects a successful email update on the next read (write-through)', async () => {
    activate('teacher');
    await account.updateEmail({
      newEmail: 'ada@newschool.org',
      hashedEmail: 'hashed',
      currentPassword: 'currentpass',
    });
    const settings = await account.getSettings();
    expect(settings.email).toBe('ada@newschool.org');
  });

  it('serves the captured 422 for a wrong current password', async () => {
    activate('teacher');
    const error = await account
      .updateEmail({
        newEmail: 'ada@newschool.org',
        hashedEmail: 'hashed',
        currentPassword: 'nope',
      })
      .catch((e: unknown) => e);
    const validation = asAccountsValidationError(error);
    expect(validation?.fieldErrors.current_password).toEqual([
      'Current password is invalid',
    ]);
  });

  it('adds a parent email and reflects it on the next read', async () => {
    activate('student');
    await account.updateParentEmail({parentEmail: 'p@new.org', optIn: 'yes'});
    expect((await account.getSettings()).parentEmail).toBe('p@new.org');
  });

  it('serves a 422 for an invalid parent email', async () => {
    activate('student');
    const error = await account
      .updateParentEmail({parentEmail: 'bad', optIn: ''})
      .catch((e: unknown) => e);
    expect(
      asAccountsValidationError(error)?.fieldErrors.parent_email,
    ).toBeDefined();
  });

  it('removes the parent email', async () => {
    activate('student'); // seed carries parent@example.com
    await account.removeParentEmail();
    expect((await account.getSettings()).parentEmail).toBeNull();
  });

  it('resolves signing out other sessions', async () => {
    activate('student');
    await expect(account.signOutOtherSessions()).resolves.toBeUndefined();
  });
});
