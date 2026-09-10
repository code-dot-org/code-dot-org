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
import {stockRuleGroups} from '../stockRuleGroups';

const open = (
  props: Partial<React.ComponentProps<typeof ImportRuleDialog>> = {},
) =>
  render(<ImportRuleDialog onImport={vi.fn()} onCancel={vi.fn()} {...props} />);

describe('ImportRuleDialog', () => {
  // Longer than the default five seconds: this renders a row per stock rule
  // and asks the accessibility tree about each, and the library keeps growing
  // — it went over the default the week Turns and History were added, on a
  // machine running the rest of the suite beside it.
  it('shows every stock rule as a tile', {timeout: 20000}, () => {
    open();

    // One tile each, named by the ability it adds: the dialog answers "what
    // should this world have?", and a rule's own name is what turns up on its
    // toolbox category once it is in.
    for (const rule of STOCK_RULES) {
      expect(
        screen.getAllByRole('button', {name: rule.ability}).length,
        rule.ability,
      ).toBe(1);
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

    fireEvent.click(screen.getByRole('button', {name: 'Has Gravity'}));
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

describe('the shelf as a grid, grouped by region', () => {
  // Forty-five rules as a column of sentences was four screens of scrolling to
  // answer a question the progression already answers: what kind of game am I
  // making. Two changes, both derived rather than curated — the detail moves
  // under the grid to the tile a learner has landed on, and the grouping is
  // read off the lessons (`stockRuleGroups`).
  it('shows the ability and no more, until a tile is picked', () => {
    // What a browsing learner needs. "Also adds" and "Gives actors" answer
    // "what happens if I take THIS one", which is a question about a tile you
    // have already chosen.
    open();

    expect(screen.queryByText(/Gives actors:/)).toBeNull();
    expect(screen.queryByText(/Also adds:/)).toBeNull();
  });

  it('says what comes with the tile that was picked', () => {
    open();

    fireEvent.click(screen.getByRole('button', {name: 'Has Gravity'}));

    // Gravity is written against Physics and Solid Bodies, and both land in
    // `rules/` with it.
    expect(screen.getByText(/Also adds:/)).toBeInTheDocument();
    expect(screen.getByText(/Gives actors:/)).toBeInTheDocument();
  });

  it('says it for one tile at a time', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Has Gravity'}));

    fireEvent.click(screen.getByRole('button', {name: 'Keeps Time'}));

    expect(screen.getAllByText(/Gives actors:/)).toHaveLength(1);
  });

  it('heads each group with the region its rules come from', () => {
    // The progression's own names, so a learner meets the same grouping here
    // that the map taught them.
    open();

    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Platformer')).toBeInTheDocument();
    expect(screen.getByText('Place')).toBeInTheDocument();
  });

  it('puts every rule in exactly one group', () => {
    // A rule that fell out of the grouping would be a rule nobody can import,
    // which is a worse failure than an odd heading.
    const grouped = stockRuleGroups().flatMap(group =>
      group.rules.map(rule => rule.id),
    );

    expect(grouped.sort()).toEqual(STOCK_RULES.map(rule => rule.id).sort());
  });

  it('keeps a rule\u2019s add-ons beside it inside a group', () => {
    // The nesting is gone from the picture and the ORDER is not: Camera's four
    // adjustments still read as Camera's four, directly under it.
    const place = stockRuleGroups().find(group => group.region.id === 'place');
    const ids = place?.rules.map(rule => rule.id) ?? [];

    expect(ids.indexOf('cameraFollow')).toBe(ids.indexOf('camera') + 1);
    expect(ids).toContain('cameraConfined');
  });
});

describe('a rule showing what it does', () => {
  // No sentence on a row can say what a rule DOES, which is the thing a
  // learner is choosing between. One strip PNG per demo: frame one is the
  // still, and the selected row steps through the rest (specs/RULE_DEMOS.md).
  const rowFor = (ability: string) =>
    screen.getByRole('button', {name: ability});

  it('shows a strip for a rule that has one', () => {
    open();

    const demo = rowFor('Has Gravity')?.querySelector('[aria-hidden="true"]');
    expect(demo).toBeTruthy();
    expect((demo as HTMLElement).style.getPropertyValue('--demo')).toContain(
      'gravity.png',
    );
  });

  it('tells the CSS how many cells to step through', () => {
    // From the demo rather than a manifest: the bundle already holds how long
    // the demo runs, and a manifest would be a second thing to fetch and a
    // second thing to be stale.
    open();

    const demo = rowFor('Has Gravity')?.querySelector('[aria-hidden="true"]');
    expect((demo as HTMLElement).style.getPropertyValue('--frames')).toBe('24');
  });

  it('shows nothing for a rule with no demo yet', () => {
    // A row with no picture is a row, not a hole — which the dialog needs
    // anyway, since a machine with no `public/demos/` has none of them.
    //
    // Two of them now, and both for the same honest reason: they are BASES,
    // and a base does nothing visible on its own. "Notices Collisions" answers
    // a question that Solid Bodies and Collection then act on, and "Has a
    // Camera" moves the view to wherever something else aimed it. A strip of
    // either would be a strip of whichever rule was standing on it.
    open();

    expect(
      rowFor('Notices Collisions')?.querySelector('[aria-hidden="true"]'),
    ).toBeNull();
    expect(
      rowFor('Has a Camera')?.querySelector('[aria-hidden="true"]'),
    ).toBeNull();
  });

  it('marks the row, so hovering or focusing it plays', () => {
    // The animation is CSS — `.row:hover .demo`, `.row:focus-within .demo` —
    // which jsdom has no engine for, so what is testable is that the row still
    // carries the class the stylesheet keys on. Browsing a shelf should not
    // cost a click per row, and a keyboard user arriving by Tab is looking at
    // it as much as a pointer hovering is.
    open();

    expect(rowFor('Has Gravity')?.className).toBeTruthy();
  });

  it('hides the strip from a screen reader', () => {
    // Decoration beside a row that already says what it is in words: a reader
    // gains nothing from "a box falls".
    open();

    const demo = rowFor('Has Gravity')?.querySelector('[aria-hidden="true"]');
    expect(demo).toHaveAttribute('aria-hidden', 'true');
  });
});
