// The picker a learner sees when they choose `(import…)` on a `use rule`.
//
// The rule library's counterpart to the effect one, and the same bargain: each
// rule explains itself — what it gives a world, in a sentence, and which traits
// it will let an actor take — because a name alone cannot answer "should I add
// this?".

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {demoUrl} from '../demos';
import {ImportRuleDialog} from '../ImportRuleDialog';
import {STOCK_RULES} from '../stock';
import {BASE_RULES, stockRuleGroups} from '../stockRuleGroups';

const open = (
  props: Partial<React.ComponentProps<typeof ImportRuleDialog>> = {},
) =>
  render(<ImportRuleDialog onImport={vi.fn()} onCancel={vi.fn()} {...props} />);

describe('ImportRuleDialog', () => {
  // Longer than the default five seconds: this renders a row per stock rule
  // and asks the accessibility tree about each, and the library keeps growing
  // — it went over the default the week Turns and History were added, on a
  // machine running the rest of the suite beside it.
  it('shows every rule it offers as a tile', {timeout: 20000}, () => {
    open();

    // One tile each, named by the ability it adds: the dialog answers "what
    // should this world have?", and a rule's own name is what turns up on its
    // toolbox category once it is in.
    for (const rule of STOCK_RULES) {
      expect(
        screen.queryAllByRole('button', {name: rule.ability}).length,
        rule.ability,
      ).toBe(BASE_RULES.includes(rule.id) ? 0 : 1);
    }
  });

  it('does not offer a rule nobody would reach for', () => {
    // The bases arrive with whatever needs them and do nothing on their own,
    // so a tile for one is a tile with nothing to show and nothing to press
    // for (`stockRuleGroups.BASE_RULES`).
    open();

    expect(
      screen.queryByRole('button', {name: 'Notices Collisions'}),
    ).toBeNull();
    expect(screen.queryByRole('button', {name: 'Has a Camera'})).toBeNull();
  });

  it('still says a base is coming, on the rule that brings it', () => {
    // Not offering one is not hiding it: Gravity is written against Collisions
    // and the file lands in `rules/` either way, so the dialog says so.
    open();

    fireEvent.click(screen.getByRole('button', {name: 'Has Gravity'}));

    expect(
      screen.getByText(/Also adds:.*Notices Collisions/),
    ).toBeInTheDocument();
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

  it('puts every offered rule in exactly one group', () => {
    // A rule that fell out of the grouping would be a rule nobody can import,
    // which is a worse failure than an odd heading. The bases are out of it on
    // purpose, and they are the only ones.
    const grouped = stockRuleGroups().flatMap(group =>
      group.rules.map(rule => rule.id),
    );

    expect(grouped.sort()).toEqual(
      STOCK_RULES.map(rule => rule.id)
        .filter(id => !BASE_RULES.includes(id))
        .sort(),
    );
  });

  it('keeps a rule\u2019s add-ons together inside a group', () => {
    // The nesting is gone from the picture and the ORDER is not: Camera's four
    // adjustments still read as a family, in a run — even with the Camera they
    // adjust taken out of the shelf, because the tree is built before it is.
    const place = stockRuleGroups().find(group => group.region.id === 'place');
    const ids = place?.rules.map(rule => rule.id) ?? [];
    const family = [
      'cameraFollow',
      'cameraEase',
      'cameraDeadzone',
      'cameraConfined',
    ];

    expect(ids).not.toContain('camera');
    expect(ids.slice(ids.indexOf('cameraFollow'))).toEqual(family);
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

describe('the shelf’s pictures', () => {
  // A grid where some tiles are blank reads as a dialog that failed to load
  // rather than as a library, and this is what keeps that from happening:
  // every rule the shelf OFFERS is one that can be shown doing something, and
  // is. The two that cannot are the two it does not offer, which is the same
  // fact said once (`stockRuleGroups.BASE_RULES`).
  it('has a demo for every rule it offers', () => {
    const missing = stockRuleGroups()
      .flatMap(group => group.rules)
      .filter(rule => !demoUrl(rule.id))
      .map(rule => rule.id);

    expect(missing).toEqual([]);
  });

  it('has none for the bases, whose demo would be of something else', () => {
    // A strip of "Notices Collisions" would be a strip of whichever rule was
    // standing on it. Pinned so that adding one is a decision.
    for (const id of BASE_RULES) {
      expect(demoUrl(id), id).toBeUndefined();
    }
  });
});
