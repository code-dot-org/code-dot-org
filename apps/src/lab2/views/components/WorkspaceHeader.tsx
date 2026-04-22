import React from 'react';

import {isProjectTemplateLevel} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import ProjectTemplateWorkspaceIconV2 from '@cdo/apps/templates/ProjectTemplateWorkspaceIconV2';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import styles from './workspace-header.module.scss';

const WorkspaceHeaderText = () => (
  <div className={styles.centerHeaderContent}>
    <div className={styles.centerHeaderContentText}>
      {commonI18n.workspaceHeaderShort()}
    </div>
  </div>
);

// Rendered via rightHeaderContent (sibling div to the h2) so the icon is
// never inside the heading element — do not move into headerContent.
const TemplateIcon = () => {
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  if (!projectTemplateLevel) return null;
  return (
    <span className={styles.templateIconWrapper}>
      <ProjectTemplateWorkspaceIconV2 />
    </span>
  );
};

export function useWorkspaceHeader() {
  return {
    headerContent: <WorkspaceHeaderText />,
    templateIcon: <TemplateIcon />,
  };
}
