import React from 'react';
import sinon from 'sinon';
import _ from 'lodash';
import {Provider} from 'react-redux';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import ProgressTableView, {
  UnconnectedProgressTableView
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';
import SummaryViewLegend from '@cdo/apps/templates/sectionProgress/progressTables/SummaryViewLegend';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import ProgressTableSummaryCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryCell';
import ProgressTableDetailCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailCell';
import ProgressTableLevelIconSet from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelIconSet';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {createStore, combineReducers} from 'redux';
import progress from '@cdo/apps/code-studio/progressRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';
import {unitTestExports} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import * as Sticky from 'reactabular-sticky';
import locales from '@cdo/apps/redux/localesRedux';
import {
  fakeLessonWithLevels,
  fakeStudents,
  fakeScriptData,
  fakeProgressTableReduxInitialState
} from '@cdo/apps/templates/progress/progressTestHelpers';
import * as progressTableHelpers from '@cdo/apps/templates/sectionProgress/progressTables/progressTableHelpers';

const LESSON_1 = fakeLessonWithLevels({position: 1});
const LESSON_2 = fakeLessonWithLevels({position: 2}, 2);
const STUDENTS = fakeStudents(2);
const LESSONS = [LESSON_1, LESSON_2];
const SCRIPT_DATA = fakeScriptData({stages: LESSONS});

const initialState = fakeProgressTableReduxInitialState(
  LESSONS,
  SCRIPT_DATA,
  STUDENTS
);

const setUp = (currentView = ViewType.SUMMARY, overrideState = {}) => {
  const store = createStore(
    combineReducers({
      progress,
      sectionData,
      sectionProgress,
      scriptSelection,
      locales
    }),
    _.merge({}, initialState, overrideState)
  );
  return mount(
    <Provider store={store}>
      <ProgressTableView currentView={currentView} />
    </Provider>
  );
};

describe('ProgressTableView', () => {
  it('renders a ProgressTableStudentList', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableStudentList)).to.have.length(1);
  });

  it('renders a ProgressTableContentView', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableContentView)).to.have.length(1);
  });

  it('passes needsGutter true to the ProgressTableContentView when the student row height exceeds the body height', () => {
    // 18 students will exceed max height
    const students = Array(18)
      .fill()
      .map((x, i) => ({id: i, name: `student-${i}`}));

    const overrideState = fakeProgressTableReduxInitialState(
      LESSONS,
      SCRIPT_DATA,
      students
    );

    const wrapper = setUp(ViewType.SUMMARY, overrideState);
    expect(wrapper.find(ProgressTableContentView).props().needsGutter).to.be
      .true;
  });

  it('passes needsGutter false to the ProgressTableContentView when the student row height is less than the body height', () => {
    // 2 students will not exceed max height (default props)
    const wrapper = setUp();

    expect(wrapper.find(ProgressTableContentView).props().needsGutter).to.be
      .false;
  });

  it('passes showSectionProgressDetails down to ProgressTableStudentList', () => {
    const overrideState = {sectionProgress: {showSectionProgressDetails: true}};
    const wrapper = setUp(ViewType.SUMMARY, overrideState);
    expect(
      wrapper.find(ProgressTableStudentList).props().showSectionProgressDetails
    ).to.be.true;
  });

  describe('summary view', () => {
    it('renders a SummaryViewLegend', () => {
      const wrapper = setUp(ViewType.SUMMARY);
      expect(wrapper.find(SummaryViewLegend)).to.have.length(1);
    });

    it('SummaryViewLegend prop showCSFProgressBox is true if scriptData.csf is true', () => {
      const overrideState = fakeProgressTableReduxInitialState(
        LESSONS,
        {...SCRIPT_DATA, csf: true},
        STUDENTS
      );

      const wrapper = setUp(ViewType.SUMMARY, overrideState);
      expect(wrapper.find(SummaryViewLegend).props().showCSFProgressBox).to.be
        .true;
    });

    it('renders a ProgressTableSummaryCell for each lesson for each student', () => {
      const wrapper = setUp(ViewType.SUMMARY);
      const expectedSummaryCellCount = STUDENTS.length * LESSONS.length;
      expect(wrapper.find(ProgressTableSummaryCell)).to.have.length(
        expectedSummaryCellCount
      );
    });

    it('renders a single header for content and student list views', () => {
      const wrapper = setUp(ViewType.SUMMARY);

      const contentViewHeaders = wrapper
        .find(ProgressTableContentView)
        .find(Sticky.Header);
      expect(contentViewHeaders).to.have.length(1);

      const studentListHeaders = wrapper
        .find(ProgressTableStudentList)
        .find(Sticky.Header);
      expect(studentListHeaders).to.have.length(1);
    });

    it('calls getSummaryCellFormatters formatters when a row is expanded', () => {
      const timeSpentFormatterStub = sinon.spy();
      const lastUpdatedFormatterStub = sinon.spy();

      const getSummaryCellFormattersStub = sinon.stub(
        progressTableHelpers,
        'getSummaryCellFormatters'
      );
      getSummaryCellFormattersStub.returns([
        () => <div />, // main cell formatter
        timeSpentFormatterStub,
        lastUpdatedFormatterStub
      ]);

      const container = setUp(ViewType.SUMMARY)
        .find(UnconnectedProgressTableView)
        .instance();
      const rowData = container.state.rows[0];
      container.onToggleRow(rowData.student.id);

      // one call for each of the two lessons
      expect(timeSpentFormatterStub.callCount).to.equal(2);
      expect(lastUpdatedFormatterStub.callCount).to.equal(2);
    });
  });

  describe('detail view', () => {
    it('renders the ProgressLegend', () => {
      const wrapper = setUp(ViewType.DETAIL);
      expect(wrapper.find(ProgressLegend)).to.have.length(1);
    });

    it('renders ProgressTableDetailCells', () => {
      const wrapper = setUp(ViewType.DETAIL);
      // 2 students * 2 lessons = 4
      expect(wrapper.find(ProgressTableDetailCell)).to.have.length(4);
    });

    it('renders header arrows', () => {
      const wrapper = setUp(ViewType.DETAIL);
      // 1 arrow for LESSON_2 with 2 levels
      expect(wrapper.find(unitTestExports.LessonArrow)).to.have.length(1);
    });

    it('renders extra header rows', () => {
      const wrapper = setUp(ViewType.DETAIL);
      // there are two tableHeaders, 1 for the student list, and 1 for the content view
      // both should have two rows
      const tableHeaders = wrapper.find(Sticky.Header);
      expect(tableHeaders.at(0).props().headerRows.length).to.equal(2);
      expect(tableHeaders.at(1).props().headerRows.length).to.equal(2);
    });

    it('formats extra header with ProgressTableLevelIcons in the content view', () => {
      const wrapper = setUp(ViewType.DETAIL);
      const contentViewHeaders = wrapper
        .find(ProgressTableContentView)
        .find(Sticky.Header);
      // one ProgressTableLevelIconSet for each of the 2 lessons
      expect(contentViewHeaders.find(ProgressTableLevelIconSet)).to.have.length(
        2
      );
    });

    it('calls timeSpent/lastUpdated formatters when a row is expanded', () => {
      const timeSpentFormatterStub = sinon.spy();
      const lastUpdatedFormatterStub = sinon.spy();

      const getDetailCellFormattersStub = sinon.stub(
        progressTableHelpers,
        'getDetailCellFormatters'
      );
      getDetailCellFormattersStub.returns([
        () => <div />, // main cell formatter
        timeSpentFormatterStub,
        lastUpdatedFormatterStub
      ]);

      const container = setUp(ViewType.DETAIL)
        .find(UnconnectedProgressTableView)
        .instance();
      const rowData = container.state.rows[0];
      container.onToggleRow(rowData.student.id);

      // one call for each of the two lessons
      expect(timeSpentFormatterStub.callCount).to.equal(2);
      expect(lastUpdatedFormatterStub.callCount).to.equal(2);
    });
  });

  it('adds rows to state when a row is toggled', () => {
    const wrapper = setUp()
      .find(UnconnectedProgressTableView)
      .instance();

    expect(wrapper.state.rows).to.have.lengthOf(STUDENTS.length);

    const numDetailRows = wrapper.numDetailRowsPerStudent();

    const rowData = wrapper.state.rows[0];
    wrapper.onToggleRow(rowData.student.id);
    expect(wrapper.state.rows).to.have.lengthOf(
      STUDENTS.length + numDetailRows
    );
  });

  it('restores original rows when a row is toggled twice', () => {
    const wrapper = setUp()
      .find(UnconnectedProgressTableView)
      .instance();

    expect(wrapper.state.rows).to.have.lengthOf(STUDENTS.length);

    const numDetailRows = wrapper.numDetailRowsPerStudent();

    const rowData = wrapper.state.rows[0];
    wrapper.onToggleRow(rowData.student.id);
    expect(wrapper.state.rows).to.have.lengthOf(
      STUDENTS.length + numDetailRows
    );
    wrapper.onToggleRow(rowData.student.id);
    expect(wrapper.state.rows).to.have.lengthOf(STUDENTS.length);
  });
});
