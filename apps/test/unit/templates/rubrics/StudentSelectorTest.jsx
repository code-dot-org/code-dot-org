import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {UnconnectedStudentSelector as StudentSelector} from '@cdo/apps/templates/rubrics/StudentSelector';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../util/reconfiguredChai';

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
    levelsWithProgress: [],
    students: [STUDENT_1, STUDENT_2],
  };

  beforeEach(() => sinon.stub(utils, 'reload'));
  afterEach(() => utils.reload.restore());

  it('sends event on Student selection', async () => {
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');
    const {user} = setup(<StudentSelector {...defaultProps} />);
    const dropdown = screen.getByLabelText('Select a student');
    await user.click(dropdown);
    await user.click(screen.getByText('Student 2 FamNameA'));
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_DROPDOWN_STUDENT_SELECTED,
      {
        unitName: 'test-2023',
        courseName: 'course-2023',
        levelName: 'test_level',
        sectionId: defaultProps.sectionId,
        studentId: STUDENT_2.id,
      }
    );
    sendEventSpy.restore();
  });
});
