import {act, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {useSelector} from 'react-redux';

import {ShareFailure} from '@cdo/apps/lab2/types';
import Lab2ShareDialogWrapper from '@cdo/apps/lab2/views/Lab2ShareDialogWrapper';
import {getSubmissionStatus} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi';
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
    submissionStatus?: string;
  }) => (
    <div>
      <div>
        share dialog:{' '}
        {props.shareFailure ? props.shareFailure.type : 'no failure'}
        {props.isAbusive ? ' abusive' : ''}
      </div>
      <div>submission status: {props.submissionStatus ?? 'unknown'}</div>
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

const mockedGetSubmissionStatus = getSubmissionStatus as jest.Mock;
const mockedUseSelector = useSelector as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedUseAppDispatch = useAppDispatch as jest.Mock;

function setState(
  projectType: string,
  isOpen = true,
  shareFailure: ShareFailure | null = null,
  isBlockedAbuse = false,
  {inRestrictedShareMode = false, isSignedIn = false} = {}
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
        signInState: isSignedIn ? 'SignedIn' : 'Unknown',
        under13: false,
        userSharingDisabled: false,
      },
      project: {inRestrictedShareMode},
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

  it('serves the share dialog to Sprite Lab in Lab2', () => {
    setState('spritelab');

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    expect(screen.getByText('share dialog: no failure')).toBeInTheDocument();
  });

  it('passes isAbusive when the project is blocked for abuse', () => {
    setState('sketchlab', true, null, true);

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    expect(
      screen.getByText('share dialog: no failure abusive')
    ).toBeInTheDocument();
  });

  it('passes the fetched submission status to the dialog', async () => {
    mockedGetSubmissionStatus.mockResolvedValue('can_submit');
    setState('spritelab', true, null, false, {isSignedIn: true});

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    expect(
      await screen.findByText('submission status: can_submit')
    ).toBeInTheDocument();
  });

  it('reports a restricted project as restricted regardless of what was fetched', async () => {
    mockedGetSubmissionStatus.mockResolvedValue('can_submit');
    setState('spritelab', true, null, false, {
      isSignedIn: true,
      inRestrictedShareMode: true,
    });

    await act(async () => {
      render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);
    });

    expect(mockedGetSubmissionStatus).toHaveBeenCalled();
    expect(
      screen.getByText('submission status: restricted_share_mode')
    ).toBeInTheDocument();
  });
});
