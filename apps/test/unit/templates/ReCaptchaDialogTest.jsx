import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import ReCaptchaDialog from '@cdo/apps/templates/ReCaptchaDialog';

const GOOGLE_RECAPTCHA_TEST_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

const DEFAULT_PROPS = {
  handleSubmit: () => {},
  handleCancel: () => {},
  isOpen: true,
  submitText: 'Submit',
  siteKey: GOOGLE_RECAPTCHA_TEST_KEY
};

describe('ReCaptchaDialog', () => {
  it('displays both the cancel and the submit button', () => {
    const wrapper = shallow(<ReCaptchaDialog {...DEFAULT_PROPS} />);
    expect(wrapper.find('Button')).to.have.lengthOf(2);
  });

  it('disables the submit button while the captcha is incomplete', () => {
    const wrapper = shallow(<ReCaptchaDialog {...DEFAULT_PROPS} />);
    const submitButton = wrapper.find('Button').at(1);
    expect(submitButton.props().disabled).to.equal(true);
  });

  it('enables the submit button upon completion of captcha', () => {
    const wrapper = shallow(<ReCaptchaDialog {...DEFAULT_PROPS} />);
    wrapper.setState({submitButtonEnabled: true});
    const submitButton = wrapper.find('Button').at(1);
    expect(submitButton.props().disabled).to.equal(false);
  });

  it('displays Spinner while the captcha is loading', () => {
    const wrapper = shallow(<ReCaptchaDialog {...DEFAULT_PROPS} />);
    expect(wrapper.find('Spinner')).to.have.lengthOf(1);
    wrapper.setState({loadedCaptcha: true});
    expect(wrapper.find('Spinner')).to.have.lengthOf(0);
  });
});
