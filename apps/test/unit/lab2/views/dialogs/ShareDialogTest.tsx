import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import {ShareFailureType} from '@cdo/apps/lab2/types';
import ShareDialog, {
  SHARE_FAILURE_FALLBACK_PREFIX,
  SHARE_FAILURE_MESSAGE_PREFIXES,
  SHARE_FAILURE_TITLE,
} from '@cdo/apps/lab2/views/dialogs/ShareDialog';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedUseAppDispatch = useAppDispatch as jest.Mock;

describe('Lab2 ShareDialog', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockedUseAppDispatch.mockReturnValue(mockDispatch);
    mockedUseAppSelector.mockImplementation(selector =>
      selector({currentUser: {signInState: 'Unknown'}})
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderShareDialog(
    props: Partial<React.ComponentProps<typeof ShareDialog>> = {}
  ) {
    return render(
      <ShareDialog
        shareUrl="https://studio.code.org/projects/sketchlab/abc123"
        projectType="sketchlab"
        onSubmitClick={jest.fn()}
        submissionStatus={undefined}
        userSharingDisabled={false}
        {...props}
      />
    );
  }

  it('renders the share link UI when there is no share failure', () => {
    renderShareDialog({shareFailure: null});
    expect(
      screen.getByRole('button', {name: 'Copy link to project'})
    ).toBeInTheDocument();
    expect(screen.queryByText(SHARE_FAILURE_TITLE)).not.toBeInTheDocument();
  });

  it('renders the failure message instead of the share link on profanity failure', () => {
    renderShareDialog({
      shareFailure: {type: 'profanity'},
    });
    expect(screen.getByText(SHARE_FAILURE_TITLE)).toBeInTheDocument();
    expect(
      screen.getByText(SHARE_FAILURE_MESSAGE_PREFIXES.profanity, {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Copy link to project'})
    ).not.toBeInTheDocument();
  });

  it('falls back to a generic message for unrecognized failure types', () => {
    renderShareDialog({
      shareFailure: {
        type: 'new-server-type' as unknown as ShareFailureType,
      },
    });
    expect(screen.getByText(SHARE_FAILURE_TITLE)).toBeInTheDocument();
    expect(
      screen.getByText(SHARE_FAILURE_FALLBACK_PREFIX, {exact: false})
    ).toBeInTheDocument();
  });

  it('shows the flagged text for PII failures', () => {
    renderShareDialog({
      shareFailure: {type: 'email', content: 'test@example.com'},
    });
    expect(
      screen.getByText(/Flagged text: "test@example.com"/)
    ).toBeInTheDocument();
  });

  it('does not show a flagged text line when content is absent', () => {
    renderShareDialog({shareFailure: {type: 'profanity'}});
    expect(screen.queryByText(/Flagged text/)).not.toBeInTheDocument();
  });

  it('shows the flagged text for profanity failures', () => {
    renderShareDialog({shareFailure: {type: 'profanity', content: 'badword'}});
    expect(screen.getByText(/Flagged text: "badword"/)).toBeInTheDocument();
  });

  it('dismisses the failure dialog on confirm', async () => {
    renderShareDialog({shareFailure: {type: 'phone', content: '123-456-7890'}});
    screen.getByRole('button', {name: /ok/i}).click();
    expect(mockDispatch).toHaveBeenCalledWith(hideShareDialog());
  });

  // The copy button's live region is also role="alert", so pin these to the
  // abuse alert's own text rather than to the role alone.
  const abuseText = /reported for violating/i;

  it('does not show the abuse alert when the project is not flagged', () => {
    renderShareDialog();
    expect(screen.queryByText(abuseText)).not.toBeInTheDocument();
  });

  it('shows the abuse alert when the project is flagged', () => {
    renderShareDialog({isAbusive: true});
    expect(
      screen.getByText(abuseText).closest('[role="alert"]')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Copy link to project'})
    ).toBeInTheDocument();
  });
});
