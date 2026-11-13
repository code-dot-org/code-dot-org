import {render, screen} from '@testing-library/react';
import React from 'react';

import FinalProjectCallout from '@cdo/apps/adaptive/views/FinalProjectCallout';

describe('FinalProjectCallout', () => {
  it('renders the title and body text', () => {
    render(<FinalProjectCallout onDismiss={jest.fn()} />);

    expect(screen.getByText('Keep working on your project')).toBeTruthy();
    expect(screen.getByText(/completed all the checkpoints/)).toBeTruthy();
  });

  it('calls onDismiss when the close button is clicked', () => {
    const onDismiss = jest.fn();
    render(<FinalProjectCallout onDismiss={onDismiss} />);

    screen.getByRole('button', {name: 'Dismiss'}).click();

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
