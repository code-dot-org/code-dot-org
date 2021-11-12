import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

class ToggleSwitch extends React.Component {
  static propTypes = {
    isEnabled: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired
  };

  render() {
    const {isEnabled, onToggle, label} = this.props;

    const dynamicStyle = isEnabled ? styles.enabledIcon : styles.disabledIcon;
    const iconStyle = {...styles.icon, ...dynamicStyle};
    const isButtonFocused = Radium.getState(this.state, 'main', ':focus');
    return (
      <button
        ref={ref => (this.buttonDiv = ref)}
        type="button"
        id="enableCodeReview"
        onClick={onToggle}
        aria-pressed={isEnabled}
        style={styles.button}
      >
        <div
          style={isButtonFocused ? styles.toggleIconDivFocus : {}}
          ref={ref => (this.toggleIconDiv = ref)}
        >
          <i className={'fa fa-toggle-on'} style={iconStyle} />
        </div>
        <div style={styles.label}>{label}</div>
      </button>
    );
  }
}
export default Radium(ToggleSwitch);

const styles = {
  // remove default button styling
  button: {
    border: '0px none',
    // outline: 0,
    // boxShadow: 'none',
    // padding: 0,
    background: 'transparent',
    font: 'inherit',
    ':hover': {
      outline: 0,
      boxShadow: 'none'
      //border: '0px none'
    },
    ':focus': {
      outline: 0,
      boxShadow: 'none'
      //border: '0px none'
    },
    ':active': {
      outline: 0,
      boxShadow: 'none'
      //border: '0px none !important'
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
  },
  toggleIconDivFocus: {
    outline: '1px solid black'
  },
  label: {
    marginLeft: 5
  }
};
