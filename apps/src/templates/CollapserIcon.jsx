import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  icon: {
    fontSize: 18
  }
};

function CollapserIcon({
  id,
  isCollapsed,
  onClick,
  collapsedIconClass,
  expandedIconClass,
  style
}) {
  const iconClass = isCollapsed ? collapsedIconClass : expandedIconClass;

  return (
    <i
      id={id}
      onClick={onClick}
      role="button"
      className={iconClass + ' fa'}
      style={{...styles.icon, ...style}}
    />
  );
}

CollapserIcon.propTypes = {
  id: PropTypes.string,
  onClick: PropTypes.func,
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
