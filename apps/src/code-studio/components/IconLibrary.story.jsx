import React from 'react';
import IconLibrary from './IconLibrary';
import {action} from '@storybook/addon-actions';

export default {
  title: 'IconLibrary',
  component: IconLibrary,
};

// Template
const Template = args => (
  <div style={{width: 800}}>
    <IconLibrary {...args} />
  </div>
);

// Stories
export const Default = Template.bind({});
Default.args = {
  assetChosen: action('Selected Icon'),
};
