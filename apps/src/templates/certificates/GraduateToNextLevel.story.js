import React from 'react';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'Congrats/GraduateToNextLevel',
  component: GraduateToNextLevel,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <GraduateToNextLevel
      courseDesc="Ready for the next level? Students will do lots of things and use their brains to solve even more complex problems. By the end of this course, students will be able to do more things. Recommended for lots of grades."
      {...args}
    />
  </Provider>
);

export const DefaultCard = Template.bind({});
DefaultCard.args = {
  courseDesc: undefined,
};

export const Course2 = Template.bind({});
Course2.args = {
  scriptName: 'course2',
  courseTitle: 'Course 2',
};

export const Course3 = Template.bind({});
Course3.args = {
  scriptName: 'course3',
  courseTitle: 'Course 3',
};

export const Course4 = Template.bind({});
Course4.args = {
  scriptName: 'course4',
  courseTitle: 'Course 4',
};

export const CourseB = Template.bind({});
CourseB.args = {
  scriptName: 'courseb-2022',
  courseTitle: 'Course B',
};

export const CourseC = Template.bind({});
CourseC.args = {
  scriptName: 'coursec-2022',
  courseTitle: 'Course C',
};

export const CourseD = Template.bind({});
CourseD.args = {
  scriptName: 'coursed-2022',
  courseTitle: 'Course D',
};

export const CourseE = Template.bind({});
CourseE.args = {
  scriptName: 'coursee-2022',
  courseTitle: 'Course E',
};

export const CourseF = Template.bind({});
CourseF.args = {
  scriptName: 'coursef-2022',
  courseTitle: 'Course F',
};

export const AppLabIntro = Template.bind({});
AppLabIntro.args = {
  scriptName: 'applab-intro',
  courseTitle: 'App Lab Intro',
};
