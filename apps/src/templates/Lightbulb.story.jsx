import React from 'react';

import Lightbulb from './Lightbulb';

export default {
  component: Lightbulb,
};

const Template = args => <Lightbulb {...args} />;

export const WithDefaultProps = Template.bind({});

export const Unlit = Template.bind({});
Unlit.args = {
  lit: false,
};

export const WithACount = Template.bind({});
WithACount.args = {
  count: 10,
};

export const MinecraftStyle = Template.bind({});
MinecraftStyle.args = {
  isMinecraft: true,
};
