import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import TeacherSectionSelector from '@cdo/apps/templates/teacherDashboard/TeacherSectionSelector';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

describe('TeacherSectionSelectorTest', () => {
  it('shows num assigned as dropdown test', () => {
    const wrapper = shallow(
      <TeacherSectionSelector
        sections={fakeTeacherSectionsForDropdown}
        onChangeSection={() => {}}
      />
    );
    expect(wrapper.text()).to.include('Assigned to 1 section');
  });
});
