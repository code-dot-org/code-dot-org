import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import BadgeLoginPage from '@cdo/apps/templates/badges/BadgeLoginPage';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient');
jest.mock('@cdo/apps/code-studio/clientState', () => ({reset: jest.fn()}));

const strings = Object.fromEntries(
  [
    'title',
    'start',
    'cancel',
    'switch_account',
    'continue',
    'signed_in',
    'manage',
    'privacy',
    'recovery',
    'continuity',
    'issue_all',
    'print_all',
    'print',
    'replace',
    'renew',
    'revoke',
    'active',
    'expires',
    'loading',
    'done',
    'confirm',
    'confirm_change',
    'back',
    'close_print',
  ].map(key => [key, key])
);
const badge = {
  generation: 1,
  expires_at: '2027-09-16T00:00:00Z',
  revoked: false,
  expired: false,
};

it('requires an explicit account switch before starting the camera', () => {
  render(
    <BadgeLoginPage
      mode="scan"
      strings={strings}
      authenticityToken="csrf"
      signedIn
      name="Teacher"
    />
  );
  expect(screen.queryByRole('button', {name: 'start'})).toBeNull();
  expect(screen.getByRole('link', {name: 'continue'})).toHaveAttribute(
    'href',
    '/home'
  );
  const button = screen.getByRole('button', {name: 'switch_account'});
  expect(button.closest('form')).toHaveAttribute(
    'action',
    '/badge_login/switch'
  );
  expect(button.closest('form')).toHaveAttribute('method', 'post');
});

it('retrieves existing cards without replacing credentials', async () => {
  HttpClient.fetchJson.mockResolvedValue({
    value: {
      students: [{id: 1, name: 'Student', eligible: true, badge}],
      issuance_enabled: false,
    },
  });
  HttpClient.post.mockResolvedValue({
    json: async () => ({
      cards: [
        {
          name: 'Student',
          badge_payload: `CDO1.${'a'.repeat(32)}.1.${'b'.repeat(43)}`,
          expires_at: badge.expires_at,
        },
      ],
      scanner_url: 'https://studio.code.org/badge_login',
    }),
  });
  render(
    <BadgeLoginPage
      mode="manage"
      sectionId={2}
      sectionName="Class"
      strings={strings}
      authenticityToken="csrf"
    />
  );
  fireEvent.click(await screen.findByRole('button', {name: 'print'}));
  expect(await screen.findByRole('img', {name: 'title'})).toBeInTheDocument();
  expect(HttpClient.post).toHaveBeenCalledTimes(1);
  expect(HttpClient.post.mock.calls[0][0]).toBe('/sections/2/badges/print');
  expect(screen.getByRole('button', {name: 'replace'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button', {name: 'close_print'}));
  expect(screen.queryByRole('img', {name: 'title'})).toBeNull();
});

it('replacement requires a confirmation and sends the current generation', async () => {
  HttpClient.fetchJson.mockResolvedValue({
    value: {
      students: [{id: 1, name: 'Student', eligible: true, badge}],
      issuance_enabled: true,
    },
  });
  HttpClient.post.mockResolvedValue({
    json: async () => ({badge: {...badge, generation: 2}}),
  });
  render(
    <BadgeLoginPage
      mode="manage"
      sectionId={2}
      sectionName="Class"
      strings={strings}
      authenticityToken="csrf"
    />
  );
  fireEvent.click(await screen.findByRole('button', {name: 'replace'}));
  expect(HttpClient.post).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole('button', {name: 'confirm'}));
  await waitFor(() => expect(HttpClient.post).toHaveBeenCalledTimes(1));
  expect(JSON.parse(HttpClient.post.mock.calls[0][1])).toMatchObject({
    operation: 'replace',
    generation: 1,
  });
});
