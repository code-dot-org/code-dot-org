import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedJavalabCaptchaDialog as JavalabCaptchaDialog} from '@cdo/apps/javalab/JavalabCaptchaDialog';
import ReCaptchaDialog from '@cdo/apps/templates/ReCaptchaDialog';
import javalabMsg from '@cdo/javalab/locale';



describe('JavalabCaptchaDialog', () => {
  let defaultProps,
    onVerifySpy,
    appendNewlineToConsoleLogSpy,
    appendOutputLogSpy,
    setDialogOpenSpy,
    fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    fetchSpy.mockImplementation((...args) => {
      if (args[0] === '/dashboardapi/v1/users/me/verify_captcha') {
        return Promise.resolve({ok: true});
      }
    });

    onVerifySpy = jest.fn();
    appendNewlineToConsoleLogSpy = jest.fn();
    appendOutputLogSpy = jest.fn();
    setDialogOpenSpy = jest.fn();

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
    fetchSpy.mockRestore();
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
        expect(onVerifySpy).toHaveBeenCalledTimes(1);
        expect(
          appendOutputLogSpy.calledOnceWith(javalabMsg.verificationSuccessful())
        ).toBe(true);
        expect(appendNewlineToConsoleLogSpy).toHaveBeenCalledTimes(1);
        expect(setDialogOpenSpy.calledOnceWith(false)).toBe(true);
        done();
      });
  });
});
