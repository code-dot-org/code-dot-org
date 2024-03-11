import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import SectionProgressV2 from '@cdo/apps/templates/sectionProgressV2/SectionProgressV2.jsx';
import {render, screen} from '@testing-library/react';

import currentUser from '@cdo/apps/templates/currentUserRedux';
import sectionProgress, {
  startLoadingProgress,
  finishLoadingProgress,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import teacherSections, {
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';
import {registerReducers, restoreRedux, stubRedux} from '@cdo/apps/redux';
import {createStore} from '@cdo/apps/templates/sectionProgress/sectionProgressTestHelpers';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const DEFAULT_PROPS = {};

describe('SectionProgressV2', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      currentUser,
      sectionProgress,
      unitSelection,
      teacherSections,
    });

    store = createStore(5, 5);
    store.dispatch(setScriptId(1));
    store.dispatch(finishLoadingProgress());
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <SectionProgressV2 {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('shows skeleton if loading', () => {
    renderDefault();
    store.dispatch(startLoadingProgress());

    screen.getByText('Progress (beta)');
    screen.getByText('Students');
    screen.getAllByTestId('skeleton-cell');
    expect(screen.queryAllByText(/Student [1-9]/)).to.be.empty;
  });

  it('shows students and unit selector', () => {
    renderDefault();

    store.dispatch(setStudentsForCurrentSection(1, STUDENTS));

    screen.getByText('Progress (beta)');
    screen.getByText('Students');

    expect(screen.getAllByText(/Student [1-9]/).length).to.equal(
      STUDENTS.length
    );
  });
});
