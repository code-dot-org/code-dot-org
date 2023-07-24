import React from 'react';
import {ImportProjectDialog} from './ImportProjectDialog';
import {action} from '@storybook/addon-actions';

export default {
  title: 'ImportProjectDialog',
  component: ImportProjectDialog,
};

const Template = args => (
  <ImportProjectDialog hideBackdrop onImport={action('onImport')} {...args} />
);

export const OnOpen = Template.bind({});

export const WhileFetching = Template.bind({});
WhileFetching.args = {
  isFetching: true,
};

export const ErrorFetching = Template.bind({});
ErrorFetching.args = {
  error: true,
};
