import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  icon: {
    fontSize: '18px'
  }
};

function CollapserIcon({
  isCollapsed,
  onClick,
  collapsedIconClass,
  expandedIconClass,
  style
}) {
  const iconClass = isCollapsed ? collapsedIconClass : expandedIconClass;

  return (
    <i
      id="ui-test-collapser"
      onClick={onClick}
      role="button"
      className={iconClass + ' fa'}
      style={{...styles.icon, ...style}}
    />
  );
}

CollapserIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  collapsedIconClass: PropTypes.string,
  expandedIconClass: PropTypes.string,
  style: PropTypes.object
};

CollapserIcon.defaultProps = {
  collapsedIconClass: 'fa-chevron-circle-down',
  expandedIconClass: 'fa-chevron-circle-up',
  style: {}
};

export default CollapserIcon;
