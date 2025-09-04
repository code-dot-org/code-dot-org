import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import calendar from '@cdo/apps/code-studio/calendarRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import unitSelection, {
  setCoursesWithProgress,
} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {ServerSection} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import UnitCalendar from '@cdo/apps/templates/teacherNavigation/UnitCalendar';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

const SECTIONS: ServerSection[] = [
  {
    id: 1,
    name: 'Period 2',
    course_offering_id: 123,
    course_version_id: 2024,
    courseVersionName: 'csd-2024',
    course_display_name: 'CSD 2024',
    course_id: 2024,
    unitName: 'csd1-2024',
    unitPosition: 1,
    code: '',
    hidden: false,
    lesson_extras: false,
    login_type: '',
    pairing_allowed: false,
    sharing_disabled: false,
    studentCount: 0,
  },
  {
    id: 9,
    name: 'Period 9',
    course_offering_id: null,
    course_version_id: null,
    courseVersionName: null,
    code: '',
    course_id: null,
    hidden: false,
    lesson_extras: false,
    login_type: '',
    pairing_allowed: false,
    sharing_disabled: false,
    studentCount: 0,
  },
  {
    id: 10,
    name: 'Period 10',
    course_offering_id: 123,
    course_version_id: 2024,
    courseVersionName: 'csd-2024',
    course_id: 2024,
    course_display_name: 'CSD',
    code: '',
    hidden: false,
    lesson_extras: false,
    login_type: '',
    pairing_allowed: false,
    sharing_disabled: false,
    studentCount: 0,
  },
  {
    id: 11,
    name: 'Period 11',
    course_offering_id: 1234,
    course_version_id: 2020,
    courseVersionName: 'csd-2020',
    course_id: 2020,
    unitName: 'csd1-2020',
    unitPosition: 1,
    course_display_name: 'CSD-2020',
    code: '',
    hidden: false,
    lesson_extras: false,
    login_type: '',
    pairing_allowed: false,
    sharing_disabled: false,
    studentCount: 0,
  },
];

const UNIT_SUMMARY = {
  id: 1,
  name: 'csd1-2024',
  course_name: 'csd-2024',
  unit_position: 1,
  lessons: [],
  title: "Unit 1 - Problem Solving and Computing ('23-'24)",
  description: 'CSD description',
  studentDescription: 'CSD student description',
  course_versions: {},
  courseVersionId: 2024,
  lessonGroups: [],
  isPlCourse: false,
  plc: false,
  calendarLessons: [
    {
      id: 1,
      lessonNumber: 1,
      title: 'First Lesson',
      duration: 45,
      assessment: false,
      unplugged: false,
      url: '/lesson/1',
    },
  ],
  showCalendar: true,
  version_year: '2024',
};

const NO_SHOW_CALENDAR_UNIT_SUMMARY = {
  ...UNIT_SUMMARY,
  showCalendar: false,
};

const LEGACY_UNIT_SUMMARY = {
  ...UNIT_SUMMARY,
  id: 2,
  name: 'csd1-2020',
  course_name: 'csd-2020',
  unit_position: 1,
  courseVersionId: 2020,
  version_year: '2020',
};

const COURSES_WITH_PROGRESS = [
  {
    id: 2024,
    display_name: 'CSD',
    units: [
      {
        id: UNIT_SUMMARY.id,
        version_year: UNIT_SUMMARY.version_year,
        key: UNIT_SUMMARY.name,
        name: UNIT_SUMMARY.title,
        position: 1,
      },
    ],
  },
];

const LEGACY_COURSES_WITH_PROGRESS = [
  {
    id: 2020,
    display_name: 'CSD',
    units: [
      {
        id: LEGACY_UNIT_SUMMARY.id,
        version_year: LEGACY_UNIT_SUMMARY.version_year,
        key: LEGACY_UNIT_SUMMARY.name,
        name: LEGACY_UNIT_SUMMARY.title,
        position: 1,
      },
    ],
  },
];

