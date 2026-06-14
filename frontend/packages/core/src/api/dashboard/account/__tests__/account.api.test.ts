// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createAccountApi} from '../account.api';

function fakeTransport(result: unknown = undefined) {
  const request = vi.fn().mockResolvedValue(result);
  const transport = {request} as unknown as Transport;
  return {api: createAccountApi(transport), request};
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
};

describe('createAccountApi.getSettings', () => {
  it('GETs the settings endpoint and camelCases the response', async () => {
    const {api, request} = fakeTransport(WIRE_SETTINGS);
    const settings = await api.getSettings();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({method: 'GET', url: '/api/v1/account/settings'}),
    );
    expect(settings.userType).toBe('teacher');
    expect(settings.parentEmail).toBeNull();
    expect(settings.authenticationOptions).toEqual([
      {credentialType: 'email', email: 'ada@example.com'},
    ]);
  });

  it('rejects when the body fails schema validation', async () => {
    const {api} = fakeTransport({user_type: 'teacher'});
    await expect(api.getSettings()).rejects.toThrow();
  });
});

describe('createAccountApi mutations target the right routes', () => {
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

  it('signOutOtherSessions DELETEs /expire_other without following the redirect', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, {status: 204}));
    vi.stubGlobal('fetch', fetchMock);
    const {api} = fakeTransport();
    await expect(api.signOutOtherSessions()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      '/expire_other',
      expect.objectContaining({method: 'DELETE', redirect: 'manual'}),
    );
    vi.unstubAllGlobals();
  });

  it('signOutOtherSessions treats an unfollowed redirect as success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({type: 'opaqueredirect', ok: false, status: 0}),
    );
    const {api} = fakeTransport();
    await expect(api.signOutOtherSessions()).resolves.toBeUndefined();
    vi.unstubAllGlobals();
  });

  it('signOutOtherSessions throws on a real failure response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, {status: 500})),
    );
    const {api} = fakeTransport();
    await expect(api.signOutOtherSessions()).rejects.toThrow();
    vi.unstubAllGlobals();
  });

  it('deleteAccount sends a top-level password_confirmation when given', async () => {
    const {api, request} = fakeTransport();
    await api.deleteAccount({password: 'pw'});
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/users',
        body: {password_confirmation: 'pw'},
      }),
    );
  });

  it('deleteAccount omits the body for word/picture accounts', async () => {
    const {api, request} = fakeTransport();
    await api.deleteAccount({});
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/users',
        body: undefined,
      }),
    );
  });
});
