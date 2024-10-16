import React, {useMemo} from 'react';

import {ComponentPlacementDirection} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import commonI18n from '@cdo/locale';

import styles from './project-template-workspace-icon-v2.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface ProjectTemplateWorkspaceIconV2Props {
  tooltipPlace?: ComponentPlacementDirection;
  darkMode?: boolean;
  className?: string;
}

/**
 * Modernized version of ProjectTemplateWorkspaceIcon, which uses DSCO for the Tooltip
 * component and a FontAwesome icon for the connected level icon.
 * This component should be used in favor of ProjectTemplateWorkspaceIcon in the workspace
 * header.
 * @param tooltipPlace - The placement of the tooltip relative to the icon. Uses
 * the DSCO ComponentPlacementDirection enum.
 * @param darkMode - boolean to indicate if the workspace is in dark mode. This is only
 * used to style the tooltip. The icon will inherit its color from the parent component.
 * @param className - Additional class name to apply to the icon container.
 * @returns
 */
const ProjectTemplateWorkspaceIconV2: React.FunctionComponent<
  ProjectTemplateWorkspaceIconV2Props
> = ({tooltipPlace, darkMode, className}) => {
  const tooltipClassName = useMemo(() => {
    if (!darkMode) {
      return undefined;
    }
    switch (tooltipPlace) {
      case 'onTop':
        return darkModeStyles.tooltipTop;
      case 'onLeft':
        return darkModeStyles.tooltipLeft;
      case 'onRight':
        return darkModeStyles.tooltipRight;
      case 'onBottom':
      default:
        return darkModeStyles.tooltipBottom;
    }
  }, [tooltipPlace, darkMode]);

  return (
    <WithTooltip
      tooltipProps={{
        text: commonI18n.workspaceProjectTemplateLevel(),
        direction: tooltipPlace || 'onBottom',
        tooltipId: 'project-template-workspace-icon-tooltip',
        className: tooltipClassName,
        size: 'xs',
      }}
      tooltipOverlayClassName={className}
    >
      {/* Wrap the icon in a button so that the tooltip is tabbable. */}
      <button type="button" className={styles.iconButton}>
        <FontAwesomeV6Icon
          iconFamily={'kit'}
          iconName={'connected-level'}
          className={styles.icon}
        />
      </button>
    </WithTooltip>
  );
};

export default ProjectTemplateWorkspaceIconV2;
