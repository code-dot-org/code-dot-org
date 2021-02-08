import React from 'react';
import {SignInCallout as Callout} from '@cdo/apps/code-studio/components/header/SignInCallout';
import {shallow} from 'enzyme';
import {expect, assert} from '../../../../util/reconfiguredChai';

const CalloutProps = {
  showCallout: true
};
const CookieProps = {
  HideSignInCallout: true
};
const wrapper = shallow(<Callout />);

describe('ViewPopup', () => {
  it('hides when dismissed', () => {
    wrapper.setProps(CalloutProps); // force a re-render
    expect(wrapper.find('.modal-backdrop').exists()).to.be.true;
    assert.equal(wrapper.find('.modal-backdrop').opacity, 0.5);
    wrapper.setProps({showCallout: false});
    expect(wrapper.find('.modal-backdrop').exists()).to.be.false;
  });

  it('hides when cookies are set', () => {
    wrapper.setProps(CookieProps);
    expect(wrapper.find('.modal-backdrop').exists()).to.be.false;
  });
});
