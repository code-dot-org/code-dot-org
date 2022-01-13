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
  canChangeParticipantType: false
};

describe('CourseTypeEditor', () => {
  it('participant audience dropdown is disabled unless canChangeParticipantType is true', () => {
    const wrapper = shallow(
      <CourseTypeEditor {...defaultProps} canChangeParticipantType={false} />
    );
    assert.equal(
      wrapper.find('.participantAudienceSelector').props().disabled,
      true
    );
  });

  it('participant audience dropdown is not disabled if canChangeParticipantType is true', () => {
    const wrapper = shallow(<CourseTypeEditor {...defaultProps} />);
    assert.equal(
      wrapper.find('.participantAudienceSelector').props().disabled,
      false
    );
  });
});
