import React from 'react';

import {isProjectTemplateLevel} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import ProjectTemplateWorkspaceIconV2 from '@cdo/apps/templates/ProjectTemplateWorkspaceIconV2';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import styles from './workspace-header.module.scss';

const WorkspaceHeader = () => {
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);

  return (
    <div className={styles.centerHeaderContent}>
      <div className={styles.centerHeaderContentText}>
        {commonI18n.workspaceHeaderShort()}
      </div>
      {projectTemplateLevel && <ProjectTemplateWorkspaceIconV2 />}
    </div>
  );
};

export default WorkspaceHeader;
