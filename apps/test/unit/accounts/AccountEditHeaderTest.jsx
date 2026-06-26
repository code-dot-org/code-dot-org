import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AccountEditHeader from '@cdo/apps/accounts/AccountEditHeader';
import * as utils from '@cdo/apps/utils';

describe('AccountEditHeader', () => {
  // window.history.length is read-only on the prototype; shadow it with an own
  // configurable property for the duration of a test.
  const stubHistoryLength = length =>
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      value: length,
    });

  afterEach(() => {
    delete window.history.length;
    jest.restoreAllMocks();
  });

  it('renders the page title and a back link', () => {
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);
    screen.getByRole('heading', {name: 'Account settings'});
    screen.getByRole('link', {name: 'Back'});
  });

  it('navigates back when there is in-app history', () => {
    stubHistoryLength(2);
    const backSpy = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);

    fireEvent.click(screen.getByRole('link', {name: 'Back'}));

    expect(backSpy).toHaveBeenCalled();
  });

  it('falls back to the referrer when there is no in-app history', () => {
    stubHistoryLength(1);
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://studio.code.org/home',
    });
    const navSpy = jest
      .spyOn(utils, 'navigateToHref')
      .mockImplementation(() => {});
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);

    fireEvent.click(screen.getByRole('link', {name: 'Back'}));

    expect(navSpy).toHaveBeenCalledWith('https://studio.code.org/home');
  });
});
