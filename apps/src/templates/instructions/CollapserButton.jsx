import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import msg from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import styles from './CollapserButton.module.scss';

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
        className={styles.collapseButton}
        style={this.props.style}
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
            className={
              this.props.isRtl ? styles.collapseIconRtl : styles.collapseIcon
            }
          />
        )}
        <div className={styles.textWrapper}>
          <div className={styles.labelGrid}>
            <div
              className={classNames(
                styles.label,
                this.props.collapsed ? styles.show : styles.hide
              )}
            >
              {msg.more()}
            </div>
            <div
              className={classNames(
                styles.label,
                this.props.collapsed ? styles.hide : styles.show
              )}
            >
              {msg.less()}
            </div>
          </div>
        </div>
      </button>
    );
  }
}

export default CollapserButton;
