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
  cannotChangeParticipantType: false
};

describe('CourseTypeEditor', () => {
  it('participant audience dropdown is disabled if cannotChangeParticipantType is true', () => {
    const wrapper = shallow(
      <CourseTypeEditor {...defaultProps} cannotChangeParticipantType={true} />
    );
    assert.equal(
      wrapper.find('.participantAudienceSelector').props().disabled,
      true
    );
  });

  it('participant audience dropdown is not disabled if cannotChangeParticipantType is false', () => {
    const wrapper = shallow(<CourseTypeEditor {...defaultProps} />);
    assert.equal(
      wrapper.find('.participantAudienceSelector').props().disabled,
      false
    );
  });
});
