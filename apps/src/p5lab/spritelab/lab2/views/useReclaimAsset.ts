import {useCallback} from 'react';

import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Deletes an uploaded image file nothing uses anymore. Deliberately narrow
 * and best-effort: only this project's own uploads, only when no image still
 * points at the file, and a failed delete is ignored.
 */
export default function useReclaimAsset(): (url?: string) => void {
  const channelId = useAppSelector(state => state.lab.channel?.id);
  return useCallback(
    (url?: string) => {
      if (!channelId || !url || !url.startsWith(`/v3/assets/${channelId}/`)) {
        return;
      }
      // The classic store is untyped; its list has the lab's shape.
      const list: RuntimeAnimationList = getStore().getState().animationList;
      const stillUsed = Object.values(list.propsByKey).some(
        p => p?.sourceUrl === url
      );
      if (stillUsed) {
        return;
      }
      HttpClient.delete(url, true).catch(() => undefined);
    },
    [channelId]
  );
}
