import {assert} from '../../util/configuredChai';
import React from 'react';
import {
  UnconnectedAgeDialog as AgeDialog
} from '@cdo/apps/templates/AgeDialog';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import cookies from 'js-cookie';
import { environmentSpecificCookieName } from '@cdo/apps/code-studio/utils';

describe('AgeDialog', () => {
  const defaultProps = {
    signedIn: false,
    turnOffFilter: ()=>{}
  };

  afterEach(() => sessionStorage.clear());

  it('renders null if signed in', () => {
    const wrapper = shallow(
      <AgeDialog
        {...defaultProps}
        signedIn={true}
      />
    );
    assert.equal(wrapper.getNode(), null);
  });

  it('renders null if seen before', () => {
    sessionStorage.setItem('anon_over13', true);
    const wrapper = shallow(
      <AgeDialog
        {...defaultProps}
      />
    );
    assert.equal(wrapper.getNode(), null);
  });

  it('renders a dialog otherwise', () => {
    const wrapper = shallow(
      <AgeDialog
        {...defaultProps}
      />
    );
    assert.equal(wrapper.name(), 'BaseDialog');
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
        <AgeDialog
          {...defaultProps}
        />
      );
      const instance = wrapper.instance();
      instance.ageDropdown = {
        getValue: () => '13'
      };
      wrapper.find('Button').at(0).simulate('click');
      assert.strictEqual(sessionStorage.getItem('anon_over13'), 'true');
      assert(utils.reload.called);
      assert(cookies.remove.calledWith(environmentSpecificCookieName('storage_id'),
        {path: '/', domain: '.code.org'}));
    });
  });
});
