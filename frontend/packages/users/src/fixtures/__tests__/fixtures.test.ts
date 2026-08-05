import {afterEach, describe, expect, it} from 'vitest';

import {DashboardApiClient} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';

import {asUsersValidationError} from '../../api/UsersApiValidationError';
import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../index';

const account = DashboardApiClient.users;

function activate(tag: string) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag});
}

afterEach(() => resetUsersFixtures());

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

  // Each of these pins one delete-account gate combination the others miss.
  it('exposes a teacher with no dependent students', async () => {
    activate('teacher-no-dependents');
    const settings = await account.getSettings();
    expect(settings.userType).toBe('teacher');
    expect(settings.dependentStudentsCount).toBe(0);
    expect(settings.canDeleteOwnAccount).toBe(true);
  });

  it('exposes an SSO teacher who still has dependent students', async () => {
    activate('sso-teacher-dependents');
    const settings = await account.getSettings();
    expect(settings.userType).toBe('teacher');
    // No password to re-authenticate with, so the acknowledgments and the typed
    // string are the whole gate.
    expect(settings.hasPassword).toBe(false);
    expect(settings.dependentStudentsCount).toBe(2);
    expect(settings.canDeleteOwnAccount).toBe(true);
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
    const validation = asUsersValidationError(error);
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
      asUsersValidationError(error)?.fieldErrors.parent_email,
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

describe('educator profile fixtures', () => {
  it('serves a teacher role, role options, and school info', async () => {
    activate('teacher');
    const settings = await account.getSettings();
    expect(settings.educatorRole).toBe('classroom_teacher');
    expect(settings.educatorRoleOptions).toHaveLength(9);
    expect(settings.educatorRoleOptions?.[0]).toEqual({
      value: 'classroom_teacher',
      text: 'Classroom Teacher',
      category: 'educator',
    });
    expect(settings.schoolInfo?.schoolName).toBe('Example Elementary School');
  });

  it('omits every educator-profile key for a student', async () => {
    activate('student');
    const settings = await account.getSettings();
    expect('educatorRole' in settings).toBe(false);
    expect('educatorRoleOptions' in settings).toBe(false);
    expect('schoolInfo' in settings).toBe(false);
  });

  it('serves an educator with no role and no school', async () => {
    activate('teacher-no-school');
    const settings = await account.getSettings();
    expect(settings.educatorRole).toBeNull();
    expect(settings.schoolInfo).toBeNull();
    expect(settings.educatorRoleOptions).toHaveLength(9);
  });

  it('reflects a saved educator role on the next read', async () => {
    activate('teacher-no-school');
    await account.updateProfile({educatorRole: 'librarian_media_specialist'});
    expect((await account.getSettings()).educatorRole).toBe(
      'librarian_media_specialist',
    );
  });
});

describe('school search and update fixtures', () => {
  it('returns schools for a seeded zip', async () => {
    activate('teacher');
    const schools = await DashboardApiClient.schools.zipSearch({zip: '98101'});
    expect(schools.map(school => school.name)).toContain(
      'Example Elementary School',
    );
  });

  it('returns an empty list for a valid zip with no schools', async () => {
    activate('teacher');
    expect(await DashboardApiClient.schools.zipSearch({zip: '30305'})).toEqual(
      [],
    );
  });

  it('resolves a sent school_id to the school name on the next read', async () => {
    activate('teacher-no-school');
    await account.updateSchoolInfo({
      schoolId: '100000000002',
      country: 'US',
      schoolName: '',
      schoolZip: '98101',
    });
    const settings = await account.getSettings();
    expect(settings.schoolInfo?.schoolName).toBe('Example Middle School');
    expect(settings.schoolInfo?.country).toBe('US');
  });

  it('stores a manually entered non-US school', async () => {
    activate('teacher-no-school');
    await account.updateSchoolInfo({
      schoolId: 'clickToAdd',
      country: 'CA',
      schoolName: 'École Secondaire',
      schoolZip: '',
    });
    const settings = await account.getSettings();
    expect(settings.schoolInfo?.schoolName).toBe('École Secondaire');
    expect(settings.schoolInfo?.country).toBe('CA');
  });

  // buildSchoolData never emits this body, so the route is hit directly: the
  // fixture guards like the controller rather than trusting the client.
  it('serves the captured 422 when neither school_id nor country is sent', async () => {
    activate('teacher');
    const response = await fetch('/api/v1/user_school_infos', {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({user: {school_info_attributes: {zip: '98101'}}}),
    });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: 'school id or country is not present',
    });
  });
});
