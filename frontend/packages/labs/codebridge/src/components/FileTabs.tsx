import {Typography} from '@mui/material';

import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useCodebridgeConfig} from '../contexts';
import {useFileOperations} from '../hooks/useFileOperations';
import {getFileIcon} from '../utils/fileIcons';
import {getOpenFiles} from '../utils/multiFileSource';

import styles from './fileTabs.module.css';

export interface FileTabsProps {
  /**
   * A file that may not be closed: no close button, and the keyboard shortcut
   * does nothing on it.
   *
   * For a workspace with no file browser (see {@link WorkspaceProps.hideFileBrowser}),
   * where closing a tab can be a one-way door — there is no list to reopen from,
   * so a file nothing else can reach is gone for the session. The host decides
   * which file that is, because "the one you cannot get back to" is a question
   * about the lab and not about the tab strip.
   */
  pinnedFileId?: string;
}

/**
 * The row of open-file tabs above the editor. Each tab shows the file-type icon
 * and name; clicking (or Enter/Space on) a tab activates its file; the close
 * button, Backspace, or Delete closes it — unless it is the pinned one.
 *
 * Ported from apps/src/codebridge/FileTabs. The close button is a sibling of the
 * tab (not nested) to avoid nested interactive controls. Drag-to-reorder (legacy
 * @dnd-kit) is deferred — `@dnd-kit` is not yet a workspace dependency.
 */
const FileTabs = ({pinnedFileId}: FileTabsProps = {}) => {
  const {source, activateFile, closeFile} = useFileOperations();
  const config = useCodebridgeConfig();
  const openFiles = getOpenFiles(source);

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className={styles.fileTabs} role="tablist" aria-label="Open files">
      {openFiles.map(file => {
        // The lab's icons, which the browser has always used and this had not:
        // a `.world` tab wore the generic file glyph beside a tree row wearing
        // a globe (`config.fileIcons`).
        const {iconName, iconStyle, isBrand} = getFileIcon(
          file.name,
          config.fileIcons,
        );
        // …and what the lab calls it, which is what the menu that opened it
        // said (`config.fileLabel`). The file name stays on the tab's tooltip:
        // it is still the answer to "which file is this".
        const label = config.fileLabel?.(file) ?? file.name;
        const pinned = file.id === pinnedFileId;
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
              title={file.name}
              onClick={() => activateFile(file.id)}
              onKeyDown={e => {
                if (!pinned && (e.key === 'Backspace' || e.key === 'Delete')) {
                  closeFile(file.id);
                }
              }}
            >
              <FontAwesomeV6Icon
                iconName={iconName}
                iconStyle={iconStyle}
                iconFamily={isBrand ? 'brands' : undefined}
              />
              <Typography variant="body4">{label}</Typography>
            </button>
            {/* No close button rather than a disabled one: a control that is
                always there and never works is a thing to keep trying. */}
            {!pinned && (
              <CloseButton
                onClick={() => closeFile(file.id)}
                color="light"
                size="s"
                aria-label={`Close ${label}`}
                className={styles.closeButton}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FileTabs;
