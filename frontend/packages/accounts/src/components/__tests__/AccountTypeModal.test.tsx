import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {UserType} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import AccountTypeModal from '../AccountTypeModal';

function renderModal(prospectiveType: UserType, onClose = vi.fn()) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <AccountTypeModal
        open
        prospectiveType={prospectiveType}
        onClose={onClose}
      />
    </QueryClientProvider>,
  );
  return onClose;
}

const emailField = () => screen.queryByRole('textbox', {name: /email/i});

describe('AccountTypeModal', () => {
  it('prompts for an email when upgrading to educator', () => {
    renderModal('teacher');
    expect(emailField()).toBeInTheDocument();
  });

  it('does not prompt for an email when downgrading to student', () => {
    renderModal('student');
    expect(emailField()).toBeNull();
  });

  it('keeps confirm disabled until an email is entered on upgrade', () => {
    renderModal('teacher');
    const confirm = screen.getByRole('button', {name: /change to educator/i});
    expect(confirm).toBeDisabled();
    fireEvent.change(emailField()!, {target: {value: 'new@teacher.org'}});
    expect(confirm).toBeEnabled();
  });

  it('sends the email and hashed email when upgrading', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users/user_type', async ({request}) => {
        body = await request.json();
        return new HttpResponse(null, {status: 204});
      }),
    );
    const onClose = renderModal('teacher');
    fireEvent.change(emailField()!, {target: {value: 'new@teacher.org'}});
    fireEvent.click(screen.getByRole('button', {name: /change to educator/i}));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      user: {
        user_type: 'teacher',
        email: 'new@teacher.org',
        hashed_email: expect.any(String),
      },
    });
  });

  it('shows a server email error on the field and stays open', async () => {
    mockServer.use(
      http.patch('*/users/user_type', () =>
        HttpResponse.json(
          {email: ['Email has already been taken']},
          {status: 422},
        ),
      ),
    );
    renderModal('teacher');
    fireEvent.change(emailField()!, {target: {value: 'taken@teacher.org'}});
    fireEvent.click(screen.getByRole('button', {name: /change to educator/i}));

    expect(
      await screen.findByText('Email has already been taken'),
    ).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
