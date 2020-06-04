import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedStatsTable as StatsTable} from '@cdo/apps/templates/teacherDashboard/StatsTable';

const students = [
  {id: 3, name: 'Student C'},
  {id: 2, name: 'Student B'},
  {id: 1, name: 'Student A'}
];
const studentsCompletedLevelCount = {
  1: 15,
  2: 12,
  3: 65
};
const section = {
  id: 1,
  students
};

describe('StatsTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <StatsTable
        section={section}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    expect(wrapper.find('table').exists()).to.be.true;
  });

  it('renders students as table rows', () => {
    const wrapper = mount(
      <StatsTable
        section={section}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    const studentRows = wrapper.find('tbody').find('tr');
    expect(studentRows).to.have.length(3);
  });

  it('sorts students by name upon clicking student name header cell', () => {
    const wrapper = mount(
      <StatsTable
        section={section}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    // first click should sort students A-Z
    wrapper.find('.uitest-name-header').simulate('click');
    let nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0).text()).to.equal('Student A');
    expect(nameCells.at(1).text()).to.equal('Student B');
    expect(nameCells.at(2).text()).to.equal('Student C');

    // second click should sort students Z-A
    wrapper.find('.uitest-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0).text()).to.equal('Student C');
    expect(nameCells.at(1).text()).to.equal('Student B');
    expect(nameCells.at(2).text()).to.equal('Student A');
  });
});
