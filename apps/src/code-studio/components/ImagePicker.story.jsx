import React from 'react';
import ImagePicker from './ImagePicker';

export default {
  title: 'ImagePicker',
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
