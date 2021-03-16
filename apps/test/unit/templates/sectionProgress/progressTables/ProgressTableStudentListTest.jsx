import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
import {ProgressTableTextLabelCell} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableTextCells';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';

const TEST_STUDENT_1 = {
  id: 1,
  name: 'Joe'
};

const TEST_STUDENT_2 = {
  id: 2,
  name: 'Jamie'
};

const STUDENT_ROWS = [
  {id: '1.0', student: TEST_STUDENT_1, expansionIndex: 0},
  {id: '2.0', student: TEST_STUDENT_2, expansionIndex: 0}
];

const DETAIL_ROWS = [
  {id: '2.1', student: TEST_STUDENT_2, expansionIndex: 1},
  {id: '2.2', student: TEST_STUDENT_2, expansionIndex: 2}
];

const DEFAULT_PROPS = {
  sectionId: 1,
  scriptData: {
    id: 144,
    name: 'csd1'
  },
  rows: STUDENT_ROWS,
  onRow: () => {},
  headers: ['Lesson'],
  studentTimestamps: {3: 1610435096000, 4: 0},
  onToggleRow: () => {}
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ProgressTableStudentList {...props} />);
};

describe('ProgressTableStudentList', () => {
  it('displays a header for each header in props.headers', () => {
    const headers = ['Lesson', 'Level Type'];
    const wrapper = setUp({headers});
    const stickyHeaderComponent = wrapper.find(Sticky.Header);
    expect(stickyHeaderComponent.contains(headers[0]));
    expect(stickyHeaderComponent.contains(headers[1]));
  });

  it('displays a name for each student', () => {
    const wrapper = setUp();
    const studentRows = wrapper.find(Virtualized.Body).props().rows;
    expect(studentRows).to.have.length(2);
    expect(studentRows.includes(TEST_STUDENT_1)).to.be.true;
    expect(studentRows.includes(TEST_STUDENT_2)).to.be.true;
  });

  it('displays text cells if detail rows are passed in', () => {
    const wrapper = setUp({rows: [...STUDENT_ROWS, ...DETAIL_ROWS]});
    expect(wrapper.find(ProgressTableTextLabelCell)).to.have.lengthOf(2);
  });
});
