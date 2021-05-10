import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '../../util/color';
import FontAwesome from '../FontAwesome';
import msg from '@cdo/locale';

/**
 * A button for toggling the collapse state of instructions in CSF
 */
class CollapserButton extends Component {
  static propTypes = {
    style: PropTypes.object,
    isRtl: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    isMinecraft: PropTypes.bool.isRequired
  };

  render() {
    // for most tutorials, we use a simple FontAwesome chevron icon for
    // the toggle; for minecraft, we have a custom asset.

    return (
      <button
        type="button"
        style={[styles.collapseButton, this.props.style]}
        id="toggleButton"
        onClick={this.props.onClick}
      >
        {this.props.isMinecraft ? (
          <img
            src="/blockly/media/1x1.gif"
            className={[
              this.props.collapsed ? 'more-btn' : 'less-btn',
              'toggle26'
            ].join(' ')}
          />
        ) : (
          <FontAwesome
            icon={
              this.props.collapsed ? 'chevron-circle-down' : 'chevron-circle-up'
            }
            style={
              this.props.isRtl ? styles.collapseIconRtl : styles.collapseIcon
            }
          />
        )}
        {this.props.collapsed ? msg.more() : msg.less()}
      </button>
    );
  }
}

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

export default Radium(CollapserButton);
