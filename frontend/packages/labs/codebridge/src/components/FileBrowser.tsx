import {Typography} from '@mui/material';
import {useCallback} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
  ProjectFolder,
} from '@code-dot-org/core/api';
import {labActions} from '@code-dot-org/lab/redux';

import {
  languageForFileName,
  validateFileName,
  validateFolderName,
} from '../config';
import {DEFAULT_FOLDER_ID} from '../constants';
import {useCodebridgeConfig} from '../contexts';
import {useFileOperations} from '../hooks/useFileOperations';
import {usePrompts} from '../hooks/usePrompts';
import {useAppSelector} from '../redux/store';
import {getFileIcon} from '../utils/fileIcons';
import {shouldShowFile} from '../utils/multiFileSource';

import styles from './fileBrowser.module.css';
import {FileBrowserToggleButton} from './FileBrowserToggleButton';
import {PopUpButton} from './PopUpButton';
import {PopUpButtonOption} from './PopUpButtonOption';

interface RowHandlers {
  activateFile: (fileId: FileId) => void;
  toggleFolder: (folderId: FolderId) => void;
  renameFile: (file: ProjectFile) => void;
  deleteFile: (file: ProjectFile) => void;
  renameFolder: (folder: ProjectFolder) => void;
  deleteFolder: (folder: ProjectFolder) => void;
  newFileIn: (parentId: FolderId) => void;
  newFolderIn: (parentId: FolderId) => void;
}

const byName = <T extends {name: string}>(a: T, b: T) =>
  a.name.localeCompare(b.name);

