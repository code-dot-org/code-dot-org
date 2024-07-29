import React, {useState, useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './collapsible-section.module.scss';

interface CollapsibleSectionProps {
  children: React.ReactNode;
  headerContent: React.ReactNode;
  initiallyCollapsed?: boolean;
  collapsedIcon?: string;
  expandedIcon?: string;
}

const CollapsibleSection: React.FunctionComponent<CollapsibleSectionProps> = ({
  children,
  headerContent,
  initiallyCollapsed = true,
  collapsedIcon = 'chevron-down',
  expandedIcon = 'chevron-up',
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
          iconName={collapsed ? collapsedIcon : expandedIcon}
          iconStyle="solid"
        />
        {headerContent}
      </button>
      {!collapsed && children}
    </>
  );
};

export default CollapsibleSection;
