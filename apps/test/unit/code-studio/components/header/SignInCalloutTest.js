import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import cookies from 'js-cookie';
import React from 'react';
import sinon from 'sinon';

import SignInCalloutWrapper from '@cdo/apps/code-studio/components/header/SignInCalloutWrapper';
import i18n from '@cdo/locale';



describe('ViewPopup', () => {
  it('displays the correct background darkness', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    expect(wrapper.html().includes('opacity:0.5')).toBe(true);
  });

  it('shows the correct header', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    expect(wrapper.html().includes(i18n.notSignedInHeader())).toBe(true);
  });

  it('shows the correct image', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    expect(wrapper.html().includes('user-not-signed-in.png')).toBe(true);
  });
});

describe('Check popup does not appear when flag is set', () => {
  it('does not obscure the current view', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: true});
    expect(wrapper.html()).toBeNull();
  });
});

describe('Check cookies and session storage appear on click', () => {
  afterEach(() => {
    if (cookies.get.restore) {
      cookies.get.restore();
    }
    if (cookies.set.restore) {
      cookies.set.restore();
    }
    if (sessionStorage.getItem.restore) {
      sessionStorage.getItem.restore();
    }
    if (sessionStorage.setItem.restore) {
      sessionStorage.setItem.restore();
    }
  });

  it('cookies appear when clicked', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    var cookieSetStub = sinon.stub(cookies, 'set');
    wrapper.find('.uitest-login-callout').simulate('click');
    expect(cookieSetStub).toHaveBeenCalledWith('hide_signin_callout', 'true', {expires: 1, path: '/'});
  });

  it('session storage appears when clicked', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    wrapper.find('.uitest-login-callout').simulate('click');
    expect(sessionStorage.getItem('hide_signin_callout')).toBe('true');
  });

  it('if cookie is set, callout does not appear', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    sinon.stub(cookies, 'get').withArgs('hide_signin_callout').returns('true');
    expect(wrapper.html()).toBeNull();
  });

  it('if session storage flag is set, callout does not appear', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    sinon
      .stub(sessionStorage, 'getItem')
      .withArgs('hide_signin_callout')
      .returns('true');
    expect(wrapper.html()).toBeNull();
  });

  it('shows prior to click, and dismisses after clicking backdrop', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    expect(wrapper.html().includes('uitest-signincallout')).toBe(true);
    wrapper.find('.modal-backdrop').simulate('click');
    expect(wrapper.html()).toBeNull();
  });

  it('shows prior to click, and dismisses after clicking callout', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    expect(wrapper.html().includes('uitest-signincallout')).toBe(true);
    wrapper.find('.uitest-login-callout').simulate('click');
    expect(wrapper.html()).toBeNull();
  });
});
