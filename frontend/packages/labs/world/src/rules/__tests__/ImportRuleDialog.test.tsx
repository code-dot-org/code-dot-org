// The picker a learner sees when they choose `(import…)` on a `use rule`.
//
// The rule library's counterpart to the effect one, and the same bargain: each
// rule explains itself — what it gives a world, in a sentence, and which traits
// it will let an actor take — because a name alone cannot answer "should I add
// this?".

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {ImportRuleDialog} from '../ImportRuleDialog';
import {STOCK_RULES} from '../stock';

const open = (
  props: Partial<React.ComponentProps<typeof ImportRuleDialog>> = {},
) =>
  render(<ImportRuleDialog onImport={vi.fn()} onCancel={vi.fn()} {...props} />);

describe('ImportRuleDialog', () => {
  it('lists every stock rule by the ability it adds', () => {
    open();

    // `getAllBy`: a rule that needs another names it, so "Has Physics" is on
    // both its own row and the rows that require it.
    for (const rule of STOCK_RULES) {
      expect(
        screen.getAllByRole('button', {name: new RegExp(rule.ability)}).length,
        rule.ability,
      ).toBeGreaterThan(0);
    }
  });

  it('is a dialog, named and described, not an alert', () => {
    // `Dialog` supplies the name and the description from its `title` and
    // `description` props — and declares `role="alertdialog"`, which announces
    // something that needs answering now. This is a picker.
    const {container} = open();

    const dialog = container.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Add a rule');
    expect(dialog.querySelector('#dsco-dialog-description')).not.toBeNull();
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('defers the choice: a row selects, `Import` commits', () => {
    // A rule brings the rules it needs with it, so the row somebody lands on
    // first is rarely the one they meant once they have read what comes along.
    const onImport = vi.fn();
    open({onImport});

    const importButton = screen.getByRole('button', {name: 'Import'});
    expect(importButton).toBeDisabled();

    fireEvent.click(screen.getAllByRole('button', {name: /Has Gravity/})[0]);
    expect(onImport).not.toHaveBeenCalled();

    fireEvent.click(importButton);
    expect(onImport).toHaveBeenCalledWith(
      STOCK_RULES.find(rule => rule.id === 'gravity'),
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
