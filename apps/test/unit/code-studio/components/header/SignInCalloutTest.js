import React from 'react';
import SignInCalloutLogic from '@cdo/apps/code-studio/components/header/SignInCalloutLogic';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import i18n from '@cdo/locale';

const wrapper = shallow(<SignInCalloutLogic />);

describe('ViewPopup', () => {
  it('displays the correct background darkness', () => {
    wrapper.setState({showCallout: true});
    expect(wrapper.html().includes('opacity:0.5')).to.be.true;
  });

  it('shows the correct header', () => {
    expect(wrapper.html().includes(i18n.notSignedInHeader())).to.be.true;
  });

  it('shows the correct image', () => {
    expect(wrapper.html().includes('user-not-signed-in.png')).to.be.true;
  });
});
