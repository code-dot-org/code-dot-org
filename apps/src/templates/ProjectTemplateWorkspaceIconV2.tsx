import classNames from 'classnames';
import React, {useMemo} from 'react';

import commonI18n from '@cdo/locale';

import {ComponentPlacementDirection} from '../componentLibrary/common/types';
import {WithTooltip} from '../componentLibrary/tooltip';

import moduleStyles from './project-template-workspace-icon-v2.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface ProjectTemplateWorkspaceIconV2Props {
  tooltipPlace?: ComponentPlacementDirection;
  darkMode?: boolean;
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
 * @returns
 */
const ProjectTemplateWorkspaceIconV2: React.FunctionComponent<
  ProjectTemplateWorkspaceIconV2Props
> = ({tooltipPlace, darkMode}) => {
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
      tooltipOverlayClassName={moduleStyles.container}
    >
      {/* FontAwesomeV6Icon does not work with WithTooltip. */}
      <i
        className={classNames('fa-kit fa-connected-level', moduleStyles.icon)}
      />
    </WithTooltip>
  );
};

export default ProjectTemplateWorkspaceIconV2;
