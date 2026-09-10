// The picker a learner sees when they choose `(import…)` on an ACTOR dropdown.
//
// `ImportRuleDialog` with one noun changed, and the rows carry the same two
// kinds of picture: a still for an actor that IS a picture, and a strip for one
// whose worth is a behavior (specs/UI_ACTORS.md, specs/RULE_DEMOS.md).

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {createLevelPropertyFixture} from '@code-dot-org/core/api/mocks';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {LevelPropertiesProvider} from '@code-dot-org/lab/contexts';

import {ProgressionProvider} from '../../progression/ProgressionProvider';
import {ACTOR_DEMOS} from '../demos';
import {ImportActorDialog} from '../ImportActorDialog';

// The map's tile detail draws a real Blockly workspace under an unlock, which
// needs a real browser — jsdom cannot parse the stylesheet Blockly writes.
// Stubbed for the reason `progression/__tests__/LessonLink` stubs it; the
// preview is exercised where it can be, in `BlockPreview.test`.
vi.mock('../../progression/BlockPreview', () => ({
  BlockPreview: () => null,
  blockForRule: () => undefined,
}));

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
    // A Health Bar shows the health of whoever it is pointed at, and nothing
    // on the shelf has any to show — so it has no demo, and the canvas preview
    // is what its row falls back to. Both pictures are hidden from a screen
    // reader: the row says what the actor is in words.
    open();

    const still = rowFor('Health Bar')?.querySelector('canvas');
    expect(still).toBeTruthy();
    expect(still).toHaveAttribute('aria-hidden', 'true');
  });
});

/**
 * The same dialog in a lab that GATES its libraries, with nothing done yet.
 *
 * The level says whether gating is on (`levelData.gateShelf`) — see
 * `progression/__tests__/shelf`, which makes the same fixture for the rule
 * picker and explains why it is not run through the schema.
 */
const gated = () =>
  render(
    <RootStateProvider>
      <LevelPropertiesProvider
        levelId={1}
        levelPropertiesMap={{
          '1': createLevelPropertyFixture({
            id: 1,
            name: 'World Lab',
            type: 'World',
            appName: 'world',
            offerBrowserTts: false,
            showExemplarLink: false,
            levelData: {gateShelf: true},
          }),
        }}
      >
        <ProgressionProvider initiallyCompleted={[]}>
          <ImportActorDialog onImport={vi.fn()} onCancel={vi.fn()} />
        </ProgressionProvider>
      </LevelPropertiesProvider>
    </RootStateProvider>,
  );

describe('an actor nobody has earned yet', () => {
  // A tile that has been taken away teaches nothing. A tile that is there and
  // says which lesson grants it is a reason to go and do that lesson.
  it('says on its own face which lesson unlocks it', {timeout: 20000}, () => {
    gated();

    expect(
      screen.getByRole('button', {
        name: 'Coin — unlocked by Things worth having',
      }),
    ).toBeInTheDocument();
  });

  it('goes to that lesson when it is pressed', {timeout: 20000}, async () => {
    // Pressed rather than refused: a locked tile is still a control, and the
    // one useful thing it can do is take you to what earns it.
    gated();

    await userEvent.click(
      screen.getByRole('button', {name: /^Coin — unlocked by/}),
    );
    expect(
      screen.getByRole('heading', {name: 'Things worth having'}),
    ).toBeInTheDocument();
  });

  it(
    'cannot be imported, since pressing it chooses nothing',
    {timeout: 20000},
    () => {
      // The press goes to the lesson rather than selecting the actor, so there
      // is nothing for Import to act on — which is the second lock, behind the
      // first.
      gated();

      expect(screen.getByRole('button', {name: 'Import'})).toBeDisabled();
    },
  );
});
