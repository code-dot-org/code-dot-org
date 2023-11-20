import React from 'react';
import TopCourse from './TopCourse';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'TopCourse',
  component: TopCourse,
};

//
// TEMPLATE
//

const Template = args => (
  <Provider store={reduxStore()}>
    <TopCourse {...args} />
  </Provider>
);

//
// STORIES
//

export const Standard = Template.bind({});
Standard.args = {
  assignableName: 'CSP 1',
  lessonName: 'Lesson 1: Intro to CSP',
  linkToOverview: 'studio.code.org/s/csp1-2021',
  linkToLesson: 'studio.code.org/s/csp1-2021/lessons/1',
};

export const ProfessionalLearning = Template.bind({});
ProfessionalLearning.args = {
  assignableName: 'Self Paced CSD 1',
  lessonName: 'What to teach when in CSD',
  linkToOverview: 'studio.code.org/s/self-paced-pl-csd1-2021',
  linkToLesson: 'studio.code.org/s/self-paced-pl-csd1-2021/lessons/1',
  isProfessionalLearningCourse: true,
};
