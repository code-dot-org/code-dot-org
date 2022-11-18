import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionAssigner as SectionAssigner} from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

describe('SectionAssigner', () => {
  const unassignedSection = fakeTeacherSectionsForDropdown[0];
  const defaultProps = {
    selectedSectionId: unassignedSection.id,
    sections: fakeTeacherSectionsForDropdown,
    selectSection: () => {},
    showAssignButton: false
  };

  it('renders a TeacherSectionSelector', () => {
    const wrapper = shallow(<SectionAssigner {...defaultProps} />);

    expect(wrapper.find('TeacherSectionSelector').exists()).to.be.true;
  });
});
