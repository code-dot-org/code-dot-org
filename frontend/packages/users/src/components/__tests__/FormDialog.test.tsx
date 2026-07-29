import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import type {FormEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';

import FormDialog from '../FormDialog';

function renderDialog({
  open = true,
  alert = false,
  onSubmit = vi.fn((event: FormEvent) => event.preventDefault()),
  describedById,
}: {
  open?: boolean;
  alert?: boolean;
  onSubmit?: (event: FormEvent) => void;
  describedById?: string;
} = {}) {
  render(
    <FormDialog
      open={open}
      onClose={vi.fn()}
      titleId="dialog-title"
      title="Test dialog"
      describedById={describedById}
      alert={alert}
      onSubmit={onSubmit}
      actions={<button type="submit">Submit</button>}
    >
      <input aria-label="First field" />
      <input aria-label="Second field" />
    </FormDialog>,
  );
  return {onSubmit};
}

describe('FormDialog', () => {
  it('renders the title, content children, and actions', () => {
    renderDialog();
    expect(screen.getByText('Test dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('First field')).toBeInTheDocument();
    expect(screen.getByLabelText('Second field')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
  });

  it('wires aria-labelledby and aria-describedby on the dialog', () => {
    renderDialog({describedById: 'dialog-description'});
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
  });

  it('defaults the paper to role="dialog"', () => {
    renderDialog();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders role="alertdialog" when alert is set', () => {
    renderDialog({alert: true});
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('focuses the first tabbable control when opened', async () => {
    renderDialog();
    const firstInput = screen.getByLabelText('First field');
    // Guards the mui#33004 workaround: FocusTrap grabs the presentation
    // container before autoFocus can win, so FormDialog focuses the first
    // tabbable control itself once onEntered fires.
    await waitFor(() => expect(firstInput).toHaveFocus());
  });

  it('calls onSubmit when the form is submitted', () => {
    const {onSubmit} = renderDialog();
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('renders nothing when open is false', () => {
    renderDialog({open: false});
    expect(screen.queryByText('Test dialog')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
