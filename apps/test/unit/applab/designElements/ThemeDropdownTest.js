import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import ThemeDropdown from '@cdo/apps/applab/designElements/ThemeDropdown';

const DEFAULT_PROPS = {
  initialValue: 'citrus',
  handleChange: () => {},
  description: 'Theme',
};

// The dropdown trigger button carries the description as its aria-label.
const getTrigger = () => screen.getByRole('button', {name: 'Theme'});

describe('ThemeDropdown', () => {
  it('shows the selected theme name in the closed control', () => {
    render(<ThemeDropdown {...DEFAULT_PROPS} />);

    expect(getTrigger()).toHaveTextContent('Citrus');
  });

  it('calls handleChange with the option value and updates the selection', () => {
    const handleChangeSpy = jest.fn();
    render(<ThemeDropdown {...DEFAULT_PROPS} handleChange={handleChangeSpy} />);

    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('button', {name: /Bubblegum/}));

    expect(handleChangeSpy).toHaveBeenCalledTimes(1);
    expect(handleChangeSpy).toHaveBeenCalledWith('bubblegum');
    expect(getTrigger()).toHaveTextContent('Bubblegum');
  });
});
