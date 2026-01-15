import {isProjectTemplateLevel} from '../../redux/labSlice';
import {useAppSelector} from '../../redux/store';
import ProjectTemplateWorkspaceIcon from '../ProjectTemplateWorkspaceIcon';

import styles from './workspaceHeader.module.scss';

const WorkspaceHeader = () => {
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);

  return (
    <div className={styles.centerHeaderContent}>
      <div className={styles.centerHeaderContentText}>Workspace</div>
      {projectTemplateLevel && <ProjectTemplateWorkspaceIcon />}
    </div>
  );
};

export default WorkspaceHeader;
