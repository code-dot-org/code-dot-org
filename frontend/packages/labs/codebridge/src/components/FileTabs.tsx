import {Typography} from '@mui/material';

import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useFileOperations} from '../hooks/useFileOperations';
import {getFileIcon} from '../utils/fileIcons';
import {getOpenFiles} from '../utils/multiFileSource';

import styles from './fileTabs.module.css';

/**
 * The row of open-file tabs above the editor. Each tab shows the file-type icon
 * and name; clicking (or Enter/Space on) a tab activates its file; the close
 * button, Backspace, or Delete closes it.
 *
 * Ported from apps/src/codebridge/FileTabs. The close button is a sibling of the
 * tab (not nested) to avoid nested interactive controls. Drag-to-reorder (legacy
 * @dnd-kit) is deferred — `@dnd-kit` is not yet a workspace dependency.
 */
const FileTabs = () => {
  const {source, activateFile, closeFile} = useFileOperations();
  const openFiles = getOpenFiles(source);

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className={styles.fileTabs} role="tablist" aria-label="Open files">
      {openFiles.map(file => {
        const {iconName, iconStyle, isBrand} = getFileIcon(file.name);
        return (
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
              className={styles.label}
              onClick={() => activateFile(file.id)}
              onKeyDown={e => {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                  closeFile(file.id);
                }
              }}
            >
              <FontAwesomeV6Icon
                iconName={iconName}
                iconStyle={iconStyle}
                iconFamily={isBrand ? 'brands' : undefined}
              />
              <Typography variant="body4">{file.name}</Typography>
            </button>
            <CloseButton
              onClick={() => closeFile(file.id)}
              color="light"
              size="s"
              aria-label={`Close ${file.name}`}
              className={styles.closeButton}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FileTabs;
