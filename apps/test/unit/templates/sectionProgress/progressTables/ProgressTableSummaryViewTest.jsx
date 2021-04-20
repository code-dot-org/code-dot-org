import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import progress from '@cdo/apps/code-studio/progressRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';
import locales from '@cdo/apps/redux/localesRedux';
import ProgressTableSummaryView, {
  UnconnectedProgressTableSummaryView
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryView';
import ProgressTableContainer, {
  UnconnectedProgressTableContainer
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContainer';
import SummaryViewLegend from '@cdo/apps/templates/sectionProgress/progressTables/SummaryViewLegend';
import ProgressTableSummaryCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryCell';
import * as Sticky from 'reactabular-sticky';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
import _ from 'lodash';
import {
  fakeLevels,
  fakeLessonWithLevels,
  fakeScriptData,
  fakeStudents,
  fakeProgressTableReduxInitialState
} from '@cdo/apps/templates/progress/progressTestHelpers';
import sinon from 'sinon';

const LESSON_1 = fakeLessonWithLevels({
  id: 1,
  position: 1,
  levels: fakeLevels(1)
});
const LESSON_2 = fakeLessonWithLevels({
  id: 2,
  position: 2,
  levels: fakeLevels(2)
});
const STAGES = [LESSON_1, LESSON_2];
const STUDENTS = fakeStudents(2);
const SCRIPT_DATA = fakeScriptData({stages: STAGES});

const initialState = fakeProgressTableReduxInitialState(
  STAGES,
  SCRIPT_DATA,
  STUDENTS
);

const setUp = (overrideState = {}) => {
  const store = createStore(
    combineReducers({
      progress,
      sectionData,
      sectionProgress,
      scriptSelection,
      locales
    }),
    _.merge(initialState, overrideState)
  );
  return mount(
    <Provider store={store}>
      <ProgressTableSummaryView />
    </Provider>
  );
};

describe('ProgressTableSummaryView', () => {
  it('renders a ProgressTableContainer', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableContainer)).to.have.length(1);
  });

  it('renders a SummaryViewLegend', () => {
    const wrapper = setUp();
    expect(wrapper.find(SummaryViewLegend)).to.have.length(1);
  });

  it('SummaryViewLegend prop showCSFProgressBox is true if scriptData.csf is true', () => {
    const wrapper = setUp({
      sectionProgress: {scriptDataByScript: {[SCRIPT_DATA.id]: {csf: true}}}
    });
    expect(wrapper.find(SummaryViewLegend).props().showCSFProgressBox).to.be
      .true;
  });

  it('renders a ProgressTableSummaryCell for each lesson for each student', () => {
    const wrapper = setUp();
    const expectedSummaryCellCount = STUDENTS.length * STAGES.length;
    expect(wrapper.find(ProgressTableSummaryCell)).to.have.length(
      expectedSummaryCellCount
    );
  });

  it('renders a single header for content and student list views', () => {
    const wrapper = setUp();

    const contentViewHeaders = wrapper
      .find(ProgressTableContentView)
      .find(Sticky.Header);
    expect(contentViewHeaders).to.have.length(1);

    const studentListHeaders = wrapper
      .find(ProgressTableStudentList)
      .find(Sticky.Header);
    expect(studentListHeaders).to.have.length(1);
  });

  it('calls timeSpent/lastUpdated formatters when a row is expanded', () => {
    sinon.spy(
      UnconnectedProgressTableSummaryView.prototype,
      'timeSpentCellFormatter'
    );
    sinon.spy(
      UnconnectedProgressTableSummaryView.prototype,
      'lastUpdatedCellFormatter'
    );
    const container = setUp()
      .find(UnconnectedProgressTableContainer)
      .instance();
    const rowData = container.state.rows[0];
    container.onToggleRow(rowData);

    // one call for each of the two lessons
    expect(
      UnconnectedProgressTableSummaryView.prototype.timeSpentCellFormatter
        .callCount
    ).to.equal(2);
    expect(
      UnconnectedProgressTableSummaryView.prototype.lastUpdatedCellFormatter
        .callCount
    ).to.equal(2);
  });
});
