import {action} from '@storybook/addon-actions';
import React from 'react';

import PlayZone from './playzone';

export default {
  component: PlayZone,
};

// Template
const Template = args => <PlayZone {...args} />;

// Stories
export const Default = Template.bind({});
Default.args = {
  lessonName: 'Test Lesson',
  onContinue: action('Selected Continue'),
};
