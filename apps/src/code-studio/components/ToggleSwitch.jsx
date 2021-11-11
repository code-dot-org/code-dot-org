import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

function ToggleSwitch({isEnabled, onToggle, label}) {
  const dynamicStyle = isEnabled ? styles.enabledIcon : styles.disabledIcon;
  const iconStyle = {...styles.icon, ...dynamicStyle};
  return (
    <button
      key="toggle-button"
      type="button"
      id="enableCodeReview"
      onClick={onToggle}
      aria-pressed={isEnabled}
      style={styles.button}
    >
      <i key="toggle-icon" className={'fa fa-toggle-on'} style={iconStyle} />
      <div>{label}</div>
    </button>
  );
}

ToggleSwitch.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
};

export default Radium(ToggleSwitch);

const styles = {
  // remove default button styling
  button: {
    border: 0,
    outline: 0,
    boxShadow: 'none',
    padding: 0,
    background: 'transparent',
    font: 'inherit',
    ':hover': {
      outline: 0,
      boxShadow: 'none',
      border: '0px none'
    },
    ':focus': {
      outline: 0,
      boxShadow: 'none',
      border: '0px none'
    },
    ':active': {
      outline: 0,
      boxShadow: 'none',
      border: '0px none !important'
    },
    textAlign: 'center',
    alignItems: 'center',
    display: 'flex'
  },
  enabledIcon: {
    color: color.default_blue
  },
  disabledIcon: {
    color: color.charcoal,
    transform: 'rotate(180deg)'
  },
  icon: {
    fontSize: '24px',
    width: '32px'
    // ':focus': {
    //   outline: '1px solid black'
    // },
    // ':focus:not(:focus-visible)': {
    //   outline: 0
    // }
  }
};
