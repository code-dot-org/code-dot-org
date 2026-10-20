import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevel: jest.fn(),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedGetCurrentLevel = getCurrentLevel as jest.Mock;

describe('TeacherViewingStudentProjectAlert', () => {
  beforeEach(() => {
    const state = {
      progress: {viewAsUserId: 99, unitProgress: {}},
      teacherSections: {selectedStudents: [{id: 99, name: 'Aisha Khan'}]},
    };
    mockedUseAppSelector.mockImplementation(selector => selector(state));
    mockedGetCurrentLevel.mockReturnValue({status: LevelStatus.not_tried});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("passes the viewed student's name to getAlertText and shows its result", () => {
    render(
      <TeacherViewingStudentProjectAlert
        getAlertText={name => <>Custom message for {name}</>}
      />
    );

    expect(
      screen.getByText('Custom message for Aisha Khan')
    ).toBeInTheDocument();
  });

  it('shows the level-progress wording when getAlertText is not given', () => {
    render(<TeacherViewingStudentProjectAlert />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Aisha Khan has not started the level.'
    );
  });
});
