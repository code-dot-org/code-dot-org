import React from 'react';
import Immutable from 'immutable';
import { UnconnectedCourseScript as CourseScript } from './CourseScript';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

const sectionId = '11';
const courseId = 123;
const unhiddenState = Immutable.fromJS({
  initialized: false,
  hideableStagesAllowed: false,
  stagesBySection: {},
  scriptsBySection: {},
});
const hiddenState = unhiddenState.setIn(['stagesBySection', sectionId, courseId.toString()], true);

const defaultProps = {
  title: 'CSP Unit 1 - The Internet',
  name: 'csp1',
  id: courseId,
  description: 'This unit explores the technical challenges and questions that ' +
    'arise from the need to represent digital information in computers and ' +
    'transfer it between people and computational devices. The unit then ' +
    'explores the structure and design of the internet and the implications of ' +
    'those design decisions.',
  viewAs: ViewType.Teacher,
  selectedSectionId: '',
  hiddenStageState: unhiddenState,
  hasNoSections: true,
  toggleHiddenScript: () => {},
};

export default storybook => {
  storybook
    .storiesOf('CourseScript', module)
    .addStoryTable([
      {
        name: 'Plain CourseScript',
        story: () => (
          <CourseScript
            {...defaultProps}
          />
        )
      },
      {
        name: 'With teacher info',
        story: () => (
          <CourseScript
            {...defaultProps}
            selectedSectionId={sectionId}
            hasNoSections={false}
          />
        )
      },
      {
        name: 'hidden as teacher',
        story: () => (
          <CourseScript
            {...defaultProps}
            selectedSectionId={sectionId}
            hasNoSections={false}
            hiddenStageState={hiddenState}
          />
        )
      },
      {
        name: 'no section selected',
        story: () => (
          <CourseScript
            {...defaultProps}
            hasNoSections={false}
            hiddenStageState={hiddenState}
          />
        )
      }
    ]);
};
