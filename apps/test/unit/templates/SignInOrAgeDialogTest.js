import {assert} from '../../util/configuredChai';
import React from 'react';
import {
  UnconnectedSignInOrAgeDialog as SignInOrAgeDialog
} from '@cdo/apps/templates/SignInOrAgeDialog';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import cookies from 'js-cookie';
import { environmentSpecificCookieName } from '@cdo/apps/code-studio/utils';

describe('SignInOrAgeDialog', () => {
  const defaultProps = {
    age13Required: true,
    signedIn: false,
  };

  afterEach(() => sessionStorage.clear());

  it('renders null if signed in', () => {
    const wrapper = shallow(
      <SignInOrAgeDialog
        {...defaultProps}
        signedIn={true}
      />
    );
    assert.equal(wrapper.getNode(), null);
  });

  it('renders null if script does not require 13+', () => {
    const wrapper = shallow(
      <SignInOrAgeDialog
        {...defaultProps}
        age13Required={false}
      />
    );
    assert.equal(wrapper.getNode(), null);
  });

  it('renders null if seen before', () => {
    sessionStorage.setItem('anon_over13', true);
    const wrapper = shallow(
      <SignInOrAgeDialog
        {...defaultProps}
      />
    );
    assert.equal(wrapper.getNode(), null);
  });

  it('renders a dialog otherwise', () => {
    const wrapper = shallow(
      <SignInOrAgeDialog
        {...defaultProps}
      />
    );
    assert.equal(wrapper.name(), 'BaseDialog');
  });

  it('renders an explanation and button if under 13', () => {
    const wrapper = shallow(
      <SignInOrAgeDialog
        {...defaultProps}
      />
    );
    const instance = wrapper.instance();
    instance.ageDropdown = {
      getValue: () => '12'
    };
    wrapper.find('Button').at(1).simulate('click');
    assert.strictEqual(sessionStorage.getItem('anon_over13'), null);
    assert.equal(wrapper.find('BaseDialog div > div').first().text(),
      'Tutorial unavailable for younger students');
    assert.equal(wrapper.find('BaseDialog Button').props().text, 'See all tutorials');
    assert.equal(wrapper.find('BaseDialog Button').props().href, '/hourofcode/overview');
  });

  describe('redirect', () => {
    let stashedRackEnv;

    beforeEach(() => {
      stashedRackEnv = window.dashboard.rack_env;
      window.dashboard.rack_env = 'unit_test';

      sinon.stub(utils, 'reload');
      sinon.stub(cookies, 'remove');
    });
    afterEach(() => {
      utils.reload.restore();
      cookies.get.restore && cookies.get.restore();
      cookies.remove.restore();
      window.dashboard.rack_env = stashedRackEnv;
    });

    it('sets sessionStorage, clears cookie, and reloads if you provide an age >= 13', () => {
      // We stub cookies, as the domain portion of our cookies.remove in SignInOrAgeDialog
      // does not work in unit tests
      sinon.stub(cookies, 'get').returns('something');

      const wrapper = shallow(
        <SignInOrAgeDialog
          {...defaultProps}
        />
      );
      const instance = wrapper.instance();
      instance.ageDropdown = {
        getValue: () => '13'
      };
      wrapper.find('Button').at(1).simulate('click');
      assert.strictEqual(sessionStorage.getItem('anon_over13'), 'true');
      assert(utils.reload.called);
      assert(cookies.remove.calledWith(environmentSpecificCookieName('storage_id'),
        {path: '/', domain: '.code.org'}));
    });

    it('does not reload when providing an age >= 13 if you did not have a cookie', () => {
      const wrapper = shallow(
        <SignInOrAgeDialog
          {...defaultProps}
        />
      );
      const instance = wrapper.instance();
      instance.ageDropdown = {
        getValue: () => '13'
      };
      wrapper.find('Button').at(1).simulate('click');
      assert.equal(utils.reload.called, false);
    });
  });
});
