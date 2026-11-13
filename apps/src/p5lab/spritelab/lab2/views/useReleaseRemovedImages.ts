import {useCallback} from 'react';

import {unflagProjectChannel} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import type {ImageProps} from './images/projectImages';
import useReclaimAsset from './useReclaimAsset';

/**
 * When an image is removed, delete its uploaded file and unflag the project if necessary.
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
      void (async () => {
        for (let i = 0; i < flagged; i++) {
          await unflagProjectChannel(channelId, dispatch);
        }
      })();
    },
    [channelId, dispatch, isBlockedAbuse, reclaimAsset]
  );
}
