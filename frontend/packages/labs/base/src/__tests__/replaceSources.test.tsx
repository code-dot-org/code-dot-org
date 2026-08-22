// Telling an open editor that its file changed underneath it.
//
// `updateSources` is for an edit the student made, and it deliberately does not
// bump `sourcesEpoch`: the editor that made the edit is already showing it, and
// re-seeding from its own typing would fight them.
//
// A document REPLACED is the other case — a version restored, an AI tutor's
// change applied or taken back — and an open editor has no way to notice. The
// cost of that was not merely a stale view: World Lab's tutor applied a change
// to an open `.actor`, the editor went on showing the old blocks, and the next
// keystroke in that stale workspace wrote them back over the change. The
// student had to close and reopen the file to see what they were deciding on,
// and doing so was itself a chance to lose the edit.

import {configureStore} from '@reduxjs/toolkit';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Provider} from 'react-redux';
import {describe, expect, it} from 'vitest';

import {SourcesProvider, useSources} from '../contexts/SourcesContext';
import {progressSlice} from '@code-dot-org/progress/redux';

import labProjectSlice from '../redux/labProjectSlice';
import labSlice from '../redux/labSlice';
import labSystemSlice from '../redux/labSystemSlice';
import labViewSlice from '../redux/labViewSlice';

const document = (contents: string) => ({source: {text: contents}}) as never;

/** Shows the epoch, and offers both ways of writing a document. */
const Probe = () => {
  const {sourcesEpoch, updateSources, replaceSources} = useSources();
  return (
    <>
      <span data-testid="epoch">{sourcesEpoch}</span>
      <button onClick={() => updateSources(document('edited'))}>update</button>
      <button onClick={() => replaceSources(document('replaced'))}>
        replace
      </button>
    </>
  );
};

const show = () => {
  const store = configureStore({
    reducer: {
      lab: labSlice.reducer,
      labProject: labProjectSlice.reducer,
      labSystem: labSystemSlice.reducer,
      labView: labViewSlice.reducer,
      progress: progressSlice.reducer,
    },
  });
  render(
    // The smallest tree that stands up: a store for the read-only flag, a level
    // with no sources of its own, and a project manager that writes nowhere.
    // None of them is what is under test.
    <Provider store={store}>
      <SourcesProvider
        levelProperties={{} as never}
        defaultSources={document('start')}
        projectManager={{save: () => Promise.resolve()} as never}
      >
        <Probe />
      </SourcesProvider>
    </Provider>,
  );
  return () => Number(screen.getByTestId('epoch').textContent);
};

describe('sourcesEpoch', () => {
  it('does not move for an edit the student made', async () => {
    const epoch = show();
    const before = epoch();

    await userEvent.click(screen.getByRole('button', {name: 'update'}));

    expect(epoch()).toBe(before);
  });

  it('moves when the document is replaced from outside', async () => {
    // What an open editor watches to know it must re-seed.
    const epoch = show();
    const before = epoch();

    await userEvent.click(screen.getByRole('button', {name: 'replace'}));

    expect(epoch()).toBeGreaterThan(before);
  });

  it('does not move for a replacement that changes nothing', async () => {
    const epoch = show();
    await userEvent.click(screen.getByRole('button', {name: 'replace'}));
    const after = epoch();

    await userEvent.click(screen.getByRole('button', {name: 'replace'}));

    expect(epoch()).toBe(after);
  });
});
