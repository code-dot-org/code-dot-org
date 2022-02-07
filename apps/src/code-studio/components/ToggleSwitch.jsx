import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import './styles.scss';

// An accessible toggle, adapted from https://kittygiraudel.com/2021/04/05/an-accessible-toggle/
class ToggleSwitch extends React.Component {
  static propTypes = {
    isToggledOn: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired
  };

  render() {
    const {isToggledOn, onToggle, label} = this.props;

    let dynamicStyle = isToggledOn
      ? styles.toggledOnIcon
      : styles.toggledOffIcon;
    const iconStyle = {...styles.icon, ...dynamicStyle};
    return (
      <button
        id="uitest-code-review-groups-toggle"
        type="button"
        onClick={onToggle}
        aria-pressed={isToggledOn}
        style={styles.button}
        className="button-active-no-border toggle-input"
      >
        <div style={styles.label}>{label}</div>
        <div className="toggle-display">
          <i className={'fa fa-toggle-on'} style={iconStyle} />
        </div>
      </button>
    );
  }
}
export default Radium(ToggleSwitch);

const styles = {
  // remove default button styling
  button: {
    padding: 0,
    border: 0,
    background: 'transparent',
    font: 'inherit',
    ':hover': {
      boxShadow: 'none'
    },
    ':focus': {
      outline: 0,
      boxShadow: 'none'
    },
    textAlign: 'center',
    alignItems: 'center',
    display: 'flex'
  },
  toggledOnIcon: {
    color: color.default_blue
  },
  toggledOffIcon: {
    color: color.charcoal,
    transform: 'rotate(180deg)'
  },
  icon: {
    fontSize: '24px',
    width: '32px'
  },
  label: {
    marginRight: 5,
    padding: 0
  }
};
