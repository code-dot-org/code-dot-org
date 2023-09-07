import React from 'react';
import DCDO from '@cdo/apps/dcdo';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
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

    expect(wrapper.find('table').exists()).to.be.true;
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
    expect(studentRows).to.have.length(3);
  });

  it('sorts students by the correct name upon clicking the name header cells', () => {
    DCDO.reset();
    DCDO.set('family-name-features-p3', true);

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
    expect(nameCells.at(0).text()).to.equal('Student A');
    expect(nameCells.at(1).text()).to.equal('Student B');
    expect(nameCells.at(2).text()).to.equal('Student C');

    // second click on display name header should sort students Z-A
    wrapper.find('.uitest-display-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-display-name-cell');
    expect(nameCells.at(0).text()).to.equal('Student C');
    expect(nameCells.at(1).text()).to.equal('Student B');
    expect(nameCells.at(2).text()).to.equal('Student A');

    // first click on family name header should sort students by family name A-Z
    wrapper.find('.uitest-family-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-family-name-cell');
    expect(nameCells.at(0).text()).to.equal('Lastname A');
    expect(nameCells.at(1).text()).to.equal('Lastname B');
    expect(nameCells.at(2).text()).to.equal('Lastname C');

    // second click on family name header should sort students by family name Z-A
    wrapper.find('.uitest-family-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-family-name-cell');
    expect(nameCells.at(0).text()).to.equal('Lastname C');
    expect(nameCells.at(1).text()).to.equal('Lastname B');
    expect(nameCells.at(2).text()).to.equal('Lastname A');

    DCDO.reset();
  });

  it('does not render a family name field in PL sections', async () => {
    DCDO.reset();
    DCDO.set('family-name-features-p3', true);

    const wrapper = mount(
      <StatsTable
        sectionId={1}
        participantType="teacher"
        students={students}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />
    );

    expect(wrapper.find('uitest-family-name-header').exists()).to.be.false;
    expect(wrapper.find('uitest-family-name-cell').exists()).to.be.false;

    DCDO.reset();
  });
});
