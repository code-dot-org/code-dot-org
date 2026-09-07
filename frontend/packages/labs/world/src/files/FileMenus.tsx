// The file menus: one button per folder, in the tab bar.
//
// See `folderMenus` for why a World project is read this way rather than as a
// tree. This is the UI half: a button that opens the folder, the two ways to
// get a new one at the top, and everything already there below.
//
// EVERY ACT HERE IS THE TREE'S ACT. Opening and deleting go through the same
// `useFileOperations` and the same prompts the file browser uses, including the
// lab's veto on deleting a rule another rule requires
// (`config.blockFileDeletion`). Two routes to one behavior; nothing new is
// possible from here, which is what makes this an alternative reading rather
// than a second file system.
//
// RENAME MEANS THE THING. These rows show what a file DECLARES —
// `player.actor` reads as "Player", the word its blocks and every dropdown
// already use — so the name worth changing is that one, and the file's stem is
// made from it so the two cannot drift apart. Every reference moves with it
// (`files/renameThing`). The tree still renames a FILE, which is a different
// act and leaves the thing inside it called what it was.
//
// A MISSING FOLDER IS NOT A MISSING MENU. A project need not have all nine — a
// scenario declares the folders it uses — and both ways in work regardless:
// `Import…` because a shelf makes the folder it writes into, and `New` because
// this makes it in the same write as the file (`make`). It was offered only
// where the folder already existed, which meant a project with no `effects/`
// could take an effect from the shelf and could not make one, for a reason
// nobody could see.

import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  createRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import {
  createExternalFile,
  createNewFile,
  getFileExtension,
  languageForFileName,
  shouldShowFile,
  useCodebridgeConfig,
  useFileOperations,
  useFileUpload,
  usePrompts,
} from '@code-dot-org/codebridge';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {ProjectFile, MultiFileSource} from '@code-dot-org/core/api';
import {IconButtonWithTooltip} from '@code-dot-org/lab/components';
import {useSources} from '@code-dot-org/lab/contexts';
import {labActions, useAppSelector} from '@code-dot-org/lab/redux';

import {requestActorEnhance} from '../actors/enhance/actorEnhance';
import {label} from '../blockly/label';
import {authoredName} from '../blockly/projectModules';
import {folderIn} from '../projectWrite';
import {resolveRuleContents} from '../rules/ruleReference';
import {filePath} from '../runtime/projectFiles';

import styles from './fileMenus.module.css';
import {FOLDER_MENUS, type FolderMenu, type Makeable} from './folderMenus';
import {fileStem, renamed, seedFor} from './newThing';
import {renameThing} from './renameThing';

/** The file the row menu is about, and what it hangs off. */
interface RowMenu {
  file: ProjectFile;
  /** What the row SHOWED, which is what a menu about it should say. */
  name: string;
  anchor: HTMLElement;
}

