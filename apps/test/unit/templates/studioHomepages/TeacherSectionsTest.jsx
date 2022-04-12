import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTeacherSections as TeacherSections} from '@cdo/apps/templates/studioHomepages/TeacherSections';

describe('TeacherSections', () => {
  const defaultProps = {
    asyncLoadSectionData: () => {}
  };

  it('renders an OwnedSections component', () => {
    const wrapper = shallow(<TeacherSections {...defaultProps} />);
    expect(wrapper.find('Connect(ContentContainer)').length).to.equal(2);
    expect(wrapper.find('Connect(OwnedSections)').length).to.equal(2);
  });
});
