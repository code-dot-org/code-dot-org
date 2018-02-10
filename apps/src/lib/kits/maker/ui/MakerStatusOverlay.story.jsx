import React from 'react';
import {APP_WIDTH, APP_HEIGHT} from '../../../../applab/constants';
import {UnconnectedMakerStatusOverlay} from "./MakerStatusOverlay";
import {action} from '@storybook/addon-actions';

export default storybook => {
  const commonProps = {
    width: APP_WIDTH,
    height: APP_HEIGHT,
    isConnecting: false,
    isWrongBrowser: false,
    hasConnectionError: false,
    handleTryAgain: action('Try Again'),
    useFakeBoardOnNextRun: action('Use fake board on next run'),
    handleDisableMaker: action('Disable Maker Toolkit'),
    handleOpenSetupPage: action('Open setup page'),
  };

  storybook
    .storiesOf('MakerStatusOverlay', module)
    .addStoryTable([
      {
        name: 'WaitingToConnect',
        story: () => wrapOverlay(
          <UnconnectedMakerStatusOverlay
            {...commonProps}
            isConnecting={true}
          />
        ),
      },
      {
        name: 'UnsupportedBrowser',
        story: () => wrapOverlay(
          <UnconnectedMakerStatusOverlay
            {...commonProps}
            isWrongBrowser={true}
          />
        ),
      },
      {
        name: 'ConnectionError',
        story: () => wrapOverlay(
          <UnconnectedMakerStatusOverlay
            {...commonProps}
            hasConnectionError={true}
          />
        ),
      },
    ]);
};

function wrapOverlay(overlay) {
  const style = {
    position: 'relative',
    width: APP_WIDTH,
    height: APP_HEIGHT,
  };
  return <div style={style}>{overlay}</div>;
}
