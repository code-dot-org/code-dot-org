import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {getLabViewPageAction} from '@cdo/apps/lab2/utils';
import {
  ProjectBlockedUI,
  PRIVACY_PROFANITY_OWNER_ALERT,
  PRIVACY_PROFANITY_BLOCKED_MESSAGE,
} from '@cdo/apps/lab2/views/ProjectBlockedUI';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/lab2/utils', () => ({
  ...jest.requireActual('@cdo/apps/lab2/utils'),
  getLabViewPageAction: jest.fn(),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockedGetLabViewPageAction = getLabViewPageAction as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;

function setState({
  isOwner,
  isTeacherOfProjectOwner = false,
  pageAction,
}: {
  isOwner: boolean;
  isTeacherOfProjectOwner?: boolean;
  pageAction: string;
}) {
  mockedGetLabViewPageAction.mockReturnValue(pageAction);
  mockedUseAppSelector.mockImplementation(selector =>
    selector({
      lab: {
        channel: {isOwner},
        isTeacherOfProjectOwner,
      },
    })
  );
}

describe('ProjectBlockedUI for privacy/profanity violations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('warns the owner inside the lab that others cannot view the project', () => {
    setState({isOwner: true, pageAction: 'edit'});

    render(
      <ProjectBlockedUI
        blockedType="privacyProfanity"
        isProjectValidator={false}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      PRIVACY_PROFANITY_OWNER_ALERT
    );
  });

  it('shows the blocked message to non-owners', () => {
    setState({isOwner: false, pageAction: 'share'});

    render(
      <ProjectBlockedUI
        blockedType="privacyProfanity"
        isProjectValidator={false}
      />
    );

    expect(
      screen.getByText(PRIVACY_PROFANITY_BLOCKED_MESSAGE)
    ).toBeInTheDocument();
  });

  it('shows the owner message, not the blocked message, to the owner on the share page', () => {
    setState({isOwner: true, pageAction: 'share'});

    render(
      <ProjectBlockedUI
        blockedType="privacyProfanity"
        isProjectValidator={false}
      />
    );

    expect(screen.getByText(PRIVACY_PROFANITY_OWNER_ALERT)).toBeInTheDocument();
    expect(
      screen.queryByText(PRIVACY_PROFANITY_BLOCKED_MESSAGE)
    ).not.toBeInTheDocument();
  });
});
