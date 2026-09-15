import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {UserType} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import UsersTypeModal from '../UsersTypeModal';

function renderModal(prospectiveType: UserType, onClose = vi.fn()) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <UsersTypeModal
        open
        prospectiveType={prospectiveType}
        onClose={onClose}
      />
    </QueryClientProvider>,
  );
  return onClose;
}

const emailField = () => screen.queryByRole('textbox', {name: /email/i});
const optInRadio = (answer: 'Yes' | 'No') =>
  screen.queryByRole('radio', {name: answer});

describe('UsersTypeModal', () => {
  it('prompts for an email when changing to educator', () => {
    renderModal('teacher');
    expect(emailField()).toBeInTheDocument();
  });

  it('does not prompt for an email when changing to student', () => {
    renderModal('student');
    expect(emailField()).toBeNull();
  });

  it('asks the email opt-in question when changing to educator', () => {
    renderModal('teacher');
    expect(
      screen.getByRole('radiogroup', {name: /can we email you/i}),
    ).toBeInTheDocument();
  });

  it('does not ask the email opt-in question when changing to student', () => {
    renderModal('student');
    expect(optInRadio('Yes')).toBeNull();
  });

  it('keeps confirm disabled until both email and opt-in are answered', () => {
    renderModal('teacher');
    const confirm = screen.getByRole('button', {name: /change to educator/i});
    expect(confirm).toBeDisabled();
    fireEvent.change(emailField()!, {target: {value: 'new@teacher.org'}});
    expect(confirm).toBeDisabled();
    fireEvent.click(optInRadio('Yes')!);
    expect(confirm).toBeEnabled();
  });

  it('keeps confirm disabled when only the opt-in is answered', () => {
    renderModal('teacher');
    fireEvent.click(optInRadio('No')!);
    expect(
      screen.getByRole('button', {name: /change to educator/i}),
    ).toBeDisabled();
  });

  it('sends the email and hashed email when changing to educator', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users/user_type', async ({request}) => {
        body = await request.json();
        return new HttpResponse(null, {status: 204});
      }),
    );
    const onClose = renderModal('teacher');
    fireEvent.change(emailField()!, {target: {value: 'new@teacher.org'}});
    fireEvent.click(optInRadio('Yes')!);
    fireEvent.click(screen.getByRole('button', {name: /change to educator/i}));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      user: {
        user_type: 'teacher',
        email: 'new@teacher.org',
        hashed_email: expect.any(String),
        email_preference_opt_in: 'yes',
      },
    });
  });

  it('sends a negative email opt-in when the answer is no', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users/user_type', async ({request}) => {
        body = await request.json();
        return new HttpResponse(null, {status: 204});
      }),
    );
    const onClose = renderModal('teacher');
    fireEvent.change(emailField()!, {target: {value: 'new@teacher.org'}});
    fireEvent.click(optInRadio('No')!);
    fireEvent.click(screen.getByRole('button', {name: /change to educator/i}));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toMatchObject({user: {email_preference_opt_in: 'no'}});
  });

  it('sends no opt-in when changing to student', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users/user_type', async ({request}) => {
        body = await request.json();
        return new HttpResponse(null, {status: 204});
      }),
    );
    const onClose = renderModal('student');
    fireEvent.click(screen.getByRole('button', {name: /change to student/i}));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({user: {user_type: 'student'}});
  });

  it('submits on Enter in the email field when changing to educator', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users/user_type', async ({request}) => {
        body = await request.json();
        return new HttpResponse(null, {status: 204});
      }),
    );
    const onClose = renderModal('teacher');
    fireEvent.change(emailField()!, {target: {value: 'new@teacher.org'}});
    fireEvent.click(optInRadio('Yes')!);
    const form = screen
      .getByRole('button', {name: /change to educator/i})
      .closest('form');
    fireEvent.submit(form!);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toMatchObject({
      user: {user_type: 'teacher', email: 'new@teacher.org'},
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
    fireEvent.click(optInRadio('Yes')!);
    fireEvent.click(screen.getByRole('button', {name: /change to educator/i}));

    expect(
      await screen.findByText('Email has already been taken'),
    ).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
