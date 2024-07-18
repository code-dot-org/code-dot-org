import {render, screen} from '@testing-library/react';
import React from 'react';

import DCDO from '@cdo/apps/dcdo';
import ResponseMenuDropdown from '@cdo/apps/templates/levelSummary/ResponseMenuDropdown';

const DEFAULT_PROPS = {
  response: {
    user_id: 1,
    text: 'response text',
  },
  hideResponse: () => {},
};

describe('ResponseMenuDropdown', () => {
  const renderDefault = (propOverrides = {}) => {
    render(<ResponseMenuDropdown {...DEFAULT_PROPS} {...propOverrides} />);
  };

  it('does not render when cfu-pin-hide-enabled is false', () => {
    DCDO.set('cfu-pin-hide-enabled', false);

    renderDefault();

    expect(screen.queryByText('Pin response')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('Opens and closes the dropdown', () => {
    DCDO.set('cfu-pin-hide-enabled', true);

    renderDefault();

    const button = screen.getByRole('button');
    expect(screen.queryByText('Pin response')).toBeNull();

    button.click();
    // Using testId because icons don't need to be read by screen readers because label text is right after.
    expect(screen.getAllByTestId('font-awesome-v6-icon')).toHaveLength(3);
    screen.getByText('Pin response');
    screen.getByText('Hide response');

    button.click();
    expect(screen.queryByText('Pin response')).toBeNull();
  });

  it('Closes the dropdown when an option is clicked', () => {
    DCDO.set('cfu-pin-hide-enabled', true);

    const hideResponse = jest.fn();
    renderDefault({hideResponse: hideResponse});

    const button = screen.getByRole('button');
    button.click();

    const pinResponseButton = screen.getByText('Pin response');
    pinResponseButton.click();

    expect(screen.queryByText('Pin response')).toBeNull();

    button.click();

    const hideResponseButton = screen.getByText('Hide response');
    hideResponseButton.click();

    expect(hideResponse).toHaveBeenCalled();
    expect(screen.queryByText('Pin response')).toBeNull();
  });
});
