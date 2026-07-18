import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useFileOperations} from '../hooks/useFileOperations';
import {getOpenFiles} from '../utils/multiFileSource';

import styles from './fileTabs.module.css';

/**
 * The row of open-file tabs above the editor. Clicking (or Enter/Space on) a tab
 * activates its file; the close button, Backspace, or Delete closes it.
 *
 * Ported from apps/src/codebridge/FileTabs. Drag-to-reorder (legacy @dnd-kit) is
 * deferred — `@dnd-kit` is not yet a workspace dependency.
 */
const FileTabs = () => {
  const {source, activateFile, closeFile} = useFileOperations();
  const openFiles = getOpenFiles(source);

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className={styles.fileTabs} role="tablist" aria-label="Open files">
      {openFiles.map(file => (
        <div
          key={file.id}
          className={
            file.active ? `${styles.tab} ${styles.active}` : styles.tab
          }
        >
          <button
            type="button"
            role="tab"
            aria-selected={Boolean(file.active)}
            className={styles.tabButton}
            onClick={() => activateFile(file.id)}
            onKeyDown={e => {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                closeFile(file.id);
              }
            }}
          >
            {file.name}
          </button>
          <button
            type="button"
            className={styles.close}
            aria-label={`Close ${file.name}`}
            onClick={() => closeFile(file.id)}
          >
            <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileTabs;
