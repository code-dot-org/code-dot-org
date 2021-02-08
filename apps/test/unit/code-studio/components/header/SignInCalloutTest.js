import React from 'react';
import {SignInCallout as Callout} from '@cdo/apps/code-studio/components/header/SignInCallout';
import {shallow} from 'enzyme';
import {expect, assert} from '../../../util/reconfiguredChai';

const CalloutProps = {
  showCallout: true
};
const CookieProps = {
  HideSignInCallout: true
};
const wrapper = shallow(<Callout />);

describe('ViewPopup', () => {
  it('renders a sign in reminder popup', () => {
    assert.equal(wrapper.find('.modal-backdrop').length, 1);
    assert.equal(wrapper.find('.modal-backdrop').at(0), 'link');
    assert.equal(wrapper.find('.modal-backdrop').opacity, 0.5);
  });

  it('hides when dismissed', () => {
    wrapper.setProps(CalloutProps); // force a re-render
    expect(wrapper.find('.modal-backdrop').exists()).to.be.true;
    wrapper.setProps({showCallout: false});
    expect(wrapper.find('.modal-backdrop').exists()).to.be.false;
  });

  it('hides when cookies are set', () => {
    wrapper.setProps(CookieProps);
    expect(wrapper.find('.modal-backdrop').exists()).to.be.false;
  });
});
