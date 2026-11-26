import {useEffect, useRef} from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const fileLocationFromSourceUrl = (
  sourceUrl: string | undefined,
  channelId: string | undefined
) =>
  !sourceUrl
    ? 'none'
    : channelId && sourceUrl.startsWith(`/v3/assets/${channelId}/`)
    ? 'project'
    : sourceUrl.startsWith('/v3/assets/')
    ? 'otherProject'
    : sourceUrl.includes('level_starter_assets')
    ? 'level'
    : 'other';

/**
 * Reports each image whose file fails to load, once per image and link.
 */
export default function useReportImageLoadFailures(
  animationList: RuntimeAnimationList,
  levelProperties: LevelProperties,
  channelId: string | undefined
) {
  const unitName = useAppSelector(state => state.progress.scriptName) ?? '';
  const reportedRef = useRef(new Set<string>());
  useEffect(() => {
    for (const key of animationList.orderedKeys) {
      const props = animationList.propsByKey[key];
      const id = `${key} ${props?.sourceUrl}`;
      if (!props?.loadFailed || reportedRef.current.has(id)) {
        continue;
      }
      reportedRef.current.add(id);
      const failure = props.loadFailure;
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_LOAD_FAILED,
        {
          reason: failure?.reason ?? 'unknown',
          ...(failure?.status !== undefined && {status: failure.status}),
          file: fileLocationFromSourceUrl(props.sourceUrl, channelId),
          ...(props.role && {role: props.role}),
          unitName,
          levelId: levelProperties.id,
          levelName: levelProperties.name,
        },
        true
      );
    }
  }, [animationList, levelProperties, channelId, unitName]);
}
