import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import {Store} from 'redux';
import '@testing-library/jest-dom';

import {getStore, registerReducers} from '@cdo/apps/redux';
import {SectionList} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionList';
import teacherSections, {
  setSectionOrder,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  delete: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({})),
}));

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

describe('SectionList', () => {
  let store: Store;
  beforeEach(() => {
    const serverSections = sections.map(serverSectionFromSection);

    store = getStore();
    registerReducers({teacherSections});
    store.dispatch(setSections(serverSections));
    store.dispatch(setSectionOrder([11, 12, 13, 14]));
  });

  function renderComponent(initialRoute = '/teacher_dashboard/home') {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={
                  <SectionList
                    showHiddenOnly={false}
                    studioUrlPrefix="https://studio.code.org"
                  />
                }
              />,
            ]),
            {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('renders list of teacher section cards without displaying PL or hidden sections', async () => {
    renderComponent();
    screen.getByText('Period 1');
    screen.getByText('Period 2');
    screen.getByText('Period 3');
    screen.getByText('Period 4');
    expect(screen.queryByText('hidden')).toBeNull();
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

  it('removes a section from the list when archived and maintains the order of other sections', async () => {
    renderComponent();

    screen.getByRole('listitem', {
      name: 'Period 1',
    });
    screen.getByRole('listitem', {
      name: 'Period 2',
    });
    screen.getByRole('listitem', {
      name: 'Period 3',
    });
    screen.getByRole('listitem', {
      name: 'Period 4',
    });

    const optionsDropdown = screen.getAllByRole('button', {
      name: 'Section options dropdown',
    });
    fireEvent.click(optionsDropdown[0]);
    const archiveButtons = screen.getAllByText('Archive');
    fireEvent.click(archiveButtons[1]);

    waitFor(() => {
      expect(screen.queryByText('Period 2')).toBeNull();
    });
    const p1 = screen.getByRole('listitem', {
      name: 'Period 1',
    });
    const p3 = screen.getByRole('listitem', {
      name: 'Period 3',
    });
    screen.getByRole('listitem', {
      name: 'Period 4',
    });

    expect(p1.compareDocumentPosition(p3)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('renders sections in the same order as specified in Redux', async () => {
    const customOrder = [14, 13, 12, 11];
    store.dispatch(setSectionOrder(customOrder));

    renderComponent();

    // Alternative verification by checking DOM order
    const p4 = screen.getByRole('listitem', {name: 'Period 4'});
    const p3 = screen.getByRole('listitem', {name: 'Period 3'});
    const p2 = screen.getByRole('listitem', {name: 'Period 2'});
    const p1 = screen.getByRole('listitem', {name: 'Period 1'});

    expect(p4.compareDocumentPosition(p3)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(p3.compareDocumentPosition(p2)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(p2.compareDocumentPosition(p1)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});
