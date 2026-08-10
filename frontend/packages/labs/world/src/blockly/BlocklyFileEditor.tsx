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
} from '@code-dot-org/blockly';
import DisableOrphansPlugin from '@code-dot-org/blockly/plugins/disableOrphans';
import ScrollOptionsPlugin from '@code-dot-org/blockly/plugins/scrollOptions';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly/plugins/toolboxTrashcan';
import {activateFile} from '@code-dot-org/codebridge';
import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';

import {
  SpritePickerDialog,
  type PickedSprite,
} from '../animationEditor/SpritePickerDialog';
import {
  setAppearanceImportHandler,
  type AppearanceKind,
} from '../appearance/appearanceImport';
import {BackgroundLibraryDialog} from '../appearance/BackgroundLibraryDialog';
import {isBackgroundPath} from '../appearance/backgroundsFolder';
import {fetchStockBackground} from '../appearance/fetchStockBackground';
import {ImportAppearanceDialog} from '../appearance/ImportAppearanceDialog';
import {
  importStockAnimation,
  importStockBackground,
  importStockSprite,
} from '../appearance/importStock';
import {projectSheets} from '../appearance/sheetFile';
import type {
  StockAnimation,
  StockBackground,
  StockSprite,
} from '../appearance/stock';
import {sizesOfImages, useProjectImages} from '../appearance/useProjectImages';
import {ImportEffectDialog} from '../effect/ImportEffectDialog';
import {importStockEffect} from '../effect/importStockEffect';
import type {StockEffect} from '../effect/stock';
import {
  hiddenToolboxCategories,
  showsRuleSource,
  type WorldLevelProperties,
} from '../levelData';
import {ImportRuleDialog} from '../rules/ImportRuleDialog';
import {importStockRule} from '../rules/importStockRule';
import type {StockRule} from '../rules/stock';
import {projectImageSizes} from '../runtime/imageSize';
import {
  filePath,
  projectFiles,
  projectImagePaths,
} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import {parseActorOwnMeta} from './actorMeta';
import {addActorThumbnails} from './actorThumbnails';
import styles from './blocklyFileEditor.module.css';
import {buildDomainPalette} from './domainBlocks';
import {setEditingRule} from './editingRule';
import {setEffectImportHandler} from './effectImport';
import {fileKindOf} from './fileKind';
import {redrawLiveDropdowns} from './moduleOptions';
import {setModuleOpener, setModuleOpeningOffered} from './openModule';
import {refreshProjectDropdowns} from './projectDropdowns';
import {
  projectActorOptions,
  projectRuleMetas,
  projectWorldOptions,
} from './projectModules';
import {
  duplicateMemberKeys,
  memberKeys,
  renameMemberInSource,
  renameMemberReferences,
  renamedMember,
  renameRuleInSource,
  renameRuleReferences,
  type MemberKey,
} from './renameRule';
import {setRuleImportHandler} from './ruleImport';
import {parseRuleMeta} from './ruleMeta';
import {ruleByName} from './ruleRegistry';
import {parseSpriteRef} from './spriteCells';
import {setSpritePickHandler} from './spritePick';
import {withoutCategories} from './toolboxFilter';
import {useWorldBlocklyTheme} from './worldBlocklyTheme';

