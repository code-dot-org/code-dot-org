import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import RecentCourses from './RecentCourses';

export default {
  component: RecentCourses,
};

const courses = [
  {
    title: 'CSP Unit 1',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit1/',
  },
  {
    title: 'CSP Unit 2',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit2/',
  },
  {
    title: 'CSP Unit 3',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit3/',
  },
  {
    title: 'CSP Unit 4',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit4/',
  },
  {
    title: 'CSP Unit 5',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit5/',
  },
  {
    title: 'CSP Unit 6',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit6/',
  },
  {
    title: 'CSP Unit 7',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit7/',
  },
];

const topCourse = {
  assignableName: 'Course 1',
  lessonName: 'Lesson 3: Learn to drag and drop',
  linkToOverview: 'http://localhost:3000/s/course1',
  linkToLesson:
    'http://localhost:3000/s/course1/lessons/3/levels/1',
};

const plCourses = [
  {
    title: 'Self Paced CSP Unit 1',
    description: 'Self paced learning',
    link: 'studio.code.org/s/self-paced-csp1-2021',
  },
  {
    title: 'Self Paced CSP Unit 2',
    description: 'Self paced learning',
    link: 'studio.code.org/s/self-paced-csp2-2021',
  },
  {
    title: 'Self Paced CSP Unit 3',
    description: 'Self paced learning',
    link: 'studio.code.org/s/self-paced-csp3-2021',
  },
  {
    title: 'Self Paced CSP Unit 4',
    description: 'Self paced learning',
    link: 'studio.code.org/s/self-paced-csp4-2021',
  },
  {
    title: 'Self Paced CSP Unit 5',
    description: 'Self paced learning',
    link: 'studio.code.org/s/self-paced-csp5-2021',
  },
  {
    title: 'Self Paced CSP Unit 6',
    description: 'Self paced learning',
    link: 'studio.code.org/s/self-paced-csp6-2021',
  },
  {
    title: 'Self Paced CSP Unit 7',
    description: 'Self paced learning',
    link: 'studio.code.org/s/self-paced-csp7-2021',
  },
];

const topPlCourse = {
  assignableName: 'Virtual PL',
  lessonName: 'Assignment 3',
  linkToOverview: 'http://studio.code.org/s/vpl-csd-2021',
  linkToLesson: 'http://studio.code.org/s/vpl-csd-2021/lessons/3/levels/1',
};

//
// TEMPLATE
//

const Template = args => (
  <Provider store={reduxStore()}>
    <RecentCourses {...args} />
  </Provider>
);

//
// STORIES
//

export const TeacherNoCourses = Template.bind({});
TeacherNoCourses.args = {
  courses: [],
  showAllCoursesLink: true,
  isTeacher: true,
};

export const StudentNoCourses = Template.bind({});
StudentNoCourses.args = {
  courses: [],
  showAllCoursesLink: true,
  isTeacher: false,
};

export const Teacher4Courses = Template.bind({});
Teacher4Courses.args = {
  courses: courses.slice(0, 4),
  showAllCoursesLink: true,
  isTeacher: true,
};

export const Student5Courses = Template.bind({});
Student5Courses.args = {
  courses: courses.slice(0, 4),
  showAllCoursesLink: true,
  isTeacher: false,
  topCourse: topCourse,
};

export const Teacher7Courses = Template.bind({});
Teacher7Courses.args = {
  courses: courses,
  showAllCoursesLink: true,
  isTeacher: true,
};

export const Student7Courses = Template.bind({});
Student7Courses.args = {
  courses: courses.slice(0, 7),
  showAllCoursesLink: true,
  isTeacher: false,
  topCourse: topCourse,
};

export const Teacher4PLCourses = Template.bind({});
Teacher4PLCourses.args = {
  courses: plCourses.slice(0, 4),
  showAllCoursesLink: true,
  isProfessionalLearningCourse: true,
};

export const Teacher5PLCourses = Template.bind({});
Teacher5PLCourses.args = {
  courses: plCourses.slice(0, 4),
  showAllCoursesLink: true,
  isProfessionalLearningCourse: true,
  topCourse: topPlCourse,
};

export const Teacher7PLCourses = Template.bind({});
Teacher7PLCourses.args = {
  courses: plCourses,
  showAllCoursesLink: true,
  isProfessionalLearningCourse: true,
};
