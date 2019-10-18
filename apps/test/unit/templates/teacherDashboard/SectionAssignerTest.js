import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionAssigner as SectionAssigner} from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

describe('SectionAssigner', () => {
  it('renders a TeacherSectionSelector', () => {
    const wrapper = mount(
      <SectionAssigner
        initialSelectedSectionId={fakeTeacherSectionsForDropdown[0].id}
        sections={fakeTeacherSectionsForDropdown}
        selectSection={() => {}}
        showAssignButton={false}
      />
    );

    expect(wrapper.find('TeacherSectionSelector').exists()).to.be.true;
  });

  it('renders an AssignButton', () => {
    const wrapper = mount(
      <SectionAssigner
        initialSelectedSectionId={fakeTeacherSectionsForDropdown[0].id}
        sections={fakeTeacherSectionsForDropdown}
        selectSection={() => {}}
        showAssignButton={true}
      />
    );

    expect(wrapper.find('AssignButton').exists()).to.be.true;
  });

  it('does not render an AssignButton if showAssignButton is false', () => {
    const wrapper = mount(
      <SectionAssigner
        initialSelectedSectionId={fakeTeacherSectionsForDropdown[0].id}
        sections={fakeTeacherSectionsForDropdown}
        selectSection={() => {}}
        showAssignButton={false}
      />
    );

    expect(wrapper.find('AssignButton').exists()).to.be.false;
  });

  // isAssigned == true for the section at index 1.
  it('renders an AssignedButton', () => {
    const wrapper = mount(
      <SectionAssigner
        initialSelectedSectionId={fakeTeacherSectionsForDropdown[1].id}
        sections={fakeTeacherSectionsForDropdown}
        selectSection={() => {}}
        showAssignButton={false}
      />
    );

    expect(wrapper.find('AssignedButton').exists()).to.be.true;
  });
});