export const FileMenus = () => {
  const ops = useFileOperations();
  // A rename rewrites the WHOLE project in one go — the file, its contents and
  // every reference to it — which is a write `useFileOperations` has no verb
  // for: its own are one act on one file.
  const {currentSources, updateSources, replaceSources} =
    useSources<MultiFileSource>();
  const config = useCodebridgeConfig();
  const {promptForName, confirm, alert} = usePrompts();
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);
  const [open, setOpen] = useState<{menu: FolderMenu; anchor: HTMLElement}>();
  const [row, setRow] = useState<RowMenu>();
  // The tolerant form: this renders inside the lab, which provides a theme,
  // and in a bare tree in tests, which does not — and a menu is not worth a
  // provider to mount.
  const {theme} = useTheme(true);
  const uploading = useFileUpload();
  /** The one hidden input every folder's `Upload…` opens, and who asked. */
  const fileInput = useRef<HTMLInputElement>(null);
  const pickingFor = useRef<string | undefined>(undefined);
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

  /**
   * What is in a folder, by the name each file DECLARES.
   *
   * `player.actor` is called "Player" everywhere else a learner looks — on its
   * own blocks, in every dropdown that offers it, in the map editor — and the
   * file name is where that lives rather than what it is. So the menus say the
   * word the rest of the lab says.
   *
   * A file that declares NOTHING is titled from its own stem, which is the
   * same fallback every dropdown makes: a map is an arrangement and a `.png`
   * is bytes, and "Coin Spin" is what the animation dropdown calls the file
   * the sprite picker calls "Coin Spin" (`blockly/label`).
   *
   * Sorted by what is SHOWN, since a list ordered by something invisible reads
   * as unordered.
   */
  const filesIn = useCallback(
    (folder: string): Array<{file: ProjectFile; name: string}> => {
      const id = folderIds.get(folder);
      const hidden = config.hiddenFileTypes ?? [];
      return id === undefined
        ? []
        : Object.values(ops.source.files)
            .filter(
              file =>
                file.folderId === id &&
                // The tree's own two questions, asked here for the same
                // reasons: a deleted file is still in the source until the
                // project is saved, and a `.sheet` belongs to the `.png` of the
                // same name rather than being a file to open (`worldConfig`).
                shouldShowFile(file) &&
                !hidden.includes(getFileExtension(file.name) ?? ''),
            )
            .map(file => ({
              file,
              // Resolved, because a rule the learner has not edited is stored
              // as a REFERENCE to the library's (rules/ruleReference) and a
              // reference declares nothing. Unresolved, every unedited rule
              // fell back to its stem and the menu read `Jump`, `Solid`,
              // `Arrows` where it had read `Jumping`, `Solid Bodies`, `Arrow
              // Keys` — the one place in the lab that reads a file's contents
              // without going through `projectFiles`.
              name:
                authoredName(resolveRuleContents(file.contents ?? '')) ??
                label(stemOf(file.name)),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    },
    [ops.source, folderIds, config],
  );

  const close = useCallback(() => setOpen(undefined), []);

  /**
   * Close the menus, and wait for them to be gone before opening a dialog.
   *
   * TWO FOCUS TRAPS FIGHT. A MUI `Menu` contains focus and so does the prompt
   * dialog (`focus-trap-react`), and each pulls it back from the other the
   * moment it leaves — forever, until the stack runs out: "Maximum call stack
   * size exceeded", twice, on every rename. Closing a menu is a state update,
   * so it has not happened yet when the dialog opens in the same tick; this
   * yields to let React commit first.
   */
  const thenAsk = useCallback(async () => {
    setRow(undefined);
    close();
    await new Promise(resolve => setTimeout(resolve, 0));
  }, [close]);

  /**
   * Make one, from a name and the extension the folder gives it.
   *
   * The extension is the menu's, not the learner's: the folder decides the
   * kind, so asking for "name.actor" would be asking for the one part of the
   * answer already known. The tree asks for the whole file name because it has
   * no folder to read it from.
   */
  /**
   * Make one, in a folder that need not exist yet.
   *
   * WRITTEN HERE rather than through `ops.newFile`, which takes a folder ID
   * and so can only put a file somewhere that is already there. A project
   * declares the folders it uses, so a scenario with no `effects/` could offer
   * the shelf (a shelf makes its own folder) and not the making — a cliff
   * nobody could see the bottom of. The folder and the file are one write now
   * (`projectWrite.folderIn`, then Codebridge's own pure edit), which is also
   * what makes the new file open: `createNewFile` activates what it creates.
   *
   * The lab's reconcile still gets the last word, as it does on every write
   * through `useFileOperations` — companion files are its business, not this
   * menu's (`worldConfig.reconcileSource`).
   */
  const make = useCallback(
    async (menu: FolderMenu, makeable: Makeable) => {
      await thenAsk();
      const name = await promptForName({
        title: makeable.label,
        placeholder: makeable.placeholder,
        validateInput: value =>
          nameProblem(
            ops.source,
            folderIds.get(menu.folder),
            value,
            makeable.extension,
          ),
      });
      if (!name) {
        return;
      }
      // ONE NAME, SAID ONCE: it becomes the file's stem and the thing's own
      // name, so the menus — which read what a file declares — call it what
      // the learner just called it (`files/newThing`).
      const fileName = fileNameFor(name, makeable.extension);
      const language = languageForFileName(config, fileName);
      const seed = seedFor(makeable.extension, name);
      const placed = folderIn(ops.source, menu.folder);
      const made =
        seed && 'url' in seed
          ? // Bytes rather than text, which is a different write: a `.png`
            // lives on a URL and the image editor reads and writes it there.
            createExternalFile({
              source: placed.source,
              fileName,
              language,
              folderId: placed.folderId,
              ...seed,
            })
          : createNewFile({
              source: placed.source,
              fileName,
              language,
              folderId: placed.folderId,
              contents: seed?.contents,
            });
      updateSources({
        ...currentSources,
        source: config.reconcileSource?.(made, ops.source) ?? made,
      });
    },
    [
      ops.source,
      config,
      promptForName,
      folderIds,
      thenAsk,
      updateSources,
      currentSources,
    ],
  );

  /**
   * Make one that starts as a copy of this one — `Clone`.
   *
   * `New` with a head start, and named the same way: the learner says what the
   * new thing is called, and that name becomes its file's stem AND the name
   * inside it. REPLACED rather than kept, which is the whole difference
   * between a clone and a duplicate — two actors both called "Player" would be
   * two rows nobody can tell apart, and every dropdown in the lab would offer
   * the word twice.
   *
   * A picture is copied by its URL, which is where the bytes live and what the
   * image editor reads and writes through.
   */
  const clone = useCallback(
    async (file: ProjectFile, was: string) => {
      await thenAsk();
      const extension = file.name.split('.').pop() ?? '';
      const name = await promptForName({
        title: `Clone ${was}`,
        value: `${was} copy`,
        validateInput: value =>
          nameProblem(ops.source, file.folderId, value, extension),
      });
      if (!name) {
        return;
      }
      const fileName = fileNameFor(name, extension);
      const language = languageForFileName(config, fileName);
      if (file.url) {
        ops.newExternalFile({
          fileName,
          language,
          folderId: file.folderId,
          url: file.url,
          mimeType: file.mimeType,
        });
        return;
      }
      ops.newFile({
        fileName,
        language,
        folderId: file.folderId,
        // Resolved, so a clone is a COPY. Cloning a reference would write a
        // second reference to the same stock rule, and `renamed` would find no
        // declaration in it to change — two files declaring one rule name,
        // which is the ambiguity every other path here works to prevent.
        contents: renamed(resolveRuleContents(file.contents ?? ''), name),
      });
    },
    [ops, config, promptForName, thenAsk],
  );

  /**
   * Rename the THING, and let its file follow.
   *
   * Not the file: these rows say what a file declares, so the name worth
   * changing is the one inside it — and the file's stem is made from that, the
   * way `New` makes one, so the two cannot drift apart. Every reference goes
   * with it (`files/renameThing`).
   */
  const rename = useCallback(
    async (file: ProjectFile, was: string) => {
      await thenAsk();
      const name = await promptForName({title: `Rename ${was}`, value: was});
      if (!name || name === was) {
        return;
      }
      const {source: next, refusal} = renameThing(ops.source, file, name);
      if (refusal) {
        await alert({title: `Cannot rename ${was}`, message: refusal});
        return;
      }
      // REPLACE, not update, because this rewrites files rather than adding
      // one — the renamed file's own contents, and every reference to it in
      // every other file. One of those may be the workspace on screen, and an
      // editor is told a document was replaced by the epoch and nothing else
      // (SourcesContext).
      //
      // What it looked like without this: renaming the open actor left a file
      // called `bouncer.actor` holding an actor still called "Ball", because
      // the stale workspace saved its old contents back over the rewritten
      // ones. The file moved, the references followed it, and the name inside
      // did not.
      replaceSources({...currentSources, source: next});
    },
    [ops.source, promptForName, alert, replaceSources, currentSources, thenAsk],
  );

  /**
   * Take a file of the learner's own into this folder.
   *
   * The third way in, beside making one and taking one from the shelf — and
   * the only one that was ever in the file tree, whose header button put every
   * upload at the ROOT. Here it lands in the folder whose menu asked for it,
   * which is what decides whether a picture is a sprite or a backdrop.
   */
  const uploadInto = useCallback(
    async (menu: FolderMenu) => {
      pickingFor.current = menu.folder;
      await thenAsk();
      fileInput.current?.click();
    },
    [thenAsk],
  );

  const tookUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const chosen = event.target.files?.[0];
      event.target.value = ''; // so the same file can be chosen again
      const folder = pickingFor.current;
      pickingFor.current = undefined;
      if (!chosen || !folder) {
        return;
      }
      // The folder first, as `make` does: an upload into `backgrounds/` is
      // what makes the picture a backdrop, and the folder may not exist yet.
      const placed = folderIn(ops.source, folder);
      updateSources({...currentSources, source: placed.source});
      const refusal = await uploading.upload(chosen, placed.folderId);
      if (refusal) {
        await alert(refusal);
      }
    },
    [ops.source, updateSources, currentSources, uploading, alert],
  );

  const importInto = useCallback(
    async (menu: FolderMenu) => {
      await thenAsk();
      await menu.shelf?.();
    },
    [thenAsk],
  );

  /**
   * Give this actor something it does not have yet.
   *
   * On the file's OWN menu, beside Rename and Clone, because that is where
   * everything done TO one file lives — and because choosing the actor is half
   * the question, already answered by whose row this is (`actors/enhance`).
   */
  const enhance = useCallback(
    async (file: ProjectFile, name: string) => {
      await thenAsk();
      await requestActorEnhance({
        kind: 'actor',
        path: (filePath(ops.source, file.id) ?? file.name).replace(
          /\.[^./]+$/,
          '',
        ),
        name,
      });
    },
    [thenAsk, ops.source],
  );

  const remove = useCallback(
    async (file: ProjectFile) => {
      await thenAsk();
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
    [ops, config, confirm, alert, thenAsk],
  );

  const files = open ? filesIn(open.menu.folder) : [];

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
          open?.menu.makes.map(makeable => (
            <MenuItem
              key={makeable.extension}
              onClick={() => make(open.menu, makeable)}
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
        {!isReadOnly && open?.menu.uploads && uploading.enabled && (
          <MenuItem onClick={() => uploadInto(open.menu)}>
            <ListItemIcon className={styles.menuIcon}>
              <FontAwesomeV6Icon iconName="upload" iconStyle="solid" />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography variant="body4">Upload…</Typography>
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
        {files.map(({file, name}) => (
          <MenuItem
            key={file.id}
            selected={Boolean(file.active)}
            onClick={() => {
              ops.activateFile(file.id);
              close();
            }}
          >
            <ListItemText disableTypography>
              <Typography variant="body4">{name}</Typography>
            </ListItemText>
            {!isReadOnly && (
              // A control inside a menu item, which is why it stops the click
              // reaching the item: the row OPENS the file and this asks what
              // else to do with it, the way the tree's `…` does.
              <IconButton
                aria-label={`Options for ${name}`}
                size="extraSmall"
                color="tertiary"
                className={styles.rowOptions}
                onClick={event => {
                  event.stopPropagation();
                  setRow({file, name, anchor: event.currentTarget});
                }}
              >
                <FontAwesomeV6Icon iconName="ellipsis-v" iconStyle="solid" />
              </IconButton>
            )}
          </MenuItem>
        ))}
      </Menu>
      {/* One input for all nine menus: which folder asked is a ref, because the
          browser's file picker answers long after the click that opened it. */}
      <input
        ref={fileInput}
        type="file"
        accept={uploading.accept}
        className={styles.hiddenInput}
        onChange={tookUpload}
      />
      <Menu
        open={Boolean(row)}
        anchorEl={row?.anchor}
        onClose={() => setRow(undefined)}
        slotProps={{
          list: {'aria-label': row && `Options for ${row.name}`, dense: true},
        }}
      >
        {row && open?.menu.enhances && (
          // First, because it is the only one of these that ADDS something —
          // the rest rename, copy and remove. An actor is the only kind with
          // anything to be given (`actors/enhance`).
          <MenuItem onClick={() => enhance(row.file, row.name)}>
            <ListItemIcon className={styles.menuIcon}>
              <FontAwesomeV6Icon iconName="sparkles" iconStyle="solid" />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography variant="body4">Enhance…</Typography>
            </ListItemText>
          </MenuItem>
        )}
        {row && (
          <MenuItem onClick={() => rename(row.file, row.name)}>
            <ListItemIcon className={styles.menuIcon}>
              <FontAwesomeV6Icon iconName="pencil" iconStyle="solid" />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography variant="body4">Rename</Typography>
            </ListItemText>
          </MenuItem>
        )}
        {row && (
          <MenuItem onClick={() => clone(row.file, row.name)}>
            <ListItemIcon className={styles.menuIcon}>
              <FontAwesomeV6Icon iconName="clone" iconStyle="solid" />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography variant="body4">Clone</Typography>
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

/**
 * Whether this NAME can be used here, in the words the prompt shows.
 *
 * Not `validateFileName`: that answers "may a learner type this FILE name",
 * and its first rule is that the extension must be one the lab lets you
 * author. A picture is not — you upload or import one — and yet `New sprite`
 * makes one, because the extension here is the menu's rather than the
 * learner's. Which left the prompt refusing every name with "File name must
 * end in: .js, .ts, …" for a file whose ending was never in question.
 *
 * What is left of the rule is what a NAME has to be: something, and not
 * something already here.
 */
export const nameProblem = (
  source: MultiFileSource,
  folderId: string | undefined,
  value: string,
  extension: string,
): string | undefined => {
  if (!fileStem(value)) {
    return 'Enter a name.';
  }
  const fileName = fileNameFor(value, extension);
  const taken =
    folderId !== undefined &&
    Object.values(source.files).some(
      file => file.folderId === folderId && file.name === fileName,
    );
  return taken ? `There is already one called ${fileName} here.` : undefined;
};

/** `coinSpin.anim` is `coinSpin`, which `label` then titles. */
const stemOf = (name: string): string => name.replace(/\.[^.]+$/, '');

/**
 * The file a thing called `name` goes in — `Health Bar` in actors is
 * `healthBar.actor`.
 *
 * A name typed WITH the extension is taken as the file name it plainly is, so
 * a learner who types `chaser.actor` gets what they asked for rather than
 * `chaserActor.actor`.
 */
const fileNameFor = (name: string, extension: string): string =>
  name.endsWith(`.${extension}`) ? name : `${fileStem(name)}.${extension}`;
