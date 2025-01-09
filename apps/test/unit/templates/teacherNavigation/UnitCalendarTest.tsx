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
import unitSelection, {setUnitName} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnitCalendar from '@cdo/apps/templates/teacherNavigation/UnitCalendar';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

const SECTIONS = [
  {
    id: 1,
    name: 'Period 2',
    course_offering_id: 123,
    courseVersionId: 2023,
    unitName: 'csd1-2024',
    unitSelection: {
      unitName: 'csd1-2024',
    },
  },
  {
    id: 9,
    name: 'Period 9',
    course_offering_id: null,
    courseVersionId: null,
    unitName: null,
    unitSelection: null,
  },
  {
    id: 10,
    name: 'Period 10',
    course_offering_id: 123,
    courseVersionId: 2023,
    courseVersionName: 'csd-2024',
    unitName: null,
    unitSelection: null,
    course_display_name: 'CSD',
  },
  {
    id: 11,
    name: 'Period 11',
    course_offering_id: 1234,
    courseVersionId: 20234,
    courseVersionName: 'csd1-2020',
    unitName: 'csd1-2020',
    unitSelection: {
      unitName: 'csd1-2020',
    },
    course_display_name: 'CSD1-2020',
  },
];

const UNIT_SUMMARY = {
  id: 1,
  name: 'csd1-2024',
  lessons: [],
  title: "Unit 1 - Problem Solving and Computing ('23-'24)",
  description: 'CSD description',
  studentDescription: 'CSD student description',
  course_versions: {},
  courseVersionId: 2,
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
  name: 'csd1-2020',
  version_year: '2020',
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
    store.dispatch(setUnitName('csd1-2024'));

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
    fetchSpy.mockResolvedValue({
      value: {
        unitData: UNIT_SUMMARY,
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
    store.dispatch(setUnitName(null));

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
    store.dispatch(setUnitName(null));

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
    store.dispatch(setUnitName('csd1-2020'));
    store.dispatch(selectSection(11));
    fetchSpy.mockResolvedValue({
      value: {
        unitData: LEGACY_UNIT_SUMMARY,
        plcBreadcrumb: {
          unit_name: 'csd1-2020',
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
    screen.getByText(i18n.calendarLegacyMessage({courseName: 'CSD1-2020'}));
  });
});
