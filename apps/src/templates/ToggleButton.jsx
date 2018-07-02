/** @file Button that can be active or inactive, for use inside ToggleGroup */
import React, {PropTypes, Component} from 'react';
import Radium from 'radium';
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
  };

  render() {
    return (
      <button
        id={this.props.id}
        style={this.getStyle()}
        className={"no-outline " + (this.props.className || "")}
        title={this.props.title}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }

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
      this.props.last ? styles.lastButtonStyle : null,
      // used to override any style properties
      this.props.style
    );
  }
}

export default Radium(ToggleButton);
