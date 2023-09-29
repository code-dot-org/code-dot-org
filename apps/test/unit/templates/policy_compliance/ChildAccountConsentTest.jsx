import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ChildAccountConsent from '@cdo/apps/templates/policy_compliance/ChildAccountConsent';

describe('ChildAccountConsent', () => {
  it('given no permission, shows the link expired message', () => {
    const props = {permissionGranted: false};
    const wrapper = shallow(<ChildAccountConsent {...props} />);
    expect(wrapper.find('#expired_token_container')).to.have.lengthOf(1);
  });
  it('given permission, shows the thanks message', () => {
    const props = {permissionGranted: true, permissionGrantedDate: new Date()};
    const wrapper = shallow(<ChildAccountConsent {...props} />);
    expect(wrapper.find('#permission_granted_container')).to.have.lengthOf(1);
  });
});
