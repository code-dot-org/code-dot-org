import React from 'react';

import BuildlabView from './BuildlabView';

export default {
  component: BuildlabView,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Prototype = () => <BuildlabView />;
