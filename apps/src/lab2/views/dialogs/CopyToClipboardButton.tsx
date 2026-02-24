import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useState} from 'react';

import {ProjectType} from '@cdo/apps/lab2/types';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
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
    analyticsReporter.sendEvent(
      EVENTS.SHARING_LINK_COPY,
      {
        lab_type: projectType,
        channel_id: channelId,
      },
      PLATFORMS.STATSIG
    );
  }, [shareUrl, projectType, channelId]);

  return (
    <Button
      iconLeft={{
        iconName: copiedToClipboard ? 'clipboard-check' : 'clipboard',
      }}
      ariaLabel={i18n.copyLinkToProject()}
      text={i18n.copyLinkToProject()}
      type="secondary"
      color="black"
      size="m"
      onClick={handleCopyToClipboard}
      className={moduleStyles.shareDialogButton}
    />
  );
};
