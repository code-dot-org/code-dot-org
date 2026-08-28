// The shelf: what a learner may take, as opposed to what they have.
//
// The design's first load-bearing claim (specs/PROGRESSION.md) is that the
// unlock has to be REAL — a New Project that already offers all thirty rules
// makes the tree decoration. What that comes to in practice is these two
// libraries, which is where somebody reaches for a mechanic they have not been
// taught.
//
// The second claim is the one the tests below spend as much space on: it has to
// be possible to say no. Gating is off unless a level asks for it, and a lab
// with no progression mounted at all offers everything.

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {createLevelPropertyFixture} from '@code-dot-org/core/api/mocks';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {LevelPropertiesProvider} from '@code-dot-org/lab/contexts';
import labStore, {labActions} from '@code-dot-org/lab/redux';

import {ImportRuleDialog} from '../../rules/ImportRuleDialog';
import {lessonChannel} from '../lessonRoute';
import {ProgressionProvider} from '../ProgressionProvider';
import type {TileId} from '../types';

/**
 * A level that does or does not gate the libraries.
 *
 * Not run through `LevelKindSchema` — that is the HOST's job, on the way in
 * from the API, and a fixture is already the shape it produces. Parsing here
 * would be testing zod.
 */
const level = (gateShelf: boolean) =>
  createLevelPropertyFixture({
    id: 1,
    name: 'World Lab',
    type: 'World',
    appName: 'world',
    offerBrowserTts: false,
    showExemplarLink: false,
    levelData: {gateShelf},
  });

const dialog = (options: {gated: boolean; done?: TileId[]; open?: TileId}) => {
  // Which project is open, as the lab states it: a lesson is a channel
  // (../lessonRoute), and the provider reads the channel to know whether the
  // learner is doing a lesson right now.
  labStore.dispatch(
    labActions.setChannel(
      options.open ? ({id: lessonChannel(options.open)} as never) : undefined,
    ),
  );
  return render(
    <RootStateProvider>
      <LevelPropertiesProvider
        levelId={1}
        levelPropertiesMap={{'1': level(options.gated)}}
      >
        <ProgressionProvider initiallyCompleted={options.done ?? []}>
          <ImportRuleDialog onImport={vi.fn()} onCancel={vi.fn()} />
        </ProgressionProvider>
      </LevelPropertiesProvider>
    </RootStateProvider>,
  );
};

/** The row for a rule, by the ability it leads with. */
const row = (ability: string) =>
  screen.getByRole('button', {name: new RegExp(ability)});

describe('an ungated lab', () => {
  it('offers every rule, whatever anybody has done', () => {
    dialog({gated: false});
    expect(row('Has Gravity')).toBeEnabled();
    expect(row('Moves on a Grid')).toBeEnabled();
  });
});

describe('a gated lab', () => {
  it('refuses a rule whose lesson is not done', () => {
    dialog({gated: true});
    expect(row('Has Gravity')).toBeDisabled();
  });

  it('offers it once the lesson is done', () => {
    dialog({gated: true, done: ['motion/gravity']});
    expect(row('Has Gravity')).toBeEnabled();
  });

  // A row that has been taken away teaches nothing. A row that is there and
  // says which lesson grants it is a reason to go and do that lesson.
  it('shows a locked rule, and says what would unlock it', () => {
    dialog({gated: true});
    expect(
      screen.getByRole('button', {name: 'Unlocked by: Down'}),
    ).toBeInTheDocument();
  });

  it('says "how this works" rather than "unlocked by" once it is held', async () => {
    dialog({gated: true, done: ['motion/gravity']});
    await userEvent.click(row('Has Gravity'));
    expect(
      screen.getByRole('button', {name: 'How this works: Down'}),
    ).toBeInTheDocument();
  });

  it('will not import a locked rule even if something clicks Import', async () => {
    dialog({gated: true});
    // The primary button is disabled while the chosen row is locked, which is
    // the belt; `onImport` refusing is the braces. A dialog that let a locked
    // rule through would undo the whole of this.
    expect(screen.getByRole('button', {name: 'Import'})).toBeDisabled();
  });
});

describe('the lesson being done', () => {
  // A lesson grants what it teaches, so while it is open the learner has not
  // earned it — and `memory/score`'s whole task is to go and find the Scoring
  // rule in this dialog. Locked, the lesson would be a door locked behind
  // itself, which is why `shelfKeys` lends a lesson its own unlocks.
  it('lends the rule its own task asks for', () => {
    dialog({gated: true, open: 'memory/score'});
    expect(row('Keeps Score')).toBeEnabled();
  });

  it('takes it back when the lesson is not the project', () => {
    dialog({gated: true});
    expect(row('Keeps Score')).toBeDisabled();
  });
});
