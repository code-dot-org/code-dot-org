import React from 'react';
import SignInCalloutWrapper from '@cdo/apps/code-studio/components/header/SignInCalloutWrapper';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import i18n from '@cdo/locale';

const wrapper = shallow(<SignInCalloutWrapper />);

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
