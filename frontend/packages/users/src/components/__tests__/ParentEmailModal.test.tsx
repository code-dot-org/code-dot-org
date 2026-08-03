import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import ParentEmailModal from '../ParentEmailModal';

const CURRENT = 'parent@example.com';

function renderModal({
  currentParentEmail = CURRENT,
  onClose = vi.fn(),
}: {currentParentEmail?: string | null; onClose?: () => void} = {}) {
  const client = createQueryClient({queries: {retry: false}});
  const tree = (address: string | null) => (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <ParentEmailModal open onClose={onClose} currentParentEmail={address} />
      </ToastProvider>
    </QueryClientProvider>
  );
  const {rerender} = render(tree(currentParentEmail));
  return {onClose, setCurrentParentEmail: (a: string) => rerender(tree(a))};
}

const addressField = () =>
  screen.getByRole('textbox', {name: /^Parent\/guardian email address/});
const confirmField = () =>
  screen.getByRole('textbox', {
    name: /^Confirm parent\/guardian email address/,
  });
const submitButton = () => screen.getByRole('button', {name: 'Update'});

const fill = (field: HTMLElement, value: string) =>
  fireEvent.change(field, {target: {value}});

describe('ParentEmailModal — prefill and copy', () => {
  // The address has to change to be accepted, so there is nothing useful to
  // prefill — offering the old value guarantees the first thing typed is wrong.
  it('opens with both address fields empty even when an address is on file', () => {
    renderModal();
    expect(addressField()).toHaveValue('');
    expect(confirmField()).toHaveValue('');
  });

  it('renders the opt-in copy verbatim, including the course-and-computer-science clause', () => {
    renderModal();
    expect(
      screen.getByText(
        'This email address will have the ability to recover/reset the password of this account.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('For parent/guardian only')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Only fill out the following question if the email address above belongs to you.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Can we email you with occasional updates on your child’s progress and projects, and updates about their course and computer science\?/,
      ),
    ).toBeInTheDocument();
  });

  it('links the privacy policy, opening it in a new tab', () => {
    renderModal();
    const link = screen.getByRole('link', {name: '(See our privacy policy)'});
    expect(link).toHaveAttribute('href', siteConfig.marketingUrl('/privacy'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // Reading and tab order should reach the answer before the optional aside, so
  // the link follows the group rather than sitting between question and answer.
  it('places the privacy link after the opt-in group', () => {
    renderModal();
    const group = screen.getByRole('radiogroup');
    const link = screen.getByRole('link', {name: '(See our privacy policy)'});
    expect(
      group.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // The page behind the dialog is aria-hidden while it is open, so the address
  // on file is unreachable unless the dialog states it — and must-differ rejects
  // that exact value, so it has to be perceivable.
  it('states the address on file and announces it as part of the dialog description', () => {
    renderModal();
    const current = document.getElementById('parent-email-current');
    expect(current).toHaveTextContent(CURRENT);
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('parent-email-current'),
    );
  });

  it('says None when no address is on file', () => {
    renderModal({currentParentEmail: null});
    expect(document.getElementById('parent-email-current')).toHaveTextContent(
      'None',
    );
  });

  it('caps both address fields at 255 characters', () => {
    renderModal();
    expect(addressField()).toHaveAttribute('maxlength', '255');
    expect(confirmField()).toHaveAttribute('maxlength', '255');
  });
});

describe('ParentEmailModal — validation gating', () => {
  it('keeps Update disabled on open, without showing an error before anything is typed', () => {
    renderModal();
    expect(submitButton()).toBeDisabled();
    expect(screen.queryByText('Email addresses must match.')).toBeNull();
    expect(screen.queryByText('An email address is required.')).toBeNull();
  });

  it('requires an address once the field has been used and cleared', () => {
    renderModal();
    fill(addressField(), 'someone@example.com');
    fill(addressField(), '');
    expect(
      screen.getByText('An email address is required.'),
    ).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('rejects a malformed address', () => {
    renderModal();
    fill(addressField(), 'not-an-email');
    expect(
      screen.getByText('The email address you provided is not valid.'),
    ).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('rejects retyping the address already on file', () => {
    renderModal();
    fill(addressField(), CURRENT);
    fill(confirmField(), CURRENT);
    expect(
      screen.getByText('New email address must not match old email address.'),
    ).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('requires the two addresses to match', () => {
    renderModal();
    fill(addressField(), 'new@example.com');
    fill(confirmField(), 'different@example.com');
    expect(screen.getByText('Email addresses must match.')).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  // A successful save invalidates the settings query, so the prop catches up to
  // the address just submitted. The must-differ check has to compare against the
  // address that was on file when the dialog opened, or the saved address starts
  // failing its own validation — visible as an error flashing while the dialog
  // dismisses.
  it('does not turn the just-saved address into a must-differ error when the record catches up', () => {
    const {setCurrentParentEmail} = renderModal();
    fill(addressField(), 'new@example.com');
    fill(confirmField(), 'new@example.com');
    expect(submitButton()).toBeEnabled();

    setCurrentParentEmail('new@example.com');

    expect(
      screen.queryByText('New email address must not match old email address.'),
    ).toBeNull();
    expect(submitButton()).toBeEnabled();
  });

  it('enables Update once the address is valid, different, and confirmed', () => {
    renderModal();
    fill(addressField(), 'new@example.com');
    fill(confirmField(), 'new@example.com');
    expect(submitButton()).toBeEnabled();
  });
});

describe('ParentEmailModal — submission', () => {
  it('sends the address and opt-in, then toasts and closes', async () => {
    let body: unknown;
    mockServer.use(
      http.patch('*/users/parent_email', async ({request}) => {
        body = await request.json();
        return HttpResponse.json({});
      }),
    );
    const {onClose} = renderModal();

    fill(addressField(), 'new@example.com');
    fill(confirmField(), 'new@example.com');
    fireEvent.click(screen.getByRole('radio', {name: 'Yes'}));
    fireEvent.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      user: {
        parent_email: 'new@example.com',
        parent_email_preference_opt_in: 'yes',
        parent_email_preference_source: 'PARENT_EMAIL_CHANGE',
      },
    });
    expect(
      screen.getByText('Parent/guardian email updated.'),
    ).toBeInTheDocument();
  });

  it('disables the fields and the opt-in while saving', async () => {
    mockServer.use(
      http.patch('*/users/parent_email', async () => {
        await new Promise(resolve => setTimeout(resolve, 60));
        return HttpResponse.json({});
      }),
    );
    renderModal();

    fill(addressField(), 'new@example.com');
    fill(confirmField(), 'new@example.com');
    fireEvent.click(submitButton());

    await waitFor(() => expect(addressField()).toBeDisabled());
    expect(confirmField()).toBeDisabled();
    expect(screen.getByRole('radio', {name: 'Yes'})).toBeDisabled();
    expect(screen.getByRole('radio', {name: 'No'})).toBeDisabled();
  });

  // The dialog's focus trap already returns focus to the first field; this
  // guards the outcome legacy achieved explicitly, whichever layer provides it.
  it('leaves focus on the address field when the server rejects it', async () => {
    mockServer.use(
      http.patch('*/users/parent_email', () =>
        HttpResponse.json(
          {parent_email: ['Parent email is invalid']},
          {status: 422},
        ),
      ),
    );
    renderModal();

    fill(addressField(), 'new@example.com');
    fill(confirmField(), 'new@example.com');
    // Park focus away from the address field so the assertion proves focus
    // moved back to it, rather than never having left.
    confirmField().focus();
    expect(confirmField()).toHaveFocus();
    fireEvent.click(submitButton());

    expect(
      await screen.findByText('Parent email is invalid'),
    ).toBeInTheDocument();
    await waitFor(() => expect(addressField()).toHaveFocus());
  });
});
