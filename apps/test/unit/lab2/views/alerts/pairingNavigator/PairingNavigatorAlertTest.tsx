import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {getUserAppOptionsPath} from '@cdo/apps/code-studio/progressReduxSelectors';
import {LevelProperties} from '@cdo/apps/lab2/types';
import fetchUserAppOptions from '@cdo/apps/lab2/utils/fetchUserAppOptions';
import PairingNavigatorAlert from '@cdo/apps/lab2/views/alerts/pairingNavigator/PairingNavigatorAlert';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getUserAppOptionsPath: jest.fn(() => '/api/user_app_options/test/1/1/1'),
}));
jest.mock('@cdo/apps/lab2/utils/fetchUserAppOptions');
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedGetUserAppOptionsPath = getUserAppOptionsPath as jest.Mock;
const mockedFetchUserAppOptions = fetchUserAppOptions as jest.Mock;

function setState({
  levelProperties,
  viewAsUserId = null,
  userAppOptionsPath = '/api/user_app_options/test/1/1/1',
}: {
  levelProperties?: Partial<LevelProperties>;
  viewAsUserId?: number | null;
  userAppOptionsPath?: string;
}) {
  mockedGetUserAppOptionsPath.mockReturnValue(userAppOptionsPath);
  const state = {
    lab: {levelProperties},
    progress: {viewAsUserId},
  };
  mockedUseAppSelector.mockImplementation(selector => selector(state));
}

describe('PairingNavigatorAlert', () => {
  beforeEach(() => {
    mockedFetchUserAppOptions.mockResolvedValue({isNavigator: false});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when user is not navigator', async () => {
    setState({levelProperties: {appName: 'music'}});

    const {container} = render(<PairingNavigatorAlert />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('renders partner link when pairingChannelId is present', async () => {
    setState({
      levelProperties: {
        appName: 'music',
      },
    });
    mockedFetchUserAppOptions.mockResolvedValue({
      isNavigator: true,
      pairingDriver: 'A Student',
      pairingChannelId: 'abc123',
    });

    render(<PairingNavigatorAlert />);

    const link = await screen.findByRole('link', {
      name: 'Click here to view the solution you created as a team.',
    });
    expect(link).toHaveAttribute('href', '/projects/music/abc123/view');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This level was completed while pairing with'
    );
    expect(screen.getByText('A Student')).toBeInTheDocument();
  });

  it('renders teacher-view link copy when teacher is viewing student work', async () => {
    setState({
      levelProperties: {
        appName: 'music',
      },
      viewAsUserId: 7,
    });
    mockedFetchUserAppOptions.mockResolvedValue({
      isNavigator: true,
      pairingDriver: 'A Student',
      pairingChannelId: 'abc123',
    });

    render(<PairingNavigatorAlert isTeacherViewingStudent={true} />);

    await waitFor(() =>
      expect(
        screen.getByRole('link', {
          name: 'Click here to view the solution created as a team.',
        })
      ).toBeInTheDocument()
    );
    expect(mockedFetchUserAppOptions).toHaveBeenCalledWith(
      '/api/user_app_options/test/1/1/1?user_id=7'
    );
  });

  it('renders fallback copy and no link when driver project link is unavailable', async () => {
    setState({
      levelProperties: {
        appName: 'sketchlab',
      },
    });
    mockedFetchUserAppOptions.mockResolvedValue({
      isNavigator: true,
      pairingDriver: 'A Student',
      pairingChannelId: 'abc123',
    });

    render(
      <PairingNavigatorAlert doesAppTypeHaveStandaloneProjectLevel={false} />
    );

    await waitFor(() => {
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        "The solution is not available for viewing. Refer to A Student's work for the solution."
      );
    });
  });

  it('renders fallback copy when standalone project level is unavailable', async () => {
    setState({
      levelProperties: {
        appName: 'sketchlab',
      },
    });
    mockedFetchUserAppOptions.mockResolvedValue({
      isNavigator: true,
      pairingDriver: 'A Student',
    });

    render(
      <PairingNavigatorAlert doesAppTypeHaveStandaloneProjectLevel={false} />
    );

    await waitFor(() => {
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        "The solution is not available for viewing. Refer to A Student's work for the solution."
      );
    });
  });

  it('renders nothing in teacher view when driver info is missing', async () => {
    setState({
      levelProperties: {
        appName: 'music',
      },
      viewAsUserId: 7,
    });
    mockedFetchUserAppOptions.mockResolvedValue({
      isNavigator: true,
      pairingChannelId: 'abc123',
    });

    const {container} = render(
      <PairingNavigatorAlert isTeacherViewingStudent={true} />
    );
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
