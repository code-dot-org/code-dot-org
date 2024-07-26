import {render, screen, fireEvent} from '@testing-library/react';
import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import cookies from 'js-cookie';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {environmentSpecificCookieName} from '@cdo/apps/code-studio/utils';
import {UnconnectedSignInOrAgeDialog as SignInOrAgeDialog} from '@cdo/apps/templates/SignInOrAgeDialog';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import FakeStorage from '../../util/FakeStorage';
import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
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
    expect(screen.queryByText(i18n.signinForProgress())).to.not.exist;
    expect(screen.queryByText(i18n.provideAge())).to.not.exist;
  });

  it('renders null if script does not require 13+', () => {
    renderDefault({age13Required: false});
    expect(screen.queryByText(i18n.provideAge())).to.not.exist;
  });

  it('renders null if seen before', () => {
    let getItem = sinon.stub(DEFAULT_PROPS.storage, 'getItem');
    getItem.withArgs('anon_over13').returns('true');
    renderDefault({signedIn: true});
    expect(screen.queryByText(i18n.signinForProgress())).to.not.exist;
    expect(screen.queryByText(i18n.provideAge())).to.not.exist;
    getItem.restore();
  });

  it('renders an explanation and button if under 13', () => {
    renderDefault();
    fireEvent.change(screen.getByRole('combobox'), {target: {value: '12'}});
    const okay = screen.getByText('OK');
    fireEvent.click(okay);
    expect(screen.queryByText('Tutorial unavailable for younger students'));
    expect(screen.getByRole('link').getAttribute('href')).to.equal(
      '/hourofcode/overview'
    );
  });

  describe('redirect', () => {
    beforeEach(() => {
      sinon.stub(utils, 'reload');
      sinon.stub(cookies, 'remove');
    });

    afterEach(() => {
      utils.reload.restore();
      cookies.get.restore && cookies.get.restore();
      cookies.remove.restore();
    });

    it('sets sessionStorage, clears cookie, and reloads if you provide an age >= 13', () => {
      const setItemSpy = sinon.spy(DEFAULT_PROPS.storage, 'setItem');
      // We stub cookies, as the domain portion of our cookies.remove in SignInOrAgeDialog
      // does not work in unit tests
      sinon.stub(cookies, 'get').returns('something');

      renderDefault();
      fireEvent.change(screen.getByRole('combobox'), {target: {value: '13'}});
      const okay = screen.getByText('OK');
      fireEvent.click(okay);
      assert(setItemSpy.calledOnce);
      assert(setItemSpy.calledWith('anon_over13', true));
      assert(utils.reload.called);
      assert(
        cookies.remove.calledWith(environmentSpecificCookieName('storage_id'), {
          path: '/',
          domain: '.code.org',
        })
      );
      setItemSpy.restore();
    });

    it('does not reload when providing an age >= 13 if you did not have a cookie', () => {
      renderDefault();
      fireEvent.change(screen.getByRole('combobox'), {target: {value: '13'}});
      const okay = screen.getByText('OK');
      fireEvent.click(okay);
      assert.equal(utils.reload.called, false);
      expect(screen.queryByText(i18n.signinForProgress())).to.not.exist;
    });
  });
});
