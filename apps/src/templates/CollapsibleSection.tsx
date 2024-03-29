import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import React, {useState} from 'react';
import moduleStyles from './collapsible-section.module.scss';
import {
  SemanticTag,
  VisualAppearance,
} from '@cdo/apps/componentLibrary/typography/types';

const CollapsibleSection: React.FunctionComponent<{
  title: string;
  titleSemanticTag?: SemanticTag;
  titleVisualAppearance?: VisualAppearance;
  children: React.ReactNode;
  initiallyCollapsed?: boolean;
  collapsedIcon?: string;
  expandedIcon?: string;
}> = ({
  title,
  titleSemanticTag = 'p',
  titleVisualAppearance = 'body-one',
  children,
  initiallyCollapsed = true,
  collapsedIcon = 'chevron-down',
  expandedIcon = 'chevron-up',
}) => {
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
            iconName={collapsed ? collapsedIcon : expandedIcon}
            iconStyle="solid"
          />
        </button>
        <Typography
          semanticTag={titleSemanticTag}
          visualAppearance={titleVisualAppearance}
          className={moduleStyles.fieldTitle}
        >
          {title}
        </Typography>
      </div>
      {!collapsed && children}
    </>
  );
};

export default CollapsibleSection;
