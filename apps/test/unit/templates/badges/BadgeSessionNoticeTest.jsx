import {act, render, screen} from '@testing-library/react';
import React from 'react';

import BadgeSessionNotice from '@cdo/apps/templates/badges/BadgeSessionNotice';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient');

const strings = {
  title: 'Badge',
  sign_out: 'Sign out',
  session_warning: 'Save your work',
  session_expired: 'Session ended',
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('warns before expiry without refreshing the session through polling', () => {
  render(
    <BadgeSessionNotice
      strings={strings}
      authenticityToken="csrf"
      expiresAt={Date.now() / 1000 + 310}
    />
  );
  act(() => jest.advanceTimersByTime(20000));
  expect(screen.getByText('Save your work')).toBeInTheDocument();
  expect(HttpClient.post).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(300000));
  expect(screen.getByText('Session ended')).toBeInTheDocument();
  expect(HttpClient.post).not.toHaveBeenCalled();
});

it('captures trusted interaction at most once a minute', async () => {
  const listeners = jest.spyOn(window, 'addEventListener');
  HttpClient.post.mockResolvedValue({
    json: async () => ({expires_at: Date.now() / 1000 + 7200}),
  });
  render(
    <BadgeSessionNotice
      strings={strings}
      authenticityToken="csrf"
      expiresAt={Date.now() / 1000 + 7200}
    />
  );
  const [, activity, capture] = listeners.mock.calls.find(
    ([name]) => name === 'pointerdown'
  );
  expect(capture).toBe(true);
  await act(async () => activity({isTrusted: false}));
  expect(HttpClient.post).not.toHaveBeenCalled();
  await act(async () => activity({isTrusted: true}));
  await act(async () => activity({isTrusted: true}));
  expect(HttpClient.post).toHaveBeenCalledTimes(1);
  expect(HttpClient.post).toHaveBeenCalledWith(
    '/badge_login/activity',
    undefined,
    true
  );
});
