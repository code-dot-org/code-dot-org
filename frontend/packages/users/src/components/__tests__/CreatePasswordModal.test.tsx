import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {SHORT_PASSWORD} from '../../fixtures/errorBodies';
import CreatePasswordModal from '../CreatePasswordModal';
import {GENERIC_ERROR} from '../modalErrors';

function renderModal(onClose = vi.fn()) {
  const client = createQueryClient({queries: {retry: false}});
  render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <CreatePasswordModal open onClose={onClose} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return {onClose};
}

const newPasswordField = () => screen.getByLabelText('New password');
const confirmPasswordField = () =>
  screen.getByLabelText('Confirm new password');
const submitButton = () =>
  screen.getByRole('button', {name: 'Create password'});

describe('CreatePasswordModal', () => {
  it('renders the new-password and confirmation fields, with no current-password field', () => {
    renderModal();
    expect(newPasswordField()).toBeInTheDocument();
    expect(confirmPasswordField()).toBeInTheDocument();
    // SSO-only accounts have nothing to confirm against; this is the field
    // that distinguishes create from update.
    expect(screen.queryByLabelText('Current password')).toBeNull();
  });

  it('submits the new password without current_password, then toasts and closes', async () => {
    let body: Record<string, unknown> = {};
    mockServer.use(
      http.patch('*/users', async ({request}) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({});
      }),
    );
    const {onClose} = renderModal();

    fireEvent.change(newPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.change(confirmPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      user: {
        password: 'newpass1',
        password_confirmation: 'newpass1',
      },
    });
    expect(
      (body.user as Record<string, unknown>).current_password,
    ).toBeUndefined();
    expect(screen.getByText('Password created.')).toBeInTheDocument();
  });

  it('keeps the dialog open and shows a too-short-password 422 on the password field', async () => {
    mockServer.use(
      http.patch('*/users', () =>
        HttpResponse.json(SHORT_PASSWORD, {status: 422}),
      ),
    );
    const {onClose} = renderModal();

    fireEvent.change(newPasswordField(), {target: {value: 'x'}});
    fireEvent.change(confirmPasswordField(), {target: {value: 'x'}});
    fireEvent.click(submitButton());

    expect(
      await screen.findByText(SHORT_PASSWORD.password[0]),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows the generic message and keeps the dialog open on a 500', async () => {
    mockServer.use(
      http.patch('*/users', () => new HttpResponse(null, {status: 500})),
    );
    const {onClose} = renderModal();

    fireEvent.change(newPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.change(confirmPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.click(submitButton());

    expect(await screen.findByText(GENERIC_ERROR)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
