import {assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {
  InstructionType,
  InstructorAudience,
  ParticipantAudience,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import CourseTypeEditor from '@cdo/apps/lib/levelbuilder/course-editor/CourseTypeEditor';

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
    assert.equal(wrapper.find('select').at(0).props().disabled, true);
    assert.equal(wrapper.find('select').at(1).props().disabled, true);
    assert.equal(wrapper.find('select').at(2).props().disabled, true);
  });

  it('allow editing selects when allowMajorCurriculumChanges is true', () => {
    const wrapper = shallow(
      <CourseTypeEditor {...defaultProps} allowMajorCurriculumChanges={true} />
    );
    assert.equal(wrapper.find('select').at(0).props().disabled, false);
    assert.equal(wrapper.find('select').at(1).props().disabled, false);
    assert.equal(wrapper.find('select').at(2).props().disabled, false);
  });
});
