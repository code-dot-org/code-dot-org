import React, {useState, useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {
  SemanticTag as TypographyElementSemanticTag,
  VisualAppearance as TypographyElementVisualAppearance,
} from '@cdo/apps/componentLibrary/typography/types';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';

import moduleStyles from './collapsible-section.module.scss';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  titleSemanticTag?: TypographyElementSemanticTag;
  titleVisualAppearance?: TypographyElementVisualAppearance;
  titleStyle?: string;
  titleIcon?: string;
  titleIconStyle?: string;
  initiallyCollapsed?: boolean;
  collapsedIcon?: string;
  expandedIcon?: string;
}

const CollapsibleSection: React.FunctionComponent<CollapsibleSectionProps> = ({
  title,
  children,
  titleSemanticTag = 'p',
  titleVisualAppearance = 'body-one',
  titleStyle = moduleStyles.title,
  titleIcon,
  titleIconStyle = moduleStyles.titleIcon,
  initiallyCollapsed = true,
  collapsedIcon = 'chevron-down',
  expandedIcon = 'chevron-up',
}) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);
  const hasTitleIcon = titleIcon !== undefined;

  return (
    <>
      <div className={moduleStyles.titleRow}>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={moduleStyles.expandCollapseButton}
        >
          <FontAwesomeV6Icon
            iconName={collapsed ? collapsedIcon : expandedIcon}
            iconStyle="solid"
          />
        </button>
        {hasTitleIcon && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className={moduleStyles.expandCollapseButton}
          >
            <FontAwesomeV6Icon
              iconName={titleIcon}
              iconStyle="solid"
              className={titleIconStyle}
            />
          </button>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className={moduleStyles.expandCollapseButton}
        >
          <Typography
            semanticTag={titleSemanticTag}
            visualAppearance={titleVisualAppearance}
            className={titleStyle}
          >
            {title}
          </Typography>
        </button>
      </div>
      {!collapsed && children}
    </>
  );
};

export default CollapsibleSection;
