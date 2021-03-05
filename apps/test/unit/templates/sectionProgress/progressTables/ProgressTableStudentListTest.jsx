import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
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

const setUp = (overrideProps = {}) => {
  const store = createStore(
    combineReducers({
      sectionProgress
    }),
    {
      sectionProgress: {
        showSectionProgressDetails: false
      }
    }
  );

  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(
    <Provider store={store}>
      <ProgressTableStudentList {...props} />
    </Provider>
  );
};

describe('ProgressTableStudentList', () => {
  it('displays a header for each header in props.headers', () => {
    const headers = ['Lesson', 'Level Type'];
    const wrapper = setUp({headers});
    const stickyHeaderComponent = wrapper.find(Sticky.Header);
    expect(stickyHeaderComponent.contains(headers[0]));
    expect(stickyHeaderComponent.contains(headers[1]));
  });

  it('displays a ProgressTableStudentName for each student', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableStudentName)).to.have.length(2);
    expect(wrapper.contains('Joe')).to.be.true;
    expect(wrapper.contains('Jamie')).to.be.true;
  });

  it('displays body with overflow scroll if needsGutter is true', () => {
    const wrapper = setUp({needsGutter: true});
    const virtualizedBodyComponent = wrapper.find(Virtualized.Body);
    expect(virtualizedBodyComponent.props().style.overflowX).to.equal('scroll');
  });
});
