import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import DCDO from '@cdo/apps/dcdo';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import StudentColumn from '@cdo/apps/templates/sectionProgressV2/StudentColumn.jsx';

const studentA = {
  name: 'Sherlock',
  familyName: 'Holmes',
  id: 1,
};

const studentB = {
  name: 'John',
  familyName: 'Watson',
  id: 2,
};

const DEFAULT_PROPS = {
  sortedStudents: [],
  sectionId: 1,
  unitName: 'test unit',
  isSkeleton: false,
};

describe('StudentColumn', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      sectionProgress,
      currentUser,
    });

    store = getStore();

    DCDO.set('progress-v2-metadata-enabled', false);
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    return render(
      <Provider store={store}>
        <StudentColumn {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('shows SortByNameDropdown', () => {
    renderDefault();
    screen.getByLabelText('Sort by:');
  });

  it('shows no students if empty', () => {
    renderDefault();
    expect(screen.queryByText('Holmes')).toBeNull();
  });

  it('shows all students', () => {
    renderDefault({
      sortedStudents: [studentA, studentB],
    });
    screen.getByText('Sherlock Holmes');
    screen.getByText('John Watson');
  });

  it('shows only name if family name is missing', () => {
    renderDefault({
      sortedStudents: [
        {
          name: 'Moriarty',
          id: 3,
        },
      ],
    });
    screen.getByText('Moriarty');
  });

  it('shows expansion if DCDO flag is enabled', () => {
    DCDO.set('progress-v2-metadata-enabled', true);

    renderDefault({
      sortedStudents: [studentA, studentB],
    });
    let holmes = screen.getByText('Sherlock Holmes');
    expect(holmes.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(holmes);

    holmes = screen.getByText('Sherlock Holmes');
    expect(holmes.getAttribute('aria-expanded')).toBe('true');

    screen.getByText('Time Spent (mins)');
    screen.getByText('Last Updated');
  });
});
