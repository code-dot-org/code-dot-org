import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from 'react-router-dom';

import {getStore, registerReducers} from '@cdo/apps/redux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import * as selectedSectionLoader from '@cdo/apps/templates/teacherNavigation/selectedSectionLoader';
import TeacherNavigationBar from '@cdo/apps/templates/teacherNavigation/TeacherNavigationBar';
import {
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_BASE_URL,
  TEACHER_NAVIGATION_SECTIONS_URL,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

const LocationElement = () => {
  const location = useLocation();
  return <div>{location.pathname} path</div>;
};

describe('TeacherNavigationBar', () => {
  const sections = [
    {
      id: 11,
      name: 'Period 1',
      hidden: false,
      courseVersionName: 'csd-2024',
    },
    {
      id: 12,
      name: 'Period 2',
      hidden: false,
      courseVersionName: 'csd-2023',
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
    },
  ];
  const serverSections = sections.map(serverSectionFromSection);

  let store;

  let loadSelectedSectionSpy;

  const renderDefault = (selectedSectionId = 11, selectedRoute = null) => {
    store = getStore();
    registerReducers({
      teacherSections,
    });
    store.dispatch(setSections(serverSections));

    loadSelectedSectionSpy = jest
      .spyOn(selectedSectionLoader, 'asyncLoadSelectedSection')
      .mockImplementation(sectionId => {
        store.dispatch(selectSection(sectionId));
        return () => {};
      });

    const initialRoute = !selectedRoute
      ? `/teacher_dashboard/sections/${selectedSectionId}/progress`
      : selectedRoute;
    render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_SECTIONS_URL}
                element={
                  <div>
                    <TeacherNavigationBar />
                    <Outlet />
                  </div>
                }
              >
                <Route
                  path={SPECIFIC_SECTION_BASE_URL}
                  element={
                    <div>
                      <Outlet />
                    </div>
                  }
                >
                  <Route
                    path={'progress'}
                    element={
                      <div>
                        <LocationElement location={location} />
                      </div>
                    }
                  />
                  <Route
                    path={'roster'}
                    element={
                      <div>
                        <LocationElement location={location} />
                      </div>
                    }
                  />
                  <Route
                    path={'unit/:unitName?'}
                    element={
                      <div>
                        <LocationElement location={location} />
                      </div>
                    }
                  />
                  <Route
                    path={'courses/:courseVersionName?'}
                    element={
                      <div>
                        <LocationElement location={location} />
                      </div>
                    }
                  />
                </Route>
              </Route>,
            ]),
            {
              initialEntries: [initialRoute],
              basename: TEACHER_NAVIGATION_BASE_URL,
            }
          )}
        />
      </Provider>
    );
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders correctly with visible sections', async () => {
    renderDefault();

    await screen.findByText(i18n.classSections());
    screen.getByRole('combobox');
    screen.getByText('Period 1');
    screen.getByText('Period 2');
    screen.getByText('Period 3');
    expect(screen.queryByText('hidden')).toBeNull();
    expect(loadSelectedSectionSpy).toHaveBeenCalledWith('11');
  });

  test('renders all navbarComponents', async () => {
    renderDefault();

    // Check for section headers
    await screen.findByText('Course Content');
    screen.getByText('Performance');
    screen.getByText('Classroom');

    // Check for NavBar content
    screen.getByText(i18n.course());
    screen.getByText(i18n.lessonMaterials());
    screen.getByText(i18n.calendar());
    screen.getByText(i18n.progress());
    screen.getByText(i18n.teacherTabStatsTextResponses());
    screen.getByText(i18n.assessments());
    screen.getByText(i18n.teacherTabStats());
    screen.getByText(i18n.studentProjects());
    screen.getByText(i18n.roster());
    screen.getByText(i18n.settings());
  });

  test('page button switches url', async () => {
    renderDefault();

    await screen.findByText('/sections/11/progress path');

    screen.getByText('Roster').click();

    await screen.findByText('/sections/11/roster path');
  });

  test('section dropdown switches url', async () => {
    renderDefault(12);
    const dropdown = await screen.findByRole('combobox');

    screen.getByText('/sections/12/progress path');
    expect(dropdown).toHaveValue('12');
    expect(loadSelectedSectionSpy).toHaveBeenCalledWith('12');

    // Change dropdown value

    fireEvent.change(dropdown, {target: {value: '11'}});

    await screen.findByText('/sections/11/progress path');
    const dropdownAfterClick = screen.getByRole('combobox');
    expect(dropdownAfterClick).toHaveValue('11');
    expect(loadSelectedSectionSpy).toHaveBeenCalledWith('11');
  });

  test('course link navigates to course when unit is not assigned', async () => {
    renderDefault(12);
    await screen.findByText('Course Content');
    screen.getByText(i18n.course()).click();
    await screen.findByText('/sections/12/courses/csd-2023 path');
    expect(loadSelectedSectionSpy).toHaveBeenCalledWith('12');
  });

  test('course link navigates to unit when unit is assigned', async () => {
    renderDefault(13);
    await screen.findByText('Course Content');
    screen.getByText(i18n.course()).click();
    await screen.findByText('/sections/13/unit/csd3-2022 path');
    expect(loadSelectedSectionSpy).toHaveBeenCalledWith('13');
  });

  test('section switch on unit page goes to selected unit', async () => {
    renderDefault(13, `/teacher_dashboard/sections/13/unit/csd3-2022`);
    const dropdown = await screen.findByRole('combobox');

    screen.getByText('/sections/13/unit/csd3-2022 path');
    expect(dropdown).toHaveValue('13');

    // Change dropdown value

    fireEvent.change(dropdown, {target: {value: '14'}});

    await screen.findByText('/sections/14/unit/csd6-2022 path');
    const dropdownAfterClick = screen.getByRole('combobox');
    expect(dropdownAfterClick).toHaveValue('14');
    expect(loadSelectedSectionSpy).toHaveBeenCalledWith('14');
  });
});
