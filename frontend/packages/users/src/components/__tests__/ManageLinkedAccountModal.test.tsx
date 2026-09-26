import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {AuthenticationOptionSummary} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import ManageLinkedAccountModal from '../ManageLinkedAccountModal';

const GOOGLE = {
  id: 7,
  credentialType: 'google_oauth2',
  email: 'ada@example.com',
};
const CANVAS = {id: 42, credentialType: 'lti_v1', email: null};

function renderModal(
  option: AuthenticationOptionSummary,
  {
    name = 'Google',
    blockedMessage,
  }: {name?: string; blockedMessage?: string} = {},
) {
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <ManageLinkedAccountModal
        open
        onClose={onClose}
        option={option}
        name={name}
        blockedMessage={blockedMessage}
      />
    </QueryClientProvider>,
  );
  return onClose;
}

beforeEach(() => {
  const meta = document.createElement('meta');
  meta.name = 'csrf-token';
  meta.content = 'test-csrf-token';
  document.head.append(meta);
});

afterEach(() => {
  document.head.querySelector('meta[name="csrf-token"]')?.remove();
});

describe('ManageLinkedAccountModal', () => {
  it('shows the linked email', () => {
    renderModal(GOOGLE);

    expect(
      screen.getByRole('dialog', {name: 'Manage Google'}),
    ).toHaveAccessibleDescription('Linked to ada@example.com');
  });

  it('disconnects an OAuth login by posting its disconnect form', () => {
    renderModal(GOOGLE);

    const form = screen
      .getByRole('button', {name: 'Disconnect account'})
      .closest('form')!;
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute('action', '/users/auth/7/disconnect');
    expect(form).toHaveFormValues({authenticity_token: 'test-csrf-token'});
  });

  it('blocks the disconnect and says why', () => {
    const reason =
      'You cannot disconnect from this linked account because it is tied to one of your sections.';
    renderModal(GOOGLE, {blockedMessage: reason});

    const disconnect = screen.getByRole('button', {name: 'Disconnect account'});
    expect(disconnect).toBeDisabled();
    expect(disconnect).toHaveAccessibleDescription(reason);
  });

  it('warns that unlinking an LMS login loses its sections', () => {
    renderModal(CANVAS, {name: 'Canvas'});

    expect(
      screen.getByRole('alertdialog', {name: 'Manage Canvas'}),
    ).toHaveAccessibleDescription(
      'Linked to Email address encrypted If you unlink your account, you will lose access to all your Canvas sections. You may regain access to these sections by launching CodeAI from Canvas again.',
    );
  });

  it('unlinks an LMS login, then lands on the legacy account page', async () => {
    let body: unknown;
    mockServer.use(
      http.post('*/lti/v1/account_linking/unlink', async ({request}) => {
        body = await request.json();
        return new HttpResponse(null, {status: 200});
      }),
    );
    // jsdom's window.location.assign is non-configurable; stub the whole object.
    const original = window.location;
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...original, assign},
    });

    try {
      renderModal(CANVAS, {name: 'Canvas'});
      fireEvent.click(screen.getByRole('button', {name: 'Unlink account'}));

      await waitFor(() => expect(assign).toHaveBeenCalledWith('/users/edit'));
      expect(body).toEqual({authentication_option_id: 42});
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: original,
      });
    }
  });

  it('stays open with an error when the unlink fails', async () => {
    mockServer.use(
      http.post(
        '*/lti/v1/account_linking/unlink',
        () => new HttpResponse(null, {status: 404}),
      ),
    );
    const onClose = renderModal(CANVAS, {name: 'Canvas'});

    fireEvent.click(screen.getByRole('button', {name: 'Unlink account'}));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on cancel', () => {
    const onClose = renderModal(GOOGLE);

    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

    expect(onClose).toHaveBeenCalled();
  });
});
