import {lazy, Suspense, useEffect, useMemo, useRef} from 'react';

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
 * that intercepts the two dashboard endpoints the lab fetches on mount.
 *
 * Music's first screen is a "Select a track" picker designed for standalone
 * use. In guided mode it blows the lesson's flow — the student lands on a
 * giant track list instead of the workspace they were just told about. The
 * `usePickerSkipper` ref-callback watches the lab DOM for the picker's
 * "Skip" button via MutationObserver and clicks it as soon as it appears,
 * before the student sees it. Lab package stays untouched.
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

  const hostRef = usePickerSkipper();

  return (
    <div className={styles.musicLabHost} ref={hostRef}>
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

/**
 * Watches the music lab subtree for the Track Picker's "Skip" button and
 * auto-clicks it. Survives the lab's lazy/async mount because we observe
 * the host element and check on every mutation. Bails out after the first
 * successful click (the picker is one-shot per session).
 *
 * Why click "Skip" rather than overlay the picker: the lab's internal
 * state machine only advances past the picker via its own controls;
 * overlaying it cosmetically would leave the lab stuck behind the cover.
 */
function usePickerSkipper() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let dismissed = false;

    const tryDismiss = () => {
      if (dismissed) return;
      // Match by the visible label — the picker exposes "Skip" and "Select"
      // buttons in its modal. Skip avoids picking a track the student didn't
      // choose, which is what we want for guided mode.
      const buttons = host.querySelectorAll<HTMLButtonElement>('button');
      for (const btn of Array.from(buttons)) {
        const label = (btn.textContent || '').trim().toLowerCase();
        if (label === 'skip') {
          btn.click();
          dismissed = true;
          break;
        }
      }
    };

    // Initial check (in case the picker is already rendered).
    tryDismiss();

    const observer = new MutationObserver(() => tryDismiss());
    observer.observe(host, {childList: true, subtree: true});

    return () => observer.disconnect();
  }, []);

  return hostRef;
}

export default MusicLabStage;
