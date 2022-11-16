import React from 'react';
import CourseBlocksTools from './CourseBlocksTools';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'CourseBlocksTools',
  component: CourseBlocksTools
};

// Template
const Template = args => (
  <Provider store={reduxStore()}>
    <CourseBlocksTools {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {
  isEnglish: true
};
