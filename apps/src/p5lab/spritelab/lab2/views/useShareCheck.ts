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

export const SHARE_CHECK_MAX_WAIT_MS = 3000;

/** Whether the share link can be handed out on this level, so it is
    checked on load. */
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

/** Asks the server whether the project can be shared, on load and each time
    the share dialog opens. */
export default function useShareCheck(
  channelId: string | undefined,
  checkOnLoad: boolean
) {
  const dispatch = useAppDispatch();
  const shareDialogOpen = useAppSelector(
    state => !!(state as {shareDialog?: {isOpen?: boolean}}).shareDialog?.isOpen
  );

  // Only the newest answer for the current project is stored.
  const newestRequestRef = useRef(0);
  const channelIdRef = useRef(channelId);
  channelIdRef.current = channelId;
  // The stored answer is not cleared on unmount: the blocked page unmounts
  // the lab.
  useEffect(
    () => () => {
      newestRequestRef.current++;
    },
    []
  );

  const requestShareCheck = useCallback(
    (id: string, onSettled?: () => void) => {
      const requestId = ++newestRequestRef.current;
      const isNewest = () =>
        requestId === newestRequestRef.current && id === channelIdRef.current;
      fetchShareFailure(id).then(
        async failure => {
          // useSources does not look this up, unlike Lab2's own project load.
          const isTeacher = failure
            ? await fetchIsTeacherOfProjectOwner(id).catch(() => false)
            : false;
          if (isNewest()) {
            if (failure) {
              dispatch(setIsTeacherOfProjectOwner(isTeacher));
            }
            dispatch(setShareFailure(failure));
          }
          // In the same callback as the answer, so the dialog renders both
          // together.
          onSettled?.();
        },
        // A failed check ends the wait without blocking sharing.
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
      requestShareCheck(channelId);
    }
  }, [channelId, checkOnLoad, requestShareCheck]);

  // A layout effect, so the dialog's first frame already withholds the link.
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
    requestShareCheck(channelId, stopWaiting);
    const timer = setTimeout(stopWaiting, SHARE_CHECK_MAX_WAIT_MS);
    return () => {
      clearTimeout(timer);
      stopWaiting();
    };
  }, [channelId, shareDialogOpen, requestShareCheck, dispatch]);
}
