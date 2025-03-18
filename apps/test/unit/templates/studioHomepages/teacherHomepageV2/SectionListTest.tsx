import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import {SectionList} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionList';
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

  const store: Store = getStore();
  registerReducers({teacherSections});
  store.dispatch(setSections(serverSections));

  function renderComponent() {
    return render(
      <Provider store={store}>
        <SectionList showHiddenOnly={false} />
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
});
