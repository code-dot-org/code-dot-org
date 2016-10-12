import React from 'react';
import Radium from 'radium';
import color from '../../color';
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
  <button
    style={[styles.collapseButton, props.style]}
    onClick={props.onClick}
  >
    <FontAwesome
      icon={props.collapsed ? 'chevron-circle-down' : 'chevron-circle-up'}
      style={props.isRtl ? styles.collapseIconRtl : styles.collapseIcon}
    />
    {props.collapsed ? msg.more() : msg.less()}
  </button>
);
CollapserButton.propTypes = {
  style: React.PropTypes.object,
  isRtl: React.PropTypes.bool.isRequired,
  onClick: React.PropTypes.func.isRequired,
  collapsed: React.PropTypes.bool.isRequired
};

export default connect(state => {
  return {
    isRtl: state.pageConstants.localeDirection === 'rtl',
  };
})(Radium(CollapserButton));
