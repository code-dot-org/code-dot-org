import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';

import {setShareCheckPending, setShareFailure} from '@cdo/apps/lab2/lab2Redux';
import {fetchShareFailure} from '@cdo/apps/lab2/projects/channelsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

// The share dialog stops holding its link back after this long, whatever
// the check is doing: a slow check must not leave a student stuck.
export const SHARE_CHECK_MAX_WAIT_MS = 3000;

/**
 * Asks the server whether the project's text may be shared, and publishes
 * the answer for the blocked notice and the share dialog.
 *
 * It asks as a project page opens, and each time the share dialog opens, on
 * a level in a unit too, since that dialog hands out the project's link. An
 * owner who has removed the flagged text can then share without reloading.
 * No check runs when a unit level loads or after a save.
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

  const ask = useCallback(
    (id: string, isCurrent: () => boolean, onSettled?: () => void) => {
      fetchShareFailure(id).then(
        failure => {
          // Together, so the dialog goes from waiting straight to the answer.
          if (isCurrent()) {
            dispatch(setShareFailure(failure));
          }
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
    if (!channelId || !isProjectPage) {
      return;
    }
    let pageOpen = true;
    ask(channelId, () => pageOpen);
    return () => {
      pageOpen = false;
    };
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
    let dialogOpen = true;
    dispatch(setShareCheckPending(true));
    ask(channelId, () => dialogOpen, stopWaiting);
    const timer = setTimeout(stopWaiting, SHARE_CHECK_MAX_WAIT_MS);
    return () => {
      dialogOpen = false;
      clearTimeout(timer);
      stopWaiting();
    };
  }, [channelId, shareDialogOpen, ask, dispatch]);
}
