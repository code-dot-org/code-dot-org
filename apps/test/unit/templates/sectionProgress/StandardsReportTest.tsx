import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import unitSelection, {
  setCoursesWithProgress,
  setScriptId,
} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import sectionProgress, {
  addDataByUnit,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionStandardsProgress, {
  setStandardsData,
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import StandardsReport from '@cdo/apps/templates/sectionProgress/standards/StandardsReport';
import teacherSections, {
  selectSection,
  setSections,
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';

// TODO: convert to @testing-library/react
const DEFAULT_PROPS = {
  scriptId: 2,
  teacherName: 'Awesome Teacher',
  sectionName: 'Great Section',
  teacherComment: null as string | null,
  unitDescription: 'This script teaches things',
  numStudentsInSection: 15,
  numLessonsCompleted: 5,
  numLessonsInUnit: 10,
  setTeacherCommentForReport: (comment: string) => {
    DEFAULT_PROPS.teacherComment = comment;
  },
  setScriptId: (scriptId: number) => {
    DEFAULT_PROPS.scriptId = scriptId;
  },
  sectionId: 6,
  scriptData: {
    id: 1163,
    excludeCsfColumnInLegend: false,
    title: 'Express Course (2019)',
    path: '//localhost-studio.code.org:3000/s/express-2019',
    lessons: [],
  },
  scriptFriendlyName: 'Express Course (2019)',
};

const UNIT_DATA = {
  id: 1,
  title: 'Express Course (2019)',
  path: '//localhost-studio.code.org:3000/s/express-2019',
  lessons: [{id: 1, position: 1, title: 'Lesson 1', levels: []}],
  name: 'Express Course',
  description: 'description',
};

const STANDARDS_DATA = {
  id: 1,
  lesson_ids: [1],
  shortcode: '1A-CS-01',
  category_description: 'Computing Systems',
  description: 'standards description',
};

const SECTION_ID = 6;
const STUDENT = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const SERVER_STUDENT = {
  ...STUDENT,
  family_name: STUDENT.familyName,
  secret_picture_name: 'secret_picture_name',
  secret_picture_path: 'secret_picture_path',
  secret_words: 'secret_words',
  sectionId: SECTION_ID,
  sharing_disabled: false,
  user_type: 'STUDENT' as const,
};

describe('StandardsReport', () => {
  beforeEach(() => {
    jest
      .spyOn(progressLoader, 'loadUnitProgress')
      .mockClear()
      .mockImplementation();
  });

  afterEach(() => {
    restoreOnWindow('opener');

    jest.restoreAllMocks();
  });

  function renderDefault(teacherComment = 'Comment!' as string | null) {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: teacherComment,
      },
    });

    const store = getStore();

    registerReducers({
      unitSelection,
      teacherSections,
      sectionStandardsProgress,
      currentUser,
      sectionProgress,
    });

    store.dispatch(setStandardsData([STANDARDS_DATA]));

    store.dispatch(
      addDataByUnit({unitDataByUnit: {[UNIT_DATA.id]: UNIT_DATA}})
    );

    store.dispatch(setScriptId(1));
    store.dispatch(
      setCoursesWithProgress([
        {
          id: 1,
          display_name: 'Course 1',
          units: [UNIT_DATA],
        },
      ])
    );

    store.dispatch(setSections([{id: SECTION_ID, name: 'Section 1'}]));
    store.dispatch(selectSection(SECTION_ID));

    store.dispatch(setStudentsForCurrentSection(SECTION_ID, [SERVER_STUDENT]));

    render(
      <Provider store={store}>
        <StandardsReport />
      </Provider>
    );
  }

  it('Report shows information accurately', () => {
    renderDefault();

    // shows print buttons
    expect(screen.getAllByText('Print report')).toHaveLength(2);

    // shows header
    screen.getByText('Class Standards Report');
    screen.getByAltText('Code.org logo');

    // shows course info
    screen.getAllByText(UNIT_DATA.name);
    screen.getByText('Class Progress');
    screen.getByText('description');
  });

  it('report shows teacher comment if one exists', () => {
    renderDefault('I love my class they are wonderful');

    screen.getByText('Teacher comments');
    screen.getByText('I love my class they are wonderful');
  });

  it('report does not show teacher comment section if there is no comment', () => {
    renderDefault(null);

    expect(screen.queryByText('Teacher comments')).toBeNull();
  });

  it('report shows StandardsProgressTable', () => {
    renderDefault();

    // column headers
    screen.getByText('Concept');
    screen.getByText('Identifier');
    screen.getByText('Description');
    screen.getByText('Lessons completed');

    // standards data
    screen.getByText('Computing Systems');
    screen.getByText('1A-CS-01');
    screen.getByText('standards description');
  });
});
