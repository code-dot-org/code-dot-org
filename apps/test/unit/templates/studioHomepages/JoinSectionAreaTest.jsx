import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
import {joinedSections} from './homepagesTestData';

const DEFAULT_PROPS = {
  initialJoinedPlSections: [],
  initialJoinedStudentSections: [],
  isTeacher: false
};

describe('JoinSectionArea', () => {
  it('shows student sections if has joined student sections', () => {
    const wrapper = shallow(
      <JoinSectionArea
        {...DEFAULT_PROPS}
        initialJoinedStudentSections={joinedSections}
      />
    );
    expect(wrapper.find('JoinSection').length).to.equal(1);
    expect(wrapper.find('StudentSections').length).to.equal(1);
    expect(wrapper.find('StudentSections').props().isTeacher).to.equal(false);
  });
  it('shows participant sections for pl if has joined pl sections', () => {
    const wrapper = shallow(
      <JoinSectionArea
        {...DEFAULT_PROPS}
        isTeacher={true}
        initialJoinedPlSections={[]}
      />
    );
    expect(wrapper.find('JoinSection').length).to.equal(1);
    expect(wrapper.find('StudentSections').length).to.equal(1);
    expect(wrapper.find('StudentSections').props().isTeacher).to.equal(true);
  });
});
