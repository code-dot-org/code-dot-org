import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '../../util/color';
import styleConstants from '../../styleConstants';

var styles = {
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
var CollapserIcon = function (props) {
  var iconClass = props.collapsed ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up';

  return (
    <i
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
