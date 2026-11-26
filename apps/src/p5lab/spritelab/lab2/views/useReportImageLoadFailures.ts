import {useEffect, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';

const fileLocationFromSourceUrl = (sourceUrl: string | undefined) =>
  !sourceUrl
    ? 'none'
    : sourceUrl.startsWith('/v3/assets/')
    ? 'project'
    : sourceUrl.includes('level_starter_assets')
    ? 'level'
    : 'other';

/**
 * Reports each image whose file fails to load, once per image and link.
 */
export default function useReportImageLoadFailures(
  animationList: RuntimeAnimationList
) {
  const reportedRef = useRef(new Set<string>());
  useEffect(() => {
    for (const key of animationList.orderedKeys) {
      const props = animationList.propsByKey[key];
      const failure = props?.loadFailure;
      const id = `${key} ${props?.sourceUrl}`;
      if (!failure || reportedRef.current.has(id)) {
        continue;
      }
      reportedRef.current.add(id);
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_LOAD_FAILED,
        {
          reason: failure.reason,
          ...(failure.status !== undefined && {status: failure.status}),
          file: fileLocationFromSourceUrl(props.sourceUrl),
          ...(props.role && {role: props.role}),
        },
        true
      );
    }
  }, [animationList]);
}
