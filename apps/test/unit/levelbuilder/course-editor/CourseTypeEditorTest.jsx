import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  InstructionType,
  InstructorAudience,
  ParticipantAudience,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import CourseTypeEditor from '@cdo/apps/levelbuilder/course-editor/CourseTypeEditor';

const defaultProps = {
  instructorAudience: InstructorAudience.teacher,
  participantAudience: ParticipantAudience.student,
  instructionType: InstructionType.teacher_led,
  handleInstructionTypeChange: () => {},
  handleInstructorAudienceChange: () => {},
  handleParticipantAudienceChange: () => {},
  allowMajorCurriculumChanges: true,
};

describe('CourseTypeEditor', () => {
  it('disables all selects when allowMajorCurriculumChanges is false', () => {
    const wrapper = shallow(
      <CourseTypeEditor {...defaultProps} allowMajorCurriculumChanges={false} />
    );
    expect(wrapper.find('select').at(0).props().disabled).toEqual(true);
    expect(wrapper.find('select').at(1).props().disabled).toEqual(true);
    expect(wrapper.find('select').at(2).props().disabled).toEqual(true);
  });

  it('allow editing selects when allowMajorCurriculumChanges is true', () => {
    const wrapper = shallow(
      <CourseTypeEditor {...defaultProps} allowMajorCurriculumChanges={true} />
    );
    expect(wrapper.find('select').at(0).props().disabled).toEqual(false);
    expect(wrapper.find('select').at(1).props().disabled).toEqual(false);
    expect(wrapper.find('select').at(2).props().disabled).toEqual(false);
  });
});
