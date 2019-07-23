import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '../../util/color';
import styleConstants from '../../styleConstants';

const styles = {
  showHideButton: {
    position: 'absolute',
    top: 0,
    left: 8,
    margin: 0,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: color.white
    }
  },
  showHideButtonRtl: {
    position: 'absolute',
    top: 0,
    right: 8,
    margin: 0,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: color.white
    }
  },
  teacherOnlyColor: {
    color: color.lightest_cyan,
    ':hover': {
      cursor: 'pointer',
      color: color.default_text
    }
  }
};

/**
 * Simple icon that either points up or down, and supports onClick
 */
class CollapserIcon extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    teacherOnly: PropTypes.bool,
    isRtl: PropTypes.bool
  };

  render() {
    const iconClass = this.props.collapsed
      ? 'fa-chevron-circle-down'
      : 'fa-chevron-circle-up';

    const combinedStyle = {
      ...(this.props.isRtl ? styles.showHideButtonRtl : styles.showHideButton),
      ...(this.props.teacherOnly && styles.teacherOnlyColor)
    };
    return (
      <i
        id="ui-test-collapser"
        style={combinedStyle}
        onClick={this.props.onClick}
        className={iconClass + ' fa'}
      />
    );
  }
}

export default Radium(CollapserIcon);
