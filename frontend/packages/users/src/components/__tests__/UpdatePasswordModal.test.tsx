import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {SHORT_PASSWORD, WRONG_PASSWORD} from '../../fixtures/errorBodies';
import {GENERIC_ERROR} from '../modalErrors';
import UpdatePasswordModal from '../UpdatePasswordModal';

function renderModal(onClose = vi.fn()) {
  const client = createQueryClient({queries: {retry: false}});
  render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <UpdatePasswordModal open onClose={onClose} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return {onClose};
}

const currentPasswordField = () => screen.getByLabelText('Current password');
const newPasswordField = () => screen.getByLabelText('New password');
const confirmPasswordField = () =>
  screen.getByLabelText('Confirm new password');
const submitButton = () =>
  screen.getByRole('button', {name: 'Update password'});

describe('UpdatePasswordModal', () => {
  it('renders the current-password, new-password, and confirmation fields', () => {
    renderModal();
    expect(currentPasswordField()).toBeInTheDocument();
    expect(newPasswordField()).toBeInTheDocument();
    expect(confirmPasswordField()).toBeInTheDocument();
  });

  it('submits current and new passwords, then toasts and closes', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users', async ({request}) => {
        body = await request.json();
        return HttpResponse.json({});
      }),
    );
    const {onClose} = renderModal();

    fireEvent.change(currentPasswordField(), {target: {value: 'oldpass'}});
    fireEvent.change(newPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.change(confirmPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      user: {
        current_password: 'oldpass',
        password: 'newpass1',
        password_confirmation: 'newpass1',
      },
    });
    expect(screen.getByText('Password updated.')).toBeInTheDocument();
  });

  it('keeps the dialog open and shows a too-short-password 422 on the password field', async () => {
    mockServer.use(
      http.patch('*/users', () =>
        HttpResponse.json(SHORT_PASSWORD, {status: 422}),
      ),
    );
    const {onClose} = renderModal();

    fireEvent.change(currentPasswordField(), {target: {value: 'oldpass'}});
    fireEvent.change(newPasswordField(), {target: {value: 'x'}});
    fireEvent.change(confirmPasswordField(), {target: {value: 'x'}});
    fireEvent.click(submitButton());

    expect(
      await screen.findByText(SHORT_PASSWORD.password[0]),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a wrong-password 422 on the current-password field', async () => {
    mockServer.use(
      http.patch('*/users', () =>
        HttpResponse.json(WRONG_PASSWORD, {status: 422}),
      ),
    );
    renderModal();

    fireEvent.change(currentPasswordField(), {target: {value: 'wrong'}});
    fireEvent.change(newPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.change(confirmPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.click(submitButton());

    expect(
      await screen.findByText(WRONG_PASSWORD.current_password[0]),
    ).toBeInTheDocument();
  });

  it('shows the generic message and keeps the dialog open on a 500', async () => {
    mockServer.use(
      http.patch('*/users', () => new HttpResponse(null, {status: 500})),
    );
    const {onClose} = renderModal();

    fireEvent.change(currentPasswordField(), {target: {value: 'oldpass'}});
    fireEvent.change(newPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.change(confirmPasswordField(), {target: {value: 'newpass1'}});
    fireEvent.click(submitButton());

    expect(await screen.findByText(GENERIC_ERROR)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
