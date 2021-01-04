import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedVirtualizedDetailView} from '@cdo/apps/templates/sectionProgress/detail/VirtualizedDetailView';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

const studentData = [
  {id: '1', name: 'studentb'},
  {id: '3', name: 'studentc'},
  {id: '0', name: 'studenta'}
];

describe('VirtualizedSummaryView', () => {
  let defaultProps;

  beforeEach(() => {
    stubRedux();
    registerReducers({sectionProgress, scriptSelection, currentUser});
    defaultProps = {
      levelProgressByStudent: {
        '0': {
          '789': {
            status: 'perfect',
            result: 1,
            paired: false
          }
        },
        '1': {
          '789': {
            status: 'perfect',
            result: 1,
            paired: false
          }
        },
        '3': {
          '789': {
            status: 'perfect',
            result: 1,
            paired: false
          }
        }
      },
      lessonOfInterest: 1,
      section: {
        id: '1',
        script: {id: 123},
        students: studentData
      },
      scriptData: {
        id: 123,
        stages: [
          {
            id: 456,
            levels: [{id: '789'}]
          }
        ]
      },
      columnWidths: [150, 100],
      setLessonOfInterest: () => {}
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders a MultiGrid', () => {
    const wrapper = shallow(
      <UnconnectedVirtualizedDetailView {...defaultProps} />
    );
    expect(wrapper.find('MultiGrid').exists()).to.be.true;
  });

  it('renders a SectionProgressNameCell for each student', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <UnconnectedVirtualizedDetailView {...defaultProps} />
      </Provider>
    );
    const studentNames = wrapper.find('SectionProgressNameCell');
    expect(studentNames.at(0).text()).to.equal(studentData[0].name);
    expect(studentNames.at(1).text()).to.equal(studentData[1].name);
    expect(studentNames.at(2).text()).to.equal(studentData[2].name);
  });

  it('renders a detail progress cell for each stage for each student', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <UnconnectedVirtualizedDetailView {...defaultProps} />
      </Provider>
    );
    expect(wrapper.find('StudentProgressDetailCell')).to.have.length(3);
  });

  it('updates the grid when the levels change', () => {
    const forceUpdateGridsSpy = sinon.spy();
    const wrapper = shallow(
      <UnconnectedVirtualizedDetailView {...defaultProps} />
    );
    wrapper.instance().detailView = {forceUpdateGrids: forceUpdateGridsSpy};
    wrapper.setProps({levelProgressByStudent: {}});
    expect(forceUpdateGridsSpy).to.have.been.calledOnce;
  });
});
