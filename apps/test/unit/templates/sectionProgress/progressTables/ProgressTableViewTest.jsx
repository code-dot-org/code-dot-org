import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';
import {Provider} from 'react-redux';
import * as Sticky from 'reactabular-sticky';
import {createStore, combineReducers} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import locales from '@cdo/apps/redux/localesRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {
  fakeLessonWithLevels,
  fakeStudents,
  fakeUnitData,
  fakeProgressTableReduxInitialState,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';
import ProgressTableDetailCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailCell';
import * as progressTableHelpers from '@cdo/apps/templates/sectionProgress/progressTables/progressTableHelpers';
import {unitTestExports} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import ProgressTableLevelIconSet from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelIconSet';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
import ProgressTableSummaryCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryCell';
import ProgressTableView, {
  UnconnectedProgressTableView,
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import SummaryViewLegend from '@cdo/apps/templates/sectionProgress/progressTables/SummaryViewLegend';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const LESSON_1 = fakeLessonWithLevels({position: 1});
const LESSON_2 = fakeLessonWithLevels({position: 2}, 2);
const STUDENTS = fakeStudents(2);
const LESSONS = [LESSON_1, LESSON_2];
const SCRIPT_DATA = fakeUnitData({lessons: LESSONS});

const initialState = fakeProgressTableReduxInitialState(
  LESSONS,
  SCRIPT_DATA,
  STUDENTS
);

jest.mock(
  '@cdo/apps/templates/sectionProgress/progressTables/progress-table-constants.module.scss',
  () => ({
    MAX_ROWS: 14,
  })
);

const setUp = (currentView = ViewType.SUMMARY, overrideState = {}) => {
  const store = createStore(
    combineReducers({
      currentUser,
      progress,
      teacherSections,
      sectionProgress,
      unitSelection,
      locales,
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
    expect(wrapper.find(ProgressTableStudentList)).toHaveLength(1);
  });

  it('renders a ProgressTableContentView', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableContentView)).toHaveLength(1);
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
    expect(wrapper.find(ProgressTableContentView).props().needsGutter).toBe(
      true
    );
  });

  it('passes needsGutter false to the ProgressTableContentView when the student row height is less than the body height', () => {
    // 2 students will not exceed max height (default props)
    const wrapper = setUp();

    expect(wrapper.find(ProgressTableContentView).props().needsGutter).toBe(
      false
    );
  });

  describe('summary view', () => {
    it('renders a SummaryViewLegend', () => {
      const wrapper = setUp(ViewType.SUMMARY);
      expect(wrapper.find(SummaryViewLegend)).toHaveLength(1);
    });

    it('SummaryViewLegend prop showCSFProgressBox is true if scriptData.csf is true', () => {
      const overrideState = fakeProgressTableReduxInitialState(
        LESSONS,
        {...SCRIPT_DATA, csf: true},
        STUDENTS
      );

      const wrapper = setUp(ViewType.SUMMARY, overrideState);
      expect(wrapper.find(SummaryViewLegend).props().showCSFProgressBox).toBe(
        true
      );
    });

    it('renders a ProgressTableSummaryCell for each lesson for each student', () => {
      const wrapper = setUp(ViewType.SUMMARY);
      const expectedSummaryCellCount = STUDENTS.length * LESSONS.length;
      expect(wrapper.find(ProgressTableSummaryCell)).toHaveLength(
        expectedSummaryCellCount
      );
    });

    it('renders a single header for content and student list views', () => {
      const wrapper = setUp(ViewType.SUMMARY);

      const contentViewHeaders = wrapper
        .find(ProgressTableContentView)
        .find(Sticky.Header);
      expect(contentViewHeaders).toHaveLength(1);

      const studentListHeaders = wrapper
        .find(ProgressTableStudentList)
        .find(Sticky.Header);
      expect(studentListHeaders).toHaveLength(1);
    });

    it('calls getSummaryCellFormatters formatters when a row is expanded', () => {
      const timeSpentFormatterStub = jest.fn();
      const lastUpdatedFormatterStub = jest.fn();

      const getSummaryCellFormattersStub = jest
        .spyOn(progressTableHelpers, 'getSummaryCellFormatters')
        .mockClear()
        .mockImplementation();
      getSummaryCellFormattersStub.mockReturnValue([
        () => <div />, // main cell formatter
        timeSpentFormatterStub,
        lastUpdatedFormatterStub,
      ]);

      const container = setUp(ViewType.SUMMARY)
        .find(UnconnectedProgressTableView)
        .instance();
      const rowData = container.state.rows[0];
      React.act(() => {
        container.onToggleRow(rowData.student.id);
      });

      // one call for each of the two lessons
      expect(timeSpentFormatterStub).toHaveBeenCalledTimes(2);
      expect(lastUpdatedFormatterStub).toHaveBeenCalledTimes(2);
    });
  });

  describe('detail view', () => {
    it('renders the ProgressLegend', () => {
      const wrapper = setUp(ViewType.DETAIL);
      expect(wrapper.find(ProgressLegend)).toHaveLength(1);
    });

    it('passes `includeReviewStates` to ProgressLegend when unit is CSD', () => {
      const wrapper = setUp(ViewType.DETAIL);
      expect(wrapper.find(ProgressLegend).props().includeReviewStates).toBe(
        true
      );
    });

    it('renders ProgressTableDetailCells', () => {
      const wrapper = setUp(ViewType.DETAIL);
      // 2 students * 2 lessons = 4
      expect(wrapper.find(ProgressTableDetailCell)).toHaveLength(4);
    });

    it('renders header arrows', () => {
      const wrapper = setUp(ViewType.DETAIL);
      // 1 arrow for LESSON_2 with 2 levels
      expect(wrapper.find(unitTestExports.LessonArrow)).toHaveLength(1);
    });

    it('renders extra header rows', () => {
      const wrapper = setUp(ViewType.DETAIL);
      // there are two tableHeaders, 1 for the student list, and 1 for the content view
      // both should have two rows
      const tableHeaders = wrapper.find(Sticky.Header);
      expect(tableHeaders.at(0).props().headerRows.length).toBe(2);
      expect(tableHeaders.at(1).props().headerRows.length).toBe(2);
    });

    it('formats extra header with ProgressTableLevelIcons in the content view', () => {
      const wrapper = setUp(ViewType.DETAIL);
      const contentViewHeaders = wrapper
        .find(ProgressTableContentView)
        .find(Sticky.Header);
      // one ProgressTableLevelIconSet for each of the 2 lessons
      expect(contentViewHeaders.find(ProgressTableLevelIconSet)).toHaveLength(
        2
      );
    });

    it('calls timeSpent/lastUpdated formatters when a row is expanded', () => {
      const timeSpentFormatterStub = jest.fn();
      const lastUpdatedFormatterStub = jest.fn();

      const getDetailCellFormattersStub = jest
        .spyOn(progressTableHelpers, 'getDetailCellFormatters')
        .mockClear()
        .mockImplementation();
      getDetailCellFormattersStub.mockReturnValue([
        () => <div />, // main cell formatter
        timeSpentFormatterStub,
        lastUpdatedFormatterStub,
      ]);

      const container = setUp(ViewType.DETAIL)
        .find(UnconnectedProgressTableView)
        .instance();
      const rowData = container.state.rows[0];
      React.act(() => {
        container.onToggleRow(rowData.student.id);
      });

      // one call for each of the two lessons
      expect(timeSpentFormatterStub).toHaveBeenCalledTimes(2);
      expect(lastUpdatedFormatterStub).toHaveBeenCalledTimes(2);
    });
  });

  it('adds rows to state when a row is toggled', () => {
    const wrapper = setUp().find(UnconnectedProgressTableView).instance();

    expect(wrapper.state.rows).toHaveLength(STUDENTS.length);

    const numDetailRows = wrapper.numDetailRowsPerStudent();

    const rowData = wrapper.state.rows[0];
    React.act(() => {
      wrapper.onToggleRow(rowData.student.id);
    });
    expect(wrapper.state.rows).toHaveLength(STUDENTS.length + numDetailRows);
  });

  it('restores original rows when a row is toggled twice', () => {
    const wrapper = setUp().find(UnconnectedProgressTableView).instance();

    expect(wrapper.state.rows).toHaveLength(STUDENTS.length);

    const numDetailRows = wrapper.numDetailRowsPerStudent();

    const rowData = wrapper.state.rows[0];
    React.act(() => {
      wrapper.onToggleRow(rowData.student.id);
    });
    expect(wrapper.state.rows).toHaveLength(STUDENTS.length + numDetailRows);
    React.act(() => {
      wrapper.onToggleRow(rowData.student.id);
    });
    expect(wrapper.state.rows).toHaveLength(STUDENTS.length);
  });

  it('sorts by family name', () => {
    // The default test helper sorts by given name
    const givenNameWrapper = setUp()
      .find(UnconnectedProgressTableView)
      .instance();

    const overrideState = {currentUser: {isSortedByFamilyName: true}};
    const familyNameWrapper = setUp(ViewType.SUMMARY, overrideState)
      .find(UnconnectedProgressTableView)
      .instance();

    expect(givenNameWrapper.state.rows).toHaveLength(STUDENTS.length);
    expect(familyNameWrapper.state.rows).toHaveLength(STUDENTS.length);

    // The student generator makes the first student have the first given name
    // alphabetically. The last student has the first family name alphabetically
    expect(givenNameWrapper.state.rows[0].student.id).toBe(0);
    expect(familyNameWrapper.state.rows[0].student.id).toBe(
      STUDENTS.length - 1
    );
  });
});
