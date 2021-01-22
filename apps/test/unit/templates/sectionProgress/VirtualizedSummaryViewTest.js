import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedVirtualizedSummaryView} from '@cdo/apps/templates/sectionProgress/summary/VirtualizedSummaryView';
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
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'}
];

describe('VirtualizedSummaryView', () => {
  let defaultProps;

  beforeEach(() => {
    stubRedux();
    registerReducers({sectionProgress, scriptSelection, currentUser});
    defaultProps = {
      levelsByLesson: {
        0: {
          0: [{id: 789, status: 'perfect'}]
        },
        1: {
          0: [{id: 789, status: 'perfect'}]
        },
        3: {
          0: [{id: 789, status: 'perfect'}]
        }
      },
      lessonOfInterest: 1,
      section: {
        id: 1,
        script: {id: 123},
        students: studentData
      },
      scriptData: {
        id: 123,
        stages: [
          {
            id: 456,
            position: 1,
            relative_position: 2,
            lockable: true,
            hasLessonPlan: false,
            levels: [{id: 789}]
          }
        ]
      },
      jumpToLessonDetails: () => {}
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders a MultiGrid', () => {
    const wrapper = shallow(
      <UnconnectedVirtualizedSummaryView {...defaultProps} />
    );
    expect(wrapper.find('MultiGrid').exists()).to.be.true;
  });

  it('renders a SectionProgressNameCell for each student', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <UnconnectedVirtualizedSummaryView {...defaultProps} />
      </Provider>
    );
    const studentNames = wrapper.find('SectionProgressNameCell');
    expect(studentNames.at(0).text()).to.equal(studentData[0].name);
    expect(studentNames.at(1).text()).to.equal(studentData[1].name);
    expect(studentNames.at(2).text()).to.equal(studentData[2].name);
  });

  it('renders a summary cell for each stage for each student', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <UnconnectedVirtualizedSummaryView {...defaultProps} />
      </Provider>
    );
    expect(wrapper.find('StudentProgressSummaryCell')).to.have.length(3);
  });

  it('updates the grid when the levels change', () => {
    const forceUpdateGridsSpy = sinon.spy();
    const wrapper = shallow(
      <UnconnectedVirtualizedSummaryView {...defaultProps} />
    );
    wrapper.instance().summaryView = {forceUpdateGrids: forceUpdateGridsSpy};
    wrapper.setProps({levelsByLesson: {}});
    expect(forceUpdateGridsSpy).to.have.been.calledOnce;
  });
});
