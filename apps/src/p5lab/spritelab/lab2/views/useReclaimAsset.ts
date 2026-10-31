import {useCallback} from 'react';

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
      const stillUsed = Object.values(
        getStore().getState().animationList.propsByKey
      ).some(p => (p as {sourceUrl?: string} | undefined)?.sourceUrl === url);
      if (stillUsed) {
        return;
      }
      HttpClient.delete(url, true).catch(() => undefined);
    },
    [channelId]
  );
}
