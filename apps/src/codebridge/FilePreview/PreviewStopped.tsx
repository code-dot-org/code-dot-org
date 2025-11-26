import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import React, {MouseEvent} from 'react';

import pageStoppedImage from '@cdo/apps/codebridge/images/preview-stopped-placeholder.png';

import moduleStyles from './styles/preview-message.module.scss';

interface PreviewStoppedProps {
  onReload: (
    event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>
  ) => void;
}

// todo: not vertically centered.
const PreviewStopped: React.FC<PreviewStoppedProps> = ({onReload}) => {
  return (
    <div className={moduleStyles.placeholderContainer}>
      <CodebridgeEmptyState
        imageProps={{src: pageStoppedImage}}
        title="Preview Stopped"
        description="You stopped running the code due to an error. Review your code or use AI Tutor to help debug before reloading."
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
