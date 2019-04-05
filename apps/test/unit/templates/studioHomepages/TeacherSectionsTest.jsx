import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTeacherSections as TeacherSections} from '@cdo/apps/templates/studioHomepages/TeacherSections';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import OwnedSections from '@cdo/apps/templates/teacherDashboard/OwnedSections';

describe('TeacherSections', () => {
  const defaultProps = {
    asyncLoadSectionData: () => {}
  };

  it('renders an OwnedSections component', () => {
    const wrapper = shallow(<TeacherSections {...defaultProps} />);
    expect(
      wrapper.containsMatchingElement(
        <ContentContainer heading="Classroom Sections">
          <OwnedSections />
        </ContentContainer>
      )
    ).to.be.ok;
  });
});
