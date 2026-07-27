import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {useSelector} from 'react-redux';

import {fetchShareFailure} from '@cdo/apps/lab2/projects/channelsApi';
import Lab2ShareDialogWrapper from '@cdo/apps/lab2/views/Lab2ShareDialogWrapper';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/lab2/projects/channelsApi', () => ({
  fetchShareFailure: jest.fn(),
}));
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
  default: (props: {shareFailure?: {type: string} | null}) => (
    <div>
      share dialog:{' '}
      {props.shareFailure ? props.shareFailure.type : 'no failure'}
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

const mockedFetchShareFailure = fetchShareFailure as jest.Mock;
const mockedUseSelector = useSelector as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedUseAppDispatch = useAppDispatch as jest.Mock;

function setState(projectType: string, isOpen = true) {
  mockedUseSelector.mockImplementation(selector =>
    selector({shareDialog: {isOpen}})
  );
  mockedUseAppSelector.mockImplementation(selector =>
    selector({
      lab: {
        levelProperties: {isProjectLevel: true},
        channel: {id: 'abc123', projectType},
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

  it('checks for a share failure for share-filtered project types', async () => {
    setState('sketchlab');
    mockedFetchShareFailure.mockResolvedValue({type: 'profanity'});

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    // Nothing renders until the check resolves.
    expect(screen.queryByText(/share dialog/)).not.toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('share dialog: profanity')).toBeInTheDocument()
    );
    expect(mockedFetchShareFailure).toHaveBeenCalledWith('abc123');
  });

  it('renders the share dialog without a failure when the project is clean', async () => {
    setState('sketchlab');
    mockedFetchShareFailure.mockResolvedValue(null);

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    await waitFor(() =>
      expect(screen.getByText('share dialog: no failure')).toBeInTheDocument()
    );
  });

  it('does not check for a share failure for non-filtered project types', async () => {
    setState('music');

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    await waitFor(() =>
      expect(screen.getByText('share dialog: no failure')).toBeInTheDocument()
    );
    expect(mockedFetchShareFailure).not.toHaveBeenCalled();
  });

  it('does not flash the previous result when the dialog is reopened', async () => {
    setState('sketchlab');
    mockedFetchShareFailure.mockResolvedValue(null);

    const {rerender} = render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);
    await waitFor(() =>
      expect(screen.getByText('share dialog: no failure')).toBeInTheDocument()
    );

    // Close the dialog.
    setState('sketchlab', false);
    rerender(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);
    expect(screen.queryByText(/share dialog/)).not.toBeInTheDocument();

    // Reopen; the project is now flagged but the check is still pending.
    let resolveFetch: (failure: {type: string}) => void = () => {};
    mockedFetchShareFailure.mockImplementation(
      () => new Promise(resolve => (resolveFetch = resolve))
    );
    setState('sketchlab', true);
    rerender(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    // The stale clean result must not flash while the check is pending.
    expect(screen.queryByText(/share dialog/)).not.toBeInTheDocument();

    resolveFetch({type: 'profanity'});
    await waitFor(() =>
      expect(screen.getByText('share dialog: profanity')).toBeInTheDocument()
    );
  });

  it('fails open when the share failure check errors', async () => {
    setState('sketchlab');
    mockedFetchShareFailure.mockRejectedValue(new Error('network error'));

    render(<Lab2ShareDialogWrapper shareUrl="fakeShareUrl" />);

    await waitFor(() =>
      expect(screen.getByText('share dialog: no failure')).toBeInTheDocument()
    );
  });
});
