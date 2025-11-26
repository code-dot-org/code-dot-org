import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import React, {MouseEvent} from 'react';

import pageStoppedImage from '@cdo/apps/codebridge/images/preview-stopped-placeholder.png';

interface PreviewStoppedProps {
  onReload: (
    event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>
  ) => void;
}

const PreviewStopped: React.FC<PreviewStoppedProps> = ({onReload}) => {
  return (
    <div data-theme="Light">
      <CodebridgeEmptyState
        imageProps={{src: pageStoppedImage}}
        title="Preview Stopped"
        description="You stopped the preview. If there was an error, review your code or use AI Tutor to help debug before reloading."
        buttonProps={{
          text: 'Reload Preview',
          onClick: onReload,
          iconLeft: {iconName: 'sync', iconStyle: 'solid'},
          type: 'secondary',
          color: 'gray',
          size: 's',
        }}
      />
    </div>
  );
};

export default PreviewStopped;
