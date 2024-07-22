/** Button for use in Maker connection status overlays */
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';

import color from '../../../../util/color';

const style = {
  height: 40,
  paddingLeft: 30,
  paddingRight: 30,
  boxSizing: 'border-box',
  overflow: 'hidden',
  ...fontConstants['main-font-regular'],
  fontSize: 12,
  fontWeight: 'bold',
  color: color.charcoal,
  textDecoration: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderColor: color.charcoal,
  borderWidth: 1,
  borderRadius: 3,
  outline: 'none',
  ':hover': {
    color: color.charcoal,
    borderColor: color.white,
    backgroundColor: color.white,
    cursor: 'pointer',
    boxShadow: 'none',
  },
};

const primaryStyle = {
  backgroundColor: color.charcoal,
  borderColor: color.charcoal,
  color: color.lighter_gray,
};

class OverlayButton extends Component {
  static propTypes = {
    className: PropTypes.string,
    primary: PropTypes.bool,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    const composedStyle = {
      ...style,
      ...(this.props.primary && primaryStyle),
    };

    return (
      <button
        type="button"
        className={this.props.className}
        style={composedStyle}
        onClick={this.props.onClick}
      >
        {this.props.text}
      </button>
    );
  }
}

export default Radium(OverlayButton);
