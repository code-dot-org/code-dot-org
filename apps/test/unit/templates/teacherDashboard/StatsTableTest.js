import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedStatsTable as StatsTable} from '@cdo/apps/templates/teacherDashboard/StatsTable';

const students = [
  {id: 3, name: 'Student C', familyName: 'Lastname A'},
  {id: 2, name: 'Student B', familyName: 'Lastname B'},
  {id: 1, name: 'Student A', familyName: 'Lastname C'},
];
const studentsCompletedLevelCount = {
  1: 15,
  2: 12,
  3: 65,
};

describe('StatsTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <StatsTable
        sectionId={1}
        students={students}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    expect(wrapper.find('table').exists()).toBe(true);
  });

  it('renders students as table rows', () => {
    const wrapper = mount(
      <StatsTable
        sectionId={1}
        students={students}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    const studentRows = wrapper.find('tbody').find('tr');
    expect(studentRows).toHaveLength(3);
  });

  it('sorts students by the correct name upon clicking the name header cells', () => {
    const wrapper = mount(
      <StatsTable
        sectionId={1}
        participantType="student"
        students={students}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    // first click on display name header should sort students A-Z
    wrapper.find('.uitest-display-name-header').simulate('click');
    let nameCells = wrapper.find('.uitest-display-name-cell');
    expect(nameCells.at(0).text()).toBe('Student A');
    expect(nameCells.at(1).text()).toBe('Student B');
    expect(nameCells.at(2).text()).toBe('Student C');

    // second click on display name header should sort students Z-A
    wrapper.find('.uitest-display-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-display-name-cell');
    expect(nameCells.at(0).text()).toBe('Student C');
    expect(nameCells.at(1).text()).toBe('Student B');
    expect(nameCells.at(2).text()).toBe('Student A');

    // first click on family name header should sort students by family name A-Z
    wrapper.find('.uitest-family-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-family-name-cell');
    expect(nameCells.at(0).text()).toBe('Lastname A');
    expect(nameCells.at(1).text()).toBe('Lastname B');
    expect(nameCells.at(2).text()).toBe('Lastname C');

    // second click on family name header should sort students by family name Z-A
    wrapper.find('.uitest-family-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-family-name-cell');
    expect(nameCells.at(0).text()).toBe('Lastname C');
    expect(nameCells.at(1).text()).toBe('Lastname B');
    expect(nameCells.at(2).text()).toBe('Lastname A');
  });

  it('does not render a family name field in PL sections', async () => {
    const wrapper = mount(
      <StatsTable
        sectionId={1}
        participantType="teacher"
        students={students}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    expect(wrapper.find('uitest-family-name-header').exists()).toBe(false);
    expect(wrapper.find('uitest-family-name-cell').exists()).toBe(false);
  });
});
