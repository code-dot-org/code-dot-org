// "Has this level's project arrived?"
//
// A host renders nothing until it has, so the answer has to be positive rather
// than inferred from the absence of a load in flight: `isLoadingProjectOrLevel`
// is false BEFORE `loadLab` is dispatched (it goes out from an effect, a render
// after the level metadata lands) as well as after it settles. A host that
// waited on the flag would get one render with no sources — which is one render
// of the level's start sources, and then a swap.

import {describe, expect, it} from 'vitest';

import {labSlice} from '../redux';
import {hasLoadedProjectFor, loadLab, onLevelChange} from '../redux/labSlice';
import type {RootState} from '../redux';

const reducer = labSlice.reducer;

/** The lab slice's own state, as the reducer produces it. */
type LabSliceState = ReturnType<typeof reducer>;

/** The slice's own reducer, applied from its initial state. */
const run = (
  actions: Array<{type: string; payload?: unknown}>,
): LabSliceState =>
  actions.reduce(
    (state, action) => reducer(state, action as never),
    reducer(undefined as never, {type: '@@init'} as never),
  );

const asState = (lab: LabSliceState) => ({lab}) as unknown as RootState;

const LEVEL = {id: 42, appName: 'world'} as never;

describe('hasLoadedProjectFor', () => {
  it('is false before anything has loaded', () => {
    const state = run([]);

    expect(hasLoadedProjectFor(42)(asState(state))).toBe(false);
  });

  it('is false while a load is in flight', () => {
    const state = run([{type: loadLab.pending.type}]);

    expect(hasLoadedProjectFor(42)(asState(state))).toBe(false);
  });

  it('is true once the level data — sources and all — has arrived', () => {
    const state = run([
      {type: loadLab.pending.type},
      {
        type: onLevelChange.type,
        payload: {levelProperties: LEVEL, appOptions: {}},
      },
    ]);

    expect(hasLoadedProjectFor(42)(asState(state))).toBe(true);
  });

  it('is false again for a different level', () => {
    // Lab2 does not reload the page between levels, so what loaded before is
    // not what is being asked for now.
    const state = run([
      {
        type: onLevelChange.type,
        payload: {levelProperties: LEVEL, appOptions: {}},
      },
      {type: loadLab.pending.type},
    ]);

    expect(hasLoadedProjectFor(42)(asState(state))).toBe(false);
  });

  it('is false when the host has no level to ask about', () => {
    const state = run([
      {
        type: onLevelChange.type,
        payload: {levelProperties: LEVEL, appOptions: {}},
      },
    ]);

    expect(hasLoadedProjectFor(undefined)(asState(state))).toBe(false);
  });
});
