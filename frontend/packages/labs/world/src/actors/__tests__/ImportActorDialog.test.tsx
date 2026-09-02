// The picker a learner sees when they choose `(import…)` on an ACTOR dropdown.
//
// `ImportRuleDialog` with one noun changed, and the rows carry the same two
// kinds of picture: a still for an actor that IS a picture, and a strip for one
// whose worth is a behaviour (specs/UI_ACTORS.md, specs/RULE_DEMOS.md).

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {ACTOR_DEMOS} from '../demos';
import {ImportActorDialog} from '../ImportActorDialog';

const open = () =>
  render(<ImportActorDialog onImport={vi.fn()} onCancel={vi.fn()} />);

/**
 * The `<li>` a row's button sits in, which is what the CSS keys on.
 *
 * Anchored, because a row's accessible name is its whole sentence and one
 * actor's name appears in another's: the Ground is described as the other half
 * of the Platformer Player, which is a description worth keeping.
 */
const rowFor = (name: string) =>
  screen.getByRole('button', {name: new RegExp(`^${name}`)}).parentElement;

describe('an actor showing what it does', () => {
  it('shows a strip for an actor that has a demo', {timeout: 20000}, () => {
    open();

    const demo = rowFor('Platformer Player')?.querySelector(
      '[aria-hidden="true"]',
    );
    expect(demo).toBeTruthy();
    expect((demo as HTMLElement).style.getPropertyValue('--demo')).toContain(
      'actors/player.png',
    );
  });

  it('tells the CSS how many cells to step through', {timeout: 20000}, () => {
    // From the demo rather than a manifest — `seconds × DEMO_FPS`, which the
    // bundle already holds.
    open();

    const demo = rowFor('Platformer Player')?.querySelector(
      '[aria-hidden="true"]',
    );
    expect((demo as HTMLElement).style.getPropertyValue('--frames')).toBe(
      String(Math.round(ACTOR_DEMOS.player.seconds * 12)),
    );
  });

  it('draws a still for an actor with no demo', {timeout: 20000}, () => {
    // A Label does nothing on its own, and a strip of one would be a strip of
    // a word sitting there. The canvas preview is what those rows show, and
    // both pictures are hidden from a screen reader: the row says what the
    // actor is in words.
    open();

    const still = rowFor('Label')?.querySelector('canvas');
    expect(still).toBeTruthy();
    expect(still).toHaveAttribute('aria-hidden', 'true');
  });
});
