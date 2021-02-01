import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
import * as Sticky from 'reactabular-sticky';
import ProgressTableStudentName from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentName';
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

describe('ProgressTableStudentList', () => {
  it('displays a header for each header in props.headers', () => {
    const headers = ['Lesson', 'Level Type'];
    const props = {...DEFAULT_PROPS, headers: headers};
    const wrapper = shallow(<ProgressTableStudentList {...props} />);
    const stickyHeaderComponent = wrapper.find(Sticky.Header);
    expect(stickyHeaderComponent.contains(headers[0]));
    expect(stickyHeaderComponent.contains(headers[1]));
  });

  it('displays a ProgressTableStudentName for each student', () => {
    const wrapper = mount(<ProgressTableStudentList {...DEFAULT_PROPS} />);
    expect(wrapper.find(ProgressTableStudentName)).to.have.length(2);
    expect(wrapper.contains('Joe')).to.equal(true);
    expect(wrapper.contains('Jamie')).to.equal(true);
  });

  it('displays body with overflow scroll if needsGutter is true', () => {
    const props = {...DEFAULT_PROPS, needsGutter: true};
    const wrapper = mount(<ProgressTableStudentList {...props} />);
    const virtualizedBodyComponent = wrapper.find(Virtualized.Body);
    expect(virtualizedBodyComponent.props().style.overflowX).to.equal('scroll');
  });
});
