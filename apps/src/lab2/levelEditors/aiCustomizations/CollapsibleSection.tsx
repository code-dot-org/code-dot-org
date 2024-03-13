/* eslint-disable import/order */
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {BodyOneText} from '@cdo/apps/componentLibrary/typography';
import React, {useState} from 'react';
import moduleStyles from './edit-ai-customizations.module.scss';

const CollapsibleSection: React.FunctionComponent<{
  title: string;
  children: React.ReactNode;
  initiallyCollapsed?: boolean;
}> = ({title, children, initiallyCollapsed = true}) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);

  return (
    <>
      <div className={moduleStyles.titleRow}>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={moduleStyles.expandCollapseButton}
        >
          <FontAwesomeV6Icon
            iconName={collapsed ? 'chevron-down' : 'chevron-up'}
            iconStyle="solid"
          />
        </button>
        <BodyOneText className={moduleStyles.fieldTitle}>{title}</BodyOneText>
      </div>
      {!collapsed && children}
    </>
  );
};

export default CollapsibleSection;
