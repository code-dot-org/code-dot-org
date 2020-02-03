import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedTeacherSections as TeacherSections} from '@cdo/apps/templates/studioHomepages/TeacherSections';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
import OwnedSections from '@cdo/apps/templates/teacherDashboard/OwnedSections';

describe('TeacherSections', () => {
  const defaultProps = {
    asyncLoadSectionData: () => {}
  };

  it('renders an OwnedSections component', () => {
    const wrapper = shallow(<TeacherSections {...defaultProps} />);
    expect(wrapper).to.containMatchingElement(
      <ContentContainer heading="Classroom Sections">
        <OwnedSections />
      </ContentContainer>
    );
  });
});
