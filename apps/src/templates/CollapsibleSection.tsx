import classNames from 'classnames';
import React, {useState, useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './collapsible-section.module.scss';

interface CollapsibleSectionProps {
  children: React.ReactNode;
  headerContent: React.ReactNode;
  initiallyCollapsed?: boolean;
  // If a single iconName is provided, it will be used for both collapsed and expanded states.
  // When expanded, the icon will be rotated 90 degrees.
  iconName?: string;
  // If separate collapsed and expanded icons are provided, each will be used in its respective state.
  collapsedIcon?: string;
  expandedIcon?: string;
}

const CollapsibleSection: React.FunctionComponent<CollapsibleSectionProps> = ({
  children,
  headerContent,
  initiallyCollapsed = true,
  iconName = 'caret-right',
  collapsedIcon = 'caret-right',
  expandedIcon = 'caret-down',
}) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return (
    <>
      <button
        type="button"
        onClick={toggleCollapsed}
        className={moduleStyles.expandCollapseButton}
      >
        <FontAwesomeV6Icon
          iconName={iconName || (collapsed ? collapsedIcon : expandedIcon)}
          iconStyle="solid"
          className={classNames(
            moduleStyles.icon,
            iconName && !collapsed && moduleStyles.iconExpanded
          )}
        />
        {headerContent}
      </button>
      {!collapsed && children}
    </>
  );
};

export default CollapsibleSection;
