import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
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

const DEFAULT_PROPS = {
  section: {
    id: 1,
    students: [TEST_STUDENT_1, TEST_STUDENT_2]
  },
  scriptData: {
    id: 144,
    name: 'csd1'
  },
  headers: ['Lesson'],
  studentTimestamps: {3: 1610435096000, 4: 0},
  localeCode: 'en-US',
  needsGutter: false
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

  it('displays body with overflow scroll if needsGutter is true', () => {
    const wrapper = setUp({needsGutter: true});
    const virtualizedBodyComponent = wrapper.find(Virtualized.Body);
    expect(virtualizedBodyComponent.props().style.overflowX).to.equal('scroll');
  });
});