// Distinct connector nubs for the lab's own value types, so they read apart from
// the puzzle-tab of numbers/strings: a triangle for `Actor` (`this actor`, every
// `of …` socket) and a square for `Vector` (directional values — velocity, a
// force, gravity's direction).
const plugins = [
  ToolboxTrashcanPlugin,
  ScrollOptionsPlugin,
  DisableOrphansPlugin,
  TriangleInputPlugin('Actor'),
  RectangleInputPlugin('Vector'),
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

/**
 * The rule rename this event is, if it is one.
 *
 * A committed edit of a `define rule` block's NAME — `BLOCK_CHANGE`, which
 * Blockly fires when the field editor closes. Typing into the field fires
 * `block_field_intermediate_change` instead, and must not be acted on: a rename
 * rewrites the project and reloads this workspace, which is not a thing to do
 * between two keystrokes.
 */
function ruleRename(
  event: Blockly.Events.Abstract,
  workspace: Blockly.WorkspaceSvg,
): {from: string; to: string; block: Blockly.Block} | undefined {
  if (event.type !== Blockly.Events.BLOCK_CHANGE) {
    return undefined;
  }
  const change = event as Blockly.Events.BlockChange;
  if (change.element !== 'field' || change.name !== 'NAME') {
    return undefined;
  }
  const block = change.blockId
    ? workspace.getBlockById(change.blockId)
    : undefined;
  if (!block || block.type !== 'world_rule') {
    return undefined;
  }
  const from = String(change.oldValue ?? '');
  const to = String(change.newValue ?? '');
  return from && to && from !== to ? {from, to, block} : undefined;
}

/**
 * Whether this event is a name being TYPED, rather than named.
 *
 * Blockly writes a text field on every keystroke, as an intermediate change, so
 * that blocks resize while you type. For most fields persisting that is
 * harmless. For the ones a `.rule` declares things with it is not: the file
 * would declare "M", "Mo", "Moo"… in turn, each of them a name nothing refers
 * to and one of which may collide with something real — and the name a rename
 * starts FROM would be gone before the rename happened. So the keystrokes are
 * shown and not saved; the commit is what the project hears about.
 */
function isTypingDeclaration(
  event: Blockly.Events.Abstract,
  workspace: Blockly.WorkspaceSvg,
): boolean {
  if (event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
    return false;
  }
  const change = event as Blockly.Events.BlockFieldIntermediateChange;
  const block = change.blockId
    ? workspace.getBlockById(change.blockId)
    : undefined;
  return !!block?.type.startsWith('world_rule');
}

/**
 * Whether this event opens or closes a signature bubble, and which.
 *
 * A `define block`'s wording lives in its mutator, and Blockly recomposes the
 * block on every keystroke there — so the member's name changes letter by
 * letter, as a mutation rather than a field edit. Reconciling on each of those
 * would rewrite the project and reload the workspace out from under the bubble
 * being typed into. Closing it is the commit.
 */
function bubbleToggle(event: Blockly.Events.Abstract): boolean | undefined {
  if (event.type !== Blockly.Events.BUBBLE_OPEN) {
    return undefined;
  }
  const bubble = event as Blockly.Events.BubbleOpen;
  return bubble.bubbleType === 'mutator' ? bubble.isOpen : undefined;
}

/**
 * What a rule's members are called as the editor opens it.
 *
 * The state the first edit is compared against — without it, a member renamed
 * before anything else in the session would look like one member leaving and
 * another arriving out of nowhere, which is not a rename anybody can follow.
 */
function initialMemberKeys(
  modulePath: string | undefined,
  contents: string,
): MemberKey[] {
  const meta = modulePath ? parseRuleMeta(modulePath, contents) : undefined;
  return meta ? memberKeys(meta) : [];
}

/**
 * The file a module path names — `rules/gravity` → `rules/gravity.rule`.
 *
 * A module path has no extension, which is what makes it a module path: the
 * compiler's own resolution tries `.rule`, then `.js`, then `.ts`, and this
 * follows it so the file a block opens is the file the project would compile.
 *
 * `.map` is tried last and is not part of that resolution — a map is data a
 * world names, not a module anything imports. It is here because the eye opens
 * FILES, and a map has an editor like the rest.
 */
function fileIdForModule(
  source: MultiFileSource,
  modulePath: string,
): string | undefined {
  for (const extension of ['.rule', '.js', '.ts', '.map']) {
    const wanted = `${modulePath}${extension}`;
    const found = Object.keys(source.files).find(
      id => filePath(source, id) === wanted,
    );
    if (found) {
      return found;
    }
  }
  return undefined;
}

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

export const BlocklyFileEditor = ({
  fileId,
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
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
  useMemo(
    () => refreshProjectDropdowns(files, imagePaths, imageSizes),
    [files, imagePaths, imageSizes],
  );

  // The stock-effect import, opened from an effect dropdown's `(import…)` row.
  //
  // The dropdown lives inside Blockly, which cannot reach React context or the
  // project sources — so the field asks through a registered handler
  // (./effectImport) and waits on the promise this resolves. Held in a ref
  // because the field calls it long after the render that installed it.
  const [importing, setImporting] = useState(false);
  const resolveImport = useRef<((path: string | undefined) => void) | null>(
    null,
  );
  // Read at import time rather than captured, so the file is written against
  // the project as it stands when the learner chooses, not as it stood when the
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

  // The same machinery for rules. Two handlers rather than one because the two
  // dropdowns want different dialogs; `importing` says which is open, so only
  // one can be at a time — which is what a modal means anyway.
  const [importingRule, setImportingRule] = useState(false);

  useEffect(() => {
    setEffectImportHandler(
      () =>
        new Promise<string | undefined>(resolve => {
          resolveImport.current = resolve;
          setImporting(true);
        }),
    );
    setRuleImportHandler(
      () =>
        new Promise<string | undefined>(resolve => {
          resolveImport.current = resolve;
          setImportingRule(true);
        }),
    );
    // Cleared on unmount so a field on a disposed workspace cannot open a
    // dialog this editor no longer owns.
    return () => {
      setEffectImportHandler(null);
      setRuleImportHandler(null);
    };
  }, []);

  const finishImport = useCallback((path: string | undefined) => {
    setImporting(false);
    setImportingRule(false);
    setImportingAppearance(null);
    resolveImport.current?.(path);
    resolveImport.current = null;
  }, []);

  const handleImport = useCallback(
    (effect: StockEffect) => {
      const sources = sourcesRef.current;
      const {source, path} = importStockEffect(sources.source, effect);
      // The file has to be in the project BEFORE the field takes its value: the
      // dropdown rebuilds from the registry, and a value with no matching option
      // is dropped by Blockly.
      updateSources({...sources, source});
      refreshProjectDropdowns(
        projectFiles(source),
        projectImagePaths(source),
        projectImageSizes(source),
      );
      finishImport(path);
    },
    [updateSources, finishImport],
  );

  const handleRuleImport = useCallback(
    (rule: StockRule) => {
      const sources = sourcesRef.current;
      const {source, name} = importStockRule(sources.source, rule);
      // In the project BEFORE the field takes its value, as with an effect: the
      // dropdown rebuilds from the registry, and a value with no matching
      // option is dropped by Blockly. The value is the rule's NAME — the field
      // says which rule, never which file.
      updateSources({...sources, source});
      refreshProjectDropdowns(
        projectFiles(source),
        projectImagePaths(source),
        projectImageSizes(source),
      );
      finishImport(name);
    },
    [updateSources, finishImport],
  );

  // The appearance picker, opened from a `set sprite` / `play animation`
  // dropdown. Same machinery as the other two: the field cannot reach React, so
  // it asks through a handler and waits on the promise this resolves.
  const [importingAppearance, setImportingAppearance] =
    useState<AppearanceKind | null>(null);
  useEffect(() => {
    setAppearanceImportHandler(
      kind =>
        new Promise<string | undefined>(resolve => {
          resolveImport.current = resolve;
          setImportingAppearance(kind);
        }),
    );
    return () => setAppearanceImportHandler(null);
  }, []);

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

  const handleAppearanceImport = useCallback(
    (chosen: StockSprite | StockAnimation) => {
      const sources = sourcesRef.current;
      const {source, value} =
        'dataUrl' in chosen
          ? importStockSprite(sources.source, chosen)
          : importStockAnimation(sources.source, chosen);
      // In the project BEFORE the field takes its value: the dropdown rebuilds
      // from the registry, and a value with no matching option is dropped.
      updateSources({...sources, source});
      refreshProjectDropdowns(
        projectFiles(source),
        projectImagePaths(source),
        projectImageSizes(source),
      );
      // An import from inside the picker continues the picking: the learner
      // asked for a picture, and now the project has one. Back to the palette
      // rather than straight to the field — an imported spritesheet still has
      // to say WHICH cell.
      if (resolvePick.current) {
        setImportingAppearance(null);
        setPickCurrent({sprite: value});
        setPickingSprite(true);
        return;
      }
      finishImport(value);
    },
    [updateSources, finishImport],
  );

  /**
   * The backdrop shelf, opened from `set background to`'s `(import…)` row.
   *
   * Async where the others are not: a backdrop's bytes are served rather than
   * bundled (BACKGROUNDS.md §7), so choosing one is a fetch before it is an
   * edit. The dialog stays open and says so while that happens, because a
   * dialog that vanished and then failed would leave the learner with nothing
   * to look at and nothing to try again.
   */
  const [importingBackground, setImportingBackground] = useState(false);
  const [backgroundError, setBackgroundError] = useState<string | undefined>();

  const handleBackgroundImport = useCallback(
    async (chosen: StockBackground) => {
      setBackgroundError(undefined);
      setImportingBackground(true);
      let dataUrl: string;
      try {
        dataUrl = await fetchStockBackground(chosen);
      } catch (error) {
        setImportingBackground(false);
        setBackgroundError(
          error instanceof Error ? error.message : String(error),
        );
        return;
      }
      setImportingBackground(false);
      const sources = sourcesRef.current;
      const {source, value} = importStockBackground(
        sources.source,
        chosen,
        dataUrl,
      );
      // In the project BEFORE the field takes its value: the dropdown rebuilds
      // from the registry, and a value with no matching option is dropped.
      updateSources({...sources, source});
      refreshProjectDropdowns(
        projectFiles(source),
        projectImagePaths(source),
        projectImageSizes(source),
      );
      finishImport(value);
    },
    [updateSources, finishImport],
  );

  // The world whose module the popup introspects: the file being edited when it
  // is a world (its own actors are in it), else the project's first.
  const worldPath = useMemo(() => {
    const path = filePath(currentSources.source, fileId);
    return path?.endsWith('.world')
      ? path.replace(/\.world$/, '')
      : (projectWorldOptions(files)[0]?.[1] ?? '');
  }, [currentSources.source, fileId, files]);

  /**
   * Keep the actor thumbnails the map field draws with.
   *
   * The sandbox renders them, and a Blockly field cannot ask it — it is not in
   * the React tree — so they are pushed into a registry the field reads
   * (`blockly/actorThumbnails`), the same way the project dropdowns are fed.
   *
   * Once per world file, after the first compile: the manifest build is cached,
   * and a `create actor in map` grid with plain markers instead of actors is
   * usable but not much fun.
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
          }
        }
      });
    return () => {
      alive = false;
    };
  }, [hasCompiled, worldPath, files]);

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

  // The properties this actor declares for itself, if it is one. Parsed from
  // the file as saved rather than from the live workspace: the palette is
  // rebuilt when the sources change, which is exactly when a declaration was
  // added or renamed. A file mid-edit parses to undefined and leaves the blocks
  // it already had alone, rather than dropping them while a name is half typed.
  const ownActorProperties = useMemo(() => {
    const path = filePath(currentSources.source, fileId);
    if (!path?.endsWith('.actor')) {
      return undefined;
    }
    // `files` is keyed by the path WITH its extension; the module path is that
    // path without one, which is what a ref names.
    return parseActorOwnMeta(path.replace(/\.actor$/, ''), files[path] ?? '');
  }, [currentSources.source, fileId, files]);

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
  const {blocks, toolbox} = useMemo(() => {
    const palette = buildDomainPalette(projectRuleMetas(files), {
      ownRuleModule,
      fileKind,
      actorOwnProperties: ownActorProperties ? [ownActorProperties] : [],
    });
    return {
      blocks: palette.blocks,
      toolbox: withoutCategories(palette.toolbox, hiddenCategories),
    };
  }, [files, ownRuleModule, fileKind, hiddenCategories, ownActorProperties]);

  // Parsed once: Codebridge keys this component by file id, so it remounts (and
  // re-reads `initialContents`) when the active file changes.
  const startBlocks = useRef(parseWorkspace(initialContents)).current;

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

  // A workspace to reload once the palette has caught up (see `carry`).
  const pendingReload = useRef<BlocklySerialization | null>(null);
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
  // Whether a `define block`'s signature is being typed into (see `bubbleToggle`).
  const signatureBubbleOpen = useRef(false);
  // The keys this rule's members are referred to by, as of the last state the
  // project agreed on. What the next commit is compared against.
  const memberState = useRef<MemberKey[]>(
    initialMemberKeys(ownRuleModule, initialContents),
  );

  /**
   * Write a rename through the project, and reload this workspace.
   *
   * `renamed` is the project with the references rewritten; `self` is this
   * file's own workspace rewritten from the LIVE one, because what is on disk
   * for it is an edit behind — the rename is in the workspace being handled.
   *
   * Writing everything in one `updateSources` rather than letting the ordinary
   * per-file save follow: `saveFile` closes over the sources of the render that
   * made it, and would put the other files back.
   */
  const carry = useCallback(
    (renamed: MultiFileSource, self: string): void => {
      const sources = sourcesRef.current;
      const file = renamed.files[fileId];
      updateSources({
        ...sources,
        source: {
          ...renamed,
          files: {...renamed.files, [fileId]: {...file, contents: self}},
        },
      });
      // The blocks in THIS workspace carry the old name in their types, and a
      // block's type cannot be changed in place. The palette rebuilds from the
      // sources we just wrote; the workspace is reloaded from the rewritten
      // state once it has (see the effect below).
      pendingReload.current = JSON.parse(self) as BlocklySerialization;
    },
    [fileId, updateSources],
  );

  /**
   * Carry a renamed MEMBER through the project.
   *
   * A member is referred to by the export name its own name derives, so
   * renaming a trait, a property, an event, a step, or the wording of a designed
   * block is the same kind of edit as renaming the rule: every reference to it
   * has to follow. What was renamed is worked out by comparing the rule's
   * members with the last state the project agreed on — not by reading the edit
   * — because the edits that rename a member are various (a NAME field, a label
   * in a mutator) and what they have in common is only the result.
   */
  const reconcileMembers = useCallback(
    (contents: string): void => {
      if (!ownRuleModule) {
        return;
      }
      const meta = parseRuleMeta(ownRuleModule, contents);
      if (!meta) {
        return;
      }
      const keys = memberKeys(meta);
      const before = memberState.current;
      memberState.current = keys;
      const rename = renamedMember(before, keys);
      if (!rename) {
        return;
      }
      // Two members with one key is a reference with two meanings — and unlike a
      // rule's name, there is no one field to put back (a designed block's name
      // is its whole signature). So it is left as written, said out loud on the
      // rule, and not carried: rewriting references to a key that names two
      // things would only spread the ambiguity.
      const duplicated = duplicateMemberKeys(keys);
      const [rule] = workspaceRef.current?.getBlocksByType('world_rule') ?? [];
      rule?.setWarningText(
        duplicated.length
          ? `Two of this rule's members are both called \u201c${duplicated[0]}\u201d.`
          : null,
      );
      if (duplicated.length) {
        return;
      }
      const self = renameMemberReferences(
        contents,
        meta.name,
        rename.from,
        rename.to,
      );
      carry(
        renameMemberInSource(
          sourcesRef.current.source,
          meta.name,
          rename.from,
          rename.to,
        ),
        self ?? contents,
      );
    },
    [carry, ownRuleModule],
  );

  /**
   * Carry a rule's new name through the project.
   *
   * Every reference to a rule is its name, so renaming one is an edit to every
   * file that mentions it — and to this one, whose own members' block types are
   * built from the name too. Returns true when it has written the project
   * itself, so the ordinary per-file save is skipped: `saveFile` closes over the
   * sources of the render that made it, and would put the other files back.
   */
  const handleRename = useCallback(
    (
      rename: {from: string; to: string; block: Blockly.Block},
      contents: string,
    ): boolean => {
      // A name two rules answer to is a reference with two meanings, so a taken
      // one is refused rather than carried: the field goes back to what it was
      // and the block says why.
      //
      // Refusing has to mean the edit did not happen at all. Letting the name
      // stand while the references keep the old one would strand the rule —
      // nothing would name it, and the NEXT rename would carry the name nothing
      // refers to, leaving no rename that could ever put it right.
      const taken = ruleByName(rename.to);
      if (taken && taken.modulePath !== ownRuleModule) {
        // Silently: the revert is not an edit, and an event for it would come
        // back through here as a rename in the other direction.
        Blockly.Events.disable();
        try {
          rename.block.setFieldValue(rename.from, 'NAME');
        } finally {
          Blockly.Events.enable();
        }
        rename.block.setWarningText(
          `Another rule is already called \u201c${rename.to}\u201d. ` +
            'Rules are referred to by name, so this one needs its own.',
        );
        return true;
      }
      rename.block.setWarningText(null);

      const self = renameRuleReferences(contents, rename.from, rename.to);
      carry(
        renameRuleInSource(sourcesRef.current.source, rename.from, rename.to),
        self ?? contents,
      );
      return true;
    },
    [carry, ownRuleModule],
  );

  const handleChange = useCallback(
    (event: Blockly.Events.Abstract) => {
      const workspace = workspaceRef.current;
      if (!workspace) {
        return;
      }
      // Opening a file is not editing it.
      if (loadedWorkspace.current !== workspace) {
        if (event.type === Blockly.Events.FINISHED_LOADING) {
          loadedWorkspace.current = workspace;
        }
        return;
      }
      // Ignore pure UI events (selection, viewport) — only persist real edits,
      // except a mutator bubble closing, which commits a signature.
      const bubble = bubbleToggle(event);
      if (bubble !== undefined) {
        signatureBubbleOpen.current = bubble;
        if (bubble) {
          return;
        }
        // Closing it commits the session: a designed block's name is its whole
        // signature, so what was typed into the bubble is only finished now.
        const edited = JSON.stringify(
          Blockly.serialization.workspaces.save(workspace),
          null,
          2,
        );
        reconcileMembers(edited);
        if (!pendingReload.current) {
          onChangeRef.current(edited);
        }
        return;
      }
      // An open bubble recomposes its block on every keystroke, so saving those
      // would put a half-renamed member in front of the compiler — which reports
      // it, having been handed a rule whose own body no longer names what it
      // declares. The session is written when it closes, above.
      if (
        event.isUiEvent ||
        signatureBubbleOpen.current ||
        isTypingDeclaration(event, workspace)
      ) {
        return;
      }
      const state = Blockly.serialization.workspaces.save(
        workspace,
      ) as BlocklySerialization;
      const contents = JSON.stringify(state, null, 2);
      const rename = ruleRename(event, workspace);
      if (rename && handleRename(rename, contents)) {
        return;
      }
      // A member's name may have changed with this edit — but not while its
      // signature is being typed into, which recomposes the block per keystroke.
      if (!signatureBubbleOpen.current) {
        reconcileMembers(contents);
        if (pendingReload.current) {
          return;
        }
      }
      onChangeRef.current(contents);
    },
    [handleRename, reconcileMembers],
  );

  // The eye on a `use rule` / `use trait` block, and what it does. The handler
  // turns the module path the field hands back into the file the browser would
  // have opened; whether it is offered at all is the level's call.
  useEffect(() => {
    setModuleOpeningOffered(showsRuleSource(levelProperties));
  }, [levelProperties]);

  useEffect(() => {
    setModuleOpener(modulePath => {
      const sources = sourcesRef.current;
      const fileId = fileIdForModule(sources.source, modulePath);
      if (fileId) {
        updateSources({
          ...sources,
          source: activateFile(sources.source, fileId),
        });
      }
    });
    // Cleared on unmount so a field on a disposed workspace cannot open a file
    // through an editor that is gone.
    return () => setModuleOpener(null);
  }, [updateSources]);

  // Which rule this workspace is, so `use rule` can leave it out of its own list.
  // After mount rather than during: the workspace is created by a child, whose
  // effects run first. A block deserialized before this lands keeps whatever it
  // was saved with, which is the right way round — a dropdown that cannot offer
  // a value drops it.
  useEffect(() => {
    if (workspaceRef.current) {
      setEditingRule(workspaceRef.current, ownRuleModule);
    }
  }, [ownRuleModule]);

  // Reload after a rename, once `blocks` carries the renamed member types —
  // BlocklyProvider registers them in its own effect, which runs before this one
  // because it is deeper in the tree. Loading with events off: the sources
  // already hold this state, and re-saving it would be a second write of the
  // file for the same edit.
  useEffect(() => {
    const workspace = workspaceRef.current;
    const state = pendingReload.current;
    if (!workspace || !state) {
      return;
    }
    pendingReload.current = null;
    const {scrollX, scrollY} = workspace;
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(state, workspace);
    } finally {
      Blockly.Events.enable();
    }
    workspace.scroll(scrollX, scrollY);
  }, [blocks]);

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
    const {scrollX, scrollY} = workspace;
    // With events off, like the rename reload: the sources already hold this
    // state, and re-saving it would be a second write for an edit nobody made.
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(
        parseWorkspace(initialContents),
        workspace,
      );
    } finally {
      Blockly.Events.enable();
    }
    workspace.scroll(scrollX, scrollY);
  }, [sourcesEpoch, initialContents]);

  // The selected block-color theme (its dark variant when the app is in dark
  // mode). `BlocklyWorkspace` applies live updates via its `theme` prop.
  const {theme} = useWorldBlocklyTheme();

  return (
    <div className={styles.editor}>
      {importing && (
        <ImportEffectDialog
          onImport={handleImport}
          onCancel={() => finishImport(undefined)}
        />
      )}
      {importingRule && (
        <ImportRuleDialog
          onImport={handleRuleImport}
          onCancel={() => finishImport(undefined)}
        />
      )}
      {pickingSprite && (
        <SpritePickerDialog
          sprites={images}
          images={decoded}
          sheets={sheets}
          current={pickCurrent}
          onPick={choosePicture}
          onImport={() => {
            setPickingSprite(false);
            setImportingAppearance('sprite');
          }}
          onCancel={() => finishPick(undefined)}
        />
      )}
      {importingAppearance === 'background' && (
        <BackgroundLibraryDialog
          onImport={handleBackgroundImport}
          busy={importingBackground}
          error={backgroundError}
          onCancel={() => {
            setBackgroundError(undefined);
            finishImport(undefined);
          }}
        />
      )}
      {importingAppearance && importingAppearance !== 'background' && (
        <ImportAppearanceDialog
          kind={importingAppearance}
          onImport={handleAppearanceImport}
          onCancel={() =>
            // Back to the pictures if this was a detour from the picker.
            resolvePick.current
              ? (setImportingAppearance(null), setPickingSprite(true))
              : finishImport(undefined)
          }
        />
      )}
      <BlocklyProvider blocks={blocks} plugins={plugins} theme={theme}>
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
          startBlocks={startBlocks}
          toolbox={toolbox}
          options={options}
          theme={theme}
          workspaceRef={workspaceRef}
          onChange={handleChange}
        />
      </BlocklyProvider>
    </div>
  );
};

export default BlocklyFileEditor;
