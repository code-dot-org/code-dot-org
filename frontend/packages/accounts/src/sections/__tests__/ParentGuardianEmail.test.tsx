import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {AccountSettings} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import ParentGuardianEmail from '../ParentGuardianEmail';

const STUDENT = {
  userType: 'student',
  parentEmail: 'parent@example.com',
} as AccountSettings;

function renderSection(overrides: Partial<AccountSettings> = {}) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <ParentGuardianEmail settings={{...STUDENT, ...overrides}} />
    </QueryClientProvider>,
  );
}

describe('ParentGuardianEmail', () => {
  it('shows the current parent email and a Remove affordance when one is set', () => {
    renderSection();
    expect(
      screen.getByRole('heading', {name: 'For Parents and Guardians'}),
    ).toBeInTheDocument();
    expect(screen.getByText('parent@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Remove'})).toBeInTheDocument();
  });

  it('shows None and no Remove affordance when no parent email is set', () => {
    renderSection({parentEmail: null});
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Remove'})).toBeNull();
  });

  it('opens the email modal from Update', async () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', {name: 'Update'}));
    const dialog = await screen.findByRole('dialog', {
      name: /parent\/guardian email/i,
    });
    expect(
      within(dialog).getByRole('textbox', {
        name: /^parent\/guardian email address$/i,
      }),
    ).toBeInTheDocument();
  });

  it('blocks submit and flags a mismatch when the two emails differ', async () => {
    let patched = false;
    mockServer.use(
      http.patch('*/users/parent_email', () => {
        patched = true;
        return new HttpResponse(null, {status: 204});
      }),
    );
    renderSection();
    fireEvent.click(screen.getByRole('button', {name: 'Update'}));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(
      within(dialog).getByRole('textbox', {
        name: /^parent\/guardian email address$/i,
      }),
      {target: {value: 'a@b.com'}},
    );
    fireEvent.change(within(dialog).getByRole('textbox', {name: /confirm/i}), {
      target: {value: 'different@b.com'},
    });
    fireEvent.click(within(dialog).getByRole('button', {name: 'Update'}));

    expect(await within(dialog).findByText(/don.t match/i)).toBeInTheDocument();
    expect(patched).toBe(false);
  });

  it('removes the parent email through PATCH /users', async () => {
    let removedBody: unknown;
    mockServer.use(
      http.patch('*/users', async ({request}) => {
        removedBody = await request.json();
        return new HttpResponse(null, {status: 204});
      }),
    );
    renderSection();
    fireEvent.click(screen.getByRole('button', {name: 'Remove'}));
    await waitFor(() =>
      expect(removedBody).toEqual({user: {parent_email: ''}}),
    );
  });
});
