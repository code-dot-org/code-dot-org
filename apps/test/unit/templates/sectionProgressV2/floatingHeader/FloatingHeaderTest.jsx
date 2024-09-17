import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {registerReducers, restoreRedux, stubRedux} from '@cdo/apps/redux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import sectionProgress, {
  addExpandedLesson,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {
  createStore,
  getScriptData,
} from '@cdo/apps/templates/sectionProgress/sectionProgressTestHelpers';
import FloatingHeader from '@cdo/apps/templates/sectionProgressV2/floatingHeader/FloatingHeader.jsx';
import teacherSections, {
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const SERVER_STUDENT_1 = {...STUDENT_1, family_name: STUDENT_1.familyName};
const SERVER_STUDENT_2 = {...STUDENT_2, family_name: STUDENT_2.familyName};
const SECTION_ID = 11;
const UNIT_DATA = getScriptData(5);

const DEFAULT_PROPS = {
  setScrollCallback: () => {},
  sortedStudents: [STUDENT_1, STUDENT_2],
  outsideTableRef: React.createRef(),
};

const NUM_DEFAULT_LESSONS = 4;

const EMPTY_DIV_TEXT = 'empty div child';

describe('FloatingHeader', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      sectionProgress,
      unitSelection,
      teacherSections,
    });
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(
    students = [SERVER_STUDENT_1, SERVER_STUDENT_2],
    propOverrides = {}
  ) {
    store = createStore(null, 5, students);
    store.dispatch(setStudentsForCurrentSection(SECTION_ID, students));

    render(
      <Provider store={store}>
        <FloatingHeader {...DEFAULT_PROPS} {...propOverrides}>
          <div>{EMPTY_DIV_TEXT}</div>
        </FloatingHeader>
      </Provider>
    );
  }

  it('nothing expanded', () => {
    renderDefault();

    // floating header doubles the number of lessons
    expect(screen.getAllByTitle('Expand')).to.have.lengthOf(
      NUM_DEFAULT_LESSONS
    );
    expect(screen.queryAllByTitle('Unexpand')).to.have.lengthOf(0);

    screen.getByText(EMPTY_DIV_TEXT);
  });

  it('one lesson expanded', async () => {
    renderDefault();
    store.dispatch(
      addExpandedLesson(UNIT_DATA.id, SECTION_ID, UNIT_DATA.lessons[0])
    );

    // floating header doubles the number of lessons
    expect(screen.getAllByTitle('Expand')).to.have.lengthOf(
      NUM_DEFAULT_LESSONS - 1
    );
    expect(screen.getAllByTitle('Unexpand')).to.have.lengthOf(1);

    screen.getByText(EMPTY_DIV_TEXT);
  });

  it('multiple lessons expanded', () => {
    store = createStore(2, 5);
    renderDefault();
    store.dispatch(
      addExpandedLesson(UNIT_DATA.id, SECTION_ID, UNIT_DATA.lessons[0])
    );
    store.dispatch(
      addExpandedLesson(UNIT_DATA.id, SECTION_ID, UNIT_DATA.lessons[1])
    );

    // floating header doubles the number of lessons
    expect(screen.getAllByTitle('Expand')).to.have.lengthOf(
      NUM_DEFAULT_LESSONS - 2
    );
    expect(screen.getAllByTitle('Unexpand')).to.have.lengthOf(2);

    screen.getByText(EMPTY_DIV_TEXT);
  });
});
