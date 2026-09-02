// The file menus: one button per folder, in the tab bar.
//
// See `folderMenus` for why a World project is read this way rather than as a
// tree. This is the UI half: a button that opens the folder, the two ways to
// get a new one at the top, and everything already there below.
//
// EVERY ACT HERE IS THE TREE'S ACT. Opening, renaming and deleting go through
// the same `useFileOperations` and the same prompts the file browser uses,
// including the lab's veto on deleting a rule another rule requires
// (`config.blockFileDeletion`). Two routes to one behaviour; nothing new is
// possible from here, which is what makes this an alternative reading rather
// than a second file system.
//
// WHAT A MISSING FOLDER DOES. A project need not have all nine — a scenario
// declares the folders it uses. `Import…` works anyway, because a shelf makes
// the folder it writes into (`projectWrite.folderIn`); `New` is offered only
// once the folder exists, because a file has to be created IN one and the id of
// a folder made in the same breath is not known until the next render. So an
// empty Effects menu offers the shelf, and offers to make one from nothing as
// soon as the project has an `effects/`.

import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {createRef, useCallback, useMemo, useState} from 'react';

import {
  languageForFileName,
  useCodebridgeConfig,
  useFileOperations,
  usePrompts,
  validateFileName,
} from '@code-dot-org/codebridge';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {ProjectFile} from '@code-dot-org/core/api';
import {IconButtonWithTooltip} from '@code-dot-org/lab/components';
import {labActions, useAppSelector} from '@code-dot-org/lab/redux';

import styles from './fileMenus.module.css';
import {FOLDER_MENUS, type FolderMenu} from './folderMenus';

/** The file the row menu is about, and what it hangs off. */
interface RowMenu {
  file: ProjectFile;
  anchor: HTMLElement;
}

