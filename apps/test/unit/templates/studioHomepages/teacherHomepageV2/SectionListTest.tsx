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

import {getStore, registerReducers} from '@cdo/apps/redux';
import {SectionList} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionList';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

describe('SectionList', () => {
  const sections = [
    {
      id: 11,
      name: 'Period 1',
      hidden: false,
      courseVersionName: 'csd-2024',
      unitName: null,
      studentCount: 0,
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

  const store: Store = getStore();
  registerReducers({teacherSections});
  store.dispatch(setSections(serverSections));

  function renderComponent(initialRoute = '/teacher_dashboard/home') {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={<SectionList showHiddenOnly={false} />}
              />,
            ]),
            {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('renders list of teacher section cards', async () => {
    renderComponent();
    screen.getByText('Period 1');
    screen.getByText('Period 2');
    screen.getByText('Period 3');
    screen.getByText('Period 4');
  });

  it('displays the section delete modal when the delete option is clicked', async () => {
    renderComponent();
    const deleteButtons = screen.getAllByText(i18n.delete());
    fireEvent.click(deleteButtons[0]);
    await screen.findByText(i18n.deleteSection());
    screen.getByText(i18n.deleteSectionConfirm());
  });

  it('deletes a section when the delete button is clicked on the section delete modal', async () => {
    renderComponent();
    const deleteButtons = screen.getAllByText(i18n.delete());
    fireEvent.click(deleteButtons[0]);
    await screen.findByText(i18n.deleteSection());
    const deleteModalButton = screen.getByLabelText(i18n.delete());
    fireEvent.click(deleteModalButton);
    expect(screen.queryByText('Period 1')).toBeNull;
    screen.getByText('Period 2');
    screen.getByText('Period 3');
    screen.getByText('Period 4');
  });
});
