import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import I18nDropdown from './index';

export default {
  component: I18nDropdown,
  argTypes: {
    localeUrl: {control: 'text'},
    optionsForLocaleSelect: {control: 'object'},
  },
} as Meta;

const Template: StoryFn<typeof I18nDropdown> = args => (
  <I18nDropdown {...args} />
);

export const Default = Template.bind({});
Default.args = {
  localeUrl: '/set_locale',
  optionsForLocaleSelect: [
    {value: 'en', text: 'English'},
    {value: 'es', text: 'Spanish'},
    {value: 'fr', text: 'French'},
  ],
};
