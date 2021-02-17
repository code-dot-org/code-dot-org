import React from 'react';
import SignInCalloutWrapper from '@cdo/apps/code-studio/components/header/SignInCalloutWrapper';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import sinon from 'sinon';
import cookies from 'js-cookie';

const wrapper = shallow(<SignInCalloutWrapper />);
const parentWrapper = mount(<SignInCalloutWrapper />);

describe('ViewPopup', () => {
  it('displays the correct background darkness', () => {
    wrapper.setState({hideCallout: false});
    expect(wrapper.html().includes('opacity:0.5')).to.be.true;
  });

  it('shows the correct header', () => {
    expect(wrapper.html().includes(i18n.notSignedInHeader())).to.be.true;
  });

  it('shows the correct image', () => {
    expect(wrapper.html().includes('user-not-signed-in.png')).to.be.true;
  });
});

describe('Check popup does not appear when flag is set', () => {
  it('does not obscure the current view', () => {
    wrapper.setState({hideCallout: true});
    expect(wrapper.html() === null).to.be.true;
  });
});

describe('Check cookies and session storage appear on click', () => {
  let server;
  beforeEach(() => {
    server = sinon.fakeServer.create();
  });
  afterEach(() => {
    server.restore();
    if (cookies.get('hide_signin_callout').restore) {
      cookies.get('hide_signin_callout').restore();
    }
    if (sessionStorage.getItem('hide_signin_callout').restore) {
      sessionStorage.getItem('hide_signin_callout').restore();
    }
  });

  it('cookies appear when clicked, and callout disappears', () => {
    parentWrapper.setState({hideCallout: false});
    expect(parentWrapper.html().includes('uitest-signincallout')).to.be.true;
    var callback = sinon.stub(cookies, 'get').withArgs('hide_signin_callout');
    callback.returns(null);
    parentWrapper.find('.modal-backdrop').simulate('click');
    expect(parentWrapper.html() === null).to.be.true;
    callback.returns('true');
  });

  it('session storage appears when clicked, and callout disappears', () => {
    parentWrapper.setState({hideCallout: false});
    expect(parentWrapper.html().includes('uitest-signincallout')).to.be.true;
    var callback = sinon
      .stub(sessionStorage, 'getItem')
      .withArgs('hide_signin_callout');
    callback.returns(null);
    parentWrapper.find('.modal-backdrop').simulate('click');
    expect(parentWrapper.html() === null).to.be.true;
    callback.returns('true');
  });
});

describe('The click to dismiss correctly updates the flag', () => {
  it('shows prior to click, and dismisses after', () => {
    parentWrapper.setState({hideCallout: false});
    expect(parentWrapper.html().includes('uitest-signincallout')).to.be.true;
    parentWrapper.find('.modal-backdrop').simulate('click');
    expect(parentWrapper.html() === null).to.be.true;

    if (cookies.get('hide_signin_callout').restore) {
      cookies.get('hide_signin_callout').restore();
    }
    if (sessionStorage.getItem('hide_signin_callout').restore) {
      sessionStorage.getItem('hide_signin_callout').restore();
    }
  });
});
