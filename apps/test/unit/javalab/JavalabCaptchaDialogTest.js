import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedJavalabCaptchaDialog as JavalabCaptchaDialog} from '@cdo/apps/javalab/JavalabCaptchaDialog';
import ReCaptchaDialog from '@cdo/apps/templates/ReCaptchaDialog';
import javalabMsg from '@cdo/javalab/locale';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('JavalabCaptchaDialog', () => {
  let defaultProps,
    onVerifySpy,
    appendNewlineToConsoleLogSpy,
    appendOutputLogSpy,
    setDialogOpenSpy,
    fetchSpy;

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');
    fetchSpy
      .withArgs('/dashboardapi/v1/users/me/verify_captcha')
      .returns(Promise.resolve({ok: true}));

    onVerifySpy = sinon.spy();
    appendNewlineToConsoleLogSpy = sinon.spy();
    appendOutputLogSpy = sinon.spy();
    setDialogOpenSpy = sinon.spy();

    defaultProps = {
      onVerify: onVerifySpy,
      onCancel: () => {},
      isCaptchaDialogOpen: true,
      setIsCaptchaDialogOpen: setDialogOpenSpy,
      appendNewlineToConsoleLog: appendNewlineToConsoleLogSpy,
      appendOutputLog: appendOutputLogSpy,
      recaptchaSiteKey: 'xyz',
    };
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('renders', () => {
    shallow(<JavalabCaptchaDialog {...defaultProps} />);
  });

  it('closes dialog and appends console message after submit', done => {
    const wrapper = shallow(<JavalabCaptchaDialog {...defaultProps} />);

    // Directly invoking this function because submit button is not clickable without some
    // additional initialization of our generic captcha dialog
    wrapper
      .find(ReCaptchaDialog)
      .first()
      .props()
      .handleSubmit()
      .then(() => {
        expect(onVerifySpy.calledOnce).to.be.true;
        expect(
          appendOutputLogSpy.calledOnceWith(javalabMsg.verificationSuccessful())
        ).to.be.true;
        expect(appendNewlineToConsoleLogSpy.calledOnce).to.be.true;
        expect(setDialogOpenSpy.calledOnceWith(false)).to.be.true;
        done();
      });
  });
});
