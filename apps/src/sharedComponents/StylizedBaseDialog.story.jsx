import {action} from '@storybook/addon-actions';
import React from 'react';

import StylizedBaseDialog from './StylizedBaseDialog';

export default {
  component: StylizedBaseDialog,
};

const DEFAULT_PROPS = {
  title: 'Title',
  body: <div>body</div>,
  handleConfirmation: action('confirmed'),
  handleClose: action('closed'),
  hideBackdrop: true,
};

//
// TEMPLATE
//

const Template = args => <StylizedBaseDialog {...DEFAULT_PROPS} {...args} />;

//
// STORIES
//

export const Default = Template.bind({});

export const Simple = Template.bind({});
Simple.args = {
  type: 'simple',
};

export const NoTitle = Template.bind({});
NoTitle.args = {
  title: null,
};

export const LeftJustifiedFooter = Template.bind({});
LeftJustifiedFooter.args = {
  footerJustification: 'flex-start',
};

export const CustomFooterButtonText = Template.bind({});
CustomFooterButtonText.args = {
  confirmationButtonText: 'Yes, please',
  cancellationButtonText: 'No, thank you',
};

export const CustomFooterWithDefaultButtons = Template.bind({});
CustomFooterWithDefaultButtons.args = {
  footerJustification: 'space-between',
  renderFooter: buttons => [
    <div key="text">You can do it!</div>,
    <div key="buttons">{buttons}</div>,
  ],
};

export const CustomFooterWithoutDefaultButtons = Template.bind({});
CustomFooterWithoutDefaultButtons.args = {
  renderFooter: () => "I don't need your buttons!",
};
