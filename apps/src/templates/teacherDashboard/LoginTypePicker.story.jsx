import React from 'react';
import {UnconnectedLoginTypePicker as LoginTypePicker} from './LoginTypePicker';
import {action} from '@storybook/addon-actions';

export default {
  title: 'LoginTypePicker',
  component: LoginTypePicker,
};

const Template = args => (
  <LoginTypePicker
    title="New section"
    handleImportOpen={action('handleImportOpen')}
    setLoginType={action('setLoginType')}
    handleCancel={action('handleCancel')}
    {...args}
  />
);

export const Basic = Template.bind({});

export const Google = Template.bind({});
Google.args = {
  providers: ['google_classroom'],
};

export const Clever = Template.bind({});
Clever.args = {
  providers: ['clever'],
};

export const Microsoft = Template.bind({});
Microsoft.args = {
  providers: ['microsoft_classroom'],
};

export const Multiple = Template.bind({});
Multiple.args = {
  providers: ['google_classroom', 'clever'],
};