const mockSpy = (
  spy: jest.SpyInstance,
  unitSummaryResponse: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  coursesWithProgress: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  spy.mockImplementation((url: string) => {
    if (url.includes('unit_summary')) {
      return Promise.resolve({
        value: unitSummaryResponse,
        response: new Response(),
      });
    } else if (url.includes('section_courses')) {
      return Promise.resolve({
        value: coursesWithProgress,
        response: new Response(),
      });
    }
  });
};

describe('UnitCalendar', () => {
  let store: Store;

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    stubRedux();

    registerReducers({
      locales,
      currentUser,
      teacherSections,
      unitSelection,
      calendar,
      progress,
    });

    store = getStore();

    store.dispatch(setLocaleCode('en-US'));
    store.dispatch(setInitialData({id: 1, user_type: 'teacher'}));
    store.dispatch(setSections(SECTIONS));
    store.dispatch(selectSection(1));
    store.dispatch(setCoursesWithProgress(COURSES_WITH_PROGRESS));

    fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    restoreRedux();
  });

  function renderComponent() {
    return render(
      <Provider store={store}>
        <UnitCalendar />
      </Provider>
    );
  }

  // ALL WORKS WITH UNIT_SUMMARY
  it('renders loading spinner initially', async () => {
    fetchSpy.mockResolvedValue(new Promise(() => {}));
    renderComponent();

    screen.getByTitle('Loading...');
  });

  it('renders calendar with instructional minutes dropdown, week, and calendar when loaded', async () => {
    mockSpy(
      fetchSpy,
      {
        unitData: UNIT_SUMMARY,
        plcBreadcrumb: {
          unit_name: 'csd1-2024',
          course_view_path: 'http://example.com/course',
        },
      },
      COURSES_WITH_PROGRESS
    );

    await act(async () => {
      renderComponent();
    });

    screen.getByText(i18n.instructionalMinutesPerWeek());
    screen.getByText('First Lesson');
    screen.getByText('Week 1');
  });

  // Works for SHOW_NO_UNIT_SUMMARY
  it('shows no calendar, when showCalendar is false', async () => {
    fetchSpy.mockResolvedValue({
      value: {
        unitData: NO_SHOW_CALENDAR_UNIT_SUMMARY,
        plcBreadcrumb: {
          unit_name: 'csd1-2024',
          course_view_path: 'http://example.com/course',
        },
      },
      response: new Response(),
    });
    await act(async () => {
      renderComponent();
    });

    screen.getByAltText(i18n.calendarNotAvailable());
    screen.getByText(i18n.calendarNotAvailable());
  });

  it('tells users to select a curriculum when no curriculum assigned', async () => {
    store.dispatch(selectSection(9));

    await act(async () => {
      renderComponent();
    });

    screen.getByAltText('blank screen');
    screen.getByText(i18n.emptySectionHeadline());
    screen.getByText(i18n.noCurriculumAssigned());
    screen.getByText(i18n.browseCurriculum());
  });

  it('tells users to select a unit when no unit assigned', async () => {
    store.dispatch(selectSection(10));

    await act(async () => {
      renderComponent();
    });

    screen.getByAltText(i18n.almostThere());
    screen.getByText(i18n.almostThere());
    screen.getByText(
      i18n.noUnitAssigned({page: 'the calendar', courseName: 'CSD'})
    );
    screen.getByText(i18n.assignAUnit());
  });

  it('notifies users that the assigned curriculum is pre-2020', async () => {
    store.dispatch(selectSection(11));
    mockSpy(
      fetchSpy,
      {
        unitData: LEGACY_UNIT_SUMMARY,
        plcBreadcrumb: {
          unit_name: 'csd1-2020',
          course_view_path: 'http://example.com/course',
        },
      },
      LEGACY_COURSES_WITH_PROGRESS
    );

    await act(async () => {
      renderComponent();
    });

    screen.getByAltText(i18n.calendarNotAvailable());
    screen.getByText(i18n.calendarNotAvailable());
    screen.getByText(i18n.calendarLegacyMessage({courseName: 'CSD-2020'}));
  });
});
