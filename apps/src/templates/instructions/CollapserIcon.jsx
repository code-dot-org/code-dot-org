import React, {PropTypes} from 'react';
import Radium from 'radium';
import color from "../../util/color";
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
  teacherOnlyColor: {
    color: color.lightest_cyan,
    ':hover': {
      cursor: 'pointer',
      color: color.default_text
    }
  },
};

/**
 * Simple icon that either points up or down, and supports onClick
 */
const CollapserIcon = function (props) {
  const iconClass = props.collapsed ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up';

  const combinedStyle = {
    ...styles.showHideButton,
    ...(props.teacherOnly && styles.teacherOnlyColor)
  };

  return (
    <i
      id="ui-test-collapser"
      style={combinedStyle}
      onClick={props.onClick}
      className={iconClass + " fa"}
    />
  );
};

CollapserIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  teacherOnly: PropTypes.bool
};

module.exports = Radium(CollapserIcon);
