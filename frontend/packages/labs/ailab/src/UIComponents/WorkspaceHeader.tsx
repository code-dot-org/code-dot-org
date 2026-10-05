/* Header row across the top of the lab's workspace. */
import styles from './workspaceHeader.module.scss';

const WorkspaceHeader = () => (
  <div className={styles.header}>
    <h2 className={styles.title}>Workspace</h2>
  </div>
);

export default WorkspaceHeader;
