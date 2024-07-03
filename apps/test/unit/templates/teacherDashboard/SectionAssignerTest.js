import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedSectionAssigner as SectionAssigner} from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

describe('SectionAssigner', () => {
  // const store = createStore(combineReducers())
  const unassignedSection = fakeTeacherSectionsForDropdown[0];
  // const assignedSection = fakeTeacherSectionsForDropdown[1];
  const defaultProps = {
    selectedSectionId: unassignedSection.id,
    sections: fakeTeacherSectionsForDropdown,
    selectSection: () => {},
    showAssignButton: false,
  };

  it('renders a TeacherSectionSelector', () => {
    const wrapper = mount(<SectionAssigner {...defaultProps} />);

    expect(wrapper.find('TeacherSectionSelector').exists()).toBe(true);
  });

  it('does not render an MultipleAssignButton if showAssignButton is false', () => {
    const wrapper = mount(<SectionAssigner {...defaultProps} />);

    expect(wrapper.find('MultipleAssignButton').exists()).toBe(false);
  });

  it('renders an MultipleAssignButton', () => {
    const wrapper = shallow(
      <SectionAssigner {...defaultProps} showAssignButton={true} />
    );

    expect(wrapper.find('Connect(MultipleAssignButton)').exists()).toBe(true);
  });
});
