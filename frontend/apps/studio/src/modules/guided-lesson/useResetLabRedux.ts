import {useLayoutEffect, useState} from 'react';

import {store as labStore} from '@code-dot-org/lab';
import {progressActions} from '@code-dot-org/platform/progress';

/**
 * Hard-reset the shared `@code-dot-org/lab` Redux store to the level context
 * we're about to mount, *before* the lab itself renders. The lab packages
 * assume one lab per page navigation — so when we swap between Music / Maze /
 * Datasci / AI Trainer inside one SPA, leftover state (especially
 * `progress.standaloneProjectType`) bleeds in and makes the lab fetch the
 * wrong `level_properties` endpoint.
 *
 * Dispatching `setCurrentLevelId` + `setStandaloneProjectType` from inside
 * `Lab` solves part of this but does it in two separate effects — between
 * them, `useLoadLevelProperties`' queryKey changes twice and briefly
 * unmounts the lab. Dispatching both *here* (atomically, before the lab
 * mounts) avoids that transient state entirely.
 *
 * Returns a `ready` flag the host should use to gate the lazy lab mount,
 * so the lab's first render already sees the right Redux state. The flag
 * flips synchronously in `useLayoutEffect`, before the browser paints —
 * so there's no visible flash.
 */
export function useResetLabRedux(input: {
  currentLevelId?: number;
  standaloneProjectType?: string;
}): boolean {
  const {currentLevelId, standaloneProjectType} = input;
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (currentLevelId !== undefined) {
      labStore.dispatch(progressActions.setCurrentLevelId(currentLevelId));
    }
    // setStandaloneProjectType's payload type is `string` (not nullable), so
    // we always send a string — empty string is treated as falsy elsewhere
    // and behaves like "cleared".
    labStore.dispatch(
      progressActions.setStandaloneProjectType(standaloneProjectType ?? ''),
    );
    setReady(true);
    // Re-run on every lab swap so the next stage's context overwrites the
    // previous one synchronously before children read it.
  }, [currentLevelId, standaloneProjectType]);

  return ready;
}
