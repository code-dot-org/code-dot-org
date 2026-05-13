// Bridge that pushes Java Lab editor source changes into lab2's
// ProjectManager so they get autosaved (throttled at 30s) and flushed on
// level navigation / page unload.
//
// editorRedux is the canonical store for what the user is editing; lab2's
// ProjectManager owns persistence. We watch state.javalabEditor.sources
// and forward each change through setAndSaveProjectSources, which calls
// ProjectManager.save under the hood. ProjectManager dedupes against its
// own lastSource, so a sync that matches the loaded sources is a no-op.

import {useEffect, useRef} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {setAndSaveProjectSources} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getSources} from '../redux/editorRedux';

export default function useSourcesBridge(): void {
  const dispatch = useAppDispatch();
  // Use a ref to avoid TS narrowing problems with reading slices the global
  // RootState type doesn't declare. The selector signature is unchanged
  // from getSources, so we trust its return shape.
  const sources = useAppSelector(state =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSources(state as any)
  );

  // The most recent sources we've seen since the last level load. After a
  // level transition we discard this so the first post-load sources value
  // (which came from useJavalabSources / lab2's load) is treated as the
  // baseline and is NOT pushed back to the server.
  const lastSyncedRef = useRef<string | null>(null);

  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    lastSyncedRef.current = null;
  });

  useEffect(() => {
    if (!sources) return;
    const stringified = JSON.stringify(sources);
    if (lastSyncedRef.current === null) {
      // First sources value after a (re)load. Treat as the loaded baseline;
      // don't dispatch a save — ProjectManager already has these as
      // lastSource. Strict-mode-safe because the second run sees the
      // primed ref and short-circuits.
      lastSyncedRef.current = stringified;
      return;
    }
    if (lastSyncedRef.current === stringified) return;
    lastSyncedRef.current = stringified;
    dispatch(setAndSaveProjectSources({source: sources}));
  }, [dispatch, sources]);
}
