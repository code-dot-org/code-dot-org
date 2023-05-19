import React from 'react';
import Immutable from 'immutable';
import {UnconnectedCourseScript as CourseScript} from './CourseScript';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {reduxStore} from '../../../.storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'CourseScript',
  component: CourseScript,
};

const sectionId = 11;
const courseId = 123;
const unhiddenState = Immutable.fromJS({
  initialized: false,
  hideableLessonsAllowed: false,
  lessonsBySection: {},
  scriptsBySection: {},
});
const hiddenState = unhiddenState.setIn(
  ['lessonsBySection', sectionId.toString(), courseId.toString()],
  true
);

const defaultProps = {
  title: 'CSP Unit 1 - The Internet',
  name: 'csp1',
  id: courseId,
  description:
    'This unit explores the technical challenges and questions that ' +
    'arise from the need to represent digital information in computers and ' +
    'transfer it between people and computational devices. The unit then ' +
    'explores the structure and design of the internet and the implications of ' +
    'those design decisions.',
  viewAs: ViewType.Instructor,
  selectedSectionId: 11,
  hiddenLessonState: unhiddenState,
  hasNoSections: true,
  toggleHiddenScript: () => {},
  sectionsForDropdown: [
    {
      name: 'Section 11',
      id: 11,
      isAssigned: false,
    },
  ],
};

const Template = args => (
  <Provider store={reduxStore()}>
    <CourseScript {...defaultProps} {...args} />
  </Provider>
);

export const Default = Template.bind({});

export const WithTeacherInfo = Template.bind({});
WithTeacherInfo.args = {
  selectedSectionId: sectionId,
  hasNoSections: false,
};

export const HiddenAsTeacher = Template.bind({});
HiddenAsTeacher.args = {
  selectedSectionId: sectionId,
  hasNoSections: false,
  hiddenLessonState: hiddenState,
};

export const NoSectionSelected = Template.bind({});
NoSectionSelected.args = {
  hasNoSection: false,
  hiddenLessonState: hiddenState,
};
