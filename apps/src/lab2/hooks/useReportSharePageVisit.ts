import {useEffect, useRef} from 'react';

import {reportSharePageVisited} from '@cdo/apps/lab2/utils/shareEvents';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/** Reports a visit to a project's share page, once per project. */
export default function useReportSharePageVisit() {
  const isShareView = useAppSelector(state => state.lab.isShareView);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const projectType = useAppSelector(state => state.lab.channel?.projectType);
  const isOwner = useAppSelector(state => state.lab.channel?.isOwner);
  const reportedChannelId = useRef<string>();

  useEffect(() => {
    if (
      !isShareView ||
      !channelId ||
      !projectType ||
      reportedChannelId.current === channelId
    ) {
      return;
    }
    reportedChannelId.current = channelId;
    reportSharePageVisited({projectType, channelId}, !!isOwner);
  }, [isShareView, channelId, projectType, isOwner]);
}
