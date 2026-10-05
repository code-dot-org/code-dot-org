/* Header row across the top of the lab's workspace. */
import {Typography} from '@mui/material';

import styles from './workspaceHeader.module.scss';

const WorkspaceHeader = () => (
  <div className={styles.header}>
    <Typography component="h2" variant="overline2" className={styles.title}>
      Workspace
    </Typography>
  </div>
);

export default WorkspaceHeader;