/** The recursive folder/file tree rooted at `parentId`. */
const FileTree = ({
  source,
  parentId,
  handlers,
  hideNewFolderButton,
  isReadOnly,
}: {
  source: MultiFileSource;
  parentId: FolderId;
  handlers: RowHandlers;
  hideNewFolderButton?: boolean;
  /** Hides the per-row edit menus (legacy `enableMenu={!isReadOnly}`). */
  isReadOnly?: boolean;
}) => {
  const folders = Object.values(source.folders)
    .filter(f => f.parentId === parentId)
    .sort(byName);
  const files = Object.values(source.files)
    .filter(f => f.folderId === parentId && shouldShowFile(f))
    .sort(byName);

  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles -- list-style:none strips list semantics
    <ol className={styles.folderChildren} role="list">
      {folders.map(folder => (
        <li key={folder.id}>
          <div className={styles.row}>
            <button
              type="button"
              className={styles.rowLabel}
              aria-expanded={Boolean(folder.open)}
              onClick={() => handlers.toggleFolder(folder.id)}
            >
              {/* Legacy signals open/closed by swapping the folder icon rather
                  than showing a caret; `aria-expanded` keeps the a11y state. */}
              <FontAwesomeV6Icon
                iconName={folder.open ? 'folder-open' : 'folder'}
                iconStyle="solid"
              />
              <Typography variant="body4">{folder.name}</Typography>
            </button>
            <span className={styles.rowActions}>
              {!isReadOnly && (
                <PopUpButton
                  iconName="ellipsis-v"
                  ariaLabel={`Options for ${folder.name}`}
                  alignment="left"
                >
                  <PopUpButtonOption
                    iconName="plus"
                    labelText="New File"
                    clickHandler={() => handlers.newFileIn(folder.id)}
                  />
                  {!hideNewFolderButton && (
                    <PopUpButtonOption
                      iconName="folder-plus"
                      labelText="Add sub-folder"
                      clickHandler={() => handlers.newFolderIn(folder.id)}
                    />
                  )}
                  <PopUpButtonOption
                    iconName="pencil"
                    labelText="Rename"
                    clickHandler={() => handlers.renameFolder(folder)}
                  />
                  <PopUpButtonOption
                    iconName="trash"
                    labelText="Delete"
                    clickHandler={() => handlers.deleteFolder(folder)}
                  />
                </PopUpButton>
              )}
            </span>
          </div>
          {folder.open && (
            <FileTree
              source={source}
              parentId={folder.id}
              handlers={handlers}
              hideNewFolderButton={hideNewFolderButton}
              isReadOnly={isReadOnly}
            />
          )}
        </li>
      ))}
      {files.map(file => {
        const {iconName, iconStyle, isBrand} = getFileIcon(file.name);
        return (
          <li key={file.id}>
            <div className={styles.row}>
              <button
                type="button"
                className={
                  file.active
                    ? `${styles.rowLabel} ${styles.active}`
                    : styles.rowLabel
                }
                onClick={() => handlers.activateFile(file.id)}
              >
                <FontAwesomeV6Icon
                  iconName={iconName}
                  iconStyle={iconStyle}
                  iconFamily={isBrand ? 'brands' : undefined}
                />
                <Typography variant="body4">{file.name}</Typography>
              </button>
              <span className={styles.rowActions}>
                {!isReadOnly && (
                  <PopUpButton
                    iconName="ellipsis-v"
                    ariaLabel={`Options for ${file.name}`}
                    alignment="left"
                  >
                    <PopUpButtonOption
                      iconName="pencil"
                      labelText="Rename"
                      clickHandler={() => handlers.renameFile(file)}
                    />
                    <PopUpButtonOption
                      iconName="trash"
                      labelText="Delete"
                      clickHandler={() => handlers.deleteFile(file)}
                    />
                  </PopUpButton>
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

interface FileBrowserProps {
  /** When provided, a collapse toggle shows in the header. The host owns the
   * collapsed state and the surrounding layout — it hides this whole panel and
   * provides the re-open affordance (so the editor can take the full width). */
  onToggleCollapse?: () => void;
}

/**
 * The file/folder tree with create/rename/delete actions. Ported from
 * apps/src/codebridge/FileBrowser, driven by {@link useFileOperations} over the
 * base SourcesContext and the base dialog system for name/confirm prompts.
 *
 * Deferred from the legacy version: drag-and-drop move (needs @dnd-kit), the
 * asset/image upload flow, backpack row actions, and levelbuilder file-type
 * toggles. New-file language is a placeholder derived from the extension until
 * the Codebridge `config.languageMapping` is ported.
 */
const FileBrowser = ({onToggleCollapse}: FileBrowserProps = {}) => {
  const ops = useFileOperations();
  const {promptForName, confirm} = usePrompts();
  const config = useCodebridgeConfig();
  // In a read-only workspace — previewing an old version, a frozen or
  // submitted level, a project you don't own — the file-editing menus are
  // hidden, matching legacy's `enableMenu={!isReadOnly}`.
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);

  const newFilePlaceholder = config.editableFileTypes[0]
    ? `name.${config.editableFileTypes[0]}`
    : 'name';

  const newFileIn = useCallback(
    async (parentId: FolderId) => {
      const name = await promptForName({
        title: 'New file',
        placeholder: newFilePlaceholder,
        validateInput: value =>
          validateFileName(config, ops.source, parentId, value),
      });
      if (name) {
        ops.newFile({
          fileName: name,
          language: languageForFileName(config, name),
          folderId: parentId,
        });
      }
    },
    [ops, promptForName, config, newFilePlaceholder],
  );

  const newFolderIn = useCallback(
    async (parentId: FolderId) => {
      const name = await promptForName({
        title: 'New folder',
        validateInput: value => validateFolderName(ops.source, parentId, value),
      });
      if (name) {
        ops.newFolder(name, parentId);
      }
    },
    [ops, promptForName],
  );

  const renameFile = useCallback(
    async (file: ProjectFile) => {
      const name = await promptForName({
        title: 'Rename file',
        value: file.name,
        validateInput: value =>
          validateFileName(config, ops.source, file.folderId, value, file.id),
      });
      if (name && name !== file.name) {
        ops.renameFile(file.id, name);
      }
    },
    [ops, promptForName, config],
  );

  const renameFolder = useCallback(
    async (folder: ProjectFolder) => {
      const name = await promptForName({
        title: 'Rename folder',
        value: folder.name,
        validateInput: value =>
          validateFolderName(ops.source, folder.parentId, value, folder.id),
      });
      if (name && name !== folder.name) {
        ops.renameFolder(folder.id, name);
      }
    },
    [ops, promptForName],
  );

  const deleteFile = useCallback(
    async (file: ProjectFile) => {
      if (
        await confirm({
          title: 'Delete file',
          message: `Delete ${file.name}? This cannot be undone.`,
        })
      ) {
        ops.deleteFile(file.id);
      }
    },
    [ops, confirm],
  );

  const deleteFolder = useCallback(
    async (folder: ProjectFolder) => {
      if (
        await confirm({
          title: 'Delete folder',
          message: `Delete ${folder.name} and everything in it? This cannot be undone.`,
        })
      ) {
        ops.deleteFolder(folder.id);
      }
    },
    [ops, confirm],
  );

  const handlers: RowHandlers = {
    activateFile: ops.activateFile,
    toggleFolder: ops.toggleFolder,
    renameFile,
    deleteFile,
    renameFolder,
    deleteFolder,
    newFileIn,
    newFolderIn,
  };

  const source = ops.source;
  const isEmpty =
    Object.values(source.files).filter(shouldShowFile).length === 0 &&
    Object.keys(source.folders).length === 0;

  return (
    <div className={styles.fileBrowser}>
      <div className={styles.header}>
        <Typography
          variant="body4"
          component="h2"
          className={styles.headerTitle}
        >
          Files
        </Typography>
        <div className={styles.headerButtons}>
          {/* A single collapsed "+" menu, matching the legacy header PopUpButton.
              Hidden in a read-only workspace (e.g. while previewing an old
              version), where none of its actions can be saved. */}
          {!isReadOnly && (
            <PopUpButton
              iconName="plus"
              ariaLabel="Manage files"
              alignment="left"
            >
              <PopUpButtonOption
                iconName="plus"
                labelText="New File"
                clickHandler={() => newFileIn(DEFAULT_FOLDER_ID)}
              />
              {!config.hideNewFolderButton && (
                <PopUpButtonOption
                  iconName="plus"
                  labelText="New Folder"
                  clickHandler={() => newFolderIn(DEFAULT_FOLDER_ID)}
                />
              )}
            </PopUpButton>
          )}
          {/* Collapse the file browser; the host re-opens it from outside the
              (now-hidden) panel. */}
          {onToggleCollapse && (
            <FileBrowserToggleButton onClick={onToggleCollapse} />
          )}
        </div>
      </div>
      <div className={styles.body}>
        {isEmpty ? (
          <div className={styles.empty}>No files yet.</div>
        ) : (
          <FileTree
            source={source}
            parentId={DEFAULT_FOLDER_ID}
            handlers={handlers}
            hideNewFolderButton={config.hideNewFolderButton}
            isReadOnly={isReadOnly}
          />
        )}
      </div>
    </div>
  );
};

export default FileBrowser;
