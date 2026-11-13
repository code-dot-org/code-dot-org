import {useCallback} from 'react';

import {unflagProjectChannel} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import type {ImageProps} from './images/projectImages';
import useReclaimAsset from './useReclaimAsset';

/**
 * What an image leaves behind when it goes: its uploaded file, and the share
 * block that keeping it flagged put on the project. Call it for every way an
 * image can leave, not just the delete button — a flagged picture dropped by
 * Start Over would otherwise block the project for good, with nothing left
 * for the student to delete.
 */
export default function useReleaseRemovedImages(): (
  removed: (ImageProps | undefined)[]
) => void {
  const dispatch = useAppDispatch();
  const reclaimAsset = useReclaimAsset();
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const isBlockedAbuse = useAppSelector(state => state.lab.isBlockedAbuse);

  return useCallback(
    (removed: (ImageProps | undefined)[]) => {
      removed.forEach(props => reclaimAsset(props?.sourceUrl));
      const flagged = removed.filter(props => props?.flagged).length;
      if (!flagged || !isBlockedAbuse || !channelId) {
        return;
      }
      // One call per flagged picture, since each raised the score on its own.
      // Sequential: the server reads the score before writing it back.
      void (async () => {
        for (let i = 0; i < flagged; i++) {
          await unflagProjectChannel(channelId, dispatch);
        }
      })();
    },
    [channelId, dispatch, isBlockedAbuse, reclaimAsset]
  );
}
