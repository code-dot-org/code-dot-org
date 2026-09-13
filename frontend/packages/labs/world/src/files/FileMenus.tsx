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
  useEffect,
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
import {DashboardApiClient} from '@code-dot-org/core/api';
import type {ProjectFile, MultiFileSource} from '@code-dot-org/core/api';
import {IconButtonWithTooltip} from '@code-dot-org/lab/components';
import {useSources} from '@code-dot-org/lab/contexts';
import {labActions, useAppSelector} from '@code-dot-org/lab/redux';

import {ActorPickerDialog, type ActorTile} from '../actors/ActorPickerDialog';
import {ActorCreator, type ActorDraft} from '../actors/create/ActorCreator';
import {lookOf, withLook, withScale} from '../actors/create/actorLook';
import {requestActorEnhance} from '../actors/enhance/actorEnhance';
import {importStockActor} from '../actors/importStockActor';
import {STOCK_ACTORS, stockActorById} from '../actors/stock';
import {AnimationPickerDialog} from '../animationEditor/AnimationPickerDialog';
import {parseAnim} from '../animationEditor/animDocument';
import {SpritePickerDialog} from '../animationEditor/SpritePickerDialog';
import {BackgroundPickerDialog} from '../appearance/BackgroundPickerDialog';
import {chooseImageGenerator} from '../appearance/generate/chooseImageGenerator';
import type {
  GeneratedPicture,
  ImageGenerator,
} from '../appearance/generate/imageGenerator';
import {useProjectImages} from '../appearance/useProjectImages';
import {actorIconImage} from '../blockly/actorIcons';
import {actorIcon, actorThumbnail} from '../blockly/actorThumbnails';
import {label} from '../blockly/label';
import {authoredName} from '../blockly/projectModules';
import {folderIn} from '../projectWrite';
import {resolveRuleContents} from '../rules/ruleReference';
import {fileIdAt, filePath} from '../runtime/projectFiles';

import styles from './fileMenus.module.css';
import {
  ACTORS_FOLDER,
  ANIMATIONS_FOLDER,
  BACKGROUNDS_FOLDER,
  FOLDER_MENUS,
  SPRITES_FOLDER,
  type FolderMenu,
  type Makeable,
} from './folderMenus';
import {fileStem, renamed, seedFor} from './newThing';
import {renameThing} from './renameThing';

/** A project with a new actor in it, and where that actor landed. */
interface BuiltActor {
  source: MultiFileSource;
  /** Its module path — `actors/chaser`, which is what an enhancement names. */
  path: string;
}

