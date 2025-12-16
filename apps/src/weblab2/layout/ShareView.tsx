import {LinkButton, Button} from '@code-dot-org/component-library/button';
import React from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import commonI18n from '@cdo/locale';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/share-layout.module.scss';

const ShareView: React.FunctionComponent = () => {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const onViewCode = () => {
    projectManager?.redirectToView();
  };

  const onRemix = () => {
    projectManager?.redirectToRemix();
  };

  const channelId = projectManager?.getChannelId();
  const projectUrl = channelId
    ? `${window.location.origin}/projects/weblab2/${channelId}`
    : '';

  const reportAbuseUrl = projectUrl
    ? `/report_abuse?projectUrl=${encodeURIComponent(projectUrl)}`
    : '/report_abuse';

  return (
    <div className={moduleStyles.shareContainer}>
      <div className={moduleStyles.sidebar}>
        <Button
          text={commonI18n.viewCode()}
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'solid', iconName: 'code'}}
          onClick={onViewCode}
        />
        <Button
          text={commonI18n.makeMyOwn()}
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'regular', iconName: 'pen-to-square'}}
          onClick={onRemix}
        />
        <LinkButton
          text="Report abuse"
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'regular', iconName: 'message-exclamation'}}
          href={reportAbuseUrl}
          target="_blank"
        />
      </div>
      <div className={moduleStyles.previewContainer}>
        <HTMLPreview />
      </div>
    </div>
  );
};

export default ShareView;
