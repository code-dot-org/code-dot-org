// The host of a World project's file acts: the component every door asks
// when it wants a file made, uploaded, opened, renamed, cloned, deleted or
// drawn (`files/fileActs`), an actor created or deleted (`actors/actorCreate`,
// `actors/actorDelete`), and the dialogs those need — the name prompt, the
// Actor Creator, a picture drawn from words. It draws nothing of its own.
//
// It was the file menus, one button per folder in the tab bar, which were the
// last way to browse a project's files after the tree and the tabs went. They
// are gone too (specs/SHELL_FINISH_PLAN.md, step 5): each kind of file has its
// way in where it is used — a picture from the look that shows it, an effect
// from the Effects tab, a rule from Rules in Play — and those ways in ask this
// rather than doing the act a second time.
//
// RENAME MEANS THE THING. A file's name is what it DECLARES — `player.actor`
// reads as "Player", the word its blocks and every dropdown already use — so
// the name worth changing is that one, and the file's stem is made from it so
// the two cannot drift apart. Every reference moves with it
// (`files/renameThing`).
//
// A MISSING FOLDER IS NOT A MISSING KIND. A project need not have every folder
// — a scenario declares the folders it uses — and making one makes its folder
// in the same write as the file (`make`). A shelf likewise makes the folder it
// writes into.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import {
  createExternalFile,
  activateFile,
  createNewFile,
  deleteFile,
  getFileExtension,
  languageForFileName,
  shouldShowFile,
  useCodebridgeConfig,
  useFileOperations,
  useFileUpload,
  usePrompts,
} from '@code-dot-org/codebridge';
import {DashboardApiClient} from '@code-dot-org/core/api';
import type {ProjectFile, MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';
import {labActions, useAppSelector} from '@code-dot-org/lab/redux';

import {setActorDeleteHandler} from '../actors/actorDelete';
import {isUnder, type PaletteTab} from '../actors/actorPurpose';
import {setActorCreateHandler} from '../actors/create/actorCreate';
import {ActorCreator, type ActorDraft} from '../actors/create/ActorCreator';
import {lookOf, withLook, withScale} from '../actors/create/actorLook';
import {newActorFile} from '../actors/create/newActor';
import {importStockActorAsData} from '../actors/importStockActor';
import {STOCK_ACTORS, stockActorById} from '../actors/stock';
import {offersActor, useAppBuilder} from '../appBuilder';
import {chooseImageGenerator} from '../appearance/generate/chooseImageGenerator';
import type {
  GeneratedPicture,
  ImageGenerator,
} from '../appearance/generate/imageGenerator';
import {importStockAnimation} from '../appearance/importStock';
import {STOCK_ANIMATIONS, stockAnimation} from '../appearance/stock';
import {useProjectImages} from '../appearance/useProjectImages';
import {actorIconImage} from '../blockly/actorIcons';
import {actorIcon, actorThumbnail} from '../blockly/actorThumbnails';
import {label} from '../blockly/label';
import {authoredName} from '../blockly/projectModules';
import {folderIn} from '../projectWrite';
import {resolveRuleContents} from '../rules/ruleReference';
import {fileIdAt, filePath} from '../runtime/projectFiles';

import {actorUses, withoutPlacementsOf} from './actorUses';
import {DrawPictureDialog} from './DrawPictureDialog';
import {setFileActHandler, type FileRef, type MadeAnswer} from './fileActs';
import styles from './fileMenus.module.css';
import {
  ACTORS_FOLDER,
  BACKGROUNDS_FOLDER,
  FOLDER_MENUS,
  SCREENS_FOLDER,
  SCREENS_MENU,
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
  /**
   * …and whether the Actor Creator is up.
   *
   * A sequence of questions, of which one is built
   * (`actors/create/ActorCreator`), asked for from the Actor Palette's Add
   * New Actor (`actors/create/actorCreate`).
   */
  const [creating, setCreating] = useState(false);
  /**
   * A picture being drawn from words for a door (`fileActs`, `draw`): which
   * folder it lands in, and how to answer the door.
   */
  const [describingFor, setDescribingFor] = useState<{
    folder: string;
    settle: (kept: Made | undefined) => void;
  }>();
  /**
   * …and for what, when the Actor Palette asked from one of its tabs; from
   * a folder's menu, nothing, and the wizard offers everything
   * (specs/PURPOSE_PLAN.md).
   */
  const [creatingFor, setCreatingFor] = useState<PaletteTab>();
  const uploading = useFileUpload();
  /** The one hidden input every folder's `Upload…` opens, and who asked. */
  const fileInput = useRef<HTMLInputElement>(null);
  const pickingFor = useRef<string | undefined>(undefined);

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
   * file name is where that lives rather than what it is. So the Actor
   * Creator's list of actors to copy says the word the rest of the lab says.
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

  /**
   * Close the Creator, and wait a tick before opening a dialog.
   *
   * TWO FOCUS TRAPS FIGHT. A door is often a MUI `Menu`, which contains
   * focus, and so does the prompt dialog (`focus-trap-react`); each pulls it
   * back from the other the moment it leaves — forever, until the stack runs
   * out: "Maximum call stack size exceeded", twice, on every rename. The door
   * closing its menu is a state update, so it has not happened yet when the
   * dialog would open in the same tick; this yields to let React commit
   * first. A dialog left standing would likewise put the one it opened
   * BEHIND it, visible and unreachable.
   */
  const thenAsk = useCallback(async () => {
    setCreating(false);
    await new Promise(resolve => setTimeout(resolve, 0));
  }, []);

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
   *
   * Answers the new file's id, so a door that asked for one — the Theme
   * field's New — can take it (`files/fileActs`).
   */
  const make = useCallback(
    async (
      menu: FolderMenu,
      makeable: Makeable,
      open = true,
    ): Promise<Made | undefined> => {
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
        return undefined;
      }
      // ONE NAME, SAID ONCE: it becomes the file's stem and the thing's own
      // name, so everywhere that reads what a file declares calls it what the
      // learner just called it (`files/newThing`).
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
      // Unopened, for a door with more to do before the file is in front:
      // the Actor Editor gives its actor the new picture first, which it
      // cannot do once its editor has gone (`fileActs`).
      const written = open ? made : quietly(made, ops.source);
      updateSources({
        ...currentSources,
        source: config.reconcileSource?.(written, ops.source) ?? written,
      });
      const id = Object.keys(made.files).find(
        each => !(each in placed.source.files),
      );
      return id ? {id, name: fileName} : undefined;
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
      // An animation from the library brings the pictures it reads, as an
      // import does (`appearance/importStock`).
      const stock =
        draft.look?.kind === 'animation'
          ? stockAnimation(draft.look.value)
          : undefined;
      const withPictures = stock
        ? importStockAnimation(source, stock).source
        : source;
      if (draft.shape) {
        // How many tiles it fills, as a row of its own. One tile writes
        // nothing, which is every actor that never touched the widget — and
        // what the picture MEASURES decides the numbers, since scaling by
        // (x, y) lands on that box only for a square one
        // (`create/actorLook.withScale`).
        contents = withScale(contents, draft.shape, draft.drawn);
      }
      return {
        ...withPictures,
        files: {...withPictures.files, [id as string]: {...file, contents}},
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
        const imported = importStockActorAsData(from, stock);
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
      // …for what it is for, when the palette said: an interface's starts
      // with a box and a drawing as big as it (`create/newActor`).
      const seed = seedFor('actor', draft.name);
      const made = createNewFile({
        source: placed.source,
        fileName,
        language,
        folderId: placed.folderId,
        contents: draft.purpose
          ? newActorFile(draft.name, draft.purpose)
          : seed && 'contents' in seed
            ? seed.contents
            : undefined,
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
      // Asked for from the map (`actorCreate`): the tab the learner was on
      // stays the active one, and the asker is told which kind was made.
      const waiting = asked.current;
      asked.current = null;
      commit(
        waiting?.returnTo && source.files[waiting.returnTo]
          ? activateFile(source, waiting.returnTo)
          : source,
      );
      waiting?.settle(lastBuilt.current);
      return true;
    },
    [thenAsk, commit],
  );

  /** Who asked for the Creator, and the tab to put back in front after. */
  const asked = useRef<{
    settle: (path: string | undefined) => void;
    returnTo?: string;
  } | null>(null);
  /** The path of the actor the Creator last built, which is what it writes. */
  const lastBuilt = useRef<string | undefined>(undefined);
  useEffect(() => {
    setActorCreateHandler(
      purpose =>
        new Promise<string | undefined>(settle => {
          // One Creator at a time: a second ask lets the first go.
          asked.current?.settle(undefined);
          if (isReadOnly) {
            settle(undefined);
            return;
          }
          asked.current = {
            settle,
            returnTo: Object.values(live.current.files).find(
              file => file.active,
            )?.id,
          };
          setCreatingFor(purpose);
          setCreating(true);
        }),
    );
    return () => setActorCreateHandler(null);
  }, [isReadOnly]);

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
   * The third way in, beside making one and taking one from the shelf. It
   * lands in the folder the door asked for — the look's Pictures menu asks
   * for `sprites/`, the Background field for `backgrounds/` — which is what
   * decides whether a picture is a sprite or a backdrop. The file tree's
   * upload put every one at the ROOT.
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

  /**
   * A file made, uploaded, opened, renamed, cloned or deleted, asked for by
   * the place its kind is used — the switcher over the map editor, a look
   * in the Actor Editor, the Theme field (`files/fileActs`).
   */
  useEffect(() => {
    setFileActHandler(async request => {
      /** The file a request names, by id or by path, as the project is now. */
      const named = (ref: FileRef) =>
        'fileId' in ref
          ? live.current.files[ref.fileId]
          : live.current.files[fileIdAt(live.current, ref.path) ?? ''];
      /** What `make` and `draw` answer for the file they made. */
      const answer = (made: Made | undefined, how?: MadeAnswer) =>
        how === 'name' ? made?.name : made?.id;
      if (request.act === 'open') {
        // Opening reads; it is the one act a read-only project still has.
        const file = named(request);
        if (file) {
          setOpening(file.id);
        }
        return undefined;
      }
      if (isReadOnly) {
        return undefined;
      }
      if (request.act === 'make' || request.act === 'upload') {
        const menu =
          request.folder === SCREENS_FOLDER
            ? SCREENS_MENU
            : FOLDER_MENUS.find(each => each.folder === request.folder);
        if (!menu) {
          return undefined;
        }
        if (request.act === 'upload') {
          // Answered before the learner has chosen anything: the browser's
          // picker says nothing at all when it is cancelled, so a promise
          // waiting on it could wait forever. What arrives is seen in the
          // folder.
          if (menu.uploads && uploading.enabled) {
            await uploadInto(menu);
          }
          return undefined;
        }
        const makeable =
          menu.makes.find(each => each.extension === request.extension) ??
          menu.makes[0];
        return makeable
          ? answer(
              await make(menu, makeable, request.open !== false),
              request.answer,
            )
          : undefined;
      }
      if (request.act === 'draw') {
        await thenAsk();
        const kept = await new Promise<Made | undefined>(settle =>
          setDescribingFor({folder: request.folder, settle}),
        );
        return answer(kept, request.answer);
      }
      const file = named(request);
      if (!file) {
        return undefined;
      }
      const name = config.fileLabel?.(file) ?? file.name;
      if (request.act === 'rename') {
        await rename(file, name);
      } else if (request.act === 'clone') {
        await clone(file, name);
      } else {
        await remove(file);
      }
      return undefined;
    });
    return () => setFileActHandler(null);
  }, [
    isReadOnly,
    make,
    rename,
    clone,
    remove,
    uploadInto,
    uploading,
    ops,
    config,
    thenAsk,
  ]);

  /**
   * A file asked to be opened (`fileActs`, `open`), opened on the render
   * after the asking. The door may have saved its own file in the same
   * breath — the Actor Editor, its new look — and that save is in the
   * project this render is handed, where a write from the render before
   * would have undone it.
   */
  const [opening, setOpening] = useState<string>();
  useEffect(() => {
    if (opening) {
      setOpening(undefined);
      ops.activateFile(opening);
    }
  }, [opening, ops]);

  /**
   * An actor taken out of the project, asked for by the Actor Palette
   * (`actors/actorDelete`). It says where the actor is placed and which
   * files' code names it, and its placements go with it: a placement of an
   * actor the project does not hold places nothing. The code that names it
   * is left as it is.
   */
  useEffect(() => {
    setActorDeleteHandler(async path => {
      const source = live.current;
      const fileId = fileIdAt(source, `${path}.actor`);
      const file = fileId ? source.files[fileId] : undefined;
      if (isReadOnly || !fileId || !file) {
        return undefined;
      }
      await thenAsk();
      const named = (ids: string[]) =>
        ids
          .map(
            id => config.fileLabel?.(source.files[id]) ?? source.files[id].name,
          )
          .join(', ');
      const {placedIn, namedIn} = actorUses(source, path);
      const message = [
        `Delete ${config.fileLabel?.(file) ?? file.name}? This cannot be undone.`,
        placedIn.length
          ? `It goes from where it is placed: ${named(placedIn)}.`
          : '',
        namedIn.length
          ? `Code in ${named(namedIn)} names it, and will stop working where it does.`
          : '',
      ]
        .filter(Boolean)
        .join(' ');
      if (!(await confirm({title: 'Delete actor', message}))) {
        return undefined;
      }
      // REPLACED, not edited, as a rename is: the map open beside the
      // palette still holds the placements this takes away, and only a new
      // epoch makes it read its file again (`replaceSources`).
      replaceSources({
        ...currentSources,
        source: deleteFile(withoutPlacementsOf(live.current, path), fileId),
      });
      return path;
    });
    return () => setActorDeleteHandler(null);
  }, [isReadOnly, thenAsk, config, confirm, replaceSources, currentSources]);

  /**
   * The project's pictures, decoded — what the Actor Creator's picture step
   * shows and what an animation's frames are drawn from.
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
   * having already recorded it, so the sprites grid could not show that
   * picture for the rest of the session while the `set sprite` picker, whose
   * own hook was never switched off, showed it perfectly. That was reported
   * exactly so.
   *
   * The dropped result is fixed where it belongs (a decode outlives the effect
   * that asked for it), and this is the window it needed to fall through.
   */
  const decoded = useProjectImages(ops.source);

  /**
   * The project's actors as things to COPY, and the library's as templates.
   *
   * Read only while the wizard is up. The
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

  // In App Builder, the controls only (`appBuilder`).
  const app = useAppBuilder();
  const templates = useMemo(
    () =>
      creating
        ? STOCK_ACTORS.filter(
            actor =>
              offersActor(actor.id, app) &&
              // The palette's tab's, when it asked (`creatingFor`).
              (!creatingFor || isUnder(actor.for, creatingFor)),
          ).map(actor => ({
            id: actor.id,
            name: actor.name,
            description: actor.description,
            look: lookOf(actor.contents),
          }))
        : [],
    [creating, app, creatingFor],
  );

  /** The project's pictures, as the wizard's picture step wants them. */
  const spriteNames = useMemo(
    () => (creating ? filesIn(SPRITES_FOLDER).map(({file}) => file.name) : []),
    [creating, filesIn],
  );

  // The library's animations: one chosen is the new actor's Main, and its
  // pictures come in with it (`buildActor`, specs/ANIMATION_PLAN.md).
  const pickableAnimations = useMemo(
    () =>
      creating
        ? STOCK_ANIMATIONS.map(animation => ({
            id: animation.id,
            name: animation.name,
            animation,
          }))
        : [],
    [creating],
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
   * it makes. That is right for an upload a door asked for and wrong for a
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
      // …AND IT OPENS NOTHING (`quietly`).
      const quiet = quietly(made, from);
      const next = config.reconcileSource?.(quiet, from) ?? quiet;
      // Said here as well as dispatched, because a caller may read it back
      // before React has rendered — the wizard does, one line later.
      live.current = next;
      updateSources({...currentSources, source: next});
      return fileName;
    },
    [config, channelId, folderIds, updateSources, currentSources],
  );

  return (
    <>
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
          build={draft => {
            const made = buildActor(draft);
            lastBuilt.current = made?.path;
            return made;
          }}
          onCreate={commitActor}
          purpose={creatingFor}
          onCancel={() => {
            setCreating(false);
            asked.current?.settle(undefined);
            asked.current = null;
          }}
        />
      )}
      {describingFor && (
        <DrawPictureDialog
          drawing={drawing}
          background={describingFor.folder === BACKGROUNDS_FOLDER}
          onKeep={picture => keepPicture(picture, describingFor.folder)}
          onDone={fileName => {
            const folderId = folderIds.get(describingFor.folder);
            // By its name in its folder, as it is now: the keep has written
            // it, and this render's project may not have it yet.
            const kept = fileName
              ? Object.values(live.current.files).find(
                  file =>
                    file.name === fileName &&
                    (folderId === undefined || file.folderId === folderId),
                )
              : undefined;
            describingFor.settle(kept && {id: kept.id, name: kept.name});
            setDescribingFor(undefined);
          }}
        />
      )}
      {/* The file picker every upload opens: which folder asked is a ref, because
          browser's file picker answers long after the click that opened it. */}
      <input
        ref={fileInput}
        type="file"
        accept={uploading.accept}
        className={styles.hiddenInput}
        onChange={tookUpload}
      />
    </>
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

/** `ripple.effect` is `ripple`, which `label` then titles. */
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

/** A file `make` or a drawing wrote: its id, and its name in its folder. */
interface Made {
  id: string;
  name: string;
}

/**
 * `made` with nothing newly opened: the files open and in front as they were
 * in `from`, and a new one closed.
 *
 * `createNewFile` and `createExternalFile` activate what they make, and the
 * tab bar reads the SOURCE's `openFiles` list, so that and each file's own
 * two flags have to be put back, which took three goes to find
 * (`codebridge.activateFile` writes all three).
 */
const quietly = (
  made: MultiFileSource,
  from: MultiFileSource,
): MultiFileSource => ({
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
});
