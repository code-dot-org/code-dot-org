import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import JavalabButton from './JavalabButton';

export default function ControlButtons({
  isDarkMode,
  isRunning,
  isTesting,
  toggleRun,
  toggleTest
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
        text={isRunning ? 'Stop' : 'Run'}
        icon={
          <FontAwesome icon={isRunning ? 'stop' : 'play'} className="fa-2x" />
        }
        onClick={toggleRun}
        isHorizontal
        className="noBorder"
        style={buttonStyles}
      />
      <JavalabButton
        text={isTesting ? 'Stop Tests' : 'Test'}
        icon={<FontAwesome icon="flask" className="fa-2x" />}
        onClick={toggleTest}
        isHorizontal
        className="noBorder"
        style={buttonStyles}
      />
    </div>
  );
}

ControlButtons.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  isRunning: PropTypes.bool.isRequired,
  isTesting: PropTypes.bool.isRequired,
  toggleRun: PropTypes.func.isRequired,
  toggleTest: PropTypes.func.isRequired
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  button: {
    all: {
      fontSize: 16,
      width: 140,
      backgroundColor: 'transparent',
      ':hover': {
        color: color.orange,
        boxShadow: 'none'
      }
    },
    light: {color: color.cyan},
    dark: {color: color.lightest_gray}
  }
};
