import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import teacherSections, {
  finishLoadingSectionData,
  startLoadingSectionData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ElementOrEmptyPage from '@cdo/apps/templates/teacherNavigation/ElementOrEmptyPage';
import i18n from '@cdo/locale';

const TEST_ELEMENT_TEXT = 'Test Element';

const DEFAULT_PROPS = {
  showNoStudents: false,
  showNoCurriculumAssigned: false,
  showNoUnitAssigned: false,
  courseName: null,
  element: <div>{TEST_ELEMENT_TEXT}</div>,
};

describe('ElementOrEmptyPage', () => {
  let store;

  function renderDefault(propOverrides = {}) {
    stubRedux();
    registerReducers({
      teacherSections,
    });

    store = getStore();

    store.dispatch(finishLoadingSectionData());

    render(
      <Router>
        <Provider store={store}>
          <ElementOrEmptyPage {...DEFAULT_PROPS} {...propOverrides} />
        </Provider>
      </Router>
    );
  }

  afterEach(() => {
    restoreRedux();
  });

  it('Shows element if loading', () => {
    renderDefault({
      showNoStudents: true,
      showNoCurriculumAssigned: true,
    });

    store.dispatch(startLoadingSectionData());

    expect(screen.queryByText(i18n.emptySectionHeadline())).toBeNull();
    expect(screen.queryByAltText('empty desk')).toBeNull();
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.addStudents())).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    screen.getByText(TEST_ELEMENT_TEXT);
  });

  it('Shows only no students graphic if both should be shown', () => {
    renderDefault({
      showNoStudents: true,
      showNoCurriculumAssigned: true,
    });

    screen.getByAltText('empty desk');
    screen.getByText(i18n.addStudents());
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    expect(screen.queryByText(TEST_ELEMENT_TEXT)).toBeNull();
  });

  it('Shows no curriculum graphic', () => {
    renderDefault({
      showNoStudents: false,
      showNoCurriculumAssigned: true,
    });

    screen.getByAltText('blank screen');
    screen.getByText(i18n.browseCurriculum());
    expect(screen.queryByAltText('empty desk')).toBeNull();
    expect(screen.queryByText(i18n.addStudents())).toBeNull();
    expect(screen.queryByText(TEST_ELEMENT_TEXT)).toBeNull();
  });

  it('Shows no students', () => {
    renderDefault({
      showNoStudents: true,
      showNoCurriculumAssigned: false,
    });

    screen.getByAltText('empty desk');
    screen.getByText(i18n.addStudents());
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    expect(screen.queryByText(TEST_ELEMENT_TEXT)).toBeNull();
  });

  it('Shows element and no empty section graphic', () => {
    renderDefault();

    expect(screen.queryByText(i18n.emptySectionHeadline())).toBeNull();
    expect(screen.queryByAltText('empty desk')).toBeNull();
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.addStudents())).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    screen.getByText(TEST_ELEMENT_TEXT);
  });

  it('Shows no unit assigned', () => {
    renderDefault({
      showNoStudents: false,
      showNoCurriculumAssigned: false,
      showNoUnitAssigned: true,
      courseName: 'CSD',
    });

    screen.getByAltText(i18n.almostThere());
    screen.getByText(i18n.almostThere());
    screen.getByText(i18n.noUnitAssigned({courseName: 'CSD'}));
    screen.getByRole('button', {name: i18n.assignAUnit()});
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    expect(screen.queryByAltText('empty desk')).toBeNull();
    expect(screen.queryByText(i18n.addStudents())).toBeNull();
    expect(screen.queryByText(TEST_ELEMENT_TEXT)).toBeNull();
  });
});
