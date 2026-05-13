import {lazy, Suspense, useMemo} from 'react';

import {ApiClientProvider, useApiClient} from '@code-dot-org/core/api';

import {useRegisterLabContext} from '@/modules/ai-tutor-host/useRegisterLabContext';

import {createStubbedLabApiClient} from './stubApiClient';
import {useResetLabRedux} from './useResetLabRedux';

import styles from './guidedLesson.module.scss';

// Lazy-load the real Code.org music lab — same pattern as `getLabEntrypoint`
// in modules/labs/router so we don't pull the music chunk into the main bundle
// unless a lesson actually opens the lab.
const MusicLab = lazy(() => import('@code-dot-org/music-lab'));

/**
 * Mounts the real `@code-dot-org/music-lab` package inside the lesson stage.
 *
 * Nests a fresh ApiClientProvider so the lab subtree sees a stubbed client
 * that intercepts the two dashboard endpoints the lab fetches on mount. This
 * lets the prototype run standalone (no Rails) — without the stub, the lab
 * would hang on its `useLevelProperties` query.
 */
const MusicLabStage = () => {
  const realApi = useApiClient();
  const stubbedApi = useMemo(
    () => createStubbedLabApiClient(realApi, {kind: 'music', levelId: 1}),
    [realApi],
  );

  const ready = useResetLabRedux({
    currentLevelId: 1,
    standaloneProjectType: 'music',
  });

  useRegisterLabContext(() => ({
    labType: 'music',
    longInstructions:
      'Drag a block from the toolbox into the workspace, then press Run.',
  }));

  return (
    <div className={styles.musicLabHost}>
      <Suspense
        fallback={<div className={styles.stageEmpty}>Loading Music Lab…</div>}
      >
        <ApiClientProvider client={stubbedApi}>
          {ready && (
            <MusicLab isLoading={false} standaloneProjectType="music" />
          )}
        </ApiClientProvider>
      </Suspense>
    </div>
  );
};

export default MusicLabStage;
