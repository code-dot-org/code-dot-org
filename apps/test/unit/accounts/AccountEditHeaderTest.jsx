import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AccountEditHeader from '@cdo/apps/accounts/AccountEditHeader';
import * as utils from '@cdo/apps/utils';

describe('AccountEditHeader', () => {
  // document.referrer is read-only; shadow it with an own configurable
  // property for the duration of a test.
  const stubReferrer = value =>
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value,
    });

  afterEach(() => {
    delete document.referrer;
    jest.restoreAllMocks();
  });

  it('renders the page title and a back link', () => {
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);
    screen.getByRole('heading', {name: 'Account settings'});
    screen.getByRole('link', {name: 'Back'});
  });

  it('walks back when the referrer is same-origin', () => {
    stubReferrer(window.location.origin + '/home');
    const backSpy = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});
    const navSpy = jest
      .spyOn(utils, 'navigateToHref')
      .mockImplementation(() => {});
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);

    fireEvent.click(screen.getByRole('link', {name: 'Back'}));

    expect(backSpy).toHaveBeenCalled();
    expect(navSpy).not.toHaveBeenCalled();
  });

  it('goes home when the referrer is cross-origin', () => {
    stubReferrer('https://www.google.com/');
    const backSpy = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});
    const navSpy = jest
      .spyOn(utils, 'navigateToHref')
      .mockImplementation(() => {});
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);

    fireEvent.click(screen.getByRole('link', {name: 'Back'}));

    expect(navSpy).toHaveBeenCalledWith('/home');
    expect(backSpy).not.toHaveBeenCalled();
  });

  it('goes home when there is no referrer', () => {
    stubReferrer('');
    const backSpy = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});
    const navSpy = jest
      .spyOn(utils, 'navigateToHref')
      .mockImplementation(() => {});
    render(<AccountEditHeader title="Account settings" backLabel="Back" />);

    fireEvent.click(screen.getByRole('link', {name: 'Back'}));

    expect(navSpy).toHaveBeenCalledWith('/home');
    expect(backSpy).not.toHaveBeenCalled();
  });
});
