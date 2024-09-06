import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import I18nDropdown from './I18nDropdown';

export default {
  component: I18nDropdown,
  argTypes: {
    localeUrl: {control: 'text'},
    optionsForLocaleSelect: {control: 'object'},
  },
} as Meta<typeof I18nDropdown>;

const Template: StoryFn<typeof I18nDropdown> = args => (
  <I18nDropdown {...args} />
);

export const Default = Template.bind({});
Default.args = {
  localeUrl: '/set_locale',
  optionsForLocaleSelect: [
    {value: 'en-US', text: 'English'},
    {value: 'es-MX', text: 'Spanish'},
    {value: 'fr-FR', text: 'French'},
  ],
};

export const WithSelectedSpanish = Template.bind({});
WithSelectedSpanish.args = {
  localeUrl: '/set_locale',
  optionsForLocaleSelect: [
    {value: 'en-US', text: 'English'},
    {value: 'es-MX', text: 'Spanish'},
    {value: 'fr-FR', text: 'French'},
  ],
};

export const WithFrenchOptionsOnly = Template.bind({});
WithFrenchOptionsOnly.args = {
  localeUrl: '/set_locale',
  optionsForLocaleSelect: [{value: 'fr-FR', text: 'French'}],
};
