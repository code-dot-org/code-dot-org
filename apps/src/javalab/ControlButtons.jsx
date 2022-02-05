import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabButton from './JavalabButton';
import JavalabSettings from './JavalabSettings';

export default function ControlButtons({
  isRunning,
  isTesting,
  toggleRun,
  toggleTest,
  isEditingStartSources,
  disableFinishButton,
  onContinue,
  renderSettings,
  disableRunButton,
  disableTestButton,
  showTestButton,
  isSubmittable,
  isSubmitted
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
      <div style={styles.leftButtons}>
        <JavalabButton
          id="runButton"
          text={isRunning ? i18n.stop() : i18n.runProgram()}
          icon={
            <FontAwesome icon={isRunning ? 'stop' : 'play'} className="fa" />
          }
          onClick={toggleRun}
          isHorizontal
          style={{...styles.button.all, ...styles.button.orange}}
          isDisabled={disableRunButton}
        />
        {showTestButton && (
          <JavalabButton
            id="testButton"
            text={isTesting ? i18n.stopTests() : i18n.test()}
            icon={<FontAwesome icon="flask" className="fa" />}
            onClick={toggleTest}
            isHorizontal
            style={{...styles.button.all, ...styles.button.white}}
            isDisabled={disableTestButton}
          />
        )}
      </div>
      <div style={styles.rightButtons}>
        <JavalabSettings>{renderSettings()}</JavalabSettings>
        {!isEditingStartSources && (
          <JavalabButton
            text={finishButtonText}
            onClick={isSubmittable ? null : onContinue}
            style={{...styles.button.all, ...styles.button.blue}}
            isDisabled={disableFinishButton}
            id={finishButtonId}
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
  renderSettings: PropTypes.func.isRequired,
  disableRunButton: PropTypes.bool,
  disableTestButton: PropTypes.bool,
  showTestButton: PropTypes.bool,
  isSubmittable: PropTypes.bool,
  isSubmitted: PropTypes.bool
};

const styles = {
  leftButtons: {
    float: 'left'
  },
  rightButtons: {
    float: 'right'
  },
  button: {
    all: {
      float: 'left',
      fontSize: 15,
      width: 140,
      backgroundColor: color.orange,
      borderColor: color.orange,
      fontFamily: '"Gotham 5r"',
      padding: '5px 12px',
      margin: '5px 0 5px 5px',
      justifyContent: 'center',
      ':hover': {
        color: color.white,
        boxShadow: 'none'
      }
    },
    orange: {
      backgroundColor: color.orange,
      borderColor: color.orange
    },
    white: {
      backgroundColor: color.white,
      borderColor: color.dark_charcoal,
      color: color.dark_charcoal,
      ':hover': {
        color: color.dark_charcoal,
        boxShadow: 'none'
      }
    },
    blue: {
      backgroundColor: color.cyan,
      borderColor: color.cyan
    }
  },
  finish: {
    backgroundColor: color.orange,
    borderColor: color.orange,
    fontFamily: '"Gotham 5r"',
    fontSize: '15px',
    padding: '1px 8px',
    margin: '5px 0 5px 5px'
  }
};
