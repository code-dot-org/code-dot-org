import {Button, Typography} from '@mui/material';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
  Blockly,
  BlocklyProvider,
  BlocklyWorkspace,
  RectangleInputPlugin,
  ScrollBlockDragger,
  TopLeftMetricsManager,
  TriangleInputPlugin,
  type BlocklySerialization,
  type Toolbox,
} from '@code-dot-org/blockly';
import DisableOrphansPlugin from '@code-dot-org/blockly/plugins/disableOrphans';
import ScrollOptionsPlugin from '@code-dot-org/blockly/plugins/scrollOptions';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly/plugins/toolboxTrashcan';
import {activateFile} from '@code-dot-org/codebridge';
import type {CustomEditorProps} from '@code-dot-org/codebridge';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useLocalization} from '@code-dot-org/core/plugins/localization';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';

import {APP_HIDDEN_BLOCKS} from '../appBuilder';
import {requestAppearanceImport} from '../appearance/appearanceImport';
import {isBackgroundPath} from '../appearance/backgroundsFolder';
import {projectSheets} from '../appearance/sheetFile';
import {
  SpritePickerDialog,
  type PickedSprite,
} from '../appearance/SpritePickerDialog';
import {sizesOfImages, useProjectImages} from '../appearance/useProjectImages';
import {setRevealer, waitFor} from '../callouts/reveal';
import {
  buildsApps,
  hiddenToolboxCategories,
  showsRuleSource,
  usesSimpleColors,
  type WorldLevelProperties,
} from '../levelData';
import {gameModuleOf} from '../mainWorld';
import {useMaybeProgression} from '../progression/progressionContext';
import {shelvedToolbox} from '../progression/toolboxShelf';
import {resolveRuleContents} from '../rules/ruleReference';
import {projectImageSizes} from '../runtime/imageSize';
import {
  filePath,
  projectFiles,
  projectImagePaths,
  projectSoundPaths,
} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

// One copy, shared with the shelves that do the same thing after a write
// (`library/refreshRegistries`).

import {refreshActorPictures} from './actorAbout';
import {projectActorIcons} from './actorIconMeta';
import {addActorThumbnails, setActorIcons} from './actorThumbnails';
import styles from './blocklyFileEditor.module.css';
import {
  BODY_OWNER_ID,
  createBodySeam,
  HIDE_BODIES,
  MEMBER_HEAD_ID,
} from './bodySurfaces';
import {actorCodeChoices, rootCodeRows} from './codeRoots';
import {documentExtras, withDocumentExtras} from './documentExtras';
import {buildDomainPalette, heldNotOffered} from './domainBlocks';
import {setEditingActor, setEditingFile, setEditingRule} from './editingRule';
import {movedItself} from './editorEvents';
import {type EventChoice} from './eventChoices';
import type {BlockPart} from './extensions/blockDesigner';
import {setBodyOpener} from './extensions/bodyButton';
import {anchorBodyOwner} from './extensions/bodyOwner';
import {refreshMissingRuleWarnings} from './extensions/missingRule';
import {setSimpleColors} from './fields/FieldColorPicker';
import {FieldMarkdown, setMarkdownOpener} from './fields/FieldMarkdown';
import {NoteEditorDialog} from './fields/NoteEditorDialog';
import {fileKindOf} from './fileKind';
import {eventsNarrowerFor, eventsUnheardBy} from './kindEvents';
import {registerLessonButtons} from './lessonFlyoutButton';
import {localizeBlocks, localizeToolbox} from './localizeBlocks';
import {
  MisplacedBlocksPlugin,
  setFileContext,
  typesOffered,
} from './misplacedBlocks';
import {redrawLiveDropdowns} from './moduleOptions';
import {
  fileIdForModule,
  setModuleOpener,
  setModuleOpeningOffered,
} from './openModule';
import {PasteAcrossTabsPlugin} from './pasteShortcut';
import {refreshProjectDropdowns} from './projectDropdowns';
import {setProjectImages} from './projectImages';
import {
  projectActorOptions,
  projectOwnMetas,
  projectRuleMetas,
} from './projectModules';
import {revealInToolbox, type ToolboxHost} from './revealInToolbox';
import {blockOwners, rulesOutOfScope} from './rulesInScope';
import {parseSpriteRef} from './spriteCells';
import {setSpritePickHandler} from './spritePick';
import {standInBlocks} from './standInBlocks';
import {toolboxForSurface, type Surface} from './surfaceToolbox';
import {
  withoutBlocks,
  withoutCategories,
  withoutEmptyHeadings,
} from './toolboxFilter';
import {DesignSystemToolboxPlugin, withAddRules} from './toolboxStyle';
import {useSectionWorkspace} from './useSectionWorkspace';
import {markCode} from './workspaceRoots';
import {useWorldBlocklyTheme} from './worldBlocklyTheme';

// Distinct connector nubs for the lab's own value types, so they read apart from
// the puzzle-tab of numbers/strings: a triangle for `Actor` (`this actor`, every
// `of …` socket) and a square for `Vector` (directional values — velocity, a
// force, gravity's direction).
const plugins = [
  ToolboxTrashcanPlugin,
  ScrollOptionsPlugin,
  DisableOrphansPlugin,
  // …and the orphan's second shape: a root this kind of file cannot hold,
  // grey with a reason rather than compiled to nothing (`misplacedBlocks`).
  MisplacedBlocksPlugin,
  // A paste lands in the tab on screen, not the tab it was copied in
  // (specs/PASTE.md).
  PasteAcrossTabsPlugin,
  TriangleInputPlugin('Actor'),
  RectangleInputPlugin('Vector'),
  // The category list, drawn like the lab's other navigation (toolboxStyle).
  DesignSystemToolboxPlugin,
];

// A `.rule` / `.actor` file is a Blockly workspace stored as serialized JSON
// (INTERFACE.md). This is the editor Codebridge mounts for those languages via
// the `editorComponents` seam. It reads the file's JSON into a Blockly
// workspace and writes the workspace back out on every change — through the
// same `onChange` seam the CodeMirror editor uses, so persistence is identical.
//
// The toolbox is the World Lab domain blocks (Actor / Traits / Events); passing
// `DOMAIN_BLOCKS` registers them (and their world-lab generators) on this
// workspace, the same definitions the generator uses.

/** Parse a file's contents into workspace state; empty/invalid → a blank workspace. */
function parseWorkspace(contents: string): BlocklySerialization {
  if (!contents.trim()) {
    return {};
  }
  try {
    return JSON.parse(contents) as BlocklySerialization;
  } catch {
    return {};
  }
}

