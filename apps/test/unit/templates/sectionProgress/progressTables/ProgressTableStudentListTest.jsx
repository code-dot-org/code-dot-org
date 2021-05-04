import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import i18n from '@cdo/locale';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
import ProgressTableStudentName from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentName';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import {
  fakeRowsForStudents,
  fakeDetailRowsForStudent
} from '@cdo/apps/templates/sectionProgress/sectionProgressTestHelpers';

const TEST_STUDENT_1 = {
  id: 1,
  name: 'Joe'
};

const TEST_STUDENT_2 = {
  id: 2,
  name: 'Jamie'
};

const STUDENT_ROWS = fakeRowsForStudents([TEST_STUDENT_1, TEST_STUDENT_2]);
const DETAIL_ROWS = fakeDetailRowsForStudent(TEST_STUDENT_1);

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
    expect(studentRows.includes(STUDENT_ROWS[0])).to.be.true;
    expect(studentRows.includes(STUDENT_ROWS[1])).to.be.true;
  });

  it('passes prop showSectionProgressDetails to ProgressTableStudentName', () => {
    const wrapper = mount(
      <ProgressTableStudentList
        {...DEFAULT_PROPS}
        showSectionProgressDetails={true}
      />
    );
    expect(
      wrapper.first(ProgressTableStudentName).props().showSectionProgressDetails
    ).to.be.true;
  });

  it('displays detail labels if detail rows are passed in', () => {
    // reactabular initially only renders three rows, so we use a single
    // student to avoid needing to workaround that.
    const rows = [STUDENT_ROWS[0], ...DETAIL_ROWS];

    // we need to use mount for the rows to actually be rendered
    const wrapper = mount(
      <ProgressTableStudentList {...DEFAULT_PROPS} rows={rows} />
    );
    expect(wrapper.contains(i18n.timeSpentMins())).to.be.true;
    expect(wrapper.contains(i18n.lastUpdatedTitle())).to.be.true;
  });
});
