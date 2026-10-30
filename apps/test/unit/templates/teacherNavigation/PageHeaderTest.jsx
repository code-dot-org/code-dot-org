import {render, screen} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import manageStudents, {
  setSectionInfo,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import teacherSections, {
  selectSection,
  setSections,
  startLoadingSectionData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import PageHeader from '@cdo/apps/templates/teacherNavigation/PageHeader';

describe('PageHeader', () => {
  const demoSection = {
    id: 11,
    name: 'Period 1',
    demo_type: 'middle',
    hidden: false,
    courseVersionName: 'csd-2024',
    unitName: null,
    participant_type: 'student',
  };

  beforeEach(() => {
    // PageHeader's useEffect dispatches loadSectionStudentData, which calls
    // $.ajax. Stub it so the test doesn't depend on a real network layer or
    // jQuery deferred semantics.
    jest.spyOn($, 'ajax').mockReturnValue({
      done() {
        return this;
      },
      fail() {
        return this;
      },
    });
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  const renderDefault = ({isLoadingSectionData = false} = {}) => {
    stubRedux();
    registerReducers({
      teacherSections,
      manageStudents,
    });
    const store = getStore();

    store.dispatch(setSections([demoSection], true, [11]));
    store.dispatch(selectSection(11));
    store.dispatch(setSectionInfo('11'));
    if (isLoadingSectionData) {
      store.dispatch(startLoadingSectionData());
    }

    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={['/teacher_dashboard/sections/11/progress']}
        >
          <PageHeader urlSectionId="11" />
        </MemoryRouter>
      </Provider>
    );
  };

  test('renders demo chip next to demo section name', () => {
    renderDefault();

    screen.getByText('Period 1');
    screen.getByText('Demo');
  });

  test('does not render demo chip while section data is loading', () => {
    renderDefault({isLoadingSectionData: true});

    expect(screen.queryByText('Demo')).toBeNull();
  });
});
