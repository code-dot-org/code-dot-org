import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import moduleStyles from './collapser-icon.module.scss';

const styles = {
  icon: {
    fontSize: 18,
    fontWeight: 400,
  },
};

function CollapserIcon({
  id,
  isCollapsed,
  onClick,
  collapsedIconClass,
  expandedIconClass,
  style,
  className,
}) {
  const iconClass = isCollapsed ? collapsedIconClass : expandedIconClass;

  return (
    <button
      id={id}
      onClick={onClick}
      className={classNames(
        iconClass + ' fa',
        className,
        moduleStyles.collapserIcon,
        'no-mc'
      )}
      style={{...style, ...styles.icon}}
      type="button"
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
  className: PropTypes.string,
};

CollapserIcon.defaultProps = {
  collapsedIconClass: 'fa-chevron-circle-down',
  expandedIconClass: 'fa-chevron-circle-up',
  style: {},
};

export default CollapserIcon;
