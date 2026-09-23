import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import UnlinkLtiModal from '../UnlinkLtiModal';

function renderModal(onClose = vi.fn()) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <UnlinkLtiModal
        open
        onClose={onClose}
        lmsName="Canvas"
        authenticationOptionId={42}
      />
    </QueryClientProvider>,
  );
  return onClose;
}

const unlinkButton = () => screen.getByRole('button', {name: 'Unlink account'});

describe('UnlinkLtiModal', () => {
  it('warns that the LMS sections will be lost', () => {
    renderModal();

    expect(
      screen.getByRole('alertdialog', {
        name: 'Are you sure you want to unlink your account?',
      }),
    ).toHaveAccessibleDescription(
      'If you unlink your account, you will lose access to all your Canvas sections. You may regain access to these sections by launching CodeAI from Canvas again.',
    );
  });

  it('posts the option id, then lands on the legacy account page', async () => {
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
      renderModal();
      fireEvent.click(unlinkButton());

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
    const onClose = renderModal();

    fireEvent.click(unlinkButton());

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on cancel without a request', () => {
    const onClose = renderModal();

    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

    expect(onClose).toHaveBeenCalled();
  });
});
