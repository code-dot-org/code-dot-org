import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionAssigner as SectionAssigner} from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

describe('SectionAssigner', () => {
  // const store = createStore(combineReducers())
  const unassignedSection = fakeTeacherSectionsForDropdown[0];
  const assignedSection = fakeTeacherSectionsForDropdown[1];
  const defaultProps = {
    selectedSectionId: unassignedSection.id,
    sections: fakeTeacherSectionsForDropdown,
    selectSection: () => {},
    showAssignButton: false
  };

  it('renders a TeacherSectionSelector', () => {
    const wrapper = mount(<SectionAssigner {...defaultProps} />);

    expect(wrapper.find('TeacherSectionSelector').exists()).to.be.true;
  });

  it('does not render an AssignButton if showAssignButton is false', () => {
    const wrapper = mount(<SectionAssigner {...defaultProps} />);

    expect(wrapper.find('AssignButton').exists()).to.be.false;
  });

  it('renders an AssignButton', () => {
    const wrapper = shallow(
      <SectionAssigner {...defaultProps} showAssignButton={true} />
    );

    expect(wrapper.find('Connect(AssignButton)').exists()).to.be.true;
  });

  it('renders an UnassignButton', () => {
    const wrapper = shallow(
      <SectionAssigner
        {...defaultProps}
        selectedSectionId={assignedSection.id}
      />
    );

    expect(wrapper.find('Connect(UnassignButton)').exists()).to.be.true;
  });
});
