import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AccountEditHeader from '@cdo/apps/accounts/AccountEditHeader';

describe('AccountEditHeader', () => {
  it('renders the page title and a back link', () => {
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);
    screen.getByRole('heading', {name: 'Account settings'});
    screen.getByRole('link', {name: 'Back'});
  });

  it('navigates back when the back link is clicked', () => {
    const backSpy = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);

    fireEvent.click(screen.getByRole('link', {name: 'Back'}));

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