export interface BlocklyFileEditorProps extends CustomEditorProps {
  /**
   * The contents are an actor's code workspace, not a whole file: its
   * handlers and its code rows, which stand as roots, and no `define actor`
   * (`codeRoots`, specs/ACTOR_EDITOR_PLAN.md step 4c).
   */
  actorCode?: boolean;
  /**
   * The actor has a box, so a drawing added to its code starts as big as
   * the box (`codeRoots.actorCodeChoices`). Read with `actorCode`.
   */
  boxed?: boolean;
  /**
   * A page of one thing's implementation (specs/ACTOR_BLOCKS_PLAN.md, step
   * 6): the contents are its head with what it does below it. A member's
   * head is the block being made (`memberHead`), and its design is the
   * page's, handed to the head as `parts`; a step's (`stepHead`) has none.
   */
  memberHead?: {parts?: readonly BlockPart[]};
}

export const BlocklyFileEditor = ({
  fileId,
  initialContents: storedContents,
  isReadOnly,
  onChange,
  actorCode = false,
  boxed = false,
  memberHead,
}: BlocklyFileEditorProps) => {
  const memberHeadRef = useRef(memberHead);
  memberHeadRef.current = memberHead;
  const isMemberPage = Boolean(memberHead);
  // What this file SAYS, which is not always what it holds.
  //
  // A rule the learner has not edited is stored as a reference to the
  // library's (rules/ruleReference) — everything else in the lab reads a
  // project through `projectFiles`, which resolves one, but the editor is
  // handed a file's own contents by the host. Unresolved, opening any unedited
  // rule parsed a reference as a workspace and drew an EMPTY one.
  //
  // Identity for every other file, and for a rule already edited. What is
  // saved back is the whole workspace, which is how a reference becomes a copy
  // the first time somebody moves a block.
  const initialContents = useMemo(
    () => resolveRuleContents(storedContents),
    [storedContents],
  );
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  // The sandbox, for the map popup: what the actors look like, and what they
  // can be given.
  const {getActorInfo, hasCompiled} = useWorldRuntime();

  // Populate the project-derived dropdowns (actors/worlds/animations) BEFORE the
  // workspace deserializes below: a dropdown drops a serialized value that isn't
  // among its options, so the registry must be current first. This runs during
  // render, ahead of the workspace's load effect. (WorldRuntimeContext also
  // refreshes these for the generator; the calls are idempotent.)
  // What this level asks of the editor: which affordances it offers, and which
  // toolbox categories it leaves out (levelData).
  const levelProperties = useMaybeLevelProperties<WorldLevelProperties>();
  const {currentSources, updateSources, sourcesEpoch} =
    useSources<MultiFileSource>();
  const files = useMemo(
    () => projectFiles(currentSources.source),
    [currentSources],
  );
  // The symbols actors elected, pushed to the fields that draw them. Read from
  // the files rather than rendered by the sandbox, so unlike a thumbnail this
  // is there the first time a dropdown is drawn — it is text in a file. Set on
  // every change rather than merged, so a `show as` row DELETED stops being an
  // icon (`actorThumbnails`).
  useEffect(() => {
    setActorIcons(projectActorIcons(files));
  }, [files]);
  // Names for the pickers (a block stores a name, and the decoded images are
  // keyed by one); paths for the dropdown registries, which have to tell a
  // backdrop from a sprite and the folder is the only thing that says so.
  const imagePaths = useMemo(
    () => projectImagePaths(currentSources.source),
    [currentSources],
  );
  // The picture palette's pool, which is the sprites and not the backdrops: a
  // sky is not something to dress an actor in (BACKGROUNDS.md §5). Derived from
  // the paths rather than from the names, because a name cannot say where a
  // file lives.
  const images = useMemo(
    () =>
      imagePaths
        .filter(path => !isBackgroundPath(path))
        .map(path => path.split('/').pop() as string),
    [imagePaths],
  );
  // How big those images are, where the editor can tell: what says how many
  // cells a spritesheet holds (blockly/spriteCells).
  // For the pickers: the project's grids, and its images decoded to draw.
  const sheets = useMemo(() => projectSheets(files), [files]);
  const decoded = useProjectImages(currentSources.source);
  // An uploaded image is a URL, so its size cannot be read from the project —
  // only from the image itself, once it has decoded. Those measurements join
  // the ones read out of the `data:` URLs the project carries.
  const imageSizes = useMemo(
    () => ({
      ...projectImageSizes(currentSources.source),
      ...sizesOfImages(decoded),
    }),
    [currentSources, decoded],
  );
  // …and the sounds, told from the images by extension rather than by folder
  // (specs/SOUND.md) — a sound a learner dragged out of `sounds/` is still one.
  const soundPaths = useMemo(
    () => projectSoundPaths(currentSources.source),
    [currentSources],
  );
  useMemo(
    () => refreshProjectDropdowns(files, imagePaths, imageSizes, soundPaths),
    [files, imagePaths, imageSizes, soundPaths],
  );
  // …and the images themselves, for the two dropdowns whose subject IS a
  // picture. Decoded already, for the pickers; a field cannot reach a context,
  // so it is pushed the way the actor thumbnails are (`projectImages`).
  useEffect(() => {
    setProjectImages(
      Object.fromEntries(
        Object.entries(decoded).map(([name, image]) => [name, image.src]),
      ),
    );
  }, [decoded]);

  // Read at import time rather than captured, so a write lands against the
  // project as it stands when the learner chooses, not as it stood when the
  // dialog opened.
  const sourcesRef = useRef(currentSources);
  sourcesRef.current = currentSources;
  // And the write itself, through a ref for the same reason Codebridge's own
  // editor keeps one: `onChange` is `saveFile` bound to the project as it was
  // at that render, and the workspace's change listener outlives the render it
  // was made in. Calling the captured one writes the file into a project from
  // BEFORE anything else changed — which is how an imported background arrived
  // and then vanished, undone by the very edit that named it.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /**
   * The `set sprite` picker: one palette of everything the project can draw.
   *
   * The field asks (blockly/spritePick) and waits. A spritesheet is shown as
   * its cells, so choosing a drawing is one question and one answer — the value
   * is `player.png`, or `coinSpin.png#3` for a cell. Importing is the other
   * door out, and lands back in the same flow.
   */
  const [pickingSprite, setPickingSprite] = useState(false);
  const [pickCurrent, setPickCurrent] = useState<PickedSprite | undefined>();
  const resolvePick = useRef<((value: string | undefined) => void) | null>(
    null,
  );

  useEffect(() => {
    setSpritePickHandler(
      current =>
        new Promise<string | undefined>(resolve => {
          resolvePick.current = resolve;
          const {sprite, cell} = parseSpriteRef(current);
          setPickCurrent(sprite ? {sprite, cell} : undefined);
          setPickingSprite(true);
        }),
    );
    return () => setSpritePickHandler(null);
  }, []);

  const finishPick = useCallback((value: string | undefined) => {
    setPickingSprite(false);
    resolvePick.current?.(value);
    resolvePick.current = null;
  }, []);

  /** A tile was chosen: the field takes its name, with the cell if it has one. */
  const choosePicture = useCallback(
    (picked: PickedSprite) => {
      finishPick(
        picked.cell === undefined
          ? picked.sprite
          : `${picked.sprite}#${picked.cell}`,
      );
    },
    [finishPick],
  );

  // The game whose module the popup introspects.
  const worldPath = useMemo(() => gameModuleOf(files) ?? '', [files]);

  /**
   * Keep the actor thumbnails the map field draws with.
   *
   * The sandbox renders them, and a Blockly field cannot ask it — it is not in
   * the React tree — so they are pushed into a registry the field reads
   * (`blockly/actorThumbnails`), the same way the project dropdowns are fed.
   *
   * Once per world file, after the first compile: the manifest build is cached,
   * and an actor dropdown with names instead of pictures is usable but not
   * much fun.
   */
  // A fresh closure on every render, held in a ref so this effect does not
  // re-run for every one — the same guard MapEditor's fetch already uses.
  //
  // Without it a single engine error during the manifest run became a hang: the
  // error is reported by pushing a console line, that is state, the render it
  // causes makes a new `getActorInfo`, the dependency changes, the effect fires
  // and errors again. A stack thousands of frames deep, all of it one bug.
  const infoFn = useRef(getActorInfo);
  infoFn.current = getActorInfo;
  useEffect(() => {
    if (!hasCompiled || !worldPath) {
      return;
    }
    let alive = true;
    void infoFn
      .current(
        projectActorOptions(files).map(([, path]) => path),
        worldPath,
      )
      .then(info => {
        if (alive) {
          addActorThumbnails(info.thumbnails);
          // The pictures have only just arrived, and the dropdowns that show
          // them were drawn before they did (moduleOptions.redrawLiveDropdowns).
          if (workspaceRef.current) {
            redrawLiveDropdowns(workspaceRef.current);
            // …and the pictures ON blocks, which arrive by the same post
            // (`actorAbout`): `this actor` shows the kind it is about.
            refreshActorPictures(workspaceRef.current);
          }
        }
      });
    return () => {
      alive = false;
    };
  }, [hasCompiled, worldPath, files]);

  // A block naming a rule the project no longer has says so on its own face
  // (extensions/missingRule). Deleting a rule is not an event on THIS
  // workspace — it happens in a dialog, to a file — so the blocks here would
  // otherwise go on looking fine while quietly generating nothing.
  useEffect(() => {
    refreshMissingRuleWarnings(workspaceRef.current);
  }, [files]);

  // The block palette + toolbox for this project: the built-ins, extended with
  // the project's own declarative `.rule` rules (their blocks and categories).
  // Keyed per file, so switching to this editor picks up rules edited elsewhere.
  // The `.rule` being edited, as the module path its members carry — so the
  // palette can offer `set` blocks for THIS rule's own read-only properties and
  // no others (see generateRulePalette). Undefined for every other file type.
  const ownRuleModule = useMemo(() => {
    const path = filePath(currentSources.source, fileId);
    return path?.endsWith('.rule') ? path.replace(/\.rule$/, '') : undefined;
  }, [currentSources.source, fileId]);

  // …and which `.actor` it is, for the same reason one step over: `this actor`
  // in an actor file is that actor, and the workspace is the only thing that
  // knows which file it is in (`actorAbout`).
  const ownActorModule = useMemo(() => {
    const path = filePath(currentSources.source, fileId);
    return path?.endsWith('.actor') ? path.replace(/\.actor$/, '') : undefined;
  }, [currentSources.source, fileId]);

  // The properties this actor declares for itself, if it is one. Parsed from
  // the file as saved rather than from the live workspace: the palette is
  // rebuilt when the sources change, which is exactly when a declaration was
  // added or renamed. A file mid-edit parses to undefined and leaves the blocks
  // it already had alone, rather than dropping them while a name is half typed.
  //
  // EVERY actor's and world's, not only the open file's. A property declared
  // in `healthBar.actor` exists to be set from somewhere ELSE — that is what a
  // property on an interface element is for — so its block has to be in the
  // palette of the file doing the setting. Scoped to the open file, a world
  // had no way to say `set subject of ⟨any ⟨Health Bar⟩⟩`.
  //
  // They land in the Actor category rather than one of their own
  // (`withOwnProperties`), which is what keeps this from becoming a category
  // per actor.
  const ownActorProperties = useMemo(() => projectOwnMetas(files), [files]);

  // What kind of file this is, where that decides what may be placed in it — a
  // world event's hat needs a `world` at module scope and only a `.world` has
  // one, and a definition root decides what the file COMPILES to (`eventHats`,
  // `ROOT_HOMES`). Read through the same `fileKindOf` the generator routes on,
  // so the palette and the compiler cannot disagree about what a file is.
  const fileKind = useMemo(() => {
    return fileKindOf(filePath(currentSources.source, fileId));
  }, [currentSources.source, fileId]);

  // The level may leave categories out of the toolbox. Only the toolbox: the
  // blocks stay defined, so a workspace that already holds one still renders.
  const hiddenCategories = hiddenToolboxCategories(levelProperties);
  // …and in App Builder, the blocks for what an app is not offered: layers,
  // cameras, Viewports (`appBuilder`). The same bargain: hidden, still defined.
  const app = buildsApps(levelProperties);
  // …and, when the level gates the shelf, the toolbox offers only what this
  // learner has unlocked plus what the lesson they are doing teaches
  // (progression/toolboxShelf). Off by default, and identity when off.
  const progression = useMaybeProgression();
  const shelf = useMemo(
    () => (progression?.gated ? {holds: progression.holds} : undefined),
    [progression?.gated, progression?.holds],
  );
  // The file's own contents, for the one question the palette asks OF it: which
  // rules it says it depends on. Read from the saved sources like
  // `ownActorProperties` beside it, and for the same reason — the palette is
  // rebuilt when the sources change, which is exactly when a `use trait` or a
  // `use rule` was added.
  const ownContents = useMemo(() => {
    const path = filePath(currentSources.source, fileId);
    return path ? files[path] : undefined;
  }, [currentSources.source, fileId, files]);

  const {blocks, toolbox, holdable} = useMemo(() => {
    const rules = projectRuleMetas(files);
    const palette = buildDomainPalette(rules, {
      ownRuleModule,
      fileKind,
      ownProperties: ownActorProperties,
      // …and which of those actors is the one being edited, which decides
      // whose `emit` blocks are listed: an actor's events are heard anywhere
      // and raised only at home (`domainBlocks`).
      ownActorModule,
    });
    // …and a definition for every block type the project's files hold that
    // this palette does not mint. That is what a deleted rule leaves behind,
    // and without one Blockly refuses to deserialize the file at all — the
    // editor throws and nothing renders (blockly/standInBlocks).
    const known = new Set(palette.blocks.map(block => block.type));
    // A `.rule` and an `.actor` are offered only the rules they say they
    // depend on, and what those depend on in turn (`rulesInScope`). A world
    // still gets every one, because it runs every one. Hidden the same way a
    // level's excluded categories are, and with the same bargain: the blocks
    // stay defined, so a file already holding one renders and compiles.
    const narrowed = rulesOutOfScope(
      {kind: fileKind, module: ownRuleModule, contents: ownContents},
      rules,
      blockOwners(palette.toolbox, rules),
    );
    // …and in an actor's own file, no hat for an event that actor cannot
    // hear: its handlers are about it and nobody else (`kindEvents`).
    const unheard = ownActorModule
      ? eventsUnheardBy(
          palette.toolbox,
          palette.blocks,
          eventsNarrowerFor(files),
          ownActorModule,
        )
      : new Set<string>();
    const offered = withoutBlocks(
      withoutCategories(palette.toolbox, [...hiddenCategories, ...narrowed]),
      new Set([...(app ? APP_HIDDEN_BLOCKS : []), ...unheard]),
    );
    const shelved = shelf ? shelvedToolbox(offered, shelf) : offered;
    return {
      blocks: [
        ...palette.blocks,
        ...standInBlocks(Object.values(files), known),
      ],
      // …and LAST, after everything that can empty a group: the headings were
      // decided while the toolbox was built, and any of the three filters
      // above can leave one standing over nothing (`toolboxFilter`).
      toolbox: withAddRules(withoutEmptyHeadings(shelved)),
      // What this kind of file may HOLD, which is the whole palette for it.
      // Every filter above is advice about what to offer — a rule out of
      // scope, a level's hidden drawers, an app's, a hat this actor cannot
      // hear, a lesson's shelf — and none of them makes a block that is
      // already in the file wrong to be there. Asking the shelved toolbox
      // instead disabled `define world` itself in any lesson opened before
      // `origin/first-world` was done, and a disabled world compiles to
      // `export default world` and nothing else (`misplacedBlocks`).
      // …and what no drawer offers because an editor says it, which a file
      // written before is still right to hold (`heldNotOffered`).
      holdable: new Set([
        ...typesOffered(palette.toolbox),
        ...heldNotOffered(fileKind),
      ]),
    };
  }, [
    files,
    ownContents,
    ownRuleModule,
    ownActorModule,
    fileKind,
    hiddenCategories,
    app,
    ownActorProperties,
    shelf,
  ]);

  /**
   * The implementations this file holds and the workspace does not (§8).
   *
   * The editor has no other way to serialize: `readFile` is how the file is
   * read and `showFile` how one is put on screen, because those are the two
   * places the split is put back together. Calling `workspaces.save` directly
   * would not throw — it would hand out a rule whose every step is empty.
   */
  const seam = useRef(createBodySeam()).current;

  // Parsed once: Codebridge keys this component by file id, so it remounts (and
  // re-reads `initialContents`) when the active file changes.
  // `useState` with an initialiser, not `useRef(seam.show(…))`: a ref's
  // argument is evaluated on every render and only the first result kept, so
  // the split would re-run and remint the ids its bodies are keyed by while
  // the workspace kept the first set.
  /** Which surface the workspace is actually showing. */
  const surfaceRef = useRef<string | null>(null);
  /** The toolbox of the surface shown, for the add-a-section menu. */
  const surfaceToolboxRef = useRef<Toolbox>([]);
  // THE FILE AS SECTIONS (`useSectionWorkspace`, specs/LAZY_WORKSPACE_PLAN.md):
  // its top blocks in a column, collapsible, reordered by dragging, added
  // from the "+" between them. Not on a body surface, which is one member's
  // implementation.
  // In an actor's own file the "+" offers what that actor can hear, as the
  // map's quick add does for a placed one (`kindEvents`).
  const narrowEvents = useMemo(() => {
    if (!ownActorModule) {
      return undefined;
    }
    const narrow = eventsNarrowerFor(files);
    return (choices: EventChoice[]) => narrow(choices, ownActorModule);
  }, [files, ownActorModule]);
  const codeChoices = useMemo(() => actorCodeChoices(boxed), [boxed]);
  const sections = useSectionWorkspace({
    memoryKey: fileId,
    definitions: blocks,
    getToolbox: () => surfaceToolboxRef.current,
    narrowEvents,
    ...(actorCode ? {moreChoices: codeChoices} : {}),
    isReadOnly,
    workspaceRef,
    // A member page is one block and what it does: no sections to fold.
    isShowingSections: () =>
      surfaceRef.current === null && !memberHeadRef.current,
  });
  /**
   * An actor's code rows made roots, after every load and arrival — on the
   * file's own surface, never on one member's body (`codeRoots`).
   */
  const rootCode = useCallback(
    (workspace: Blockly.Workspace) => {
      if (actorCode && surfaceRef.current === null) {
        rootCodeRows(workspace);
      }
    },
    [actorCode],
  );
  const {
    prepare: stripCollapsed,
    save: saveSections,
    layOut,
    layOutRef,
    onInject: injectSections,
    handleEvent: sectionEvent,
  } = sections;

  const [startBlocks] = useState(() => {
    const document = parseWorkspace(initialContents);
    // As this file was left this session, or — for one not yet opened —
    // collapsed when it is too big to read at once.
    // A member page is one stack, and what hangs below its head is the page.
    if (memberHeadRef.current) {
      return document;
    }
    return sections.prepareFirst(HIDE_BODIES ? seam.show(document) : document);
  });

  // What the file holds beside its workspace — a world's main map — kept
  // from the contents this opened on and put back on every save
  // (`documentExtras`). Re-read when the lab hands over a different document.
  const extras = useRef(documentExtras(initialContents));

  /** The FILE: what the workspace shows, with its bodies put back. */
  const readFile = useCallback(
    (workspace: Blockly.Workspace) => {
      // …with every collapsed body put back where it was taken from: the file
      // a collapsed workspace writes is the file a built one would.
      const saved = saveSections(workspace);
      return withDocumentExtras(
        HIDE_BODIES ? seam.read(saved) : saved,
        extras.current,
      );
    },
    [seam, saveSections],
  );

  /**
   * The member whose body is on screen, if one is.
   *
   * ONE workspace, loaded in place — the same thing the rename and epoch
   * effects below do, with events off. Re-keying the `BlocklyWorkspace` to
   * swap `startBlocks` was the first attempt and the body came up empty;
   * loading is what this file already knows how to do.
   */
  const [editing, setEditing] = useState<{
    id: string;
    label: string;
    /** Which toolbox this surface wants — an event's is not a body's. */
    kind: Surface;
  } | null>(null);
  /** The interface, held while a body has its place. */
  const interfaceRef = useRef<BlocklySerialization | null>(null);

  /** What the pencil on a `define …` block does. */
  const openBody = useCallback((blockId: string) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    // Saved, not re-read from the file: the learner may have renamed a
    // property since, and going back should show what they left.
    // With the collapsed bodies put back: going Back strips them out again,
    // and a save made from the body surface writes the interface whole.
    interfaceRef.current = saveSections(workspace);
    const block = workspace.getBlockById(blockId);
    setEditing({
      id: blockId,
      label: block?.getFieldValue('NAME') || 'this',
      // A drawing's is a body plus the one drawer that can only be used
      // there (`surfaceToolbox`).
      kind: block?.type === 'world_define_drawing' ? 'drawing' : 'body',
    });
  }, []);

  /** The note being written, if one is. */
  const [note, setNote] = useState<{
    field: FieldMarkdown;
    value: string;
  } | null>(null);

  // The same arrangement the pencil uses: a Blockly field has no route to
  // React state, so the editor installs itself while it is mounted.
  useEffect(() => {
    setMarkdownOpener(field =>
      setNote({field, value: (field.getValue() as string) ?? ''}),
    );
    return () => setMarkdownOpener(null);
  }, []);

  const closeBody = useCallback(() => {
    // Back to the FILE, not to the snapshot taken when the body opened. The
    // head has been drawing `RETURNS` since then, and it is the only place
    // that field exists — so the interface is rebuilt from what the file now
    // says, which also lets the seam forget what the head was holding.
    const held = interfaceRef.current;
    if (held && HIDE_BODIES) {
      interfaceRef.current = seam.show(seam.read(held));
    }
    setEditing(null);
  }, [seam]);

  // THE MEMBER PAGE'S PARTS, ON THE HEAD. The page edits the design and the
  // head is where the body's variables are bound to it: loading the parts
  // binds a new value to a variable of its own and renames one renamed,
  // which is what the body's getters follow. The events that fires save the
  // file, and the page reads the bound parts back from it.
  const memberParts = memberHead?.parts;
  useEffect(() => {
    const head = workspaceRef.current?.getBlockById(MEMBER_HEAD_ID) as
      | (Blockly.Block & {
          saveExtraState?: () => {parts?: BlockPart[]};
          loadExtraState?: (state: {parts: BlockPart[]}) => void;
          fill_?: () => void;
        })
      | null
      | undefined;
    if (!memberParts || !head?.loadExtraState) {
      return;
    }
    const unbound = (parts: readonly BlockPart[]) =>
      JSON.stringify(
        parts.map(part =>
          part.kind === 'param' ? {...part, var: undefined} : part,
        ),
      );
    const now = head.saveExtraState?.()?.parts ?? [];
    if (unbound(now) === unbound(memberParts)) {
      return;
    }
    head.loadExtraState({parts: memberParts.map(part => ({...part}))});
    head.fill_?.();
  }, [memberParts]);

  // A Blockly field has no route to React state, so the editor installs
  // itself while it is mounted — `setModuleOpener` and `setLessonOpener` are
  // the same arrangement.
  useEffect(() => {
    setBodyOpener(openBody);
    return () => setBodyOpener(null);
  }, [openBody]);

  /** Show a whole document: keep its bodies, render its interface. */
  const showFile = useCallback(
    (document: BlocklySerialization, workspace: Blockly.WorkspaceSvg) => {
      const shown = HIDE_BODIES ? seam.show(document) : document;
      Blockly.serialization.workspaces.load(stripCollapsed(shown), workspace);
      rootCode(workspace);
      // Handed back because the caller may be reloading UNDER an open body,
      // and the body is built from the interface, not from the workspace.
      // WHOLE, collapsed bodies and all: it is what a save from the body
      // surface writes.
      return shown;
    },
    [seam, stripCollapsed, rootCode],
  );

  // The toolbox the surface in front of the learner can actually use. Kept
  // apart from the `blocks` memo above on purpose: `blocks` re-registers every
  // definition and is watched by the effect that swaps surfaces, so folding
  // this into it would rebuild the palette every time a body opened.
  const surfaceToolbox = useMemo(
    () =>
      toolboxForSurface(
        toolbox,
        editing?.kind ?? (isMemberPage ? 'body' : 'interface'),
      ),
    [toolbox, editing, isMemberPage],
  );
  surfaceToolboxRef.current = surfaceToolbox;

  // The words on the blocks, in the reader's language.
  //
  // Done to the DEFINITIONS rather than to the workspace: Blockly has no
  // notion of localization, and a translation that reached the SVG would be
  // text rewritten under its layout. `localizeBlocks` translates what is read
  // and leaves every identifier — block types, argument names, what a dropdown
  // STORES — exactly as it was.
  const locale = useLocalization();
  const localizedBlocks = useMemo(
    // `locale` is not read; it is the signal. The plugin fires `change` when
    // LocalizeJS arrives and on every switch after, and the translation is
    // synchronous, so re-running it is the whole of following a locale.
    () => localizeBlocks(blocks),
    [blocks, locale],
  );

  // …and the drawers they sit in. The toolbox is inside the `notranslate`
  // container with the workspace, so nothing else would translate it.
  //
  // LAST, after `toolboxForSurface` and the two filters above it: all three
  // select categories by name, and would stop matching a name in another
  // language. See `localizeToolbox`.
  const localizedToolbox = useMemo(
    () => localizeToolbox(surfaceToolbox),
    [surfaceToolbox, locale],
  );

  const options = useMemo(
    () => ({
      readOnly: isReadOnly,
      trashcan: false,
      move: {wheel: true, drag: true, scrollbars: true},
      plugins: {
        metricsManager: TopLeftMetricsManager,
        blockDragger: ScrollBlockDragger,
      },
    }),
    [isReadOnly],
  );

  // The workspace whose load has finished. Blockly reports what it creates while
  // loading — the variables a rule declares, the blocks themselves — as ordinary
  // change events, and saving those writes the file back the moment it is
  // opened: an edit nobody made, a project marked dirty, and a full recompile
  // for byte-identical output.
  //
  // Per WORKSPACE, not per editor: this component keeps its state while the
  // workspace beneath it is re-injected (see the `readOnly` key below), and the
  // lab is read-only for a moment while the project loads — so every file open
  // was followed by a second load whose events looked like edits. Worse, they
  // were edits to the sources as they stood BEFORE the project arrived, so the
  // enqueued save wrote the starter project over the learner's work half a
  // minute later.
  const loadedWorkspace = useRef<Blockly.WorkspaceSvg | null>(null);
  /**
   * The toolbox's blocks, at the height the workspace draws them.
   *
   * THE FLYOUT IS ITS OWN WORKSPACE with its own renderer and its own copy of
   * the font metrics, and the effect below refreshes the main workspace's and
   * not those. So a page whose font arrived after injection ends up with two
   * answers — measured, 20/16 in the workspace against 17/14 in the flyout —
   * and every block in the toolbox is drawn to a different height than the one
   * you get when you drag it out. Which way it is wrong depends on which face
   * stood in, so it reads as "too tall" or "too short" depending on the
   * machine.
   *
   * The main workspace is the authority here because it is the one that gets
   * reloaded; the flyout only has to agree with it. Unlike a workspace, a
   * flyout redraws its blocks from the refreshed constants straight away —
   * nothing has to be reloaded — so this is the whole of the fix.
   */
  const syncFlyoutMetrics = useCallback(
    (workspace: Blockly.WorkspaceSvg): void => {
      const flyout = workspace.getFlyout()?.getWorkspace();
      if (!flyout) {
        return;
      }
      const metric = (one: Blockly.WorkspaceSvg): number =>
        (
          one.getRenderer().getConstants() as unknown as {
            FIELD_TEXT_HEIGHT?: number;
          }
        ).FIELD_TEXT_HEIGHT ?? 0;
      if (metric(flyout) !== metric(workspace)) {
        flyout.refreshTheme();
      }
    },
    [],
  );

  /**
   * Ask every block on the workspace to work out its own size.
   *
   * A LOAD DOES NOT ALWAYS LAY OUT WHAT IT BUILT. Opening `use the pad` on
   * Teleport — eighty-eight blocks, seventeen of them values nested inside
   * other values — left those seventeen reporting a height and width of zero
   * while claiming to be rendered and holding an SVG root. A block with no
   * size draws as nothing, and a dropdown on one draws as an arrow with no
   * block around it, which is what it looks like from the front.
   *
   * `finishQueuedRenders` alone does not help, and that is the tell: nothing
   * had been queued. So they are queued here, by name, and then flushed.
   *
   * Cheap enough to do after every load — a block that already knows its size
   * re-renders to the same numbers — and worth doing there rather than only
   * where it was noticed, since which blocks get missed is not something this
   * code decides.
   */
  /** Sections, and the "How this works" button in a rule's drawer. */
  const onInject = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      // A rule's page holds a body and no `define rule` (`definesRule`).
      markCode(workspace, fileKind === 'rule' ? 'rule' : undefined);
      injectSections(workspace);
      registerLessonButtons(workspace);
    },
    [injectSections, fileKind],
  );
  useEffect(() => {
    if (workspaceRef.current) {
      markCode(workspaceRef.current, fileKind === 'rule' ? 'rule' : undefined);
    }
  }, [fileKind]);

  const handleChange = useCallback(
    (event: Blockly.Events.Abstract) => {
      const workspace = workspaceRef.current;
      if (!workspace) {
        return;
      }
      // Before anything else, and before the UI events are dropped: opening a
      // category is exactly when the flyout's metrics have to be right, and
      // asking here needs no guess about when the font arrived. A no-op once
      // the two workspaces agree, which is every time after the first.
      if (event.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
        syncFlyoutMetrics(workspace);
      }
      // Before the layout below sees it: a code row loaded, dragged in or
      // let go of at the top of an actor's code is a root there.
      if (
        event.type === Blockly.Events.FINISHED_LOADING ||
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_MOVE
      ) {
        rootCode(workspace);
      }
      // Opening a file is not editing it.
      if (loadedWorkspace.current !== workspace) {
        if (event.type === Blockly.Events.FINISHED_LOADING) {
          loadedWorkspace.current = workspace;
          // The first load of this workspace goes through `BlocklyWorkspace`'s
          // own seeding and not through either of the reload effects, so this
          // is the only place it can be measured and arranged.
          layOut(workspace);
          (
            workspace.getBlockById(MEMBER_HEAD_ID) as unknown as {
              fill_?: () => void;
            } | null
          )?.fill_?.();
        }
        return;
      }
      // A member page's workspace is the member: saved whole, as the page
      // reads it (`memberEdits.withMemberDocument`). Keystrokes are shown and
      // not saved, as on a body surface, and for its reason: a value's name
      // is the block's, and a rename rewrites the project.
      if (memberHeadRef.current) {
        if (
          event.isUiEvent ||
          event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE ||
          isReadOnly
        ) {
          return;
        }
        onChangeRef.current(
          JSON.stringify(
            Blockly.serialization.workspaces.save(workspace),
            null,
            2,
          ),
        );
        return;
      }
      sectionEvent(event, workspace);
      // A BODY's edits are not the file's. The workspace holds one member's
      // implementation, so what it saves is that body — put back in the seam,
      // and the file is the interface this editor set aside, merged with it.
      //
      // Safe against the empty surface that broke the first attempt: the swap
      // above loads with events off, so nothing arrives here until a person
      // has done something, and `surfaceRef` says which surface they did it
      // on.
      if (editing && surfaceRef.current === editing.id) {
        if (event.isUiEvent) {
          return;
        }
        // A KEYSTROKE IS NOT AN EDIT, and on this surface that is not a
        // nicety. Blockly writes a text field on every keypress as an
        // intermediate change, so that the block resizes as you type. Down
        // this path the member's name is its signature: persisting those
        // would rename it to "c", then "cl", then "cla" — and a rename
        // rewrites the project, which reloads this workspace, which throws
        // away the very block whose field is open. Typing `clamped between 0
        // and 1` over `kept between 0 and 1` lost the field editor within the
        // first few letters and left the member called `cla`.
        //
        // So the keystrokes are shown and not saved; the commit — the
        // BLOCK_CHANGE Blockly fires when the editor closes, from the value
        // it opened with — is what the project hears about.
        if (event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
          return;
        }
        seam.setBody(
          editing.id,
          Blockly.serialization.workspaces.save(
            workspace,
          ) as BlocklySerialization,
        );
        const held = interfaceRef.current;
        if (held && !isReadOnly) {
          onChangeRef.current(JSON.stringify(seam.read(held), null, 2));
        }
        return;
      }
      // Ignore pure UI events (selection, viewport) — only persist real edits.
      if (event.isUiEvent || movedItself(event)) {
        return;
      }
      onChangeRef.current(JSON.stringify(readFile(workspace), null, 2));
    },
    // `editing` among them, and it is not optional: without it this closure
    // keeps the value it had when the editor mounted — null — and a body's
    // edits fall through to the path that writes the whole file, which for a
    // workspace holding one implementation is not the file at all.
    [
      editing,
      seam,
      isReadOnly,
      readFile,
      syncFlyoutMetrics,
      layOut,
      sectionEvent,
      rootCode,
    ],
  );

  // The open button on a `use rule` / `use trait` block, and what it does. The handler
  // turns the module path the field hands back into the file the browser would
  // have opened; whether it is offered at all is the level's call.
  useEffect(() => {
    setModuleOpeningOffered(showsRuleSource(levelProperties));
  }, [levelProperties]);

  // How much of the color picker a level wants offered. A field has no route to
  // React state, which is what these module-level installers are for.
  useEffect(() => {
    setSimpleColors(usesSimpleColors(levelProperties));
  }, [levelProperties]);

  useEffect(() => {
    setModuleOpener(modulePath => {
      const sources = sourcesRef.current;
      const fileId = fileIdForModule(sources.source, modulePath);
      if (!fileId) {
        // The button is only drawn when the project holds the file
        // (`canOpenModule`), so getting here means the two disagree about what
        // "holds" means — which is what happened when `.actor` was registered
        // as openable and not listed among the extensions tried here. The
        // button did nothing at all, and nothing anywhere said why.
        console.warn(
          `World Lab: nothing to open for \`${modulePath}\`. The button offered ` +
            'it, so the openable registry and this resolver disagree.',
        );
        return;
      }
      updateSources({
        ...sources,
        source: activateFile(sources.source, fileId),
      });
    });
    // Cleared on unmount so a field on a disposed workspace cannot open a file
    // through an editor that is gone.
    return () => setModuleOpener(null);
  }, [updateSources]);

  // "Show me" on a block or a drawer (`callouts/reveal`): this editor's
  // toolbox, while this editor is the one on screen. Blockly's own focus is
  // what points at a block, so that a keyboard and a screen reader are
  // pointed at it too (`revealInToolbox`).
  useEffect(() => {
    setRevealer('toolbox', async step => {
      // A workspace is INJECTED after the editor holding it has mounted, so
      // a reveal that has just brought this file to the front arrives before
      // there is a toolbox to open. Waited for here, where what is waited on
      // is known, rather than by the caller guessing a delay.
      const workspace = await waitFor(() => workspaceRef.current);
      if (!workspace) {
        return false;
      }
      try {
        return revealInToolbox(
          workspace as unknown as ToolboxHost,
          step,
          node =>
            Blockly.getFocusManager().focusNode(node as Blockly.IFocusableNode),
          // Once the flyout has laid its blocks out, so the block's place
          // is its real one.
          act => void Blockly.renderManagement.finishQueuedRenders().then(act),
        );
      } catch {
        // Pointing is a second channel: a Blockly that objects to being
        // steered from outside costs the ring, never the lesson.
        return false;
      }
    });
    return () => setRevealer('toolbox', null);
  }, []);

  // Which rule this workspace is, so `use rule` can leave it out of its own list.
  // After mount rather than during: the workspace is created by a child, whose
  // effects run first. A block deserialized before this lands keeps whatever it
  // was saved with, which is the right way round — a dropdown that cannot offer
  // a value drops it.
  useEffect(() => {
    if (workspaceRef.current) {
      setEditingRule(workspaceRef.current, ownRuleModule);
      setEditingActor(workspaceRef.current, ownActorModule);
      // …and which FILE it is at all, which is what an act on the file needs:
      // a world's own `define actor` can be enhanced, and the patch lands in
      // the world (`extensions/enhanceButton`).
      setEditingFile(
        workspaceRef.current,
        filePath(currentSources.source, fileId)?.replace(/\.[^./]+$/, ''),
      );
      // …and what kind of file, and what it offers, which is what says a
      // block pasted here from another tab cannot be here (`misplacedBlocks`).
      setFileContext(
        workspaceRef.current,
        fileKind ? {kind: fileKind, offered: holdable} : undefined,
      );
      // …and now that the workspace knows which file it is, the blocks that
      // draw the actor they are about can say so. HERE rather than only on
      // creation, because a block is created before it is connected and a
      // SHADOW is created without announcing itself at all — so the first ask
      // of "what am I about" can come before there is anything to answer with.
      refreshActorPictures(workspaceRef.current);
    }
  }, [
    ownRuleModule,
    ownActorModule,
    currentSources.source,
    fileId,
    fileKind,
    holdable,
  ]);

  // Swap the surface, and keep it swapped.
  //
  // NOT one-shot on `editing` changing. `BlocklyWorkspace` re-seeds itself
  // from `startBlocks` when its `blocks` prop changes, and `blocks` is
  // rebuilt whenever the project's files change — which a body's own edit
  // does. So the interface reappeared underneath an open body, and the next
  // edit stored THAT as the body. This runs on `blocks` too and asks the
  // workspace what it is actually showing.
  //
  // The question it asks: a member's block lives on the interface and never
  // inside its own body, so finding it means the interface is up.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    const want = editing?.id ?? null;
    const showingInterface = Boolean(want && workspace.getBlockById(want));
    if (surfaceRef.current === want && !showingInterface) {
      return;
    }
    surfaceRef.current = want;
    const held = interfaceRef.current ?? startBlocks;
    const document = editing
      ? seam.bodyOf(editing.id, held)
      : stripCollapsed(held);
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(document, workspace);
      rootCode(workspace);
      if (editing) {
        // Inside the quiet, not after it: anchoring changes the block, and a
        // change event here would be read as the learner editing the body and
        // written straight back to the file.
        const head = workspace.getBlockById(BODY_OWNER_ID);
        if (head) {
          anchorBodyOwner(head);
          // The viewport is wherever the interface left it, which for a rule
          // wider than the screen is not where this is. To the ORIGIN rather
          // than centered on the head: the head is as wide as the signature it
          // draws, and centring a wide block puts its left edge behind the
          // toolbox.
        }
      }
    } finally {
      Blockly.Events.enable();
    }
    if (editing) {
      // To the ORIGIN, which is where the head is: `bodyOf` places it at the
      // same offset every other workspace in the lab puts its root, and the
      // viewport is otherwise still wherever the interface was left. Opening a
      // body from a rule scrolled to the right put the head behind the
      // toolbox, off the side of the screen.
      workspace.scroll(0, 0);
    }
    refreshActorPictures(workspace);
    layOut(workspace);
  }, [editing, blocks, seam, startBlocks, layOut, stripCollapsed, rootCode]);

  /**
   * Re-seed when the lab is handed a different document.
   *
   * Loading the project, restoring a version, starting over — `sourcesEpoch`
   * counts those and nothing else (SourcesContext), so this never has to work
   * out whether a change was its own. Its own edits do not bump it.
   */
  const seenEpoch = useRef(sourcesEpoch);
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || seenEpoch.current === sourcesEpoch) {
      return;
    }
    seenEpoch.current = sourcesEpoch;
    extras.current = documentExtras(initialContents);
    const {scrollX, scrollY} = workspace;
    // With events off, like the rename reload: the sources already hold this
    // state, and re-saving it would be a second write for an edit nobody made.
    Blockly.Events.disable();
    try {
      showFile(parseWorkspace(initialContents), workspace);
    } finally {
      Blockly.Events.enable();
    }
    refreshActorPictures(workspace);
    workspace.scroll(scrollX, scrollY);
  }, [sourcesEpoch, initialContents, showFile]);

  // Blocks already on screen were built with the words of the old locale.
  //
  // Re-registering the definitions changes what the NEXT block made of a type
  // will say, and nothing about the ones already made — a block keeps the
  // fields it was created with. So the workspace is loaded back into itself,
  // which is the same thing a file switch does and the same thing the font
  // re-measure below does.
  //
  // Not on the first render: `useLocalization` reports a locale immediately,
  // and reloading a workspace that was just built in that locale is a reload
  // for nothing.
  const localeShown = useRef<string | null>(null);
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    if (localeShown.current === null) {
      localeShown.current = locale;
      return;
    }
    if (localeShown.current === locale) {
      return;
    }
    localeShown.current = locale;
    const {scrollX, scrollY} = workspace;
    const state = Blockly.serialization.workspaces.save(workspace);
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(state, workspace);
      rootCode(workspace);
      const head = workspace.getBlockById(BODY_OWNER_ID);
      if (head) {
        anchorBodyOwner(head);
      }
    } finally {
      Blockly.Events.enable();
    }
    workspace.scroll(scrollX, scrollY);
    refreshActorPictures(workspace);
    // The reload made every block anew, and the show/hide control is not part
    // of the file, so it is put back with the layout (`syncToggles`).
    layOut(workspace);
  }, [locale, localizedBlocks, layOut, rootCode]);

  // Re-measure when the web fonts land.
  //
  // A renderer measures the font ONCE, when the workspace is injected, and
  // keeps the answer in its constants: `FIELD_TEXT_HEIGHT` and
  // `FIELD_TEXT_BASELINE`. The first workspace of a page load is injected
  // before the web font has arrived, so those are measured in the fallback
  // face and every row is a few pixels out for the life of that workspace —
  // measured here, 17 and 14 against the 20 and 16 the same file gets when it
  // is opened again. Which way it is wrong depends on which font stood in.
  //
  // Nothing recovers it but REBUILDING the blocks. `refreshTheme` recomputes
  // the constants, and re-rendering does not use them: a block keeps the
  // layout it was built with, and `queueRender` with the renders flushed
  // leaves it exactly as tall as it was. Loading the workspace back into
  // itself is what a file switch does, which is why switching has always been
  // the cure.
  //
  // `loadingdone` rather than `fonts.ready`: that promise settles for whatever
  // was pending when it was asked, and more faces start loading after — it
  // resolved a second before these blocks existed. The event fires once per
  // batch, a handful of times, and never in a steady state; and the guard
  // below means a batch that changes no metric costs a measurement and stops.
  useEffect(() => {
    const fonts = document.fonts;
    if (!fonts?.addEventListener) {
      return;
    }
    const textHeight = (workspace: Blockly.WorkspaceSvg): number =>
      (
        workspace.getRenderer().getConstants() as unknown as {
          FIELD_TEXT_HEIGHT?: number;
        }
      ).FIELD_TEXT_HEIGHT ?? 0;

    const remeasure = (): void => {
      const workspace = workspaceRef.current;
      if (!workspace) {
        return;
      }
      const before = textHeight(workspace);
      workspace.refreshTheme();
      if (textHeight(workspace) === before) {
        return;
      }
      const {scrollX, scrollY} = workspace;
      const state = Blockly.serialization.workspaces.save(workspace);
      // Silently: a font arriving is not an edit, and this must not write the
      // file back — least of all a body surface, whose workspace is one
      // member's implementation and not the file at all.
      Blockly.Events.disable();
      try {
        Blockly.serialization.workspaces.load(state, workspace);
        rootCode(workspace);
        // The head is anchored imperatively, so a reload hands back a plain
        // block: draggable, deletable, wearing a pencil into itself.
        const head = workspace.getBlockById(BODY_OWNER_ID);
        if (head) {
          anchorBodyOwner(head);
        }
      } finally {
        Blockly.Events.enable();
      }
      workspace.scroll(scrollX, scrollY);
      refreshActorPictures(workspace);
      // …and the show/hide controls, which the reload took away: they are not
      // part of the file, so a reload builds blocks without them. On a fresh
      // page the fonts land after the file has opened, which is why a large
      // file showed its headers with no way to open them until a tab switch
      // reloaded it with the fonts already there.
      layOutRef.current(workspace);
    };
    fonts.addEventListener('loadingdone', remeasure);
    return () => fonts.removeEventListener('loadingdone', remeasure);
  }, []);

  // The selected block-color theme (its dark variant when the app is in dark
  // mode). `BlocklyWorkspace` applies live updates via its `theme` prop.
  const {theme} = useWorldBlocklyTheme();

  return (
    <div className={styles.editor}>
      {pickingSprite && (
        <SpritePickerDialog
          sprites={images}
          images={decoded}
          sheets={sheets}
          current={pickCurrent}
          onPick={choosePicture}
          onImport={async () => {
            // The same handover, and the same reason it is an await: an import
            // from inside the picker continues the picking. The learner asked
            // for a picture and now the project has one, so it goes back to the
            // palette rather than straight to the field — an imported
            // spritesheet still has to say WHICH cell.
            setPickingSprite(false);
            const value = await requestAppearanceImport('sprite');
            if (value) {
              setPickCurrent({sprite: value});
            }
            setPickingSprite(true);
          }}
          onCancel={() => finishPick(undefined)}
        />
      )}
      {editing && (
        // The body has the workspace's place; this says whose it is and how
        // to get back. A header rather than a modal's chrome, because the
        // pane is the same pane and what changed is what is in it.
        <div className={styles.bodyHeader}>
          {/* The same button the Preview's "Restart" and the Console's
              "Clear" are — a text button at `extraSmall` with an icon in
              front. This bar sits directly under the panel header those live
              in, so anything else would read as a different kind of control. */}
          <Button
            variant="text"
            size="extraSmall"
            startIcon={
              <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
            }
            onClick={closeBody}
          >
            Back
          </Button>
          {/* `label2` is the type scale's name-of-a-thing: 14px, semibold.
              Not an overline, which is what the panel header above uses —
              that is a LABEL and is uppercased, and this is the member's own
              name, which a learner wrote and should read back as they typed
              it. */}
          <Typography component="span" variant="label2">
            {editing.label}
          </Typography>
        </div>
      )}
      {note && (
        <NoteEditorDialog
          value={note.value}
          onCancel={() => setNote(null)}
          onSave={markdown => {
            // Through the FIELD, so Blockly raises the change event the file is
            // written from — the same path typing in any other field takes.
            note.field.setValue(markdown);
            setNote(null);
          }}
        />
      )}
      {/* LocalizeJS sweeps the DOM and rewrites text nodes. Inside a
          workspace that is Blockly's own SVG, laid out from measurements it
          took itself, so the sweep is kept out and the words are translated
          in the definitions instead. Blockly's widget and dropdown divs mount
          on `document.body` and are outside this, which is the same caveat
          the effect editor's theme records. */}
      <div className={styles.blocks} data-notranslate>
        <BlocklyProvider
          blocks={localizedBlocks}
          plugins={plugins}
          theme={theme}
        >
          <BlocklyWorkspace
            // Blockly reads `readOnly` when the workspace is INJECTED and never
            // again: a read-only injection has no toolbox, no dragging and no
            // edits, for the life of that workspace. The lab is read-only for a
            // moment while the project loads, and the file open at that moment
            // got a workspace that stayed dead — no categories, nothing
            // clickable — until you opened another file and came back, which
            // remounted it. Keying on the answer re-injects once, when it
            // changes.
            key={isReadOnly ? 'read-only' : 'editable'}
            className={styles.workspace}
            // What the "How this works" button at the top of a rule's drawer
            // does (blockly/lessonFlyoutButton). Registered at injection, so a
            // toolbox rebuilt for any of the several reasons it is rebuilt still
            // finds its callbacks.
            onInject={onInject}
            startBlocks={startBlocks}
            toolbox={localizedToolbox}
            options={options}
            theme={theme}
            workspaceRef={workspaceRef}
            onChange={handleChange}
          />
        </BlocklyProvider>
        {sections.menu}
        {!editing && !isMemberPage && sections.outlineButton}
      </div>
    </div>
  );
};

export default BlocklyFileEditor;
