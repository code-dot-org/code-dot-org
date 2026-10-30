import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {useSelector} from 'react-redux';

import {ShareFailure} from '@cdo/apps/lab2/types';
import Lab2ShareDialogWrapper from '@cdo/apps/lab2/views/Lab2ShareDialogWrapper';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/metrics/MetricsReporter');
jest.mock(
  '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi',
  () => ({
    getSubmissionStatus: jest.fn(() => Promise.resolve(undefined)),
  })
);
jest.mock(
  '@cdo/apps/templates/projects/submitProjectDialog/SubmitProjectDialog',
  () => () => null
);
jest.mock('@cdo/apps/code-studio/components/ShareDialog', () => () => null);
jest.mock('@cdo/apps/lab2/views/dialogs/ShareDialog', () => ({
  __esModule: true,
  default: (props: {
    shareFailure?: {type: string} | null;
    isAbusive?: boolean;
  }) => (
    <div>
      share dialog:{' '}
      {props.shareFailure ? props.shareFailure.type : 'no failure'}
      {props.isAbusive ? ' abusive' : ''}
    </div>
  ),
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(() => jest.fn()),
}));

const mockedUseSelector = useSelector as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedUseAppDispatch = useAppDispatch as jest.Mock;

function setState(
  projectType: string,
  isOpen = true,
  shareFailure: ShareFailure | null = null,
  isBlockedAbuse = false
) {
  mockedUseSelector.mockImplementation(selector =>
    selector({shareDialog: {isOpen}})
  );
  mockedUseAppSelector.mockImplementation(selector =>
    selector({
      lab: {
        levelProperties: {isProjectLevel: true},
        channel: {id: 'abc123', projectType},
        shareFailure,
        isBlockedAbuse,
      },
      currentUser: {
        signInState: 'Unknown',
        under13: false,
        userSharingDisabled: false,
      },
    })
  );
}

describe('Lab2ShareDialogWrapper', () => {
  beforeEach(() => {
    mockedUseAppDispatch.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes the stored share failure to the dialog', () => {
    setState('sketchlab', true, {type: 'profanity'});

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    expect(screen.getByText('share dialog: profanity')).toBeInTheDocument();
  });

  it('renders the share dialog without a failure when the project is clean', () => {
    setState('sketchlab');

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    expect(screen.getByText('share dialog: no failure')).toBeInTheDocument();
  });

  it('renders nothing when the dialog is closed', () => {
    setState('sketchlab', false);

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    expect(screen.queryByText(/share dialog/)).not.toBeInTheDocument();
  });

  it('passes isAbusive when the project is blocked for abuse', () => {
    setState('sketchlab', true, null, true);

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    expect(
      screen.getByText('share dialog: no failure abusive')
    ).toBeInTheDocument();
  });
});
