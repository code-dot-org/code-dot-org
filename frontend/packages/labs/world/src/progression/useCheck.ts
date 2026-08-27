// Running a lesson's check, and what comes of it.
//
// The lab compiles the project and the sandbox plays the script; this decides
// what the numbers mean, which is the split `runtime/checks` is shaped around.
// A tile is completed only by its own `passes` — nothing here knows how to
// judge a lesson, and nothing in the sandbox does either.

import {useCallback, useState} from 'react';

import {useMaybeWorldRuntime} from '../runtime/WorldRuntimeContext';

import {useProgression} from './progressionContext';
import type {TileId} from './types';

import {tile as tileById} from './index';

export type CheckState =
  | {status: 'idle'}
  | {status: 'running'}
  | {status: 'passed'}
  /** Failed, with whatever the world had to say for itself. */
  | {status: 'failed'; because?: string};

export interface Checker {
  state: CheckState;
  /** Whether this tile can be checked at all: it has a script, and there is a
   *  sandbox to play it in. */
  canCheck: (id: TileId) => boolean;
  run: (id: TileId) => Promise<void>;
  reset: () => void;
}

export const useCheck = (): Checker => {
  const runtime = useMaybeWorldRuntime();
  const {complete} = useProgression();
  const [state, setState] = useState<CheckState>({status: 'idle'});

  const canCheck = useCallback(
    (id: TileId) => Boolean(runtime?.isConfigured && tileById(id).check.run),
    [runtime],
  );

  const run = useCallback(
    async (id: TileId) => {
      const {check} = tileById(id);
      if (!runtime || !check.run || !check.passes) {
        return;
      }
      setState({status: 'running'});
      const result = await runtime.runCheck(check.run);
      if (result.error) {
        // A project that throws has failed, and the message is the most useful
        // thing anybody can be told — it is usually the actual mistake.
        setState({status: 'failed', because: result.error});
        return;
      }
      if (check.passes(result)) {
        complete(id);
        setState({status: 'passed'});
      } else {
        setState({status: 'failed'});
      }
    },
    [runtime, complete],
  );

  return {state, canCheck, run, reset: () => setState({status: 'idle'})};
};
