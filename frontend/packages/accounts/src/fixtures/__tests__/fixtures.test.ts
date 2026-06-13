import {afterEach, describe, expect, it} from 'vitest';

import {setActiveScenario} from '@code-dot-org/core/api/mocks';

import {getAccountSettings, updateEmail} from '../../api/accounts.api';
import {AccountsApiValidationError} from '../../api/AccountsApiValidationError';
import {
  ACCOUNTS_LAB_KEY,
  registerAccountsFixtures,
  resetAccountsFixtures,
} from '../index';

function activate(tag: string) {
  registerAccountsFixtures();
  setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag});
}

afterEach(() => resetAccountsFixtures());

describe('account fixtures', () => {
  it('serves the teacher scenario settings', async () => {
    activate('teacher');
    const settings = await getAccountSettings();
    expect(settings.userType).toBe('teacher');
    expect(settings.email).toBe('ada@example.com');
    expect(settings.dependentStudentsCount).toBe(2);
  });

  it('masks the student email and includes age/state', async () => {
    activate('student');
    const settings = await getAccountSettings();
    expect(settings.userType).toBe('student');
    expect(settings.email).toBeNull();
    expect(settings.shouldSeeEditEmailLink).toBe(true);
    expect(settings.age).toBe(14);
    expect(settings.usState).toBe('WA');
  });

  it('exposes an SSO-only teacher with no password and a Google provider', async () => {
    activate('sso-teacher');
    const settings = await getAccountSettings();
    expect(settings.hasPassword).toBe(false);
    expect(settings.shouldSeeAddPasswordForm).toBe(true);
    expect(settings.authenticationOptions[0].credentialType).toBe(
      'google_oauth2',
    );
  });

  it('exposes an oauth-only student with no add-password entitlement', async () => {
    activate('sso-student');
    const settings = await getAccountSettings();
    expect(settings.userType).toBe('student');
    expect(settings.hasPassword).toBe(false);
    expect(settings.shouldSeeAddPasswordForm).toBe(false);
  });

  it('exposes a minimal account with optional fields null and edits locked', async () => {
    activate('minimal');
    const settings = await getAccountSettings();
    expect(settings.givenName).toBeNull();
    expect(settings.age).toBeNull();
    expect(settings.usState).toBeNull();
    expect(settings.canEditEmail).toBe(false);
    expect(settings.canDeleteOwnAccount).toBe(false);
  });

  it('reflects a successful email update on the next read (write-through)', async () => {
    activate('teacher');
    await updateEmail({
      newEmail: 'ada@newschool.org',
      hashedEmail: 'hashed',
      currentPassword: 'currentpass',
    });
    const settings = await getAccountSettings();
    expect(settings.email).toBe('ada@newschool.org');
  });

  it('serves the captured 422 for a wrong current password', async () => {
    activate('teacher');
    const error = await updateEmail({
      newEmail: 'ada@newschool.org',
      hashedEmail: 'hashed',
      currentPassword: 'nope',
    }).catch(e => e);
    expect(error).toBeInstanceOf(AccountsApiValidationError);
    expect(error.fieldErrors.current_password).toEqual([
      'Current password is invalid',
    ]);
  });
});
