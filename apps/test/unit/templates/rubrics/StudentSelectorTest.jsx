import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';

import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {UnconnectedStudentSelector as StudentSelector} from '@cdo/apps/templates/rubrics/StudentSelector';
import teacherRubric from '@cdo/apps/templates/rubrics/teacherRubricRedux';
import * as utils from '@cdo/apps/utils';
function setup(jsx) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

describe('StudentSelector', () => {
  const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
  const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};

  const selectUserFunc = () => {};

  const reportingData = {
    unitName: 'test-2023',
    courseName: 'course-2023',
    levelName: 'test_level',
  };

  const defaultProps = {
    reloadOnChange: true,
    sectionId: 1,
    reportingData: reportingData,
    selectUser: selectUserFunc,
    students: [STUDENT_1, STUDENT_2],
  };

  let store;

  beforeEach(() => {
    jest.spyOn(utils, 'reload').mockClear().mockImplementation();
    stubRedux();
    registerReducers({
      teacherRubric,
      teacherPanel,
    });
    store = getStore();
  });
  afterEach(() => {
    utils.reload.mockRestore();
    restoreRedux();
  });

  it('sends event on Student selection', async () => {
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    const {user} = setup(
      <Provider store={store}>
        <StudentSelector {...defaultProps} />
      </Provider>
    );
    const dropdown = screen.getByLabelText('Select a student');
    await user.click(dropdown);
    await user.click(screen.getByText('Student 2 FamNameA'));
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_DROPDOWN_STUDENT_SELECTED,
      {
        unitName: 'test-2023',
        courseName: 'course-2023',
        levelName: 'test_level',
        sectionId: defaultProps.sectionId,
        studentId: STUDENT_2.id,
      }
    );
    sendEventSpy.mockRestore();
  });
});
