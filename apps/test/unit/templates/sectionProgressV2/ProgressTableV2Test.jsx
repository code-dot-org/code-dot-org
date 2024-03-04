import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import ProgressTableV2 from '@cdo/apps/templates/sectionProgressV2/ProgressTableV2.jsx';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import sectionProgress, {
  addDataByUnit,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import teacherSections, {
  setStudentsForCurrentSection,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import currentUser, {
  setSortByFamilyName,
} from '@cdo/apps/templates/currentUserRedux';
import {Provider} from 'react-redux';

import {
  fakeLessonWithLevels,
  fakeUnitData,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import {createStore} from '@cdo/apps/templates/sectionProgress/sectionProgressTestHelpers';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const SERVER_STUDENT_1 = {...STUDENT_1, family_name: STUDENT_1.familyName};
const SERVER_STUDENT_2 = {...STUDENT_2, family_name: STUDENT_2.familyName};
const LESSONS = [1, 2, 3, 4, 5].map(index =>
  fakeLessonWithLevels({position: index}, index)
);
const SECTION_ID = 1;
const UNIT_DATA = fakeUnitData({lessons: LESSONS});
const DEFAULT_PROPS = {
  expandedLessonIds: [],
  setExpandedLessons: () => {},
  isSkeleton: false,
};

describe('ProgressTableV2', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      currentUser,
      sectionProgress,
      unitSelection,
      teacherSections,
    });

    store = getStore();
    store.dispatch(setScriptId(UNIT_DATA.id));
    store.dispatch(
      setSortByFamilyName(false, SECTION_ID, UNIT_DATA.name, 'test')
    );
    store.dispatch(
      setStudentsForCurrentSection(SECTION_ID, [
        SERVER_STUDENT_1,
        SERVER_STUDENT_2,
      ])
    );
    store.dispatch(selectSection(SECTION_ID));
    store.dispatch(addDataByUnit(UNIT_DATA));
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <ProgressTableV2 {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('sorts by display name by default', () => {
    renderDefault();

    const s1 = screen.getByText(STUDENT_1.name + ' ' + STUDENT_1.familyName);
    const s2 = screen.getByText(STUDENT_2.name + ' ' + STUDENT_2.familyName);
    expect(s1.compareDocumentPosition(s2)).to.equal(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('sorts by family name if toggled', () => {
    renderDefault();
    store.dispatch(
      setSortByFamilyName(true, SECTION_ID, UNIT_DATA.name, 'test')
    );

    const s1 = screen.getByText(STUDENT_1.name + ' ' + STUDENT_1.familyName);
    const s2 = screen.getByText(STUDENT_2.name + ' ' + STUDENT_2.familyName);
    expect(s1.compareDocumentPosition(s2)).to.equal(
      Node.DOCUMENT_POSITION_PRECEDING
    );
  });

  it('sorts null family names last', () => {
    store.dispatch(
      setStudentsForCurrentSection(SECTION_ID, [
        SERVER_STUDENT_1,
        {id: 3, name: 'Student 3'},
        SERVER_STUDENT_2,
      ])
    );
    renderDefault();
    store.dispatch(
      setSortByFamilyName(true, SECTION_ID, UNIT_DATA.name, 'test')
    );

    const s1 = screen.getByText(STUDENT_1.name + ' ' + STUDENT_1.familyName);
    const s2 = screen.getByText(STUDENT_2.name + ' ' + STUDENT_2.familyName);
    const nullNameStudent = screen.getByText('Student 3');
    expect(nullNameStudent.compareDocumentPosition(s2)).to.equal(
      Node.DOCUMENT_POSITION_PRECEDING
    );
    expect(nullNameStudent.compareDocumentPosition(s1)).to.equal(
      Node.DOCUMENT_POSITION_PRECEDING
    );
  });

  it('includes non-alphabetic characters in sorting', () => {
    store.dispatch(
      setStudentsForCurrentSection(SECTION_ID, [
        {id: 1, name: 'Student 1', family_name: '2Brown'},
        {id: 2, name: 'Student 2', family_name: 'Delta'},
        {id: 3, name: 'Student 3', family_name: '1Adams'},
        {id: 4, name: 'Student 4', family_name: '!Charles'},
      ])
    );
    renderDefault();
    store.dispatch(
      setSortByFamilyName(true, SECTION_ID, UNIT_DATA.name, 'test')
    );

    const sortedStudents = screen.getAllByText('Student', {exact: false});

    const expectedOrder = [4, 3, 1, 2];
    expectedOrder.forEach((id, index) => {
      expect(sortedStudents[index].textContent).to.contain(`Student ${id}`);
    });
  });

  it('sorts by name when family names are equivalent', () => {
    store.dispatch(
      setStudentsForCurrentSection(SECTION_ID, [
        {id: 1, name: 'C Student 1', familyName: 'Carlson'},
        {id: 2, name: 'A Student 2', familyName: 'Carlson'},
        {id: 3, name: 'B Student 3', familyName: 'Carlson'},
      ])
    );
    renderDefault();
    store.dispatch(
      setSortByFamilyName(true, SECTION_ID, UNIT_DATA.name, 'test')
    );

    const sortedStudents = screen.getAllByText('Student', {exact: false});
    const expectedOrder = [2, 3, 1];
    expectedOrder.forEach((id, index) => {
      expect(sortedStudents[index].textContent).to.contain(`Student ${id}`);
    });
  });

  it('nothing expanded', () => {
    store = createStore(2, 5);
    renderDefault();

    expect(screen.getAllByTitle('Expand')).to.have.lengthOf(4);
    expect(screen.queryAllByTitle('Unexpand')).to.have.lengthOf(0);
  });

  it('one lesson expanded', () => {
    store = createStore(2, 5);
    // ID 722 set by createStore
    renderDefault({expandedLessonIds: [722]});

    expect(screen.getAllByTitle('Expand')).to.have.lengthOf(3);
    screen.getByTitle('Unexpand');
  });

  it('multiple lessons expanded', () => {
    store = createStore(2, 5);
    // ID 722 & 1558 set by createStore
    renderDefault({expandedLessonIds: [722, 1558]});

    expect(screen.getAllByTitle('Expand')).to.have.lengthOf(2);
    expect(screen.getAllByTitle('Unexpand')).to.have.lengthOf(2);
  });
});
