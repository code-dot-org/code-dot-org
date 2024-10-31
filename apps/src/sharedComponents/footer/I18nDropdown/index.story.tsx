import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import I18nDropdown from './index';

export default {
  component: I18nDropdown,
  argTypes: {
    localeUrl: {control: 'text'},
    selectedLocale: {control: 'text'},
    optionsForLocaleSelect: {control: 'object'},
  },
} as Meta;

const localeOptions = [
  {value: 'en', text: 'English'},
  {value: 'es', text: 'Spanish'},
  {value: 'fr', text: 'French'},
];

const Template: StoryFn<typeof I18nDropdown> = args => (
  <I18nDropdown
    {...args}
    localeUrl="/set_locale"
    optionsForLocaleSelect={localeOptions}
  />
);

export const Default = Template.bind({});
Default.args = {};

export const WithSelectedLocale = Template.bind({});
WithSelectedLocale.args = {
  selectedLocale: 'es',
};
