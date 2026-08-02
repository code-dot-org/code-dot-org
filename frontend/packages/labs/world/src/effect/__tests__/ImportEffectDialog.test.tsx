// The picker a learner sees when they choose `(import…)`.
//
// What it has to get right is what it SHOWS: the whole point of the stock
// library is that each effect explains itself, and a picker that lists bare
// names throws that away and leaves the learner guessing.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {ImportEffectDialog} from '../ImportEffectDialog';
import {STOCK_EFFECTS} from '../stock';

const open = (
  props: Partial<React.ComponentProps<typeof ImportEffectDialog>> = {},
) =>
  render(
    <ImportEffectDialog onImport={vi.fn()} onCancel={vi.fn()} {...props} />,
  );

describe('ImportEffectDialog', () => {
  it('lists every stock effect', () => {
    open();

    for (const effect of STOCK_EFFECTS) {
      expect(
        screen.getByRole('button', {name: new RegExp(effect.document.name)}),
      ).toBeInTheDocument();
    }
  });

  it('shows each effect’s description, not just its name', () => {
    open();

    expect(
      screen.getByText(
        'Turns the picture into chunky blocks, like an old video game.',
      ),
    ).toBeInTheDocument();
  });

  it('names the knobs an effect offers', () => {
    // Two effects can do similar things and differ entirely in what they let
    // you control, which is worth knowing before importing one.
    open();

    expect(screen.getByText(/Knobs:.*speed.*strength/)).toBeInTheDocument();
  });

  it('lists them in the library’s teaching order', () => {
    const {container} = open();

    const names = [
      ...container.querySelectorAll('li button > span:first-child'),
    ].map(node => node.textContent);
    expect(names).toEqual(STOCK_EFFECTS.map(effect => effect.document.name));
  });

  it('defers the choice: a row selects, `Import` commits', () => {
    // Copying a file into the project the moment a click lands is a decision
    // made by the mouse. Nothing happens until the primary button is pressed,
    // and until something is selected there is nothing for it to do.
    const onImport = vi.fn();
    open({onImport});

    const importButton = screen.getByRole('button', {name: 'Import'});
    expect(importButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: /Pixelate/}));
    expect(onImport).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: /Pixelate/})).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(importButton);
    expect(onImport).toHaveBeenCalledWith(
      STOCK_EFFECTS.find(effect => effect.id === 'pixelate'),
    );
  });

  it('takes a double click as "that one, now"', () => {
    const onImport = vi.fn();
    open({onImport});

    fireEvent.doubleClick(screen.getByRole('button', {name: /Pixelate/}));

    expect(onImport).toHaveBeenCalledWith(
      STOCK_EFFECTS.find(effect => effect.id === 'pixelate'),
    );
  });

  it('is a dialog, named and described, not an alert', () => {
    // `Dialog` supplies the name and the description from its `title` and
    // `description` props — and declares `role="alertdialog"`, which announces
    // something that needs answering now. This is a picker.
    const {container} = open();

    const dialog = container.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Add an effect');
    expect(dialog.querySelector('#dsco-dialog-description')).not.toBeNull();
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('cancels without importing', () => {
    const onImport = vi.fn();
    const onCancel = vi.fn();
    open({onImport, onCancel});

    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

    expect(onCancel).toHaveBeenCalled();
    expect(onImport).not.toHaveBeenCalled();
  });
});
