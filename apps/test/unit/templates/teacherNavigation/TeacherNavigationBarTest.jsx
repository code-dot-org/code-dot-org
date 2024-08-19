import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';

import {getStore, registerReducers} from '@cdo/apps/redux';
import teacherSections, {
  serverSectionFromSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import TeacherNavigationBar from '@cdo/apps/templates/teacherNavigation/TeacherNavigationBar';
import i18n from '@cdo/locale';

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

  beforeEach(() => {
    store = getStore();
    registerReducers({
      teacherSections,
    });
    store.dispatch(setSections(serverSections));
  });

  test('renders correctly with visible sections', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeacherNavigationBar />
        </MemoryRouter>
      </Provider>
    );

    screen.getByText(i18n.classSections());
    screen.getByRole('combobox');
    screen.getByText('Period 1');
    expect(screen.queryByText('Period 3')).toBeNull();
    screen.getByText('Period 2');
  });

  test('renders all navbarComponents', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeacherNavigationBar />
        </MemoryRouter>
      </Provider>
    );

    // Check for section headers
    screen.getByText('Course Content');
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

    // Object.keys(LABELED_TEACHER_NAVIGATION_PATHS).forEach((key) => {
    //   const label = LABELED_TEACHER_NAVIGATION_PATHS[key as keyof typeof LABELED_TEACHER_NAVIGATION_PATHS].label;
    //   if (label) {
    //     expect(screen.getByText(label)).toBeInTheDocument();
    //   }
  });
});
