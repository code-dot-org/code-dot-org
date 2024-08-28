import React from 'react';

import CollapserIcon from './CollapserIcon';

const styles = {
  background: {
    position: 'relative',
  },
};

export default {
  component: CollapserIcon,
};

const Template = args => (
  <div style={styles.background}>
    <CollapserIcon onClick={() => {}} {...args} />
  </div>
);

export const DefaultExpanded = Template.bind({});
DefaultExpanded.args = {
  isCollapsed: false,
};

export const DefaultCollapsed = Template.bind({});
DefaultCollapsed.args = {
  isCollapsed: true,
};

export const DifferentIconExpanded = Template.bind({});
DifferentIconExpanded.args = {
  isCollapsed: false,
  expandedIconClass: 'fa-caret-down',
};

export const CustomStyleExpanded = Template.bind({});
CustomStyleExpanded.args = {
  isCollapsed: false,
  style: {color: 'red'},
};
