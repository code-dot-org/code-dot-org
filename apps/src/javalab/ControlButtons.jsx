import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabButton from './JavalabButton';
import JavalabSettings from './JavalabSettings';
import style from './control-buttons.module.scss';
import ReCaptchaDialog from '@cdo/apps/templates/ReCaptchaDialog';
import {appendOutputLog, appendNewlineToConsoleLog} from './redux/consoleRedux';
import {setCaptchaRequired} from './redux/javalabRedux';
import {getStore} from '@cdo/apps/redux';

export default function ControlButtons({
  isRunning,
  isTesting,
  toggleRun,
  toggleTest,
  isEditingStartSources,
  disableFinishButton,
  onContinue,
  disableRunButton,
  disableTestButton,
  showTestButton,
  isSubmittable,
  isSubmitted,
  finishButtonTooltipText,
  captchaRequired,
  recaptchaSiteKey,
}) {
  /* The ids of these buttons are relied on in other parts of the codebase.
   * All of them are relied on for UI tests
   * The submit/unsubmit button ids are relied on for hooking in the submit
   * utils, see https://github.com/code-dot-org/code-dot-org/blob/47be99d6cf7df2be746b592906f50c0f3860b80a/apps/src/submitHelper.js#L26
   */
  let finishButtonText, finishButtonId;
  if (isSubmitted) {
    finishButtonText = i18n.unsubmit();
    finishButtonId = 'unsubmitButton';
  } else if (isSubmittable) {
    finishButtonText = i18n.submit();
    finishButtonId = 'submitButton';
  } else {
    finishButtonText = i18n.finish();
    finishButtonId = 'finishButton';
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dialogBody = (
    <p>
      Java usage is limited for new users. Verified teachers have access to a
      much higher quota for themselves and their students without any additional
      checks. You can learn why verification is needed on this blog page: link
    </p>
  );

  return (
    <div>
      <div className={style.leftButtons}>
        {captchaRequired && (
          <ReCaptchaDialog
            isOpen={isDialogOpen}
            handleCancel={() => setIsDialogOpen(false)}
            handleSubmit={token => {
              fetch('/dashboardapi/v1/users/me/verify_captcha', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({'g-recaptcha-response': token}),
              }).then(() => {
                getStore().dispatch(
                  appendOutputLog('Verification successful!')
                );
                getStore().dispatch(appendNewlineToConsoleLog());
                getStore().dispatch(setCaptchaRequired(false));
                setIsDialogOpen(false);
              });
            }}
            siteKey={recaptchaSiteKey}
            body={dialogBody}
          />
        )}
        <JavalabButton
          id="runButton"
          text={isRunning ? i18n.stop() : i18n.runProgram()}
          icon={
            <FontAwesome icon={isRunning ? 'stop' : 'play'} className="fa" />
          }
          onClick={() => {
            toggleRun();
            setIsDialogOpen(true);
          }}
          isHorizontal
          className={style.buttonOrange}
          isDisabled={disableRunButton}
        />
        {showTestButton && (
          <JavalabButton
            id="testButton"
            text={isTesting ? i18n.stopTests() : i18n.test()}
            icon={<FontAwesome icon="flask" className="fa" />}
            onClick={() => {
              toggleTest();
              setIsDialogOpen(true);
            }}
            isHorizontal
            className={style.buttonWhite}
            isDisabled={disableTestButton}
          />
        )}
      </div>
      <div className={style.rightButtons}>
        <JavalabSettings />
        {!isEditingStartSources && (
          <JavalabButton
            text={finishButtonText}
            onClick={isSubmittable ? null : onContinue}
            className={style.buttonBlue}
            isDisabled={disableFinishButton}
            id={finishButtonId}
            tooltipText={finishButtonTooltipText}
          />
        )}
      </div>
    </div>
  );
}

ControlButtons.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  isTesting: PropTypes.bool.isRequired,
  toggleRun: PropTypes.func.isRequired,
  toggleTest: PropTypes.func.isRequired,
  isEditingStartSources: PropTypes.bool,
  disableFinishButton: PropTypes.bool,
  onContinue: PropTypes.func.isRequired,
  disableRunButton: PropTypes.bool,
  disableTestButton: PropTypes.bool,
  showTestButton: PropTypes.bool,
  isSubmittable: PropTypes.bool,
  isSubmitted: PropTypes.bool,
  finishButtonTooltipText: PropTypes.string,
  captchaRequired: PropTypes.bool,
  recaptchaSiteKey: PropTypes.string,
};
