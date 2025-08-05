import {fireEvent, render, screen, act} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepage';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import HttpClient from '@cdo/apps/util/HttpClient';

const INITIAL_ROUTE = '/teacher_dashboard/home';

jest.mock('@cdo/apps/util/HttpClient');

describe('TeacherHomepage', () => {
  const sections = [
    {
      id: 11,
      name: 'Period 1',
      hidden: false,
      courseVersionName: 'csd-2024',
      unitName: null,
      studentCount: 0,
      participantType: 'student',
    },
    {
      id: 12,
      name: 'Period 2',
      hidden: false,
      courseVersionName: 'csd-2023',
      unitName: null,
      participantType: 'student',
    },
    {
      id: 13,
      name: 'Period 3',
      hidden: false,
      courseVersionName: 'csd-2022',
      unitName: 'csd3-2022',
      participantType: 'student',
    },
    {
      id: 14,
      name: 'Period 4',
      hidden: false,
      courseVersionName: 'csd-2022',
      unitName: 'csd6-2022',
      participantType: 'student',
    },
    {
      id: 15,
      name: 'hidden',
      hidden: true,
      unitName: null,
      participantType: 'student',
    },
    {
      id: 16,
      name: 'PL Section',
      hidden: false,
      unitName: null,
      participantType: 'teacher',
    },
  ];

  const serverSections = sections.map(serverSectionFromSection);

  let fetchSpy: jest.SpyInstance;
  let sendEventSpy: jest.SpyInstance;
  let jquerySpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
    postSpy = jest.spyOn(HttpClient, 'post');
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    jquerySpy = jest.spyOn($, 'getJSON');
    stubRedux();
    fetchSpy.mockImplementation((url: string) => {
      if (url === '/dashboardapi/sections/available_participant_types') {
        return Promise.resolve({
          value: {availableParticipantTypes: ['student']},
          response: new Response(),
        });
      } else if (
        url === '/marketing/teacher/promotions/55R4y1NlZ0qJG9O0qgyq0Q'
      ) {
        return Promise.resolve({value: [], response: new Response()});
      } else if (
        url === '/teacher_dashboard/get_school_info_interstitial_data'
      ) {
        return Promise.resolve({
          value: {
            showSchoolInfoInterstitial: false,
            showSchoolInfoConfirmation: false,
            existingSchoolInfo: {},
          },
          response: new Response(),
        });
      }
      return Promise.resolve({value: {}, response: new Response()});
    });

    postSpy.mockImplementation((url: string) => {
      if (url === '/aidiff_threads/curriculum_courses') {
        return Promise.resolve({
          json: () => Promise.resolve({courses: []}),
        });
      }
      return Promise.resolve({json: () => Promise.resolve({})});
    });

    const mockDone = jest.fn();
    jquerySpy.mockImplementation(() => {
      return {
        done: (callback: jest.Func) => {
          mockDone(callback);
          callback([
            {
              instructor_email: 'test@code.org',
              instructor_name: '',
              invited_by_email: '',
              invited_by_name: '',
              participant_type: 'student',
              section_id: 1,
              section_name: '',
              status: 'invited',
            },
          ]);
          return {fail: () => ({always: () => {}})}; // Add fail and always to prevent errors
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    restoreRedux();
  });

  function renderComponent(initialSections = serverSections) {
    const store = getStore();
    registerReducers({teacherSections, currentUser});
    store.dispatch(setInitialData({id: 1, display_name: 'Rubber Ducky'}));
    store.dispatch(setSections(initialSections));
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={
                  <TeacherHomepage studioUrlPrefix="https://studio.code.org" />
                }
              />,
            ]),
            {initialEntries: [INITIAL_ROUTE], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('sends analytics event when visiting the page', async () => {
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.NEW_TEACHER_HOMEPAGE_VISITED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('renders SectionList component', async () => {
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    screen.getByText('Welcome, Rubber Ducky');
    screen.getByText('Class Sections');
    screen.getByText('Period 1');
    screen.getByText('Period 4');
  });

  it('create section button opens popup', async () => {
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    expect(fetchSpy).toHaveBeenCalledWith(
      '/dashboardapi/sections/available_participant_types'
    );

    fireEvent.click(screen.getByRole('button', {name: 'New class section'}));

    await screen.findByText('Create a new section');

    await screen.findByText('Picture password', {}, {timeout: 5000});
    screen.getByRole('button', {name: 'Cancel'});
  }, 15000);

  it('teaching/archived toggle', async () => {
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    screen.getByRole('button', {name: 'Teaching'});
    const archivedButton = screen.getByRole('button', {name: 'Archived'});
    const teachingButton = screen.getByRole('button', {name: 'Teaching'});

    screen.getByText('Period 1');
    expect(screen.queryByText('hidden')).toBeNull();

    fireEvent.click(archivedButton);

    await screen.findByText('hidden');
    expect(screen.queryByText('Period 1')).toBeNull();
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_LIST_ARCHIVE_TOGGLE_CLICKED,
      {},
      PLATFORMS.BOTH
    );

    fireEvent.click(teachingButton);
    await screen.findByText('Period 1');
    expect(screen.queryByText('hidden')).toBeNull();
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_LIST_TEACHING_TOGGLE_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('archive all opens modal', async () => {
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    const optionsDropdown = screen.getByRole('button', {name: 'More options'});
    fireEvent.click(optionsDropdown);

    const archiveAllSectionsButton = await screen.findByRole('button', {
      name: 'Archive all class sections',
    });

    fireEvent.click(archiveAllSectionsButton);

    screen.getByText('Archive all class sections?');
  });

  it('empty sections shows empty state', async () => {
    renderComponent([]);
    await act(async () => await new Promise(process.nextTick));
    await screen.findByText('Welcome, Rubber Ducky');
    await screen.findByText("It's a bit empty here...");
    screen.getByText('You haven’t created any class sections yet.');
  });

  it('empty archived sections shows empty state', async () => {
    renderComponent([]);
    await act(async () => await new Promise(process.nextTick));
    const archivedButton = screen.getByRole('button', {name: 'Archived'});
    fireEvent.click(archivedButton);

    screen.getByText('Welcome, Rubber Ducky');
    screen.getByText("It's a bit empty here...");
    screen.getByText('You haven’t archived any class sections yet.');
  });

  it('displays coteacher invite notification', async () => {
    renderComponent();
    await act(async () => await new Promise(process.nextTick));
    screen.getByText('Accept');
  });
});
