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
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

// The share dialog stops holding its link back after this long, whatever
// the check is doing: a slow check must not leave a student stuck.
export const SHARE_CHECK_MAX_WAIT_MS = 3000;

/**
 * Asks the server whether the project's text may be shared, and publishes
 * the answer for the blocked notice and the share dialog. It asks as a
 * project page opens and each time the share dialog opens. No check runs
 * when a unit level loads or after a save.
 *
 * The answer stays until another replaces it or the project changes. The
 * blocked page takes this lab off the screen, so an answer cleared as the
 * lab leaves would bring the lab straight back to ask again.
 */
export default function useShareCheck(
  channelId: string | undefined,
  isProjectPage: boolean
) {
  const dispatch = useAppDispatch();
  const shareDialogOpen = useAppSelector(
    state => !!(state as {shareDialog?: {isOpen?: boolean}}).shareDialog?.isOpen
  );

  // Only the newest question's answer is published, and only for the project
  // it was asked about. Closing the dialog does not discard an answer: an
  // owner who dismisses a failure they have just fixed still gets the news.
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
          // In the same step as the answer, so the dialog goes from waiting
          // straight to it.
          onSettled?.();
        },
        // A check that cannot be made leaves the project viewable, as the
        // server does when its own filter is unreachable.
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
    if (channelId && isProjectPage) {
      ask(channelId);
    }
  }, [channelId, isProjectPage, ask]);

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
