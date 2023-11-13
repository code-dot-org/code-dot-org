import ResourceLink from './ResourceLink';
import React from 'react';

export default {
  title: 'ResourceLink',
  component: ResourceLink,
};

const Template = args => <ResourceLink {...args} />;

export const HighlightedReference = Template.bind({});
HighlightedReference.args = {
  highlight: true,
  icon: 'map',
  text: 'First Item',
  reference: '/docs/csd/maker_leds/index.html',
};

export const NonHighlightedReference = Template.bind({});
NonHighlightedReference.args = {
  highlight: false,
  icon: 'book',
  text: 'Second Item',
  reference: '/docs/csd/maker_leds/index.html',
};
