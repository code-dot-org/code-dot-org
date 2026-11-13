import {useCallback} from 'react';

import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Deletes an uploaded image file nothing uses anymore.
 * Resolves true once the project no longer contains the image and false otherwise.
 */
export default function useReclaimAsset(): (url?: string) => Promise<boolean> {
  const channelId = useAppSelector(state => state.lab.channel?.id);
  return useCallback(
    async (url?: string) => {
      if (!url) {
        return true;
      }
      if (!channelId || !url.startsWith(`/v3/assets/${channelId}/`)) {
        return false;
      }
      // The classic store is untyped; its list has the lab's shape.
      const list: RuntimeAnimationList = getStore().getState().animationList;
      const stillUsed = Object.values(list.propsByKey).some(
        p => p?.sourceUrl === url
      );
      if (stillUsed) {
        return false;
      }
      try {
        await HttpClient.delete(url, true);
        return true;
      } catch {
        return false;
      }
    },
    [channelId]
  );
}
