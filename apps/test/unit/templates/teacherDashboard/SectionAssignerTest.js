import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
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
});
