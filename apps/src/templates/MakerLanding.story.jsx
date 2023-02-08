import React from 'react';
import MakerLanding from './MakerLanding';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

const topCourse = {
  assignableName: 'CSD Unit 6 - Physical Computing',
  lessonName: 'Lesson 1: Computing innovations',
  linkToOverview: 'http://localhost-studio.code.org:3000/s/csd6',
  linkToLesson:
    'http://localhost-studio.code.org:3000/s/csd6/lessons/1/levels/1'
};

export default {
  title: 'MakerLanding',
  component: MakerLanding
};

const Template = args => (
  <Provider store={reduxStore()}>
    <MakerLanding {...args} />
  </Provider>
);

export const MakerExample = Template.bind({});
MakerExample.args = {
  topCourse: topCourse
};
