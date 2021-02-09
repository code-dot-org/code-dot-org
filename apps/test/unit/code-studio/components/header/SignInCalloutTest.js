import React from 'react';
import SignInCallout from '@cdo/apps/code-studio/components/header/SignInCallout';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import i18n from '@cdo/locale';

const wrapper = shallow(<SignInCallout />);

describe('ViewPopup', () => {
  it('displays the correct background darkness', () => {
    wrapper.setState({showCallout: true});
    expect(wrapper.html().includes('opacity:0.5')).to.be.true;
  });

  it('shows the correct header and body text', () => {
    expect(wrapper.html().includes(i18n.notSignedInHeader())).to.be.true;
    expect(wrapper.html().includes(i18n.notSignedInBody())).to.be.true;
  });
});
