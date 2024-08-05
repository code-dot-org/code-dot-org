import {action} from '@storybook/addon-actions';
import React from 'react';

import {APP_WIDTH, APP_HEIGHT} from '../../../../applab/constants';

import {UnconnectedMakerStatusOverlay} from './MakerStatusOverlay';

const commonProps = {
  width: APP_WIDTH,
  height: APP_HEIGHT,
  isConnecting: false,
  isWrongBrowser: false,
  hasConnectionError: false,
  handleTryAgain: action('Try Again'),
  useVirtualBoardOnNextRun: action('Use virtual board on next run'),
  handleDisableMaker: action('Disable Maker Toolkit'),
  handleOpenSetupPage: action('Open setup page'),
};

export default {
  component: UnconnectedMakerStatusOverlay,
};

const Template = args =>
  wrapOverlay(<UnconnectedMakerStatusOverlay {...commonProps} {...args} />);

export const WaitingToConnect = Template.bind({});
WaitingToConnect.args = {
  isConnecting: true,
};

export const UnsupportedBrowser = Template.bind({});
UnsupportedBrowser.args = {
  isWrongBrowser: true,
};

export const ConnectionError = Template.bind({});
ConnectionError.args = {
  hasConnectionError: true,
};

function wrapOverlay(overlay) {
  const style = {
    position: 'relative',
    width: APP_WIDTH,
    height: APP_HEIGHT,
  };
  return <div style={style}>{overlay}</div>;
}
