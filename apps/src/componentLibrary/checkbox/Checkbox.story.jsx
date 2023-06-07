import React from 'react';
import Checkbox from './index';

export default {
  title: 'Checkbox Component',
  component: Checkbox,
};

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const Template = args => <Checkbox {...args} />;

export const DefaultCheckbox = Template.bind({});
DefaultCheckbox.args = {
  name: 'test',
  label: 'label',
};
