import {Tooltip} from '@mui/material';
import type {FunctionComponent} from 'react';

import {muiPlacementFor} from '@code-dot-org/component-library/common/helpers';
import type {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

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
    <Tooltip
      id="project-template-workspace-icon-tooltip"
      title="This icon means that this level is part of a larger project. Changes will be saved across these levels."
      placement={muiPlacementFor(tooltipPlace, 'bottom')}
    >
      {/* Wrap the icon in a button so that the tooltip is tabbable. */}
      <button
        type="button"
        aria-label="Project template level"
        className={styles.iconButton}
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
