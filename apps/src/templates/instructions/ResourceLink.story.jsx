import React from 'react';

import ResourceLink from './ResourceLink';

export default {
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