export const FileMenus = () => {
  const ops = useFileOperations();
  const config = useCodebridgeConfig();
  const {promptForName, confirm, alert} = usePrompts();
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);
  const [open, setOpen] = useState<{menu: FolderMenu; anchor: HTMLElement}>();
  const [row, setRow] = useState<RowMenu>();
  // The tolerant form: this renders inside the lab, which provides a theme,
  // and in a bare tree in tests, which does not — and a menu is not worth a
  // provider to mount.
  const {theme} = useTheme(true);
  /** What each menu hangs off — one per button, since a click reports none. */
  const anchors = useMemo(
    () => FOLDER_MENUS.map(() => createRef<HTMLSpanElement>()),
    [],
  );

  /** Every folder the project has, by name — the id is what a write needs. */
  const folderIds = useMemo(
    () =>
      new Map(
        Object.values(ops.source.folders).map(folder => [
          folder.name,
          folder.id,
        ]),
      ),
    [ops.source],
  );

  const filesIn = useCallback(
    (folder: string): ProjectFile[] => {
      const id = folderIds.get(folder);
      return id === undefined
        ? []
        : Object.values(ops.source.files)
            .filter(file => file.folderId === id)
            .sort((a, b) => a.name.localeCompare(b.name));
    },
    [ops.source, folderIds],
  );

  const close = useCallback(() => setOpen(undefined), []);

  /**
   * Make one, from a name and the extension the folder gives it.
   *
   * The extension is the menu's, not the learner's: the folder decides the
   * kind, so asking for "name.actor" would be asking for the one part of the
   * answer already known. The tree asks for the whole file name because it has
   * no folder to read it from.
   */
  const make = useCallback(
    async (menu: FolderMenu, extension: string) => {
      const folderId = folderIds.get(menu.folder);
      if (folderId === undefined) {
        return;
      }
      close();
      const name = await promptForName({
        title: `New ${extension} in ${menu.folder}`,
        placeholder: `name.${extension}`,
        validateInput: value =>
          validateFileName(
            config,
            ops.source,
            folderId,
            withExtension(value, extension),
          ),
      });
      if (name) {
        const fileName = withExtension(name, extension);
        ops.newFile({
          fileName,
          language: languageForFileName(config, fileName),
          folderId,
        });
      }
    },
    [ops, config, promptForName, folderIds, close],
  );

  const importInto = useCallback(
    async (menu: FolderMenu) => {
      close();
      await menu.shelf?.();
    },
    [close],
  );

  const rename = useCallback(
    async (file: ProjectFile) => {
      setRow(undefined);
      close();
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
    [ops, config, promptForName, close],
  );

  const remove = useCallback(
    async (file: ProjectFile) => {
      setRow(undefined);
      close();
      // The lab's veto first, exactly as the tree asks it: some files hold
      // others up, and which ones is the lab's to know (`rules/deleteGuard`).
      const refusal = config.blockFileDeletion?.(file, ops.source);
      if (refusal) {
        await alert({title: `Cannot delete ${file.name}`, message: refusal});
        return;
      }
      if (
        await confirm({
          title: 'Delete file',
          message: `Delete ${file.name}? This cannot be undone.`,
        })
      ) {
        ops.deleteFile(file.id);
      }
    },
    [ops, config, confirm, alert, close],
  );

  const files = open ? filesIn(open.menu.folder) : [];
  const canMake = open ? folderIds.has(open.menu.folder) : false;

  return (
    <div className={styles.menus}>
      {FOLDER_MENUS.map((menu, at) => (
        // The lab's icon button, not a bare MUI one: its tooltip is the design
        // system's and takes the theme, where MUI's own renders dark-on-light
        // whatever the page is doing. It reports no event, so the menu hangs
        // off the container it wraps.
        <span key={menu.folder} ref={anchors[at]}>
          <IconButtonWithTooltip
            id={`files-${menu.folder}`}
            label={menu.label}
            icon={{iconName: menu.icon, iconStyle: 'solid'}}
            type="tertiary"
            color="gray"
            buttonSize="xs"
            tooltipSize="xs"
            tooltipDirection="onBottom"
            theme={theme}
            // The TOOLTIP's class, which is what this prop is: the bubble
            // portals to `<body>` at z-index 10 and the workspace paints over
            // it, so it is lifted the way the image editor's tooltips are.
            className={styles.tooltip}
            onClick={() =>
              setOpen(
                anchors[at].current
                  ? {menu, anchor: anchors[at].current!}
                  : undefined,
              )
            }
          />
        </span>
      ))}
      <Menu
        open={Boolean(open)}
        anchorEl={open?.anchor}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
        slotProps={{list: {'aria-label': open?.menu.label, dense: true}}}
      >
        {!isReadOnly &&
          canMake &&
          open?.menu.makes.map(makeable => (
            <MenuItem
              key={makeable.extension}
              onClick={() => make(open.menu, makeable.extension)}
            >
              <ListItemIcon className={styles.menuIcon}>
                <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
              </ListItemIcon>
              <ListItemText disableTypography>
                <Typography variant="body4">{makeable.label}</Typography>
              </ListItemText>
            </MenuItem>
          ))}
        {!isReadOnly && open?.menu.shelf && (
          <MenuItem onClick={() => importInto(open.menu)}>
            <ListItemIcon className={styles.menuIcon}>
              <FontAwesomeV6Icon iconName="download" iconStyle="solid" />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography variant="body4">Import…</Typography>
            </ListItemText>
          </MenuItem>
        )}
        {!isReadOnly && <Divider />}
        {/* What is not there yet, said rather than left blank — the wording
            every empty dropdown in this lab uses (`blockly/moduleOptions`). */}
        {files.length === 0 && (
          <MenuItem disabled>
            <ListItemText disableTypography>
              <Typography variant="body4">
                {`(no ${open?.menu.label.toLowerCase()} yet)`}
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
        {files.map(file => (
          <MenuItem
            key={file.id}
            selected={Boolean(file.active)}
            onClick={() => {
              ops.activateFile(file.id);
              close();
            }}
          >
            <ListItemText disableTypography>
              <Typography variant="body4">{file.name}</Typography>
            </ListItemText>
            {!isReadOnly && (
              // A control inside a menu item, which is why it stops the click
              // reaching the item: the row OPENS the file and this asks what
              // else to do with it, the way the tree's `…` does.
              <IconButton
                aria-label={`Options for ${file.name}`}
                size="extraSmall"
                color="tertiary"
                className={styles.rowOptions}
                onClick={event => {
                  event.stopPropagation();
                  setRow({file, anchor: event.currentTarget});
                }}
              >
                <FontAwesomeV6Icon iconName="ellipsis-v" iconStyle="solid" />
              </IconButton>
            )}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        open={Boolean(row)}
        anchorEl={row?.anchor}
        onClose={() => setRow(undefined)}
        slotProps={{
          list: {'aria-label': row && `Options for ${row.file.name}`},
        }}
      >
        {row && (
          <MenuItem onClick={() => rename(row.file)}>
            <ListItemIcon className={styles.menuIcon}>
              <FontAwesomeV6Icon iconName="pencil" iconStyle="solid" />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography variant="body4">Rename</Typography>
            </ListItemText>
          </MenuItem>
        )}
        {row && (
          <MenuItem onClick={() => remove(row.file)}>
            <ListItemIcon className={styles.menuIcon}>
              <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography variant="body4">Delete</Typography>
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

/** `player` in the actors menu is `player.actor`; `player.actor` already is. */
const withExtension = (name: string, extension: string): string =>
  name.endsWith(`.${extension}`) ? name : `${name}.${extension}`;
