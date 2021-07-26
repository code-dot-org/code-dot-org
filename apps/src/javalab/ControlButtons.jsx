import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabButton from './JavalabButton';
import JavalabSettings from './JavalabSettings';

export default function ControlButtons({
  isDarkMode,
  isRunning,
  isTesting,
  toggleRun,
  toggleTest,
  isEditingStartSources,
  isReadOnlyWorkspace,
  onContinue,
  renderSettings
}) {
  const buttonStyles = {
    ...styles.button.all,
    ...(isDarkMode ? styles.button.dark : styles.button.light)
  };

  // Note: The 'noBorder' class is required on the buttons below because there are !important
  // button styles we don't want. This class can be removed when the button:active !important
  // border is removed from common.scss.
  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: isDarkMode ? color.black : color.white
      }}
    >
      <JavalabButton
        text={isRunning ? i18n.stop() : i18n.runProgram()}
        icon={<FontAwesome icon={isRunning ? 'stop' : 'play'} className="fa" />}
        onClick={toggleRun}
        isHorizontal
        style={{...buttonStyles, ...styles.button.orange, float: 'left'}}
      />
      <JavalabButton
        text={isTesting ? i18n.stopTests() : i18n.test()}
        icon={<FontAwesome icon="flask" className="fa" />}
        onClick={toggleTest}
        isHorizontal
        style={{...buttonStyles, ...styles.button.white, float: 'left'}}
      />
      {!isEditingStartSources && (
        <JavalabButton
          text={i18n.finish()}
          onClick={onContinue}
          style={{...buttonStyles, ...styles.button.blue, float: 'right'}}
          isDisabled={isReadOnlyWorkspace}
        />
      )}
      <JavalabSettings>{renderSettings()}</JavalabSettings>
    </div>
  );
}

ControlButtons.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  isRunning: PropTypes.bool.isRequired,
  isTesting: PropTypes.bool.isRequired,
  toggleRun: PropTypes.func.isRequired,
  toggleTest: PropTypes.func.isRequired,
  isEditingStartSources: PropTypes.bool,
  isReadOnlyWorkspace: PropTypes.bool.isRequired,
  onContinue: PropTypes.func.isRequired,
  renderSettings: PropTypes.func.isRequired
};

const styles = {
  container: {
    _display: 'flex',
    _flexDirection: 'row',
    _justifyContent: 'space-around'
  },
  button: {
    all: {
      fontSize: 15,
      width: 140,
      backgroundColor: color.orange,
      borderColor: color.orange,
      fontFamily: '"Gotham 5r"',
      padding: '5px 12px',
      margin: '5px 0 5px 5px',
      ':hover': {
        color: color.white,
        boxShadow: 'none'
      }
    },
    light: {
      //color: color.white
    },
    dark: {
      //color: color.lightest_gray
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
      backgroundColor: color.default_blue,
      borderColor: color.default_blue
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
