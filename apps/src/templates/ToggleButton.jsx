/** @file Button that can be active or inactive, for use inside ToggleGroup */
import React from 'react';
import Radium from 'radium';
import styles from './ToggleButtonStyles';

const ToggleButton = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    active: React.PropTypes.bool.isRequired,
    first: React.PropTypes.bool,
    last: React.PropTypes.bool,
    activeColor: React.PropTypes.string,
    title: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired,
    children: React.PropTypes.node,
  },

  render() {
    return (
      <button
        id={this.props.id}
        style={this.getStyle()}
        className="no-outline"
        title={this.props.title}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  },

  getStyle() {
    return Object.assign({},
      {
        ':focus': {
          outline: 'none'
        }
      },
      styles.buttonStyle,
      styles.toggleButtonStyle,
      this.props.active ? styles.activeStyle : styles.inactiveStyle,
      this.props.active && this.props.activeColor && {
        backgroundColor: this.props.activeColor
      },
      this.props.first ? styles.firstButtonStyle: null,
      this.props.last ? styles.lastButtonStyle : null);
  }
});
export default Radium(ToggleButton);
