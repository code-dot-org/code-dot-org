import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

describe('SectionAssigner', () => {
  it('renders a TeacherSectionSelector', () => {
    const wrapper = mount(
      <SectionAssigner
        initialSelectedSection={fakeTeacherSectionsForDropdown[0]}
        sections={fakeTeacherSectionsForDropdown}
      />
    );

    expect(wrapper.find('TeacherSectionSelector').exists()).to.be.true;
  });

  it('renders an AssignButton', () => {
    const wrapper = mount(
      <SectionAssigner
        initialSelectedSection={fakeTeacherSectionsForDropdown[0]}
        sections={fakeTeacherSectionsForDropdown}
      />
    );

    expect(wrapper.find('AssignButton').exists()).to.be.true;
  });

  // isAssigned == true for the section at index 1.
  it('renders an AssignedButton', () => {
    const wrapper = mount(
      <SectionAssigner
        initialSelectedSection={fakeTeacherSectionsForDropdown[1]}
        sections={fakeTeacherSectionsForDropdown}
      />
    );

    expect(wrapper.find('AssignedButton').exists()).to.be.true;
  });
});
