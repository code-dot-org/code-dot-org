import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import PairingNavigatorAlert from '@cdo/apps/lab2/views/alerts/pairingNavigator/PairingNavigatorAlert';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockedUseAppSelector = useAppSelector as jest.Mock;

function setLevelProperties(levelProperties?: Partial<LevelProperties>) {
  mockedUseAppSelector.mockImplementation(() => levelProperties);
}

describe('PairingNavigatorAlert', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when level is not navigator', () => {
    setLevelProperties({isNavigator: false, appName: 'music'});

    const {container} = render(<PairingNavigatorAlert />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders partner link when pairingAttempt is present', () => {
    setLevelProperties({
      isNavigator: true,
      appName: 'music',
      pairingDriver: 'A Student',
      pairingAttempt: '/level_solutions/123/edit',
    });

    render(<PairingNavigatorAlert />);

    const link = screen.getByRole('link', {
      name: 'Click here to view the solution that was created as a team.',
    });
    expect(link).toHaveAttribute('href', '/level_solutions/123/edit');
    expect(
      screen.getByText('This level was completed while pair programming with')
    ).toBeInTheDocument();
    expect(screen.getByText('A Student')).toBeInTheDocument();
  });

  it('renders nothing with requirePairingDriver when driver info is missing', () => {
    setLevelProperties({
      isNavigator: true,
      appName: 'music',
      pairingChannelId: 'abc123',
    });

    const {container} = render(<PairingNavigatorAlert requirePairingDriver />);
    expect(container).toBeEmptyDOMElement();
  });
});
