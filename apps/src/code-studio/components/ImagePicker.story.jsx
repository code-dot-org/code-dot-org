import React from 'react';

import ImagePicker from './ImagePicker';

global.appOptions = {
  app: 'applab',
  level: {
    projectType: 'applab',
    name: 'storybook-level',
    isProjectLevel: true,
  },
};

export default {
  component: ImagePicker,
};

// Template
const Template = args => <ImagePicker {...args} />;

// Stories
export const WithWarning = Template.bind({});
WithWarning.args = {
  showUnderageWarning: true,
  uploadsEnabled: true,
};
