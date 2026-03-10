import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useState} from 'react';

import {ProjectType} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {commonI18n as i18n} from '@cdo/apps/types/locale';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import trackEvent from '@cdo/apps/util/trackEvent';

import moduleStyles from './share-dialog.module.scss';

export const CopyToClipboardButton: React.FunctionComponent<{
  shareUrl: string;
  projectType: ProjectType;
  channelId: string | undefined;
}> = ({shareUrl, projectType, channelId}) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCopyToClipboard = useCallback(() => {
    copyToClipboard(shareUrl, () => {
      setCopiedToClipboard(true);
    });
    trackEvent('share', 'share_copy_url', {value: projectType});
    analyticsReporter.sendEvent(EVENTS.SHARING_LINK_COPY, {
      lab_type: projectType,
      channel_id: channelId,
    });
  }, [shareUrl, projectType, channelId]);

  return (
    <MuiButton
      variant="outlined"
      color="secondary"
      size="medium"
      className={moduleStyles.shareDialogButton}
      onClick={handleCopyToClipboard}
      aria-label={i18n.copyLinkToProject()}
      type="button"
      startIcon={
        <FontAwesomeV6Icon
          iconName={copiedToClipboard ? 'clipboard-check' : 'clipboard'}
        />
      }
    >
      {i18n.copyLinkToProject()}
    </MuiButton>
  );
};
