import React from 'react';

import Meter from '@cdo/apps/templates/Meter';
import color from '@cdo/apps/util/color';

export default {
  component: Meter,
};

// The meter background is white, so add a background color to make
// the meter more easily visible.
const containerStyle = {
  backgroundColor: color.lightest_gray,
  padding: 10,
};

//
// TEMPLATE
//

const Template = args => (
  <Meter max={10} containerStyle={containerStyle} {...args} />
);

//
// STORIES
//

export const HalfFull = Template.bind({});
HalfFull.args = {
  id: 'meter-1',
  label: 'Glass half-full:',
  value: 5,
};

export const SeventyFivePercentPlusFull = Template.bind({});
SeventyFivePercentPlusFull.args = {
  id: 'meter-2',
  label: 'Warning zone:',
  value: 8,
};

export const NinetyPercentPlusFull = Template.bind({});
NinetyPercentPlusFull.args = {
  id: 'meter-3',
  label: 'Almost full!',
  value: 9,
};

export const NoLabel = Template.bind({});
NoLabel.args = {
  id: 'meter-4',
  value: 4,
};
