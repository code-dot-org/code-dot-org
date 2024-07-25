/** @file Button that can be active or inactive, for use inside ToggleGroup */
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React, {Component} from 'react';

import styles from './ToggleButtonStyles';

class ToggleButton extends Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    active: PropTypes.bool.isRequired,
    first: PropTypes.bool,
    last: PropTypes.bool,
    activeColor: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
    children: PropTypes.node,
    useRebrandedLikeStyles: PropTypes.bool,
  };

  render() {
    return (
      <button
        type="button"
        id={this.props.id}
        style={this.getStyle()}
        className={'no-outline ' + (this.props.className || '')}
        title={this.props.title}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }

  getStyle() {
    return Object.assign(
      {},
      {
        ':focus': {
          outline: 'none',
        },
      },
      styles.buttonStyle,
      styles.toggleButtonStyle,
      this.props.active ? styles.activeStyle : styles.inactiveStyle,
      this.props.active &&
        this.props.activeColor && {
          backgroundColor: this.props.activeColor,
        },
      this.props.first ? styles.firstButtonStyle : null,
      this.props.last ? styles.lastButtonStyle : null,
      this.props.useRebrandedLikeStyles
        ? styles.rebrandedLikeButtonStyle
        : null,
      // used to override any style properties
      this.props.style
    );
  }
}

export default Radium(ToggleButton);
