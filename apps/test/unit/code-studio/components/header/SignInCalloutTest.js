import React from 'react';
import SignInCallout from '@cdo/apps/code-studio/components/header/SignInCallout';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';

const CalloutProps = {
  showCallout: true
};
const CookieProps = {
  showCallout: false
};
const wrapper = shallow(<SignInCallout />);

describe('ViewPopup', () => {
  it('hides when dismissed', () => {
    wrapper.setProps(CalloutProps); // force a re-render
    expect(wrapper.find('div.modal-backdrop').exists()).to.be.true;
    wrapper.setProps(CookieProps); // should have now switched to false
    expect(wrapper.find('div.modal-backdrop').exists()).to.be.false;
  });

  it('hides when cookies are set', () => {
    wrapper.setProps(CookieProps);
    expect(wrapper.find('div.modal-backdrop').exists()).to.be.false;
  });
});
