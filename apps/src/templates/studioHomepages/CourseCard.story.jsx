import React from 'react';
import CourseCard from './CourseCard';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

const exampleCard = {
  title: 'CSP Unit 2 - Digital Information',
  description:
    'Explore how more complex digital information is represented and manipulated through computation and visualization',
  link: 'studio.code.org/s/csp2-2021',
};

const examplePLCard = {
  title: 'Self Paced CSD Professional Learning - Unit 1',
  description: 'Learn how to teach CSD to your students',
  link: 'studio.code.org/s/self-paced-pl-csd1-2021',
};

export default {
  title: 'CourseCard',
  component: CourseCard,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <CourseCard {...args} />
  </Provider>
);

export const StudentCourseCard = Template.bind({});
StudentCourseCard.args = {
  ...exampleCard,
};

export const PLCourseCard = Template.bind({});
PLCourseCard.args = {
  ...examplePLCard,
  isProfessionalLearningCourse: true,
};
