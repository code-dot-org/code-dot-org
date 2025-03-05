import {render, screen} from '@testing-library/react';
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

  beforeEach(() => {
    store = getStore();
    registerReducers({teacherSections, currentUser});
    store.dispatch(setSections(serverSections));
    store.dispatch(setInitialData({id: 1, display_name: 'Rubber Ducky'}));
  });

  function renderComponent() {
    return render(
      <Provider store={store}>
        <TeacherHomepage />
      </Provider>
    );
  }

  it('renders SectionList component', async () => {
    renderComponent();
    screen.getByText('Welcome, Rubber Ducky');
    screen.getByText('Class Sections');
  });
});
