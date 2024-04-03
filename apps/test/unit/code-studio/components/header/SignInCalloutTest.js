import React from 'react';
import SignInCalloutWrapper from '@cdo/apps/code-studio/components/header/SignInCalloutWrapper';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import cookies from 'js-cookie';

describe('ViewPopup', () => {
  it('displays the correct background darkness', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    expect(wrapper.html().includes('opacity:0.5')).to.be.true;
  });

  it('shows the correct header', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    expect(wrapper.html().includes(i18n.notSignedInHeader())).to.be.true;
  });

  it('shows the correct image', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    expect(wrapper.html().includes('user-not-signed-in.png')).to.be.true;
  });
});

describe('Check popup does not appear when flag is set', () => {
  it('does not obscure the current view', () => {
    const wrapper = shallow(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: true});
    expect(wrapper.html()).to.be.null;
  });
});

describe('Check cookies and session storage appear on click', () => {
  afterEach(() => {
    if (cookies.get.restore) {
      cookies.get.mockRestore();
    }
    if (cookies.set.restore) {
      cookies.set.mockRestore();
    }
    if (sessionStorage.getItem.restore) {
      sessionStorage.getItem.mockRestore();
    }
    if (sessionStorage.setItem.restore) {
      sessionStorage.setItem.mockRestore();
    }
  });

  it('cookies appear when clicked', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    var cookieSetStub = jest
      .spyOn(cookies, 'set')
      .mockClear()
      .mockImplementation();
    wrapper.find('.uitest-login-callout').simulate('click');
    expect(cookieSetStub).to.have.been.calledWith(
      'hide_signin_callout',
      'true',
      {expires: 1, path: '/'}
    );
  });

  it('session storage appears when clicked', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    var sessionSetStub = jest
      .spyOn(sessionStorage, 'setItem')
      .mockClear()
      .mockImplementation();
    wrapper.find('.uitest-login-callout').simulate('click');
    expect(sessionSetStub).to.have.been.calledWith(
      'hide_signin_callout',
      'true'
    );
  });

  it('if cookie is set, callout does not appear', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    jest
      .spyOn(cookies, 'get')
      .mockClear()
      .mockImplementation((...args) => {
        if (args[0] === 'hide_signin_callout') {
          return 'true';
        }
      });
    expect(wrapper.html()).to.be.null;
  });

  it('if session storage flag is set, callout does not appear', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    jest
      .spyOn(sessionStorage, 'getItem')
      .mockClear()
      .mockImplementation((...args) => {
        if (args[0] === 'hide_signin_callout') {
          return 'true';
        }
      });
    expect(wrapper.html()).to.be.null;
  });

  it('shows prior to click, and dismisses after clicking backdrop', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    expect(wrapper.html().includes('uitest-signincallout')).to.be.true;
    wrapper.find('.modal-backdrop').simulate('click');
    expect(wrapper.html()).to.be.null;
  });

  it('shows prior to click, and dismisses after clicking callout', () => {
    const wrapper = mount(<SignInCalloutWrapper />);
    wrapper.setState({hideCallout: false});
    expect(wrapper.html().includes('uitest-signincallout')).to.be.true;
    wrapper.find('.uitest-login-callout').simulate('click');
    expect(wrapper.html()).to.be.null;
  });
});
