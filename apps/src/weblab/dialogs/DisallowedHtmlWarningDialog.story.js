import React from 'react';
import {action} from '@storybook/addon-actions';
import DisallowedHtmlWarningDialog from './DisallowedHtmlWarningDialog';

export default {
  title: 'DisallowedHtmlWarningDialog',
  component: DisallowedHtmlWarningDialog,
};

const DEFAULT_PROPS = {
  isOpen: true,
  filename: 'index.html',
  handleClose: action('close'),
  hideBackdrop: true,
};

const Template = args => (
  <DisallowedHtmlWarningDialog {...DEFAULT_PROPS} {...args} />
);

export const SingleDisallowedTags = Template.bind({});
SingleDisallowedTags.args = {
  disallowedTags: ['script'],
};

export const MultipleDisallowedTags = Template.bind({});
MultipleDisallowedTags.args = {
  disallowedTags: ['script', 'meta[http-equiv]'],
};
