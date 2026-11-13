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
      const released = removed.map(props => reclaimAsset(props?.sourceUrl));
      if (!isBlockedAbuse || !channelId) {
        return;
      }
      void (async () => {
        for (let i = 0; i < removed.length; i++) {
          if (!removed[i]?.flagged || !(await released[i])) {
            continue;
          }
          await unflagProjectChannel(channelId, dispatch);
        }
      })();
    },
    [channelId, dispatch, isBlockedAbuse, reclaimAsset]
  );
}
