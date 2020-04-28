import {assert} from '../../util/reconfiguredChai';
import React from 'react';
import {UnconnectedSignInOrAgeDialog as SignInOrAgeDialog} from '@cdo/apps/templates/SignInOrAgeDialog';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import cookies from 'js-cookie';
import {environmentSpecificCookieName} from '@cdo/apps/code-studio/utils';
import {replaceOnWindow, restoreOnWindow} from '../../util/testUtils';

describe('SignInOrAgeDialog', () => {
  const defaultProps = {
    age13Required: true,
    signedIn: false
  };

  before(() => {
    replaceOnWindow('sessionStorage', {
      getItem: () => {},
      setItem: () => {}
    });
    replaceOnWindow('dashboard', {
      rack_env: 'unit_test'
    });
  });

  after(() => {
    restoreOnWindow('sessionStorage');
    restoreOnWindow('dashboard');
  });

  it('renders null if signed in', () => {
    const wrapper = shallow(
      <SignInOrAgeDialog {...defaultProps} signedIn={true} />
    );
    assert.equal(wrapper.children().length, 0);
  });

  it('renders null if script does not require 13+', () => {
    const wrapper = shallow(
      <SignInOrAgeDialog {...defaultProps} age13Required={false} />
    );
    assert.equal(wrapper.children().length, 0);
  });

  it('renders null if seen before', () => {
    let getItem = sinon.stub(window.sessionStorage, 'getItem').returns('true');
    const wrapper = shallow(<SignInOrAgeDialog {...defaultProps} />);
    assert.equal(wrapper.children().length, 0);
    getItem.restore();
  });

  it('renders a dialog otherwise', () => {
    const wrapper = shallow(<SignInOrAgeDialog {...defaultProps} />);
    assert.equal(wrapper.name(), 'BaseDialog');
  });

  it('renders an explanation and button if under 13', () => {
    const wrapper = shallow(<SignInOrAgeDialog {...defaultProps} />);
    const instance = wrapper.instance();
    instance.ageDropdown = {
      getValue: () => '12'
    };
    assert.equal(wrapper.state().tooYoung, false);
    instance.onClickAgeOk();
    assert.equal(wrapper.state().tooYoung, true);
    assert.equal(
      wrapper
        .find('BaseDialog div > div')
        .first()
        .text(),
      'Tutorial unavailable for younger students'
    );
    assert.equal(
      wrapper.find('BaseDialog Button').props().text,
      'See all tutorials'
    );
    assert.equal(
      wrapper.find('BaseDialog Button').props().href,
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
      let setItemSpy = sinon.spy(window.sessionStorage, 'setItem');
      // We stub cookies, as the domain portion of our cookies.remove in SignInOrAgeDialog
      // does not work in unit tests
      sinon.stub(cookies, 'get').returns('something');

      const wrapper = shallow(<SignInOrAgeDialog {...defaultProps} />);
      const instance = wrapper.instance();
      instance.ageDropdown = {
        getValue: () => '13'
      };
      wrapper
        .find('Button')
        .at(1)
        .simulate('click');
      assert.equal(setItemSpy.callCount, 1);
      assert(utils.reload.called);
      assert(
        cookies.remove.calledWith(environmentSpecificCookieName('storage_id'), {
          path: '/',
          domain: '.code.org'
        })
      );
      window.sessionStorage.setItem.restore();
    });

    it('does not reload when providing an age >= 13 if you did not have a cookie', () => {
      const wrapper = shallow(<SignInOrAgeDialog {...defaultProps} />);
      const instance = wrapper.instance();
      instance.ageDropdown = {
        getValue: () => '13'
      };
      instance.onClickAgeOk();
      assert.equal(utils.reload.called, false);
      assert.equal(wrapper.state().open, false);
    });
  });
});
