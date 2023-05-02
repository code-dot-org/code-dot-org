import React from 'react';
import ReCaptchaDialog from '@cdo/apps/templates/ReCaptchaDialog';
import javalabMsg from '@cdo/javalab/locale';
import {connect} from 'react-redux';
import {
  appendNewlineToConsoleLog,
  appendOutputLog,
} from '@cdo/apps/javalab/redux/consoleRedux.ts';
import {setIsCaptchaDialogOpen} from '@cdo/apps/javalab/redux/javalabRedux.ts';
import PropTypes from 'prop-types';

function JavalabCaptchaDialog({
  isCaptchaDialogOpen,
  setIsCaptchaDialogOpen,
  appendNewlineToConsoleLog,
  appendOutputLog,
  recaptchaSiteKey,
}) {
  const onCaptchaSubmit = token => {
    fetch('/dashboardapi/v1/users/me/verify_captcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({'g-recaptcha-response': token}),
    }).then(() => {
      appendOutputLog(javalabMsg.verificationSuccessful());
      appendNewlineToConsoleLog();
      setIsCaptchaDialogOpen(false);
    });
  };

  return (
    <ReCaptchaDialog
      submitText={javalabMsg.submit()}
      isOpen={isCaptchaDialogOpen}
      handleCancel={() => {
        setIsCaptchaDialogOpen(false);
      }}
      handleSubmit={onCaptchaSubmit}
      siteKey={recaptchaSiteKey}
    >
      <h3>{javalabMsg.verificationHeaderMessage()}</h3>
      <p>{javalabMsg.verificationDialogMessage()}</p>
    </ReCaptchaDialog>
  );
}

JavalabCaptchaDialog.propTypes = {
  isCaptchaDialogOpen: PropTypes.bool.isRequired,
  setIsCaptchaDialogOpen: PropTypes.func.isRequired,
  appendNewlineToConsoleLog: PropTypes.func.isRequired,
  appendOutputLog: PropTypes.func.isRequired,
  recaptchaSiteKey: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    recaptchaSiteKey: state.pageConstants.recaptchaSiteKey,
    isCaptchaDialogOpen: state.javalab.isCaptchaDialogOpen,
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    appendNewlineToConsoleLog: () => dispatch(appendNewlineToConsoleLog()),
    setIsCaptchaDialogOpen: isDialogOpen =>
      dispatch(setIsCaptchaDialogOpen(isDialogOpen)),
  })
)(JavalabCaptchaDialog);
