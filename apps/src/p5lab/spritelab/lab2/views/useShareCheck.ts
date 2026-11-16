import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';

import {
  setIsTeacherOfProjectOwner,
  setShareCheckPending,
  setShareFailure,
} from '@cdo/apps/lab2/lab2Redux';
import {
  fetchIsTeacherOfProjectOwner,
  fetchShareFailure,
} from '@cdo/apps/lab2/projects/channelsApi';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

// The share dialog stops holding its link back after this long, whatever
// the check is doing: a slow check must not leave a student stuck.
export const SHARE_CHECK_MAX_WAIT_MS = 3000;

/** Whether to check as the level loads: wherever the project's link can be
    handed out, on a project page, from a header that offers Share/Remix,
    or from a finish dialog. */
export function checksOnLoad(
  levelProperties: Pick<
    LevelProperties,
    'isProjectLevel' | 'hideShareAndRemix' | 'finishDialog'
  >
): boolean {
  return (
    !!levelProperties.isProjectLevel ||
    levelProperties.hideShareAndRemix === false ||
    !!levelProperties.finishDialog
  );
}

/**
 * Asks the server whether the project can be shared: on load when
 * checksOnLoad says so, and each time the share dialog opens. The answer is
 * kept when the lab unmounts, since the blocked page unmounts it and
 * clearing the answer then would make it ask again.
 */
export default function useShareCheck(
  channelId: string | undefined,
  checkOnLoad: boolean
) {
  const dispatch = useAppDispatch();
  const shareDialogOpen = useAppSelector(
    state => !!(state as {shareDialog?: {isOpen?: boolean}}).shareDialog?.isOpen
  );

  // Only the newest question's answer is stored, and only for the project
  // it was asked about. An answer that arrives after the dialog closes is
  // still stored, so a failure the owner has since fixed is cleared.
  const newestAskRef = useRef(0);
  const channelIdRef = useRef(channelId);
  channelIdRef.current = channelId;
  useEffect(
    () => () => {
      newestAskRef.current++;
    },
    []
  );

  const ask = useCallback(
    (id: string, onSettled?: () => void) => {
      const asked = ++newestAskRef.current;
      const isNewest = () =>
        asked === newestAskRef.current && id === channelIdRef.current;
      fetchShareFailure(id).then(
        async failure => {
          // The owner's teacher may look at a flagged project, and this lab's
          // loader does not find out who the viewer is to the owner.
          const isTeacher = failure
            ? await fetchIsTeacherOfProjectOwner(id).catch(() => false)
            : false;
          if (isNewest()) {
            if (failure) {
              dispatch(setIsTeacherOfProjectOwner(isTeacher));
            }
            dispatch(setShareFailure(failure));
          }
          // Ends the wait in the same callback that stores the answer, so
          // the dialog never renders a finished wait without the answer.
          onSettled?.();
        },
        // A failed check stores nothing and ends the wait, so sharing is not
        // blocked. The server likewise serves main.json when WebPurify is down.
        () => onSettled?.()
      );
    },
    [dispatch]
  );

  const answeredForRef = useRef(channelId);
  useEffect(() => {
    if (answeredForRef.current !== channelId) {
      answeredForRef.current = channelId;
      dispatch(setShareFailure(null));
    }
  }, [channelId, dispatch]);

  useEffect(() => {
    if (channelId && checkOnLoad) {
      ask(channelId);
    }
  }, [channelId, checkOnLoad, ask]);

  // A layout effect, so the dialog's first painted frame already holds the
  // link back.
  useLayoutEffect(() => {
    if (!channelId || !shareDialogOpen) {
      return;
    }
    let waiting = true;
    const stopWaiting = () => {
      if (waiting) {
        waiting = false;
        dispatch(setShareCheckPending(false));
      }
    };
    dispatch(setShareCheckPending(true));
    ask(channelId, stopWaiting);
    const timer = setTimeout(stopWaiting, SHARE_CHECK_MAX_WAIT_MS);
    return () => {
      clearTimeout(timer);
      stopWaiting();
    };
  }, [channelId, shareDialogOpen, ask, dispatch]);
}
