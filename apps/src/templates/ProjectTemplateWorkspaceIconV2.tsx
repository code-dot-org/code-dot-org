import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip, TooltipProps} from '@mui/material';
import classnames from 'classnames';
import React from 'react';

import commonI18n from '@cdo/locale';

import styles from './project-template-workspace-icon-v2.module.scss';

interface ProjectTemplateWorkspaceIconV2Props {
  tooltipPlace?: ComponentPlacementDirection;
  className?: string;
}

// Map the DSCO ComponentPlacementDirection enum to the MUI Tooltip placement API.
const PLACEMENT_MAP: Record<
  ComponentPlacementDirection,
  TooltipProps['placement']
> = {
  onTop: 'top',
  onRight: 'right',
  onBottom: 'bottom',
  onLeft: 'left',
};

/**
 * Modernized version of ProjectTemplateWorkspaceIcon, which uses DSCO for the Tooltip
 * component and a FontAwesome icon for the connected level icon.
 * This component should be used in favor of ProjectTemplateWorkspaceIcon in the workspace
 * header.
 * @param tooltipPlace - The placement of the tooltip relative to the icon. Uses
 * the DSCO ComponentPlacementDirection enum.
 * @returns
 */
const ProjectTemplateWorkspaceIconV2: React.FunctionComponent<
  ProjectTemplateWorkspaceIconV2Props
> = ({tooltipPlace, className}) => {
  return (
    <Tooltip
      title={commonI18n.workspaceProjectTemplateLevel()}
      placement={PLACEMENT_MAP[tooltipPlace || 'onBottom']}
    >
      {/* Wrap the icon in a button so that the tooltip is tabbable. */}
      <button
        type="button"
        aria-label="Project template level"
        className={classnames(className, styles.iconButton)}
      >
        <FontAwesomeV6Icon
          iconFamily={'kit'}
          iconName={'connected-level'}
          className={styles.icon}
        />
      </button>
    </Tooltip>
  );
};

export default ProjectTemplateWorkspaceIconV2;
