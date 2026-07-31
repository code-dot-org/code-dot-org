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

  it('hands back the effect that was chosen', () => {
    const onImport = vi.fn();
    open({onImport});

    fireEvent.click(screen.getByRole('button', {name: /Pixelate/}));

    expect(onImport).toHaveBeenCalledWith(
      STOCK_EFFECTS.find(effect => effect.id === 'pixelate'),
    );
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
