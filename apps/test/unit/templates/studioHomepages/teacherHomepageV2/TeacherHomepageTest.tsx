import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import {Store} from 'redux';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {TeacherHomepage} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepage';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import HttpClient from '@cdo/apps/util/HttpClient';

describe('TeacherHomepage', () => {
  const sections = [
    {
      id: 11,
      name: 'Period 1',
      hidden: false,
      courseVersionName: 'csd-2024',
      unitName: null,
    },
    {
      id: 12,
      name: 'Period 2',
      hidden: false,
      courseVersionName: 'csd-2023',
      unitName: null,
    },
    {
      id: 13,
      name: 'Period 3',
      hidden: false,
      courseVersionName: 'csd-2022',
      unitName: 'csd3-2022',
    },
    {
      id: 14,
      name: 'Period 4',
      hidden: false,
      courseVersionName: 'csd-2022',
      unitName: 'csd6-2022',
    },
    {
      id: 15,
      name: 'hidden',
      hidden: true,
      unitName: null,
    },
  ];

  const serverSections = sections.map(serverSectionFromSection);

  let store: Store;

  const fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    store = getStore();
    registerReducers({teacherSections, currentUser});
    store.dispatch(setSections(serverSections));
    store.dispatch(setInitialData({id: 1, display_name: 'Rubber Ducky'}));

    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');

    fetchSpy.mockImplementation((url: string) => {
      if (url === '/dashboardapi/sections/available_participant_types') {
        return Promise.resolve({
          value: {availableParticipantTypes: ['student']},
          response: new Response(),
        });
      }
      return Promise.resolve({value: {}, response: new Response()});
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  function renderComponent(initialRoute = '/teacher_dashboard/home') {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={<TeacherHomepage />}
              />,
            ]),
            {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('sends analytics event when visiting the page', () => {
    renderComponent();
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.NEW_TEACHER_HOMEPAGE_VISITED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('renders SectionList component', () => {
    renderComponent();
    screen.getByText('Welcome, Rubber Ducky');
    screen.getByText('Class Sections');
  });

  it('create section button opens popup', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', {name: 'New class section'}));

    await screen.findByText('Create a new section', {}, {timeout: 5000});
    screen.getByText('Picture password');
    screen.getByRole('button', {name: 'Cancel'});
  }, 15000);

  it('teaching/archived toggle', async () => {
    renderComponent();
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
    const optionsDropdown = screen.getByRole('button', {name: 'More options'});
    fireEvent.click(optionsDropdown);

    const archiveAllSectionsButton = await screen.findByRole('button', {
      name: 'Archive all class sections',
    });

    fireEvent.click(archiveAllSectionsButton);

    screen.getByText('Archive all class sections?');
  });
});
