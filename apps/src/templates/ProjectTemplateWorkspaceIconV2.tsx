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

// Legacy direction → MUI placement ('none' and unset → bottom).
const PLACEMENT_MAP: Record<
  ComponentPlacementDirection,
  TooltipProps['placement']
> = {
  onTop: 'top',
  onRight: 'right',
  onBottom: 'bottom',
  onLeft: 'left',
  none: 'bottom',
};

/**
 * Modernized ProjectTemplateWorkspaceIcon: MUI Tooltip + a FontAwesome
 * connected-level icon. Prefer this over ProjectTemplateWorkspaceIcon in the
 * workspace header.
 * @param tooltipPlace - Tooltip placement, as a DSCO ComponentPlacementDirection.
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
