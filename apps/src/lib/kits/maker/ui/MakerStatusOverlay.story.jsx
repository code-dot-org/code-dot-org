import React from 'react';
import {APP_WIDTH, APP_HEIGHT} from '../../../../applab/constants';
import {UnconnectedMakerStatusOverlay} from "./MakerStatusOverlay";

export default storybook => {
  storybook
    .storiesOf('MakerStatusOverlay')
    .addStoryTable([
      {
        name: 'WaitingToConnect',
        story: () => wrapOverlay(
          <UnconnectedMakerStatusOverlay
            width={APP_WIDTH}
            height={APP_HEIGHT}
            isConnecting={true}
            hasConnectionError={false}
            handleTryAgain={storybook.action('Try Again')}
            handleDisableMaker={storybook.action('Disable Maker Toolkit')}
          />
        ),
      },
      {
        name: 'ConnectionError',
        story: () => wrapOverlay(
          <UnconnectedMakerStatusOverlay
            width={APP_WIDTH}
            height={APP_HEIGHT}
            isConnecting={false}
            hasConnectionError={true}
            handleTryAgain={storybook.action('Try Again')}
            handleDisableMaker={storybook.action('Disable Maker Toolkit')}
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
