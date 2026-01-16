import type {FunctionComponent} from 'react';

import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import styles from './projectTemplateWorkspaceIcon.module.scss';

export interface ProjectTemplateWorkspaceIconV2Props {
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
const ProjectTemplateWorkspaceIconV2: FunctionComponent<
  ProjectTemplateWorkspaceIconV2Props
> = ({tooltipPlace}) => {
  return (
    <WithTooltip
      tooltipProps={{
        text: 'This icon means that this level is part of a larger project. Changes will be saved across these levels.',
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
