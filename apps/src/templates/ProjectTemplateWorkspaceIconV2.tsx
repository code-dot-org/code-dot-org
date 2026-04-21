import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React from 'react';

import commonI18n from '@cdo/locale';

import styles from './project-template-workspace-icon-v2.module.scss';

interface ProjectTemplateWorkspaceIconV2Props {
  tooltipPlace?: ComponentPlacementDirection;
}

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
> = ({tooltipPlace}) => {
  return (
    <WithTooltip
      tooltipProps={{
        text: commonI18n.workspaceProjectTemplateLevel(),
        direction: tooltipPlace || 'onBottom',
        tooltipId: 'project-template-workspace-icon-tooltip',
        size: 'xs',
      }}
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
