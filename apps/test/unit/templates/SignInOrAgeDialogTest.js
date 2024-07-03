import {render, screen, fireEvent} from '@testing-library/react';
import {assert} from 'chai';
import cookies from 'js-cookie';
import React from 'react';

import {environmentSpecificCookieName} from '@cdo/apps/code-studio/utils';
import {UnconnectedSignInOrAgeDialog as SignInOrAgeDialog} from '@cdo/apps/templates/SignInOrAgeDialog';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import FakeStorage from '../../util/FakeStorage';

import {replaceOnWindow, restoreOnWindow} from '../../util/testUtils';

const DEFAULT_PROPS = {
  age13Required: true,
  signedIn: false,
  storage: new FakeStorage(),
};

describe('SignInOrAgeDialog', () => {
  beforeEach(() => {
    replaceOnWindow('dashboard', {
      rack_env: 'unit_test',
    });
  });

  afterEach(() => {
    restoreOnWindow('dashboard');
  });

  function renderDefault(propOverrides = {}) {
    render(<SignInOrAgeDialog {...DEFAULT_PROPS} {...propOverrides} />);
  }

  it('renders null if signed in', () => {
    renderDefault({signedIn: true});
    expect(screen.queryByText(i18n.signinForProgress())).toBeFalsy();
    expect(screen.queryByText(i18n.provideAge())).toBeFalsy();
  });

  it('renders null if script does not require 13+', () => {
    renderDefault({age13Required: false});
    expect(screen.queryByText(i18n.provideAge())).toBeFalsy();
  });

  it('renders null if seen before', () => {
    let getItem = jest.spyOn(DEFAULT_PROPS.storage, 'getItem').mockClear().mockImplementation();
    getItem.mockImplementation((...args) => {
      if (args[0] === 'anon_over13') {
        return 'true';
      }
    });
    renderDefault({signedIn: true});
    expect(screen.queryByText(i18n.signinForProgress())).toBeFalsy();
    expect(screen.queryByText(i18n.provideAge())).toBeFalsy();
    getItem.mockRestore();
  });

  it('renders an explanation and button if under 13', () => {
    renderDefault();
    fireEvent.change(screen.getByRole('combobox'), {target: {value: '12'}});
    const okay = screen.getByText('OK');
    fireEvent.click(okay);
    expect(screen.queryByText('Tutorial unavailable for younger students'));
    expect(screen.getByRole('link').getAttribute('href')).toBe('/hourofcode/overview');
  });

  describe('redirect', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'reload').mockClear().mockImplementation();
      jest.spyOn(cookies, 'remove').mockClear().mockImplementation();
    });

    afterEach(() => {
      utils.reload.mockRestore();
      cookies.get.restore && cookies.get.mockRestore();
      cookies.remove.mockRestore();
    });

    it('sets sessionStorage, clears cookie, and reloads if you provide an age >= 13', () => {
      const setItemSpy = jest.spyOn(DEFAULT_PROPS.storage, 'setItem').mockClear();
      // We stub cookies, as the domain portion of our cookies.remove in SignInOrAgeDialog
      // does not work in unit tests
      jest.spyOn(cookies, 'get').mockClear().mockReturnValue('something');

      renderDefault();
      fireEvent.change(screen.getByRole('combobox'), {target: {value: '13'}});
      const okay = screen.getByText('OK');
      fireEvent.click(okay);
      assert(setItemSpy.toHaveBeenCalledTimes(1));
      assert(setItemSpy.calledWith('anon_over13', true));
      assert(utils.toHaveBeenCalled());
      assert(
        cookies.remove.calledWith(environmentSpecificCookieName('storage_id'), {
          path: '/',
          domain: '.code.org',
        })
      );
      setItemSpy.mockRestore();
    });

    it('does not reload when providing an age >= 13 if you did not have a cookie', () => {
      renderDefault();
      fireEvent.change(screen.getByRole('combobox'), {target: {value: '13'}});
      const okay = screen.getByText('OK');
      fireEvent.click(okay);
      assert.equal(utils.toHaveBeenCalled(), false);
      expect(screen.queryByText(i18n.signinForProgress())).toBeFalsy();
    });
  });
});
