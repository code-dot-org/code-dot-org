import React from 'react';

import {SmallChevronLink} from './SmallChevronLink';

export default {
  component: SmallChevronLink,
};

const Template = args => (
  <SmallChevronLink href="/foo" text="View course" {...args} />
);

export const Default = Template.bind({});

export const IconBeforeText = Template.bind({});
IconBeforeText.args = {
  iconBefore: true,
};
