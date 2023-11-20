import React from 'react';
import ConfirmDeleteButton from './ConfirmDeleteButton';
import {action} from '@storybook/addon-actions';

export default {
  title: 'ConfirmDeleteButton',
  component: ConfirmDeleteButton,
};

const Template = args => <ConfirmDeleteButton {...args} />;

export const BasicExample = Template.bind({});
BasicExample.args = {
  title: 'Delete table?',
  body: 'Are you sure you want to delete the table?',
  buttonText: 'Delete table',
  onConfirmDelete: action('delete table'),
};
