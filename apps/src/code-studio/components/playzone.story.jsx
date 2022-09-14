import React from 'react';
import PlayZone from './playzone';

export default {
  title: 'PlayZone',
  component: PlayZone
};

// Template
const Template = args => <PlayZone {...args} />;

// Stories
export const Default = Template.bind({});
Default.args = {
  lessonName: 'Test Lesson',
  onContinue: () => {}
};
