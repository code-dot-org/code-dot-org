import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {TeacherHomepage} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepage';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';

describe('SectionList', () => {
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

  beforeEach(() => {
    store = getStore();
    registerReducers({teacherSections, currentUser});
    store.dispatch(setSections(serverSections));
    store.dispatch(setInitialData({id: 1, display_name: 'Rubber Ducky'}));

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

  function renderComponent() {
    return render(
      <Provider store={store}>
        <TeacherHomepage />
      </Provider>
    );
  }

  it('renders SectionList component', () => {
    renderComponent();
    screen.getByText('Welcome, Rubber Ducky');
    screen.getByText('Class Sections');
  });

  it('create section button opens popup', async () => {
    renderComponent();

    screen.getByRole('button', {name: 'New class section'}).click();

    await screen.findByText('Create a new section');
    screen.getByText('Picture password');
    screen.getByRole('button', {name: 'Cancel'});
  });

  it('teaching/archived toggle', async () => {
    renderComponent();
    screen.getByRole('button', {name: 'Teaching'});
    const archivedButton = screen.getByRole('button', {name: 'Archived'});

    screen.getByText('Period 1');
    expect(screen.queryByText('hidden')).toBeNull();

    userEvent.click(archivedButton);

    await screen.findByText('hidden');
    expect(screen.queryByText('Period 1')).toBeNull();
  });
});
