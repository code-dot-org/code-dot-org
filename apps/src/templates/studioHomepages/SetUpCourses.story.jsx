import React from 'react';
import SetUpCourses from './SetUpCourses';

export default {
  title: 'SetUpCourses',
  component: SetUpCourses,
};

//
// TEMPLATE
//

const Template = args => <SetUpCourses {...args} />;

//
// STORIES
//

export const TeacherNoCourses = Template.bind({});
TeacherNoCourses.args = {
  isTeacher: true,
};

export const StudentNoCourses = Template.bind({});
StudentNoCourses.args = {
  isTeacher: false,
};

export const TeacherWithCourse = Template.bind({});
TeacherWithCourse.args = {
  isTeacher: true,
  hasCourse: true,
};

export const StudentWithCourse = Template.bind({});
StudentWithCourse.args = {
  isTeacher: false,
  hasCourse: true,
};
