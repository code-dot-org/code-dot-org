import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';

import JavalabButton from './JavalabButton';
import JavalabSettings from './JavalabSettings';

import style from './control-buttons.module.scss';

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

  return (
    <div>
      <div className={style.leftButtons}>
        <JavalabButton
          id="runButton"
          text={isRunning ? i18n.stop() : i18n.runProgram()}
          icon={
            <FontAwesome icon={isRunning ? 'stop' : 'play'} className="fa" />
          }
          onClick={toggleRun}
          isHorizontal
          className={style.buttonOrange}
          isDisabled={disableRunButton}
        />
        {showTestButton && (
          <JavalabButton
            id="testButton"
            text={isTesting ? i18n.stopTests() : i18n.test()}
            icon={<FontAwesome icon="flask" className="fa" />}
            onClick={toggleTest}
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
};
