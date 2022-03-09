import {assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {
  InstructionType,
  InstructorAudience,
  ParticipantAudience
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import CourseTypeEditor from '@cdo/apps/lib/levelbuilder/course-editor/CourseTypeEditor';

const defaultProps = {
  instructorAudience: InstructorAudience.teacher,
  participantAudience: ParticipantAudience.student,
  instructionType: InstructionType.teacher_led,
  handleInstructionTypeChange: () => {},
  handleInstructorAudienceChange: () => {},
  handleParticipantAudienceChange: () => {},
  allowMajorCurriculumChanges: true
};

describe('CourseTypeEditor', () => {
  it('participant audience dropdown is disabled if allowMajorCurriculumChanges is false', () => {
    const wrapper = shallow(
      <CourseTypeEditor {...defaultProps} allowMajorCurriculumChanges={false} />
    );
    assert.equal(
      wrapper.find('.participantAudienceSelector').props().disabled,
      true
    );
  });

  it('participant audience dropdown is not disabled if allowMajorCurriculumChanges is true', () => {
    const wrapper = shallow(
      <CourseTypeEditor {...defaultProps} allowMajorCurriculumChanges={true} />
    );
    assert.equal(
      wrapper.find('.participantAudienceSelector').props().disabled,
      false
    );
  });
});
