import {assert} from '../../util/configuredChai';
import React from 'react';
import {
  UnconnectedSignInOrAgeDialog as SignInOrAgeDialog
} from '@cdo/apps/templates/SignInOrAgeDialog';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

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

  describe('redirect', () => {
    beforeEach(() => sinon.stub(utils, 'navigateToHref'));
    afterEach(() => utils.navigateToHref.restore());

    it('redirects if you provide an age < 13', () => {
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
      assert(utils.navigateToHref.called);
    });
  });

  it('sets sessionStorage if you provide an age >= 13', () => {
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
  });

});
