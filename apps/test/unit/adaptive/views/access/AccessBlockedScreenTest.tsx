import {render, screen} from '@testing-library/react';
import React from 'react';

import AccessBlockedScreen from '@cdo/apps/adaptive/views/access/AccessBlockedScreen';

describe('AccessBlockedScreen', () => {
  it('offers home and Quest Builder when AI is unavailable', () => {
    render(<AccessBlockedScreen reason="aiUnavailable" />);
    expect(
      screen.getByRole('heading', {
        name: 'AI Makerspace is temporarily unavailable',
      })
    ).toBeTruthy();
    expect(
      screen.getByRole('link', {name: 'Back to Home page'})
    ).toHaveAttribute('href', '/home');
    expect(
      screen.getByRole('link', {name: 'Try Quest Builder'})
    ).toHaveAttribute('href', '/s/quest-builder-2026/reset');
    expect(screen.queryByText(/Continue to AI Makerspace/)).toBeNull();
  });
});
