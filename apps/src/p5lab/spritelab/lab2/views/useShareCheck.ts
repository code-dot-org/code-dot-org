import {useEffect} from 'react';

import {setShareFailure} from '@cdo/apps/lab2/lab2Redux';
import {fetchShareFailure} from '@cdo/apps/lab2/projects/channelsApi';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

/**
 * Asks the server, once as a project page opens, whether the project's text
 * may be shared, and publishes the answer for the page's blocked notice and
 * the share dialog. The server looks for profanity and personal information.
 * A level in a unit does not ask, and nothing asks again after a save, so
 * the server is not called on every level load and save.
 */
export default function useShareCheck(
  channelId: string | undefined,
  isProjectPage: boolean
) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!channelId || !isProjectPage) {
      return;
    }
    let left = false;
    fetchShareFailure(channelId)
      .then(failure => {
        if (!left) {
          dispatch(setShareFailure(failure));
        }
      })
      // A check that cannot be made leaves the project viewable, as the
      // server does when its own filter is unreachable.
      .catch(() => {});
    return () => {
      left = true;
      dispatch(setShareFailure(null));
    };
  }, [channelId, isProjectPage, dispatch]);
}
