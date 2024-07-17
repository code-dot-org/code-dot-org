import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {
  appendNewlineToConsoleLog,
  appendOutputLog,
} from '@cdo/apps/javalab/redux/consoleRedux.ts';
import {setIsCaptchaDialogOpen} from '@cdo/apps/javalab/redux/javalabRedux.ts';
import ReCaptchaDialog from '@cdo/apps/templates/ReCaptchaDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import javalabMsg from '@cdo/javalab/locale';

const BLOG_URL = 'https://support.code.org/hc/en-us/articles/6104078305549';

// exported for tests
export function UnconnectedJavalabCaptchaDialog({
  onVerify,
  onCancel,
  isCaptchaDialogOpen,
  setIsCaptchaDialogOpen,
  appendNewlineToConsoleLog,
  appendOutputLog,
  recaptchaSiteKey,
}) {
  // return promise for tests
  const onCaptchaSubmit = token => {
    return fetch('/dashboardapi/v1/users/me/verify_captcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({'g-recaptcha-response': token}),
    }).then(() => {
      appendOutputLog(javalabMsg.verificationSuccessful());
      appendNewlineToConsoleLog();
      onVerify();
      setIsCaptchaDialogOpen(false);
    });
  };

  const onCaptchaCancel = () => {
    appendOutputLog(javalabMsg.verificationIncomplete());
    appendNewlineToConsoleLog();
    onCancel();
    setIsCaptchaDialogOpen(false);
  };

  return (
    <ReCaptchaDialog
      submitText={javalabMsg.submit()}
      isOpen={isCaptchaDialogOpen}
      handleSubmit={onCaptchaSubmit}
      handleCancel={onCaptchaCancel}
      siteKey={recaptchaSiteKey}
      title={javalabMsg.verificationHeaderMessage()}
    >
      <SafeMarkdown
        markdown={javalabMsg.verificationDialogMessage({blogUrl: BLOG_URL})}
        openExternalLinksInNewTab
      />
    </ReCaptchaDialog>
  );
}

UnconnectedJavalabCaptchaDialog.propTypes = {
  onVerify: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isCaptchaDialogOpen: PropTypes.bool.isRequired,
  setIsCaptchaDialogOpen: PropTypes.func.isRequired,
  appendNewlineToConsoleLog: PropTypes.func.isRequired,
  appendOutputLog: PropTypes.func.isRequired,
  recaptchaSiteKey: PropTypes.string.isRequired,
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
)(UnconnectedJavalabCaptchaDialog);
