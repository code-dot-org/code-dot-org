// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';

import {getSpaCsrfToken, setSpaCsrfToken} from '../../../csrfToken';
import type {Transport} from '../../../transports/types';
import {createUsersApi} from '../users.api';

function fakeTransport(result: unknown = undefined) {
  const request = vi.fn().mockResolvedValue(result);
  const requestWithMeta = vi.fn().mockResolvedValue({
    data: undefined,
    meta: {status: 204, headers: {}, url: '/x'},
  });
  const transport = {request, requestWithMeta} as unknown as Transport;
  return {api: createUsersApi(transport), request, requestWithMeta};
}

const WIRE_SETTINGS = {
  user_type: 'teacher',
  given_name: 'Ada',
  family_name: 'Lovelace',
  display_name: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  has_password: true,
  can_edit_email: true,
  can_edit_password: true,
  should_see_add_password_form: false,
  should_see_edit_email_link: true,
  authentication_options: [
    {credential_type: 'email', email: 'ada@example.com'},
  ],
  can_change_user_type: true,
  can_delete_own_account: true,
  age: '21+',
  us_state: null,
  parent_email: null,
  dependent_students_count: 0,
  age_options: [{value: '4', text: '4'}],
  us_state_options: [{value: 'WA', text: 'Washington'}],
};

describe('createUsersApi.getSettings', () => {
  it('GETs the settings endpoint and camelCases the response', async () => {
    const {api, request} = fakeTransport(WIRE_SETTINGS);
    const settings = await api.getSettings();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/api/v1/users/me/settings',
      }),
    );
    expect(settings.userType).toBe('teacher');
    expect(settings.parentEmail).toBeNull();
    expect(settings.authenticationOptions).toEqual([
      {credentialType: 'email', email: 'ada@example.com'},
    ]);
    expect(settings.ageOptions).toEqual([{value: '4', text: '4'}]);
    expect(settings.usStateOptions).toEqual([
      {value: 'WA', text: 'Washington'},
    ]);
  });

  it('rejects when the body fails schema validation', async () => {
    const {api} = fakeTransport({user_type: 'teacher'});
    await expect(api.getSettings()).rejects.toThrow();
  });
});

describe('createUsersApi mutations target the right routes', () => {
  it('updateProfile PATCHes /dashboardapi/users with only the given fields', async () => {
    const {api, request} = fakeTransport();
    await api.updateProfile({givenName: 'Grace', usState: 'WA'});
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        url: '/dashboardapi/users',
        body: {user: {given_name: 'Grace', us_state: 'WA'}},
      }),
    );
  });

  it('updateEmail PATCHes /users/email', async () => {
    const {api, request} = fakeTransport();
    await api.updateEmail({
      newEmail: 'a@b.co',
      hashedEmail: 'h',
      currentPassword: 'pw',
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({method: 'PATCH', url: '/users/email'}),
    );
  });

  it('updateParentEmail PATCHes /users/parent_email with the change source', async () => {
    const {api, request} = fakeTransport();
    await api.updateParentEmail({parentEmail: 'p@e.com', optIn: 'yes'});
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        url: '/users/parent_email',
        body: {
          user: {
            parent_email: 'p@e.com',
            parent_email_preference_opt_in: 'yes',
            parent_email_preference_source: 'PARENT_EMAIL_CHANGE',
          },
        },
      }),
    );
  });

  it('removeParentEmail PATCHes /users with a blank parent_email', async () => {
    const {api, request} = fakeTransport();
    await api.removeParentEmail();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        url: '/users',
        body: {user: {parent_email: ''}},
      }),
    );
  });

  it('signOutOtherSessions DELETEs /expire_other with redirect:manual', async () => {
    const {api, requestWithMeta} = fakeTransport();
    await expect(api.signOutOtherSessions()).resolves.toBeUndefined();
    expect(requestWithMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/expire_other',
        redirect: 'manual',
      }),
    );
  });

  it('signOutOtherSessions refreshes the CSRF token after expiring sessions', async () => {
    // expire_other rotates the session's CSRF token, so the next mutation 422s
    // unless we re-fetch it from /get_token (read off the response header).
    setSpaCsrfToken('stale');
    const {api, requestWithMeta} = fakeTransport();
    requestWithMeta.mockImplementation((req: {url: string}) =>
      req.url === '/get_token'
        ? Promise.resolve({
            data: undefined,
            meta: {status: 200, headers: {'csrf-token': 'fresh'}, url: req.url},
          })
        : Promise.resolve({
            data: undefined,
            meta: {status: 0, headers: {}, url: req.url},
          }),
    );

    await api.signOutOtherSessions();

    expect(requestWithMeta).toHaveBeenCalledWith(
      expect.objectContaining({method: 'GET', url: '/get_token'}),
    );
    expect(getSpaCsrfToken()).toBe('fresh');
    setSpaCsrfToken(null);
  });

  it('signOutOtherSessions rejects when the sign-out request fails', async () => {
    const {api, requestWithMeta} = fakeTransport();
    requestWithMeta.mockRejectedValue(new Error('Sign-out failed'));
    await expect(api.signOutOtherSessions()).rejects.toThrow();
  });

  it('deleteUser sends a top-level password_confirmation when given', async () => {
    const {api, request} = fakeTransport();
    await api.deleteUser({password: 'pw'});
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/users',
        body: {password_confirmation: 'pw'},
      }),
    );
  });

  it('deleteUser omits the body for word/picture accounts', async () => {
    const {api, request} = fakeTransport();
    await api.deleteUser({});
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/users',
        body: undefined,
      }),
    );
  });
});
