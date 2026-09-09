import {muiPlacementFor} from '@code-dot-org/component-library/common/helpers';
import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip} from '@mui/material';
import classnames from 'classnames';
import React from 'react';

import commonI18n from '@cdo/locale';

import styles from './project-template-workspace-icon-v2.module.scss';

interface ProjectTemplateWorkspaceIconV2Props {
  tooltipPlace?: ComponentPlacementDirection;
  className?: string;
}

// Prefer this over ProjectTemplateWorkspaceIcon in the workspace header.
const ProjectTemplateWorkspaceIconV2: React.FunctionComponent<
  ProjectTemplateWorkspaceIconV2Props
> = ({tooltipPlace, className}) => {
  return (
    <Tooltip
      title={commonI18n.workspaceProjectTemplateLevel()}
      placement={muiPlacementFor(tooltipPlace, 'bottom')}
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
