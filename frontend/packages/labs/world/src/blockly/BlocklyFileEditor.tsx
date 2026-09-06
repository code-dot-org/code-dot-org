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
import {requestAppearanceImport} from '../appearance/appearanceImport';
import {isBackgroundPath} from '../appearance/backgroundsFolder';
import {projectSheets} from '../appearance/sheetFile';
import {sizesOfImages, useProjectImages} from '../appearance/useProjectImages';
import {
  hiddenToolboxCategories,
  showsRuleSource,
  type WorldLevelProperties,
} from '../levelData';
import {refreshFor} from '../library/refreshRegistries';
import {useMaybeProgression} from '../progression/progressionContext';
import {shelvedToolbox} from '../progression/toolboxShelf';
import {removeRule, type HeldRule} from '../rules/removeRule';
import {RulesInPlayDialog} from '../rules/RulesInPlayDialog';
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
import {
  addActorThumbnails,
  setActorIcons,
  setPlacementThumbnails,
} from './actorThumbnails';
import styles from './blocklyFileEditor.module.css';
import {BODY_OWNER_ID, createBodySeam, HIDE_BODIES} from './bodySurfaces';
import {buildDomainPalette} from './domainBlocks';
import {setEditingActor, setEditingFile, setEditingRule} from './editingRule';
import {setBodyOpener} from './extensions/bodyButton';
import {anchorBodyOwner} from './extensions/bodyOwner';
import {refreshMissingRuleWarnings} from './extensions/missingRule';
import {fileKindOf} from './fileKind';
import {registerLessonButtons} from './lessonFlyoutButton';
import {redrawLiveDropdowns} from './moduleOptions';
import {
  OPENABLE_EXTENSIONS,
  setModuleOpener,
  setModuleOpeningOffered,
} from './openModule';
import {projectPlacements} from './placementRequests';
import {refreshProjectDropdowns} from './projectDropdowns';
import {setProjectImages} from './projectImages';
import {
  projectActorOptions,
  projectOwnMetas,
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
import {requestRuleImport} from './ruleImport';
import {designedName, parseRuleMeta} from './ruleMeta';
import {ruleByName} from './ruleRegistry';
import {setRulesConfigHandler} from './rulesConfig';
import {parseSpriteRef} from './spriteCells';
import {setSpritePickHandler} from './spritePick';
import {standInBlocks} from './standInBlocks';
import {toolboxForSurface} from './surfaceToolbox';
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
  for (const extension of OPENABLE_EXTENSIONS.map(kind => `.${kind}`)) {
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

  // The rules panel: what a world holds, opened from the world block. Not an
  // importer — it is not choosing a value for anything — which is why it is
  // the one dialog still owned here now that the shelves are the lab's
  // (`library/LibraryImports`).
  const [configuringRules, setConfiguringRules] = useState(false);
  const resolveRulesConfig = useRef<(() => void) | null>(null);

  useEffect(() => {
    // The rules panel, from the world block. It resolves with nothing — what it
    // changes it changes in the project, and the block only wants to know when
    // it closed so it can count again (blockly/rulesConfig).
    //
    // The only seam left here. The five IMPORT shelves are the lab's now
    // (`library/LibraryImports`): they are offered from the file menus as well,
    // which are on screen whatever is open, and a dialog owned by one editor
    // can only be opened while that editor is mounted.
    setRulesConfigHandler(
      () =>
        new Promise<void>(resolve => {
          resolveRulesConfig.current = resolve;
          setConfiguringRules(true);
        }),
    );
    // Cleared on unmount so a field on a disposed workspace cannot open a
    // dialog this editor no longer owns.
    return () => {
      setRulesConfigHandler(null);
    };
  }, []);

  /** Close the panel, and let the block that opened it count again. */
  const finishRulesConfig = useCallback(() => {
    setConfiguringRules(false);
    resolveRulesConfig.current?.();
    resolveRulesConfig.current = null;
  }, []);

  /**
   * Delete a rule's file, which is how a world stops having that mechanic.
   *
   * The registries are refreshed in the same breath as the write, exactly as an
   * import does: every dropdown in the workspace is built from them, and a
   * `use trait` still offering a deleted rule's traits would be offering
   * something nothing can provide.
   */
  const handleRuleRemove = useCallback(
    (rule: HeldRule) => {
      const sources = sourcesRef.current;
      const source = removeRule(sources.source, rule);
      updateSources({...sources, source});
      refreshFor(source);
    },
    [updateSources],
  );

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
        projectPlacements(files),
      )
      .then(info => {
        if (alive) {
          addActorThumbnails(info.thumbnails);
          // …and the pictures of particular placements, where a kind's own is
          // not what a map should draw (specs/UI_ACTORS.md).
          setPlacementThumbnails(info.placements);
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
  // …and, when the level gates the shelf, the toolbox offers only what this
  // learner has unlocked plus what the lesson they are doing teaches
  // (progression/toolboxShelf). Off by default, and identity when off.
  const progression = useMaybeProgression();
  const shelf = useMemo(
    () => (progression?.gated ? {holds: progression.holds} : undefined),
    [progression?.gated, progression?.holds],
  );
  const {blocks, toolbox} = useMemo(() => {
    const palette = buildDomainPalette(projectRuleMetas(files), {
      ownRuleModule,
      fileKind,
      ownProperties: ownActorProperties,
    });
    // …and a definition for every block type the project's files hold that
    // this palette does not mint. That is what a deleted rule leaves behind,
    // and without one Blockly refuses to deserialize the file at all — the
    // editor throws and nothing renders (blockly/standInBlocks).
    const known = new Set(palette.blocks.map(block => block.type));
    return {
      blocks: [
        ...palette.blocks,
        ...standInBlocks(Object.values(files), known),
      ],
      toolbox: shelf
        ? shelvedToolbox(
            withoutCategories(palette.toolbox, hiddenCategories),
            shelf,
          )
        : withoutCategories(palette.toolbox, hiddenCategories),
    };
  }, [
    files,
    ownRuleModule,
    fileKind,
    hiddenCategories,
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
  const [startBlocks] = useState(() => {
    const document = parseWorkspace(initialContents);
    return HIDE_BODIES ? seam.show(document) : document;
  });

  /** The FILE: what the workspace shows, with its bodies put back. */
  const readFile = useCallback(
    (workspace: Blockly.Workspace) => {
      const saved = Blockly.serialization.workspaces.save(
        workspace,
      ) as BlocklySerialization;
      return HIDE_BODIES ? seam.read(saved) : saved;
    },
    [seam],
  );

  /**
   * The member whose body is on screen, if one is.
   *
   * ONE workspace, loaded in place — the same thing the rename and epoch
   * effects below do, with events off. Re-keying the `BlocklyWorkspace` to
   * swap `startBlocks` was the first attempt and the body came up empty;
   * loading is what this file already knows how to do.
   */
  const [editing, setEditing] = useState<{id: string; label: string} | null>(
    null,
  );
  /** The interface, held while a body has its place. */
  const interfaceRef = useRef<BlocklySerialization | null>(null);
  /** Which surface the workspace is actually showing. */
  const surfaceRef = useRef<string | null>(null);

  /** What the pencil on a `define …` block does. */
  const openBody = useCallback((blockId: string) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    // Saved, not re-read from the file: the learner may have renamed a
    // property since, and going back should show what they left.
    interfaceRef.current = Blockly.serialization.workspaces.save(
      workspace,
    ) as BlocklySerialization;
    // `define block` has no NAME field — what it is called is the signature
    // the learner designed, which is where every other reader of the file gets
    // it from too (`ruleMeta.addDesignedBlock`).
    const block = workspace.getBlockById(blockId);
    const designed = designedName(
      (
        block as unknown as {
          saveExtraState?: () => {
            parts?: Array<{kind?: string; text?: string}>;
          };
        }
      )?.saveExtraState?.()?.parts,
    );
    setEditing({
      id: blockId,
      label: block?.getFieldValue('NAME') || designed || 'this',
    });
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
      Blockly.serialization.workspaces.load(
        HIDE_BODIES ? seam.show(document) : document,
        workspace,
      );
    },
    [seam],
  );

  // The toolbox the surface in front of the learner can actually use. Kept
  // apart from the `blocks` memo above on purpose: `blocks` re-registers every
  // definition and is watched by the effect that swaps surfaces, so folding
  // this into it would rebuild the palette every time a body opened.
  const surfaceToolbox = useMemo(
    () => toolboxForSurface(toolbox, editing ? 'body' : 'interface'),
    [toolbox, editing],
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
        seam.setBody(
          editing.id,
          Blockly.serialization.workspaces.save(
            workspace,
          ) as BlocklySerialization,
        );
        const held = interfaceRef.current;
        if (held && !isReadOnly) {
          const contents = JSON.stringify(seam.read(held), null, 2);
          // A field on the HEAD is not a change to this member's body — it is
          // a change to what the rule offers, and `reconcileMembers` keeps the
          // snapshot it compares against in step. Switching a `define block`
          // between doing and reporting is deliberately not treated as a
          // rename (`renamedMember`), so this only updates that snapshot; it
          // is here so the next edit on the interface is compared against what
          // the file actually says.
          if ((event as {blockId?: string}).blockId === BODY_OWNER_ID) {
            reconcileMembers(contents);
          }
          onChangeRef.current(contents);
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
        const edited = JSON.stringify(readFile(workspace), null, 2);
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
      const state = readFile(workspace);
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
    // `editing` among them, and it is not optional: without it this closure
    // keeps the value it had when the editor mounted — null — and a body's
    // edits fall through to the path that writes the whole file, which for a
    // workspace holding one implementation is not the file at all.
    [handleRename, reconcileMembers, editing, seam, isReadOnly, readFile],
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
      if (!fileId) {
        // The eye is only drawn when the project holds the file
        // (`canOpenModule`), so getting here means the two disagree about what
        // "holds" means — which is what happened when `.actor` was registered
        // as openable and not listed among the extensions tried here. The
        // button did nothing at all, and nothing anywhere said why.
        console.warn(
          `World Lab: nothing to open for \`${modulePath}\`. The eye offered ` +
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
      // …and now that the workspace knows which file it is, the blocks that
      // draw the actor they are about can say so. HERE rather than only on
      // creation, because a block is created before it is connected and a
      // SHADOW is created without announcing itself at all — so the first ask
      // of "what am I about" can come before there is anything to answer with.
      refreshActorPictures(workspaceRef.current);
    }
  }, [ownRuleModule, ownActorModule, currentSources.source, fileId]);

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
      showFile(state, workspace);
    } finally {
      Blockly.Events.enable();
    }
    refreshActorPictures(workspace);
    workspace.scroll(scrollX, scrollY);
  }, [blocks, showFile]);

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
    const document = editing ? seam.bodyOf(editing.id, held) : held;
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(document, workspace);
      if (editing) {
        // Inside the quiet, not after it: anchoring changes the block, and a
        // change event here would be read as the learner editing the body and
        // written straight back to the file.
        const head = workspace.getBlockById(BODY_OWNER_ID);
        if (head) {
          anchorBodyOwner(head);
          // The viewport is wherever the interface left it, which for a rule
          // wider than the screen is not where this is. To the ORIGIN rather
          // than centred on the head: the head is as wide as the signature it
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
  }, [editing, blocks, seam, startBlocks]);

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
      showFile(parseWorkspace(initialContents), workspace);
    } finally {
      Blockly.Events.enable();
    }
    refreshActorPictures(workspace);
    workspace.scroll(scrollX, scrollY);
  }, [sourcesEpoch, initialContents, showFile]);

  // The selected block-color theme (its dark variant when the app is in dark
  // mode). `BlocklyWorkspace` applies live updates via its `theme` prop.
  const {theme} = useWorldBlocklyTheme();

  return (
    <div className={styles.editor}>
      {configuringRules && (
        <RulesInPlayDialog
          source={currentSources.source}
          editable={!isReadOnly}
          onAdd={async () => {
            // Hand over to the shelf and come back — one dialog on screen at a
            // time. The panel's promise stays unresolved across the handover,
            // so the block that opened it still counts once at the end of the
            // whole errand.
            //
            // AWAITED, where this used to set a flag and let the shelf's own
            // finisher put the panel back. The shelf is the lab's now
            // (`library/LibraryImports`) and answers with a promise, so
            // "come back afterwards" is the line after the await rather than a
            // ref two components share.
            setConfiguringRules(false);
            await requestRuleImport();
            setConfiguringRules(true);
          }}
          onRemove={handleRuleRemove}
          onClose={finishRulesConfig}
        />
      )}
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
          <button type="button" className={styles.bodyBack} onClick={closeBody}>
            ← Back
          </button>
          <span className={styles.bodyTitle}>{editing.label}</span>
        </div>
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
          // What the "How this works" button at the top of a rule's drawer
          // does (blockly/lessonFlyoutButton). Registered at injection, so a
          // toolbox rebuilt for any of the several reasons it is rebuilt still
          // finds its callbacks.
          onInject={registerLessonButtons}
          startBlocks={startBlocks}
          toolbox={surfaceToolbox}
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
