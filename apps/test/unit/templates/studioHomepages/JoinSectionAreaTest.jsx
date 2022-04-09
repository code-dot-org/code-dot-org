import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
import {joinedSections, joinedPlSections} from './homepagesTestData';
import {isolateComponent} from 'isolate-react';

const defaultProps = {
  initialJoinedPlSections: [],
  initialJoinedStudentSections: [],
  isTeacher: false
};

describe('JoinSectionArea', () => {
  it('shows student sections if has joined student sections', () => {
    const wrapper = isolateComponent(
      <JoinSectionArea
        {...defaultProps}
        initialJoinedStudentSections={joinedSections}
      />
    );
    expect(wrapper.findAll('JoinSection').length).to.equal(1);
    expect(wrapper.findAll('StudentSections').length).to.equal(1);
    expect(wrapper.findAll('StudentSections').props.isTeacher).to.equal(false);
  });
  it('shows participant sections for pl if has joined pl sections', () => {
    const wrapper = isolateComponent(
      <JoinSectionArea
        {...defaultProps}
        isTeacher={true}
        initialJoinedPlSections={joinedPlSections}
      />
    );
    expect(wrapper.findAll('JoinSection').length).to.equal(1);
    expect(wrapper.findAll('StudentSections').length).to.equal(1);
    expect(wrapper.findAll('StudentSections').props.isTeacher).to.equal(true);
  });
});
