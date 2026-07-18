import {Button, IconButton} from '@mui/material';
import {useCallback} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
  ProjectFolder,
} from '@code-dot-org/core/api';

import {
  languageForFileName,
  validateFileName,
  validateFolderName,
} from '../config';
import {DEFAULT_FOLDER_ID} from '../constants';
import {useCodebridgeConfig} from '../contexts';
import {useFileOperations} from '../hooks/useFileOperations';
import {usePrompts} from '../hooks/usePrompts';
import {shouldShowFile} from '../utils/multiFileSource';

import styles from './fileBrowser.module.css';

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

const RowAction = ({
  iconName,
  label,
  onClick,
}: {
  iconName: string;
  label: string;
  onClick: () => void;
}) => (
  <IconButton
    aria-label={label}
    onClick={onClick}
    variant="text"
    color="tertiary"
    size="extraSmall"
  >
    <FontAwesomeV6Icon iconName={iconName} />
  </IconButton>
);

/** The recursive folder/file tree rooted at `parentId`. */
const FileTree = ({
  source,
  parentId,
  handlers,
  hideNewFolderButton,
}: {
  source: MultiFileSource;
  parentId: FolderId;
  handlers: RowHandlers;
  hideNewFolderButton?: boolean;
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
              <FontAwesomeV6Icon
                iconName={folder.open ? 'chevron-down' : 'chevron-right'}
                iconStyle="solid"
              />
              <FontAwesomeV6Icon iconName="folder" iconStyle="solid" />
              {folder.name}
            </button>
            <span className={styles.rowActions}>
              <RowAction
                iconName="file-plus"
                label={`New file in ${folder.name}`}
                onClick={() => handlers.newFileIn(folder.id)}
              />
              {!hideNewFolderButton && (
                <RowAction
                  iconName="folder-plus"
                  label={`New folder in ${folder.name}`}
                  onClick={() => handlers.newFolderIn(folder.id)}
                />
              )}
              <RowAction
                iconName="pen"
                label={`Rename ${folder.name}`}
                onClick={() => handlers.renameFolder(folder)}
              />
              <RowAction
                iconName="trash"
                label={`Delete ${folder.name}`}
                onClick={() => handlers.deleteFolder(folder)}
              />
            </span>
          </div>
          {folder.open && (
            <FileTree
              source={source}
              parentId={folder.id}
              handlers={handlers}
              hideNewFolderButton={hideNewFolderButton}
            />
          )}
        </li>
      ))}
      {files.map(file => (
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
              <FontAwesomeV6Icon iconName="file" iconStyle="regular" />
              {file.name}
            </button>
            <span className={styles.rowActions}>
              <RowAction
                iconName="pen"
                label={`Rename ${file.name}`}
                onClick={() => handlers.renameFile(file)}
              />
              <RowAction
                iconName="trash"
                label={`Delete ${file.name}`}
                onClick={() => handlers.deleteFile(file)}
              />
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};

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
const FileBrowser = () => {
  const ops = useFileOperations();
  const {promptForName, confirm} = usePrompts();
  const config = useCodebridgeConfig();

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
        <strong>Files</strong>
        <span className={styles.headerActions}>
          <Button
            variant="outlined"
            color="tertiary"
            size="small"
            onClick={() => newFileIn(DEFAULT_FOLDER_ID)}
          >
            New file
          </Button>
          {!config.hideNewFolderButton && (
            <Button
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={() => newFolderIn(DEFAULT_FOLDER_ID)}
            >
              New folder
            </Button>
          )}
        </span>
      </div>
      {isEmpty ? (
        <div className={styles.empty}>No files yet.</div>
      ) : (
        <FileTree
          source={source}
          parentId={DEFAULT_FOLDER_ID}
          handlers={handlers}
          hideNewFolderButton={config.hideNewFolderButton}
        />
      )}
    </div>
  );
};

export default FileBrowser;
