import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';

import {hideOverlay} from '../redux/instructions';

// 1020 puts this halfway between the small footer (at 1000) and the
// video modal backdrop (at 1040)
export const Z_INDEX = 1020;

const style = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  opacity: 0.4,
  backgroundColor: 'black',
  zIndex: Z_INDEX,
};

const craftStyle = {
  opacity: 0.8,
};

class Overlay extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    hide: PropTypes.func,
    isMinecraft: PropTypes.bool,
  };

  render() {
    return this.props.visible ? (
      <div
        id="overlay"
        onClick={this.props.hide}
        style={[style, this.props.isMinecraft && craftStyle]}
      />
    ) : null;
  }
}

export default connect(
  function propsFromStore(state) {
    return {
      visible: state.instructions.overlayVisible,
      isMinecraft: !!state.pageConstants.isMinecraft,
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      hide: function () {
        dispatch(hideOverlay());
      },
    };
  }
)(Radium(Overlay));
