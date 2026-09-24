import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {MALFORMED_EMAIL, WRONG_PASSWORD} from '../../fixtures/errorBodies';
import {GENERIC_ERROR} from '../modalErrors';
import UpdateEmailModal from '../UpdateEmailModal';

function renderModal(onClose = vi.fn(), isTeacher = false) {
  const client = createQueryClient({queries: {retry: false}});
  render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <UpdateEmailModal open onClose={onClose} isTeacher={isTeacher} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return {onClose};
}

// A regex name match survives the wrapping <label> growing to include the
// error text once a field error is shown (the label's accessible name is its
// full text content).
const newEmailField = () => screen.getByRole('textbox', {name: /^New email/});
const currentPasswordField = () => screen.getByLabelText('Current password');
const submitButton = () => screen.getByRole('button', {name: 'Update email'});

describe('UpdateEmailModal', () => {
  it('renders the new-email and current-password fields', () => {
    renderModal();
    expect(newEmailField()).toBeInTheDocument();
    expect(currentPasswordField()).toBeInTheDocument();
  });

  it('submits the hashed email and current password, then toasts and closes', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users/email', async ({request}) => {
        body = await request.json();
        return HttpResponse.json({});
      }),
    );
    const {onClose} = renderModal();

    fireEvent.change(newEmailField(), {target: {value: 'test@example.com'}});
    fireEvent.change(currentPasswordField(), {target: {value: 'hunter2'}});
    fireEvent.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    // Backend parity contract: hashed_email must match what Rails computes
    // from the same address, so it can match accounts without the cleartext.
    expect(body).toEqual({
      user: {
        email: 'test@example.com',
        hashed_email: '55502f40dc8b7c769880b10874abc9d0',
        current_password: 'hunter2',
      },
    });
    expect(screen.getByText('Email updated.')).toBeInTheDocument();
  });

  it('keeps the dialog open and shows the email error on a malformed-email 422', async () => {
    mockServer.use(
      http.patch('*/users/email', () =>
        HttpResponse.json(MALFORMED_EMAIL, {status: 422}),
      ),
    );
    const {onClose} = renderModal();

    fireEvent.change(newEmailField(), {target: {value: 'not-an-email'}});
    fireEvent.change(currentPasswordField(), {target: {value: 'hunter2'}});
    fireEvent.click(submitButton());

    expect(
      await screen.findByText(MALFORMED_EMAIL.email[0]),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(newEmailField()).toHaveValue('not-an-email');
  });

  it('surfaces a wrong-password 422 on the current-password field', async () => {
    mockServer.use(
      http.patch('*/users/email', () =>
        HttpResponse.json(WRONG_PASSWORD, {status: 422}),
      ),
    );
    renderModal();

    fireEvent.change(newEmailField(), {target: {value: 'test@example.com'}});
    fireEvent.change(currentPasswordField(), {target: {value: 'wrong'}});
    fireEvent.click(submitButton());

    expect(
      await screen.findByText(WRONG_PASSWORD.current_password[0]),
    ).toBeInTheDocument();
  });

  it('shows the generic message and keeps the dialog open on a 500', async () => {
    mockServer.use(
      http.patch('*/users/email', () => new HttpResponse(null, {status: 500})),
    );
    const {onClose} = renderModal();

    fireEvent.change(newEmailField(), {target: {value: 'test@example.com'}});
    fireEvent.change(currentPasswordField(), {target: {value: 'hunter2'}});
    fireEvent.click(submitButton());

    expect(await screen.findByText(GENERIC_ERROR)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  describe('email opt-in', () => {
    const fillAndSubmit = () => {
      fireEvent.change(newEmailField(), {target: {value: 'test@example.com'}});
      fireEvent.change(currentPasswordField(), {target: {value: 'hunter2'}});
      fireEvent.click(submitButton());
    };

    it('should ask a teacher the legacy opt-in question with a privacy link', () => {
      renderModal(vi.fn(), true);
      expect(
        screen.getByRole('radiogroup', {
          name: 'Can we email you about updates to our courses, local opportunities, or other computer science news?',
        }),
      ).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'Yes'})).not.toBeChecked();
      expect(screen.getByRole('radio', {name: 'No'})).not.toBeChecked();
      expect(
        screen.getByRole('link', {name: '(See our privacy policy)'}),
      ).toHaveAttribute('href', expect.stringContaining('/privacy'));
    });

    it('should not ask a student', () => {
      renderModal();
      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    });

    it('should require an answer from a teacher before sending anything', async () => {
      let requested = false;
      mockServer.use(
        http.patch('*/users/email', () => {
          requested = true;
          return HttpResponse.json({});
        }),
      );
      const {onClose} = renderModal(vi.fn(), true);

      fillAndSubmit();

      expect(
        await screen.findByText('This field is required.'),
      ).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription(
        'This field is required.',
      );
      expect(requested).toBe(false);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should send a teacher's answer with the email change", async () => {
      let body: unknown;
      mockServer.use(
        http.patch('*/users/email', async ({request}) => {
          body = await request.json();
          return HttpResponse.json({});
        }),
      );
      const {onClose} = renderModal(vi.fn(), true);

      fireEvent.click(screen.getByRole('radio', {name: 'No'}));
      fillAndSubmit();

      await waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(body).toEqual({
        user: {
          email: 'test@example.com',
          hashed_email: '55502f40dc8b7c769880b10874abc9d0',
          current_password: 'hunter2',
          email_preference_opt_in: 'no',
        },
      });
    });
  });
});
