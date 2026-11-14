import {useCallback, useEffect, useRef} from 'react';

import {setShareFailure} from '@cdo/apps/lab2/lab2Redux';
import {fetchShareFailure} from '@cdo/apps/lab2/projects/channelsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Asks the server whether the project's text may be shared, and publishes
 * the answer for the blocked notice and the share dialog.
 *
 * It asks as a project page opens, and each time the share dialog opens, on
 * a level in a unit too, since that dialog hands out the project's link. An
 * owner who has removed the flagged text can then share without reloading.
 * Nothing asks as a level in a unit loads or after a save.
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
    (id: string, isCurrent: () => boolean) => {
      fetchShareFailure(id)
        .then(failure => {
          if (isCurrent()) {
            dispatch(setShareFailure(failure));
          }
        })
        // A check that cannot be made leaves the project viewable, as the
        // server does when its own filter is unreachable.
        .catch(() => {});
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

  useEffect(() => {
    if (!channelId || !shareDialogOpen) {
      return;
    }
    let dialogOpen = true;
    ask(channelId, () => dialogOpen);
    return () => {
      dialogOpen = false;
    };
  }, [channelId, shareDialogOpen, ask]);
}
