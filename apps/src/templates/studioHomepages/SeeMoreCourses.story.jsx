import React from 'react';
import SeeMoreCourses from './SeeMoreCourses';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

const courses = [
  {
    title: 'Play Lab',
    description: 'Create a story or make a game with Play Lab!',
    link: 'https://code.org/playlab',
  },
  {
    title: 'CSP Unit 2 - Digital Information',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit2/',
  },
  {
    title: 'CSP Unit 2 - Digital Information',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit2/',
  },
];

export default {
  title: 'SeeMoreCourse',
  component: SeeMoreCourses,
};

const Template = args => {
  return (
    <Provider store={reduxStore()}>
      <SeeMoreCourses courses={courses} />
    </Provider>
  );
};

export const SeeMoreCoursesExamples = Template.bind({});
