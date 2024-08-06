import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React, {Component} from 'react';

import msg from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';
import color from '../../util/color';

/**
 * A button for toggling the collapse state of instructions in CSF
 */
class CollapserButton extends Component {
  static propTypes = {
    style: PropTypes.object,
    isRtl: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    isMinecraft: PropTypes.bool.isRequired,
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
            alt=""
            className={[
              this.props.collapsed ? 'more-btn' : 'less-btn',
              'toggle26',
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
        <div style={{display: 'inline-block', userSelect: 'none'}}>
          <div style={{display: 'grid'}}>
            <div
              style={{
                opacity: this.props.collapsed ? 1 : 0,
                gridRow: 1,
                gridColumn: 1,
              }}
            >
              {msg.more()}
            </div>
            <div
              style={{
                opacity: this.props.collapsed ? 0 : 1,
                gridRow: 1,
                gridColumn: 1,
              }}
            >
              {msg.less()}
            </div>
          </div>
        </div>
      </button>
    );
  }
}

const styles = {
  collapseButton: {
    backgroundColor: color.neutral_white,
    border: `2px solid ${color.neutral_dark}`,
    color: color.neutral_dark,
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: color.neutral_dark20,
      boxShadow: 'none',
    },
    ':focus': {
      backgroundColor: color.neutral_dark20,
      boxShadow: 'none',
    },
  },
  collapseIcon: {
    marginRight: 5,
  },
  collapseIconRtl: {
    marginLeft: 5,
  },
};

export default Radium(CollapserButton);
