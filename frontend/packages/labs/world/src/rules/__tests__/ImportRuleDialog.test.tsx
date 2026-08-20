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
import {stockRuleRows} from '../stockRuleTree';

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

describe('the shelf as a tree', () => {
  // Twenty-three rules, each carrying four lines, was a page nobody scans. Two
  // changes, both derived rather than curated: the detail moves to the row a
  // learner has actually landed on, and the list nests by what each rule is
  // written against.
  it('shows the ability and the sentence, and no more, until a row is picked', () => {
    // What a browsing learner needs. "Also adds" and "Gives actors" answer
    // "what happens if I take THIS one", which is a question about a row you
    // have already chosen.
    open();

    expect(screen.queryByText(/Gives actors:/)).toBeNull();
    expect(screen.queryByText(/Also adds:/)).toBeNull();
  });

  it('says what comes with the row that was picked', () => {
    open();

    fireEvent.click(screen.getByRole('button', {name: /Has Gravity/}));

    // Gravity is written against Physics and Solid Bodies, and both land in
    // `rules/` with it.
    expect(screen.getByText(/Also adds:/)).toBeInTheDocument();
    expect(screen.getByText(/Gives actors:/)).toBeInTheDocument();
  });

  it('says it for one row at a time', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: /Has Gravity/}));

    fireEvent.click(screen.getByRole('button', {name: /Keeps Time/}));

    expect(screen.getAllByText(/Gives actors:/)).toHaveLength(1);
  });

  it('nests a rule under the one thing it is written against', () => {
    // Camera Ease is not a peer of Camera — it is a thing you add to one — and
    // the library already says so in its `use rule`. Nothing here is
    // maintained by hand (`stockRuleTree`).
    const rows = stockRuleRows();
    const depthOf = (ability: string) =>
      rows.find(row => row.rule.ability === ability)?.depth;

    expect(depthOf('Has a Camera')).toBe(0);
    expect(depthOf('Eases the Camera')).toBe(1);
    expect(depthOf('Keeps the View in the Map')).toBe(1);
  });

  it('leaves a rule with two requirements at the top', () => {
    // Gravity is written against Physics AND Solid Bodies. Filing it under
    // either would pick one arbitrarily and say something untrue about the
    // other.
    const rows = stockRuleRows();

    expect(rows.find(row => row.rule.id === 'gravity')?.depth).toBe(0);
  });

  it('still shows every rule', () => {
    // A tree that hid one would be a worse list, not a shorter one.
    expect(
      stockRuleRows()
        .map(row => row.rule.id)
        .sort(),
    ).toEqual(STOCK_RULES.map(rule => rule.id).sort());
  });

  it('takes the top level from twenty-three rows to twelve', () => {
    // The point of the change, as a number: what a learner scans before
    // opening anything.
    const top = stockRuleRows().filter(row => row.depth === 0);

    expect(STOCK_RULES.length).toBeGreaterThan(20);
    expect(top.length).toBeLessThan(STOCK_RULES.length / 1.5);
  });
});
