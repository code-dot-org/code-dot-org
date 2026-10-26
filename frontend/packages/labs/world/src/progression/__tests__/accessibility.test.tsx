// The progression, audited.
//
// specs/PROGRESSION_UI.md calls milestone 5 a gate rather than a nicety, and
// this is the gate: axe over the whole dialog in both views, plus the claims
// axe cannot make — that the list says in words everything the map says in
// color, and that a completion is announced to somebody who cannot see the
// tile it opened.
//
// Color contrast is disabled here and checked in `palette.test.ts` instead:
// jsdom paints nothing, so axe cannot compute a ratio, and the palette test
// measures every pair at every region hue, which is stronger than what axe
// would have done on one rendered screen.

import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {axe} from 'vitest-axe';

import {RootStateProvider} from '@code-dot-org/core/redux';

import {TILES} from '../catalogue';
import {tile} from '../index';
import {useProgression} from '../progressionContext';
import {ProgressionProvider} from '../ProgressionProvider';
import type {TileId} from '../types';

// The drawn block under an unlock injects a real Blockly workspace, which
// needs a real browser — jsdom cannot parse the stylesheet Blockly writes.
// Stubbed here for the reason `__tests__/App` stubs the block editor; the
// preview is exercised where it can be, in `BlockPreview.test`.
vi.mock('../BlockPreview', () => ({
  BlockPreview: () => null,
  blockForRule: () => undefined,
}));

const Opener = ({focus}: {focus?: TileId}) => {
  const {openTree} = useProgression();
  return (
    <button type="button" onClick={() => openTree(focus)}>
      open
    </button>
  );
};

const open = async (focus?: TileId, done: TileId[] = []) => {
  render(
    <RootStateProvider>
      <ProgressionProvider initiallyCompleted={done}>
        <Opener focus={focus} />
      </ProgressionProvider>
    </RootStateProvider>,
  );
  await userEvent.click(screen.getByRole('button', {name: 'open'}));
};

const show = async (view: 'Map' | 'List') =>
  userEvent.click(
    screen.getByRole('button', {
      name: new RegExp(`the lessons as a ${view.toLowerCase()}`, 'i'),
    }),
  );

const audit = () =>
  axe(document.body, {rules: {'color-contrast': {enabled: false}}});

describe('the progression dialog', () => {
  // Longer than the default: axe walks the whole dialog, which is sixty-seven
  // options and a reading pane, and does it in jsdom.
  it('has no axe violations showing the map', {timeout: 20_000}, async () => {
    await open('motion/gravity', ['origin/first-world']);
    expect(await audit()).toHaveNoViolations();
  });

  it('has no axe violations showing the list', {timeout: 20_000}, async () => {
    await open('motion/gravity', ['origin/first-world']);
    await show('List');
    expect(await audit()).toHaveNoViolations();
  });

  it(
    'has no axe violations before a tile is chosen',
    {timeout: 20_000},
    async () => {
      await open();
      expect(await audit()).toHaveNoViolations();
    },
  );
});

describe('the list', () => {
  it('is the whole catalogue, not a summary of it', async () => {
    await open();
    await show('List');
    expect(screen.getAllByRole('listitem')).toHaveLength(TILES.length);
  });

  // The map says "locked" with a padlock, a gray fill and a dashed edge. None
  // of that is available to a screen reader or to somebody who cannot separate
  // the grays, so the list says it in words — including WHAT it is waiting for,
  // which the map only shows as the shape of the path to it.
  it('says in words what the map says in color', async () => {
    await open();
    await show('List');
    const jump = screen.getByRole('button', {name: /^Up/});
    expect(jump).toHaveTextContent('Locked');
    expect(jump).toHaveTextContent('needs A key is an event and Down');
  });

  it('marks the chosen lesson as the current one', async () => {
    await open('puzzle/push');
    await show('List');
    expect(
      screen.getByRole('button', {
        name: new RegExp(`^${tile('puzzle/push').title}`),
      }),
    ).toHaveAttribute('aria-current', 'true');
  });

  it('groups the lessons under a heading per region', async () => {
    await open();
    await show('List');
    expect(
      screen.getByRole('heading', {name: /Platformer/}),
    ).toBeInTheDocument();
  });

  it('chooses a lesson, and the detail follows', async () => {
    await open();
    await show('List');
    await userEvent.click(screen.getByRole('button', {name: /^Down/}));
    const detail = within(screen.getByRole('dialog')).getByRole(
      'complementary',
    );
    expect(
      within(detail).getByRole('heading', {name: tile('motion/gravity').title}),
    ).toBeInTheDocument();
  });
});

describe('finishing a lesson', () => {
  // The tile a completion opens is somewhere else on the map, and a keyboard or
  // screen-reader user has no way to notice it moved. So it is said out loud.
  it('is announced, along with what it opened', async () => {
    await open('origin/first-world');
    const detail = within(screen.getByRole('dialog')).getByRole(
      'complementary',
    );
    await userEvent.click(
      within(detail).getByRole('button', {name: 'Mark as done'}),
    );

    const live = screen.getByRole('status', {name: 'Progression updates'});
    expect(live.textContent).toContain('First light marked as done');
    expect(live.textContent).toContain('now ready to start');
  });

  it('says nothing when nothing opened', async () => {
    // Marking a tile whose neighbors are still waiting on something else
    // should not claim to have unlocked anything.
    await open('input/press', ['origin/first-world', 'input/arrows']);
    const detail = within(screen.getByRole('dialog')).getByRole(
      'complementary',
    );
    await userEvent.click(
      within(detail).getByRole('button', {name: 'Mark as done'}),
    );

    const live = screen.getByRole('status', {name: 'Progression updates'});
    expect(live.textContent).toContain('A key is an event marked as done');
    expect(live.textContent).not.toContain('ready to start');
  });
});
