/** Button for use in Maker connection status overlays */
import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import color from '../../../../util/color';

const style = {
  height: 40,
  paddingLeft: 30,
  paddingRight: 30,
  boxSizing: 'border-box',
  overflow: 'hidden',
  fontFamily: '"Gotham 4r", sans-serif',
  fontSize: 12,
  fontWeight: 'bold',
  color: color.white,
  textDecoration: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderColor: color.white,
  borderWidth: 1,
  borderRadius: 3,
  outline: 'none',
  ':hover': {
    color: color.black,
    backgroundColor: color.white,
    cursor: 'pointer',
    boxShadow: 'none',
  },
};

class OverlayButton extends Component {
  render() {
    return (
      <button
        className={this.props.className}
        style={style}
        onClick={this.props.onClick}
      >
        {this.props.text}
      </button>
    );
  }
}
OverlayButton.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default Radium(OverlayButton);
