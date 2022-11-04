import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const styles = {
  icon: {
    fontSize: 18,
    fontWeight: 400
  }
};

function CollapserIcon({
  id,
  isCollapsed,
  onClick,
  collapsedIconClass,
  expandedIconClass,
  style,
  className
}) {
  const iconClass = isCollapsed ? collapsedIconClass : expandedIconClass;

  return (
    <i
      id={id}
      onClick={onClick}
      role="button"
      className={classNames(iconClass + ' fa', className)}
      style={{...style, ...styles.icon}}
    />
  );
}

CollapserIcon.propTypes = {
  id: PropTypes.string,
  onClick: PropTypes.func,
  isCollapsed: PropTypes.bool.isRequired,
  collapsedIconClass: PropTypes.string,
  expandedIconClass: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string
};

CollapserIcon.defaultProps = {
  collapsedIconClass: 'fa-chevron-circle-down',
  expandedIconClass: 'fa-chevron-circle-up',
  style: {}
};

export default CollapserIcon;