/** The file the row menu is about, and what it hangs off. */
interface RowMenu {
  file: ProjectFile;
  /** What the row SHOWED, which is what a menu about it should say. */
  name: string;
  anchor: HTMLElement;
  /**
   * Whether this kind can be GIVEN something (`folderMenus.enhances`).
   *
   * Carried on the row rather than read off the open folder menu, because the
   * actors reach this menu from a grid that is not one (`onOptions` below) and
   * there is no open folder menu to ask.
   */
  enhances: boolean;
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
  /** What scopes an uploaded asset to this project. */
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const [open, setOpen] = useState<{menu: FolderMenu; anchor: HTMLElement}>();
  /**
   * Whether the actor grid is up.
   *
   * The actors read as a grid rather than a list, because an actor is a thing
   * you can see and the lab draws it everywhere else it is named
   * (`actors/ActorPickerDialog`). Every act in it is still this component's —
   * the same `make`, the same shelf, the same row menu — so the two readings
   * cannot drift.
   */
  const [picking, setPicking] = useState(false);
  /**
   * …and whether the picture palette is.
   *
   * The same reading for the same reason, and the SAME DIALOG: choosing a
   * picture to draw with and choosing one to open are one grid of the project's
   * pictures, differing in what a press means (`SpritePickerDialog`).
   */
  const [painting, setPainting] = useState(false);
  /** …and whether the animations are, which is the same grid again, running. */
  const [playing, setPlaying] = useState(false);
  /**
   * …and whether the backdrops are.
   *
   * The same reading once more, at the size the stock shelf shows the same
   * pictures at: a backdrop is a place, and a place is recognized rather than
   * read (`appearance/BackgroundPickerDialog`).
   */
  const [staging, setStaging] = useState(false);
  /**
   * …and whether the Actor Creator is up.
   *
   * Not a grid: a sequence of questions, of which one is built
   * (`actors/create/ActorCreator`). It stands where `New` stood, because that
   * is the moment a learner has the question it asks.
   */
  const [creating, setCreating] = useState(false);
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
   *
   * EVERY GRID, not only the actors'. Each of these dialogs traps focus too, so
   * one left standing puts the shelf it just opened BEHIND it — visible,
   * unreachable, and unclosable without dismissing the grid on top of it. That
   * shipped for the sprites and the animations: their Import and New tiles led
   * to a dialog nobody could touch. Whichever grid asked, all of them go.
   */
  const thenAsk = useCallback(async () => {
    setRow(undefined);
    setPicking(false);
    setPainting(false);
    setPlaying(false);
    setStaging(false);
    setCreating(false);
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
   * The project as it stands, readable BETWEEN renders.
   *
   * `ops.source` is a value some render was handed, which is fine for
   * everything here that writes once per press. The wizard does not: keeping a
   * drawn picture and building the actor that names it are two writes in one
   * tick, and the second has to see the first. Reading the render's copy it
   * could not — so the commit wrote the pre-keep project back over the
   * picture, and what a learner got was a `set sprite` row naming a file that
   * was no longer there.
   *
   * Written by every render and by the keep itself. After `updateSources` the
   * store already holds the new source, so the two cannot disagree and no
   * later render can put a stale one back.
   */
  const live = useRef(ops.source);
  live.current = ops.source;

  /** One write, at the end, with the lab's reconcile given the last word. */
  const commit = useCallback(
    (source: MultiFileSource) => {
      updateSources({
        ...currentSources,
        source: config.reconcileSource?.(source, ops.source) ?? source,
      });
    },
    [updateSources, currentSources, config, ops.source],
  );

  /**
   * The actor, looking like what the wizard's picture step chose.
   *
   * A no-op when the step chose nothing, which is its commonest answer: an
   * actor made from nothing has no picture, and one copied from something
   * already looks like it (`create/actorLook`).
   */
  const dressed = useCallback(
    (source: MultiFileSource, fileName: string, draft: ActorDraft) => {
      const shaped =
        draft.shape && (draft.shape.x !== 1 || draft.shape.y !== 1);
      if (!draft.look && !shaped) {
        return source;
      }
      const id = fileIdAt(source, `${ACTORS_FOLDER}/${fileName}`);
      const file = id ? source.files[id] : undefined;
      if (!file) {
        return source;
      }
      let contents = file.contents ?? '';
      if (draft.look) {
        contents = withLook(contents, draft.look);
      }
      if (draft.shape) {
        // How many tiles it fills, as a row of its own. One tile writes
        // nothing, which is every actor that never touched the widget.
        contents = withScale(contents, draft.shape);
      }
      return {
        ...source,
        files: {...source.files, [id as string]: {...file, contents}},
      };
    },
    [],
  );

  /**
   * Make an actor from the wizard's first answer — the three doors, done.
   *
   * `make` and `clone` each ask for the name themselves and cannot be handed
   * one, so this is their tails rather than a call to either: the same writes,
   * the same reconcile, with the name already settled. Returns whether it
   * worked, because the wizard waits to be told (`create/ActorCreator`).
   */
  const buildActor = useCallback(
    (draft: ActorDraft): BuiltActor | undefined => {
      // The project as it is NOW, not as the render that handed this over
      // saw it: a picture kept on the way into this call is part of what
      // the actor is built on top of.
      const from = live.current;
      const fileName = fileNameFor(draft.name, 'actor');
      const language = languageForFileName(config, fileName);

      if (draft.origin === 'copy') {
        const file = draft.source ? from.files[draft.source] : undefined;
        if (!file) {
          return undefined;
        }
        // Resolved, so a copy is a COPY — the reasoning is `clone`'s, and the
        // name is replaced inside the file for the reason it is there: two
        // actors called "Player" are two rows nobody can tell apart.
        const made = createNewFile({
          source: from,
          fileName,
          language,
          folderId: file.folderId,
          contents: renamed(
            resolveRuleContents(file.contents ?? ''),
            draft.name,
          ),
        });
        return {
          source: dressed(made, fileName, draft),
          path: `${ACTORS_FOLDER}/${stemOf(fileName)}`,
        };
      }

      if (draft.origin === 'template') {
        const stock = draft.source ? stockActorById(draft.source) : undefined;
        if (!stock) {
          return undefined;
        }
        // An import is an AGGREGATE — the rules it elects traits from, the
        // animations it plays, the images those read — so this is one call and
        // up to seven files (`actors/importStockActor`).
        //
        // AND IT NEVER OVERWRITES, which is the whole of why the two branches
        // below are different. Asked for a template the project already holds,
        // it writes the dependencies and hands back the file that was already
        // there — the learner's, with the learner's edits in it. Renaming that
        // was the first cut of this, and what it did was rename their Coin to
        // "Gold Piece" and move every reference with it. So: whether the actor
        // file was there BEFORE decides which act this is.
        const had = fileIdAt(from, `${ACTORS_FOLDER}/${stock.id}.actor`);
        const imported = importStockActor(from, stock);
        const id = fileIdAt(imported.source, `${imported.path}.actor`);
        const file = id ? imported.source.files[id] : undefined;
        if (!file) {
          return undefined;
        }
        let next = imported.source;
        if (had !== undefined) {
          // Theirs already. Copy it under the new name, which is exactly what
          // the other door does — a template the project has IS one of mine.
          next = createNewFile({
            source: next,
            fileName,
            language,
            folderId: file.folderId,
            contents: renamed(
              resolveRuleContents(file.contents ?? ''),
              draft.name,
            ),
          });
        } else if (draft.name !== stock.name) {
          // Fresh, and called something else. Renamed after the write, since
          // the import names the file after the library's actor: the thing's
          // name and its stem move together, and every reference with them
          // (`files/renameThing`).
          const {source: withName, refusal} = renameThing(
            next,
            file,
            draft.name,
          );
          if (!refusal) {
            next = withName;
          }
        }
        // WHERE IT LANDED, which is not always `actors/<the name>`: a
        // template kept at the library's own name is the file the import
        // wrote, and one renamed or copied is the file this made.
        const where =
          had !== undefined
            ? `${ACTORS_FOLDER}/${stemOf(fileName)}`
            : imported.path;
        return {source: dressed(next, fileName, draft), path: where};
      }

      // …and from nothing, which is `New actor` with the prompt already
      // answered. The folder and the file are one write, so a project with no
      // `actors/` gets one.
      const placed = folderIn(from, ACTORS_FOLDER);
      // Narrowed rather than asserted: `seedFor` answers either bytes or text
      // depending on the kind, and an actor's is always text — but the type
      // says so for `.png` too, and reading `.contents` off the other arm is
      // exactly the mistake it is shaped to catch.
      const seed = seedFor('actor', draft.name);
      const made = createNewFile({
        source: placed.source,
        fileName,
        language,
        folderId: placed.folderId,
        contents: seed && 'contents' in seed ? seed.contents : undefined,
      });
      return {
        source: dressed(made, fileName, draft),
        path: `${ACTORS_FOLDER}/${stemOf(fileName)}`,
      };
    },
    [config, dressed],
  );

  /**
   * …and the other half: write what the wizard settled on, once.
   *
   * The build above touches nothing — every step of it is a pure transform
   * over a project source, which is what lets the wizard apply enhancements to
   * an actor that is not in the project yet and what lets Back work at all.
   * This is the only part that writes (`create/ActorCreator`).
   */
  const commitActor = useCallback(
    async (source: MultiFileSource): Promise<boolean> => {
      await thenAsk();
      commit(source);
      return true;
    },
    [thenAsk, commit],
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

  /** The pictures under `sprites/`, and those decoded to draw them. */
  const spriteFiles = useMemo(
    () => (painting ? filesIn(SPRITES_FOLDER) : []),
    [painting, filesIn],
  );
  /**
   * The project's pictures, decoded — what a sprite tile shows and what an
   * animation's frames are drawn from.
   *
   * ASKED FOR ALWAYS, where this used to ask only while a grid was up. The
   * saving was imaginary: a decode is remembered per picture
   * (`appearance/useProjectImages`), the runtime and the Blockly editor both
   * decode the whole project unconditionally anyway, and this hook shares
   * neither of their maps.
   *
   * What the condition bought instead was a WINDOW. A picture kept inside the
   * Actor Creator was requested while the wizard was up and arrived after it
   * closed — by which time this had been handed `undefined`, and the decode
   * landed in a torn-down effect. It was never requested again, `requested`
   * having already recorded it, so the sprites shelf could not show that
   * picture for the rest of the session while the `set sprite` picker, whose
   * own hook was never switched off, showed it perfectly. That was reported
   * exactly so.
   *
   * The dropped result is fixed where it belongs (a decode outlives the effect
   * that asked for it), and this is the window it needed to fall through.
   */
  const decoded = useProjectImages(ops.source);

  /**
   * The animation files, each with the FIRST animation it holds.
   *
   * The first because that is the one the editor opens on, and because a tile
   * showing all of a file's animations would be a second grid inside the first
   * (`AnimationPickerDialog`).
   */
  const animationTiles = useMemo(
    () =>
      playing
        ? filesIn(ANIMATIONS_FOLDER).map(({file, name}) => ({
            fileId: file.id,
            name,
            animation: Object.values(
              parseAnim(file.contents ?? '').animations,
            )[0],
          }))
        : [],
    [playing, filesIn],
  );

  /**
   * The backdrops, as the shelf needs them.
   *
   * The `url` and not the decoded image: a backdrop is drawn with an `<img>`
   * stretched over the tile, the way the world stretches it over the viewport,
   * and every image file in a project carries the URL its bytes are at
   * (`appearance/useProjectImages` reads the same field).
   */
  const backgroundTiles = useMemo(
    () =>
      staging
        ? filesIn(BACKGROUNDS_FOLDER).map(({file, name}) => ({
            fileId: file.id,
            name,
            url: file.url,
          }))
        : [],
    [staging, filesIn],
  );

  /**
   * The project's actors as things to COPY, and the library's as templates.
   *
   * Read only while the wizard is up, like every other grid's rows here. The
   * picture is the one every other surface draws an actor by: its elected
   * symbol, else the sandbox's rendering of it (`blockly/actorThumbnails`).
   */
  const copyable = useMemo(
    () =>
      creating
        ? filesIn(ACTORS_FOLDER).map(({file, name}) => {
            const key = (filePath(ops.source, file.id) ?? file.name).replace(
              /\.[^./]+$/,
              '',
            );
            return {
              fileId: file.id,
              name,
              picture:
                actorIconImage(actorIcon(key) ?? '') ?? actorThumbnail(key),
              // What it is drawn as, so the picture step opens on the answer
              // this actor already gives (`create/actorLook`).
              look: lookOf(file.contents ?? ''),
            };
          })
        : [],
    [creating, filesIn, ops.source],
  );

  const templates = useMemo(
    () =>
      creating
        ? STOCK_ACTORS.map(actor => ({
            id: actor.id,
            name: actor.name,
            description: actor.description,
            look: lookOf(actor.contents),
          }))
        : [],
    [creating],
  );

  /**
   * The project's pictures and animations, as the wizard's picture step wants
   * them.
   *
   * An animation is listed by its own KEY inside its `.anim` file rather than
   * by the file: a `play animation` row stores that key, and one file may hold
   * several (`actors/stock/workspace.playAnimation`).
   */
  const spriteNames = useMemo(
    () => (creating ? filesIn(SPRITES_FOLDER).map(({file}) => file.name) : []),
    [creating, filesIn],
  );

  const pickableAnimations = useMemo(
    () =>
      creating
        ? filesIn(ANIMATIONS_FOLDER).flatMap(({file}) =>
            Object.entries(parseAnim(file.contents ?? '').animations).map(
              ([id, animation]) => ({id, name: label(id), animation}),
            ),
          )
        : [],
    [creating, filesIn],
  );

  /**
   * Where a described picture comes from, if anywhere.
   *
   * ASKED ONCE, AND BEFORE THE DOOR IS OFFERED. Which of the transports this
   * is — a dev proxy really drawing, the fixture, or nothing at all — depends
   * on what is answering on this origin, and a door that offered to draw and
   * then failed would read as a broken lab
   * (`appearance/generate/chooseImageGenerator`).
   *
   * Undefined until the question comes back, which is a few milliseconds in
   * the harness and for ever anywhere else. The wizard simply does not offer
   * the door while it is undefined, which is the same thing it does when the
   * answer is that nothing can draw.
   */
  const [drawing, setDrawing] = useState<ImageGenerator>();
  useEffect(() => {
    let gone = false;
    void chooseImageGenerator().then(chosen => {
      if (!gone) {
        setDrawing(chosen.generator);
      }
    });
    return () => {
      gone = true;
    };
  }, []);

  /**
   * Keep a drawn picture: upload the bytes, and say what it is called.
   *
   * THE BYTES GO TO THE ASSETS BACKEND and the project keeps only the URL it
   * answers with, which is what an upload does and what a picture in a project
   * is (`codebridge/useFileUpload`, `core/api/assets`). The first cut of this
   * inlined a data URL the way an imported stock backdrop does — fine for a
   * 400-pixel backdrop, and not for what a model draws: the harness keeps a
   * project in one `sessionStorage` blob and two pictures exhausted it.
   *
   * NOT THROUGH `useFileUpload`, though it is the same road, and the
   * difference is one thing that hook does at the end: it activates the file
   * it makes. That is right for an upload from the file menus and wrong for a
   * wizard still asking questions — a learner who keeps a picture from each of
   * two prompts would find two editors open behind a dialog they have not
   * finished with, having asked for neither. So the upload is called directly
   * and the file written here, quietly.
   */
  const keepPicture = useCallback(
    async (
      picture: GeneratedPicture,
      folder: string,
    ): Promise<string | undefined> => {
      if (!channelId) {
        return undefined;
      }
      // As it is NOW: two keeps in a row must not land on one name, and
      // an actor built after this one is built on what this wrote.
      const from = live.current;
      // IN THIS FOLDER, not in the project. A `star.png` among the backdrops
      // does not stop one among the sprites — they are different files in
      // different folders, and that is what makes one a backdrop and the other
      // a sprite. Asked of the whole project, keeping a drawn backdrop called
      // `star.png` made the next drawn SPRITE `star2.png` for no reason a
      // learner could see. The same question `nameProblem` asks.
      const folderId = folderIds.get(folder);
      const taken = new Set(
        Object.values(from.files)
          .filter(file => file.folderId === folderId)
          .map(file => file.name),
      );
      // `crab.png`, then `crab2.png`: a learner may keep a picture from each
      // of several prompts, and the name a transport gives is a word rather
      // than a promise that it is unique.
      let fileName = `${picture.name}.png`;
      for (let at = 2; taken.has(fileName); at++) {
        fileName = `${picture.name}${at}.png`;
      }

      let url: string;
      try {
        const bytes = await (await fetch(picture.dataUrl)).blob();
        // A name of its own in the asset store, so two projects keeping a
        // `crab.png` cannot land on each other — the same shape the uploader
        // uses, for the same reason.
        const stored = await DashboardApiClient.assets.upload({
          channelId,
          filename: `${crypto.randomUUID()}.png`,
          data: bytes,
        });
        url = stored.url;
      } catch (error) {
        // The wizard leaves the picture in the tray to try again; the console
        // gets the reason, as the uploader's own failure path does.
        console.error('Keeping the drawn picture failed', error);
        return undefined;
      }

      // THE FOLDER IS WHAT THE PICTURE IS. The same bytes are a sprite in
      // `sprites/` and a backdrop in `backgrounds/`, which is the whole of the
      // difference (`appearance/backgroundsFolder`).
      const placed = folderIn(from, folder);
      const made = createExternalFile({
        source: placed.source,
        fileName,
        language: languageForFileName(config, fileName),
        folderId: placed.folderId,
        url,
        mimeType: picture.mediaType,
      });
      // …AND IT OPENS NOTHING. `createExternalFile` activates what it makes,
      // and the tab bar reads the SOURCE's `openFiles` list — so both that and
      // the file's own two flags have to be put back, which took three goes to
      // find (`codebridge.activateFile` writes all three).
      const quiet = {
        ...made,
        openFiles: from.openFiles,
        files: Object.fromEntries(
          Object.entries(made.files).map(([id, file]) => {
            const before = from.files[id];
            return [
              id,
              before
                ? {...file, open: before.open, active: before.active}
                : {...file, open: false, active: false},
            ];
          }),
        ),
      };
      const next = config.reconcileSource?.(quiet, from) ?? quiet;
      // Said here as well as dispatched, because a caller may read it back
      // before React has rendered — the wizard does, one line later.
      live.current = next;
      updateSources({...currentSources, source: next});
      return fileName;
    },
    [config, channelId, folderIds, updateSources, currentSources],
  );

  /** The folder menu the animations' grid stands in for. */
  const animationsMenu = FOLDER_MENUS.find(
    menu => menu.folder === ANIMATIONS_FOLDER,
  ) as FolderMenu;

  /** …and the one the backdrops' shelf stands in for. */
  const backgroundsMenu = FOLDER_MENUS.find(
    menu => menu.folder === BACKGROUNDS_FOLDER,
  ) as FolderMenu;

  /** The folder menu the sprites' palette stands in for. */
  const spritesMenu = FOLDER_MENUS.find(
    menu => menu.folder === SPRITES_FOLDER,
  ) as FolderMenu;

  /** The folder menu the actors' grid stands in for — its `New`, its shelf. */
  const actorsMenu = FOLDER_MENUS.find(
    menu => menu.folder === ACTORS_FOLDER,
  ) as FolderMenu;

  /**
   * The actors, as the grid needs them.
   *
   * The `moduleKey` is what the picture registries are keyed by — a file's
   * path without its extension, which is how every other surface asks for an
   * actor's picture (`blockly/moduleOptions.pictured`).
   */
  const actorTiles: ActorTile[] = useMemo(
    () =>
      picking
        ? filesIn(ACTORS_FOLDER).map(({file, name}) => ({
            fileId: file.id,
            name,
            moduleKey: (filePath(ops.source, file.id) ?? file.name).replace(
              /\.[^./]+$/,
              '',
            ),
          }))
        : [],
    [picking, filesIn, ops.source],
  );

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
            onClick={() => {
              if (menu.folder === ACTORS_FOLDER) {
                setPicking(true);
                return;
              }
              if (menu.folder === SPRITES_FOLDER) {
                setPainting(true);
                return;
              }
              if (menu.folder === ANIMATIONS_FOLDER) {
                setPlaying(true);
                return;
              }
              if (menu.folder === BACKGROUNDS_FOLDER) {
                setStaging(true);
                return;
              }
              setOpen(
                anchors[at].current
                  ? {menu, anchor: anchors[at].current!}
                  : undefined,
              );
            }}
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
                  setRow({
                    file,
                    name,
                    anchor: event.currentTarget,
                    enhances: Boolean(open?.menu.enhances),
                  });
                }}
              >
                <FontAwesomeV6Icon iconName="ellipsis-v" iconStyle="solid" />
              </IconButton>
            )}
          </MenuItem>
        ))}
      </Menu>
      {picking && (
        <ActorPickerDialog
          actors={actorTiles}
          readOnly={isReadOnly}
          onOpen={fileId => {
            ops.activateFile(fileId);
            setPicking(false);
          }}
          // THE WIZARD, where `New` used to prompt for a name and write an
          // empty file. The prompt is step one's third door now
          // (`actors/create/ActorCreator`).
          onNew={() => {
            setPicking(false);
            setTimeout(() => setCreating(true), 0);
          }}
          // The grid closes and the menu opens off the ACTORS BUTTON, which is
          // still there — rather than off the tile, which is not. Two focus
          // traps in a stack is the bug `thenAsk` exists for, and the way past
          // it is the same: let one go before the next arrives.
          onOptions={actor => {
            const file = ops.source.files[actor.fileId];
            const anchor = anchors[FOLDER_MENUS.indexOf(actorsMenu)].current;
            if (!file || !anchor) {
              return;
            }
            setPicking(false);
            setTimeout(
              () => setRow({file, name: actor.name, anchor, enhances: true}),
              0,
            );
          }}
          onCancel={() => setPicking(false)}
        />
      )}
      {creating && (
        <ActorCreator
          actors={copyable}
          templates={templates}
          sprites={spriteNames}
          images={decoded}
          animations={pickableAnimations}
          drawing={drawing}
          onKeep={picture => keepPicture(picture, SPRITES_FOLDER)}
          nameProblem={value =>
            nameProblem(
              ops.source,
              folderIds.get(ACTORS_FOLDER),
              value,
              'actor',
            )
          }
          build={buildActor}
          onCreate={commitActor}
          onCancel={() => setCreating(false)}
        />
      )}
      {playing && (
        <AnimationPickerDialog
          animations={animationTiles}
          images={decoded}
          readOnly={isReadOnly}
          onOpen={fileId => {
            ops.activateFile(fileId);
            setPlaying(false);
          }}
          onNew={() => void make(animationsMenu, animationsMenu.makes[0])}
          onImport={() => void importInto(animationsMenu)}
          onCancel={() => setPlaying(false)}
        />
      )}
      {staging && (
        <BackgroundPickerDialog
          backgrounds={backgroundTiles}
          onOpen={fileId => {
            ops.activateFile(fileId);
            setStaging(false);
          }}
          onImport={() => void importInto(backgroundsMenu)}
          onNew={
            isReadOnly
              ? undefined
              : () => void make(backgroundsMenu, backgroundsMenu.makes[0])
          }
          onUpload={
            isReadOnly || !uploading.enabled
              ? undefined
              : () => void uploadInto(backgroundsMenu)
          }
          drawing={isReadOnly ? undefined : drawing}
          onKeep={
            isReadOnly
              ? undefined
              : picture => keepPicture(picture, BACKGROUNDS_FOLDER)
          }
          onCancel={() => setStaging(false)}
        />
      )}
      {painting && (
        <SpritePickerDialog
          title="Sprites"
          description="Open one to draw on, or bring in another."
          // The FILES, not their cells: a spritesheet is one picture to open,
          // and a cell of one is not a thing this can open at all. Which cell
          // is a question the animation editor asks, where it has an answer.
          sprites={spriteFiles.map(({file}) => file.name)}
          images={decoded}
          sheets={{}}
          chooseOnPress
          onPick={({sprite}) => {
            const file = spriteFiles.find(one => one.file.name === sprite);
            if (file) {
              ops.activateFile(file.file.id);
            }
            setPainting(false);
          }}
          onImport={() => void importInto(spritesMenu)}
          onNew={
            isReadOnly
              ? undefined
              : () => void make(spritesMenu, spritesMenu.makes[0])
          }
          onUpload={
            isReadOnly || !uploading.enabled
              ? undefined
              : () => void uploadInto(spritesMenu)
          }
          drawing={isReadOnly ? undefined : drawing}
          onKeep={
            isReadOnly
              ? undefined
              : picture => keepPicture(picture, SPRITES_FOLDER)
          }
          onCancel={() => setPainting(false)}
        />
      )}
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
        {row?.enhances && (
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
