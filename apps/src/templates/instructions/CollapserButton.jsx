import React, {PropTypes} from 'react';
import Radium from 'radium';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import msg from '@cdo/locale';
import { connect } from 'react-redux';

const styles = {
  collapseButton: {
    backgroundColor: color.cyan,
    color: color.white,
    whiteSpace: 'nowrap'
  },
  collapseIcon: {
    marginRight: 5
  },
  collapseIconRtl: {
    marginLeft: 5
  }
};

/**
 * A button for toggling the collapse state of instructions in CSF
 */
const CollapserButton = props => (
  // for most tutorials, we use a simple FontAwesome chevron icon for
  // the toggle; for minecraft, we have a custom asset.

  <button
    style={[styles.collapseButton, props.style]}
    id="toggleButton"
    onClick={props.onClick}
  >
    {props.isMinecraft ?
      <img
        src="/blockly/media/1x1.gif"
        className={[(props.collapsed ? 'more-btn' : 'less-btn'), 'toggle26'].join(' ')}
      /> :
      <FontAwesome
        icon={props.collapsed ? 'chevron-circle-down' : 'chevron-circle-up'}
        style={props.isRtl ? styles.collapseIconRtl : styles.collapseIcon}
      />}
    {props.collapsed ? msg.more() : msg.less()}
  </button>
);

CollapserButton.propTypes = {
  style: PropTypes.object,
  isRtl: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  isMinecraft: PropTypes.bool.isRequired,
};

export default connect(state => {
  return {
    isRtl: state.isRtl,
    isMinecraft: !!state.pageConstants.isMinecraft,
  };
})(Radium(CollapserButton));
