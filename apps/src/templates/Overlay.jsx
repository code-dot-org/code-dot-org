import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {hideOverlay} from '../redux/instructions';

import styles from './overlay.module.scss';

// 1020 puts this halfway between the small footer (at 1000) and the
// video modal backdrop (at 1040)
export const Z_INDEX = 1020;

class Overlay extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    hide: PropTypes.func,
    isMinecraft: PropTypes.bool,
  };

  render() {
    const {visible, hide, isMinecraft} = this.props;

    if (!visible) {
      return null;
    }

    return (
      <div
        id="overlay"
        onClick={hide}
        className={classNames(styles.overlay, isMinecraft && styles.minecraft)}
      />
    );
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
)(Overlay);
