import {useCallback, useEffect} from 'react';

import {setShareFailure} from '@cdo/apps/lab2/lab2Redux';
import {fetchShareFailure} from '@cdo/apps/lab2/projects/channelsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Asks the server whether the project's text may be shared, and publishes
 * the answer for the page's blocked notice and the share dialog. The server
 * looks for profanity and personal information.
 *
 * It asks as a project page opens, and again each time the share dialog
 * opens, so an owner who has removed the flagged text can share without
 * reloading. A level in a unit does not ask, and nothing asks after a save,
 * so the server is not called on every level load and save.
 */
export default function useShareCheck(
  channelId: string | undefined,
  isProjectPage: boolean
) {
  const dispatch = useAppDispatch();
  const shareDialogOpen = useAppSelector(
    state => !!(state as {shareDialog?: {isOpen?: boolean}}).shareDialog?.isOpen
  );
  const checkedChannelId = isProjectPage ? channelId : undefined;

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

  useEffect(() => {
    if (!checkedChannelId) {
      return;
    }
    let pageOpen = true;
    ask(checkedChannelId, () => pageOpen);
    return () => {
      pageOpen = false;
      dispatch(setShareFailure(null));
    };
  }, [checkedChannelId, ask, dispatch]);

  useEffect(() => {
    if (!checkedChannelId || !shareDialogOpen) {
      return;
    }
    let dialogOpen = true;
    ask(checkedChannelId, () => dialogOpen);
    return () => {
      dialogOpen = false;
    };
  }, [checkedChannelId, shareDialogOpen, ask]);
}
