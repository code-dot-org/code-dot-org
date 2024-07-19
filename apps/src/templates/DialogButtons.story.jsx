import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {registerReducers} from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {reduxStore} from '@cdo/storybook/decorators';

import DialogButtons from './DialogButtons';

export default {
  component: DialogButtons,
};

const store = reduxStore();
registerReducers({...commonReducers, isRtl});

const Template = args => (
  <Provider store={store}>
    <DialogButtons {...args} />
  </Provider>
);

export const OK = Template.bind({});
OK.args = {
  ok: true,
};

export const CancelText = Template.bind({});
CancelText.args = {
  cancelText: 'Custom Cancel Text',
};

export const ConfirmText = Template.bind({});
ConfirmText.args = {
  confirmText: 'Custom Confirm Text',
};

export const NextLevel = Template.bind({});
NextLevel.args = {
  nextLevel: true,
  continueText: 'Custom Continue Text',
};

export const TryAgain = Template.bind({});
TryAgain.args = {
  tryAgain: 'Custom Try Again Text',
};

export const TryAgainWithHint = Template.bind({});
TryAgainWithHint.args = {
  shouldPromptForHint: true,
  tryAgain: 'Custom Try Again Text',
};

export const K1Customizations = Template.bind({});
K1Customizations.args = {
  isK1: true,
  tryAgain: 'Custom Try Again',
  nextLevel: true,
  continueText: 'Custom Continue',
  assetUrl: url => '/blockly/' + url,
};

export const K1FreePlay = Template.bind({});
K1FreePlay.args = {
  isK1: true,
  freePlay: true,
  tryAgain: 'Custom Try Again',
  nextLevel: true,
  continueText: 'Custom Continue',
  assetUrl: url => '/blockly/' + url,
};
