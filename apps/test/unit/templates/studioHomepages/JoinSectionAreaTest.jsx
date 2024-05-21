import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';

import {expect} from '../../../util/reconfiguredChai';

import {joinedSections, joinedPlSections} from './homepagesTestData';

const defaultProps = {
  initialJoinedPlSections: [],
  initialJoinedStudentSections: [],
  isTeacher: false,
  isPlSections: false,
};

describe('JoinSectionArea', () => {
  it('shows student sections if isPlSections is false and has joined student sections', () => {
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
  it('shows participant sections for pl if isPlSections is true and has joined pl sections', () => {
    const wrapper = shallow(
      <JoinSectionArea
        {...defaultProps}
        isTeacher={true}
        initialJoinedPlSections={joinedPlSections}
        isPlSections={true}
      />
    );
    expect(wrapper.find('Connect(JoinSection)').length).to.equal(1);
    expect(wrapper.find('ParticipantSections').length).to.equal(1);
    expect(wrapper.find('ParticipantSections').props().isTeacher).to.equal(
      true
    );
  });
});
