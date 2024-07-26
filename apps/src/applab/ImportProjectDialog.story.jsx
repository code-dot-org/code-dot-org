import {action} from '@storybook/addon-actions';
import React from 'react';

import {ImportProjectDialog} from './ImportProjectDialog';

export default {
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
