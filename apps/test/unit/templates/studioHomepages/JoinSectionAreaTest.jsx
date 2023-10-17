import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
import {joinedSections, joinedPlSections} from './homepagesTestData';
import {shallow} from 'enzyme';

const defaultProps = {
  initialJoinedPlSections: [],
  initialJoinedStudentSections: [],
  isTeacher: false,
};

describe('JoinSectionArea', () => {
  it('shows student sections if has joined student sections', () => {
    const wrapper = shallow(
      <JoinSectionArea
        {...defaultProps}
        initialJoinedStudentSections={joinedSections}
      />
    );
    expect(wrapper.find('Connect(JoinSection)').length).to.equal(1);
    expect(wrapper.find('ParticipantSections').length).to.equal(1);
    expect(wrapper.find('ParticipantSections').props().isTeacher).to.equal(
      false
    );
  });
  it('shows participant sections for pl if has joined pl sections', () => {
    const wrapper = shallow(
      <JoinSectionArea
        {...defaultProps}
        isTeacher={true}
        initialJoinedPlSections={joinedPlSections}
      />
    );
    expect(wrapper.find('Connect(JoinSection)').length).to.equal(1);
    expect(wrapper.find('ParticipantSections').length).to.equal(1);
    expect(wrapper.find('ParticipantSections').props().isTeacher).to.equal(
      true
    );
  });
});
