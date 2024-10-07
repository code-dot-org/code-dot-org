import classNames from 'classnames';
import React, {useMemo} from 'react';

import commonI18n from '@cdo/locale';

import {ComponentPlacementDirection} from '../componentLibrary/common/types';
import {WithTooltip} from '../componentLibrary/tooltip';

import moduleStyles from './project-template-workspace-icon-v2.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface ProjectTemplateWorkspaceIconV2Props {
  tooltipPlace?: ComponentPlacementDirection;
  dark?: boolean;
}

const ProjectTemplateWorkspaceIconV2: React.FunctionComponent<
  ProjectTemplateWorkspaceIconV2Props
> = ({tooltipPlace, dark}) => {
  const tooltipClassName = useMemo(() => {
    if (!dark) {
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
  }, [tooltipPlace, dark]);

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
        className={classNames('fa-kit fa-solid-gear-pen', moduleStyles.icon)}
      />
    </WithTooltip>
  );
};

export default ProjectTemplateWorkspaceIconV2;
