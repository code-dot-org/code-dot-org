import React from 'react';
import PlayZone from './playzone';
import {action} from '@storybook/addon-actions';

export default {
  title: 'PlayZone',
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
