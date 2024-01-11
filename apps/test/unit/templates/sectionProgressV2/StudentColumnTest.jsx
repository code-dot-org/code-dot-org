import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StudentColumn from '@cdo/apps/templates/sectionProgressV2/StudentColumn.jsx';
import SortByNameDropdown from '@cdo/apps/templates/SortByNameDropdown';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';

const studentA = {
  name: 'Sherlock',
  familyName: 'Holmes',
  id: 1,
};

const studentB = {
  name: 'John',
  familyName: 'Watson',
  id: 2,
};

const oneNameStudent = {
  name: 'Moriarty',
  id: 3,
};

describe('StudentColumn', () => {
  it('shows SortByNameDropdown', () => {
    const wrapper = shallow(
      <StudentColumn sectionId={1} unitName="test unit" sortedStudents={[]} />
    );
    expect(wrapper.find(SortByNameDropdown)).to.have.length(1);
    const dropdown = wrapper.find(SortByNameDropdown);
    expect(dropdown.props().sectionId).to.equal(1);
    expect(dropdown.props().source).to.equal('SectionProgressV2');
  });

  it('shows no students if empty', () => {
    const wrapper = shallow(
      <StudentColumn sectionId={1} unitName="test unit" sortedStudents={[]} />
    );
    expect(wrapper.find(`.${styles.gridBox}`)).to.have.length(0);
  });

  it('shows all students', () => {
    const wrapper = shallow(
      <StudentColumn
        sectionId={1}
        unitName="test unit"
        sortedStudents={[studentA, studentB]}
      />
    );
    console.log(wrapper.debug());
    expect(wrapper.find(`.${styles.gridBox}`)).to.have.length(2);
  });

  it('joins family name and name if both are present', () => {
    const wrapper = shallow(
      <StudentColumn
        sectionId={1}
        unitName="test unit"
        sortedStudents={[studentA]}
      />
    );
    expect(wrapper.find(`.${styles.gridBox}`).text()).to.equal(
      'Sherlock Holmes'
    );
  });

  it('shows only name if family name is missing', () => {
    const wrapper = shallow(
      <StudentColumn
        sectionId={1}
        unitName="test unit"
        sortedStudents={[oneNameStudent]}
      />
    );
    expect(wrapper.find(`.${styles.gridBox}`).text()).to.equal('Moriarty');
  });
});
