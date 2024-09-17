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
  serverSectionFromSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
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
    },
    {
      id: 12,
      name: 'Period 2',
      hidden: false,
    },
    {
      id: 13,
      name: 'Period 3',
      hidden: true,
    },
  ];
  const serverSections = sections.map(serverSectionFromSection);

  let store;

  const renderDefault = (selectedSectionId = 11) => {
    store = getStore();
    registerReducers({
      teacherSections,
    });
    store.dispatch(setSections(serverSections));

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
                  loader={({params}) => {
                    store.dispatch(selectSection(params.sectionId));
                    return null;
                  }}
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
                    path={'manage_students'}
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
              initialEntries: [
                `/teacher_dashboard/sections/${selectedSectionId}/progress`,
              ],
              basename: TEACHER_NAVIGATION_BASE_URL,
            }
          )}
        />
      </Provider>
    );
  };

  test('renders correctly with visible sections', async () => {
    renderDefault();

    await screen.findByText(i18n.classSections());
    screen.getByRole('combobox');
    expect(screen.getByText('Period 1')).toBeVisible();
    expect(screen.queryByText('Period 3')).toBeNull();
    screen.getByText('Period 2');
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

  test('section button switches url', async () => {
    renderDefault();

    await screen.findByText('/sections/11/progress path');

    screen.getByText('Roster').click();

    await screen.findByText('/sections/11/manage_students path');
  });

  test('section dropdown switches url', async () => {
    renderDefault(12);
    const dropdown = await screen.findByRole('combobox');

    screen.getByText('/sections/12/progress path');
    expect(dropdown).toHaveValue('12');

    // Change dropdown value

    fireEvent.change(dropdown, {target: {value: '11'}});

    await screen.findByText('/sections/11/progress path');
    const dropdownAfterClick = screen.getByRole('combobox');
    expect(dropdownAfterClick).toHaveValue('11');
  });
});
