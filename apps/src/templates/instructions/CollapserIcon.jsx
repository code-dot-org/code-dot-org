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
};

/**
 * Simple icon that either points up or down, and supports onClick
 */
const CollapserIcon = function (props) {
  const iconClass = props.collapsed ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up';

  return (
    <i
      id="ui-test-collapser"
      style={styles.showHideButton}
      onClick={props.onClick}
      className={iconClass + " fa"}
    />
  );
};

CollapserIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired
};

module.exports = Radium(CollapserIcon);
