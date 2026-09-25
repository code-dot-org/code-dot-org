import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {registerReducers, restoreRedux, stubRedux} from '@cdo/apps/redux';
import unitSelection, {setUnit} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import * as sectionProgressLoader from '@cdo/apps/templates/sectionProgressV2/sectionProgressLoader';
import sectionProgress, {
  startLoadingProgress,
  finishLoadingProgress,
} from '@cdo/apps/templates/sectionProgressV2/sectionProgressRedux';
import SectionProgressV2 from '@cdo/apps/templates/sectionProgressV2/SectionProgressV2.jsx';
import teacherSections, {
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';

import {createStore} from './sectionProgressTestHelpers';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const DEFAULT_PROPS = {};

jest.mock('@cdo/apps/templates/sectionProgressV2/sectionProgressLoader');

// Expected gallery URL derived from the test helper's script data:
// path  = '//localhost-studio.code.org:3000/s/csd3-2020'
// first lesson relative_position = 0
const GALLERY_URL =
  '//localhost-studio.code.org:3000/s/csd3-2020/lessons/0/tutor/gallery';

describe('SectionProgressV2', () => {
  let store;
  const realIsEnabledAllowingQueryString =
    experiments.isEnabledAllowingQueryString;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      currentUser,
      sectionProgress,
      unitSelection,
      teacherSections,
    });

    store = createStore(5, 5);
    store.dispatch(setUnit(1, 99));
    store.dispatch(finishLoadingProgress());
    jest
      .spyOn(sectionProgressLoader, 'loadUnitProgress')
      .mockResolvedValue(Promise.resolve());

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );

    // jest.resetAllMocks() (called in afterEach) clears the ResizeObserver
    // mock implementation set in setupJest.js. Re-establish it each test so
    // components that use ResizeObserver don't throw when fully rendered.
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    experiments.isEnabledAllowingQueryString = jest.fn(() => false);
  });

  afterEach(() => {
    restoreRedux();
    experiments.isEnabledAllowingQueryString = realIsEnabledAllowingQueryString;
    jest.resetAllMocks();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <SectionProgressV2 {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('shows expand and collapse dropdown', () => {
    renderDefault();

    store.dispatch(setStudentsForCurrentSection(1, STUDENTS));
    screen.getByRole('button', {name: 'Additional options'});
  });

  it('shows skeleton if loading', () => {
    renderDefault();
    store.dispatch(startLoadingProgress());

    screen.getByText('Icon Key');
    screen.getByText('Students');
    // eslint-disable-next-line no-restricted-properties
    screen.getAllByTestId('skeleton-cell');
    expect(screen.queryAllByText(/Student [1-9]/)).toHaveLength(0);
  });

  it('shows students and unit selector', () => {
    renderDefault();

    store.dispatch(setStudentsForCurrentSection(1, STUDENTS));

    screen.getByText('Icon Key');
    screen.getByText('Students');

    expect(screen.getAllByText(/Student [1-9]/).length).toBe(STUDENTS.length);
  });

  it('shows the gallery link button when lesson-tutor-challenge is enabled', () => {
    experiments.isEnabledAllowingQueryString = jest.fn(() => true);
    // scriptId must match the test helper's script id (2) so unitData resolves.
    store.dispatch(setUnit(2, 99));
    renderDefault();

    const link = screen.getByRole('link', {
      name: /Review extension activities/,
    });
    expect(link).toHaveAttribute('href', GALLERY_URL);
  });

  it('hides the gallery link button when lesson-tutor-challenge is disabled', () => {
    experiments.isEnabledAllowingQueryString = jest.fn(() => false);
    store.dispatch(setUnit(2, 99));
    renderDefault();

    expect(
      screen.queryByRole('link', {
        name: /Review extension activities/,
      })
    ).toBeNull();
  });
});
