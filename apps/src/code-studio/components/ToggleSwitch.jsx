import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';

import color from '@cdo/apps/util/color';
import './styles.scss';

// An accessible toggle, adapted from https://kittygiraudel.com/2021/04/05/an-accessible-toggle/
class ToggleSwitch extends React.Component {
  static propTypes = {
    isToggledOn: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    expands: PropTypes.string,
  };

  render() {
    const {isToggledOn, onToggle, label, expands} = this.props;

    let dynamicStyle = isToggledOn
      ? styles.toggledOnIcon
      : styles.toggledOffIcon;
    const iconStyle = {...styles.icon, ...dynamicStyle};

    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isToggledOn}
        style={styles.button}
        className="button-active-no-border toggle-input"
        // Technically we should probably use one of `controls` or `owns`, but
        // current screenreader support is so spotty that using both seems like
        // a safer bet for now :(
        // https://a11ysupport.io/tests/tech__aria__aria-controls
        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-owns
        aria-controls={expands}
        aria-owns={expands}
        aria-expanded={expands ? isToggledOn : undefined}
      >
        <div className="toggle-display">
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
    padding: 0,
    border: 0,
    background: 'transparent',
    font: 'inherit',
    ':hover': {
      boxShadow: 'none',
    },
    ':focus': {
      outline: 0,
      boxShadow: 'none',
    },
    textAlign: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  toggledOnIcon: {
    color: color.default_blue,
  },
  toggledOffIcon: {
    color: color.charcoal,
    transform: 'rotate(180deg)',
  },
  icon: {
    fontSize: '24px',
    width: '32px',
  },
  label: {
    marginLeft: 5,
    padding: 0,
  },
};
